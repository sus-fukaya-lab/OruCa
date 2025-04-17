import axios from 'axios';
import express from 'express';
import * as http from "http";
import mysql from "mysql2/promise";
import * as WebSocket from "ws";
import { DBresult, SLACK_BOT_TOKEN, SLACK_CHANNEL_ID, TWsMessage } from "../config";
import { hasProps, sendWsMessage } from "../utils";
import { MessageHandler } from "./MessageHandler";

export class WebSocketServerHandler {
	private httpServer : http.Server; 
	private wss: WebSocket.WebSocketServer;
	private connectionPool: mysql.PoolConnection;
	private messageHandler: MessageHandler;
	private expressServer : express.Express;

	constructor(app:express.Express, connection:mysql.PoolConnection) {
		// Expressサーバー作成
		const server = http.createServer(app);
		
		this.httpServer = server;
		this.wss = new WebSocket.WebSocketServer({ server });
		this.connectionPool = connection;  // プールを作成
		this.expressServer = app;
		this.messageHandler = new MessageHandler(this.expressServer,this.wss, this.connectionPool); // MessageHandlerのインスタンスを作成
		this.initializeWebSocketServer();
	}

	private initializeWebSocketServer() {
		this.expressServer.post("/log/write", express.json(), async (req: express.Request, res: express.Response) => {
			console.log("/log/write");
			
			const { type, payload } = req.body;
			if (!type ||
				!payload ||
				!hasProps<{ content: string }>(payload, ["content"]) ||
				!hasProps<{ student_ID: string }>(payload.content, ["student_ID"])
			) {
				res.status(400).json({ message: 'データの構造が不正です' });
				return;
			}
			const student_ID = payload.content.student_ID;
			const jsonMsg: TWsMessage = {
				type: "log/write",
				payload: {
					result: false,
					content: [],
					message: "不明なエラー",
				},
			};
			try {
				await this.connectionPool.execute("CALL insert_or_update_log(?);", [student_ID]);
				jsonMsg.payload = {
					result: true,
					content: [],
					message: "データが挿入されました"
				}
				res.status(200).json(jsonMsg);
				setTimeout(async () => {
					await this.sendToSlackBot(req,res,student_ID);
				}, 2000);
				this.messageHandler.broadcastData();
				return;
			} catch (error) {
				jsonMsg.payload = {
					result: false,
					content: [],
					message: `データの挿入に失敗しました:${error}`
				}
				res.status(400).json(jsonMsg);
				return;
			}
		});
		this.wss.on("connection", (ws: WebSocket.WebSocket) => {
			this.handleConnection(ws);
		});
	}

	private async handleConnection(ws: WebSocket.WebSocket) {
		console.log("クライアントが接続しました");

		// 初期データをこのクライアントに送信
		sendWsMessage(ws,{
			type:"log/fetch",
			payload:{
				result:true,
				content: await this.messageHandler.fetchLogs(),
				message: "クライアントが接続しました"
			}
		});

		// メッセージ受信処理
		ws.on("message", (message) => {
			try {
				const data: TWsMessage = JSON.parse(message.toString("utf-8"));
				const handler = this.messageHandler.handlers[data.type];
				console.log(data.type);
				if (handler) handler(ws, data);
			} catch (error) {
				console.error("メッセージ処理エラー:", error);
			}
		});

		// 接続が切れた場合
		ws.on("close", () => {
			console.log("クライアントが切断しました");
		});
	}
	public getServer():http.Server{
		return this.httpServer;
	}
	private async sendToSlackBot(req:express.Request,res:express.Response,student_ID: string ){
		console.log("/slackBot/post");
		const jsonMsg: TWsMessage = {
			type: "slackBot/post",
			payload: {
				result: false,
				content: [],
				message: "不明なエラー"
			}
		}
		try {
			const countIsInRoom_query = `SELECT COUNT(*) AS inRoomCount
												FROM logs
												WHERE isInRoom = TRUE;`;
			const fetchNameByID_query = `SELECT student_Name, isInRoom
												FROM student_log_view 
												WHERE student_ID = ?;`;

			const [count_results] = await this.connectionPool.execute<DBresult["noHead"]>(countIsInRoom_query);
						
			if (!hasProps<{ inRoomCount: string }>(count_results[0], ["inRoomCount"])) {
				jsonMsg.payload.message = "在室人数が取得できませんでした";
				return;
			}
			const inRoomCount = count_results[0].inRoomCount;
			
			const [written_results] = await this.connectionPool.execute<DBresult["noHead"]>(fetchNameByID_query,[student_ID]);
			let student_Name = "";
			if (!hasProps<{ isInRoom: number }>(written_results[0], ["isInRoom"])) {
				jsonMsg.payload.message = "isInRoomが取得できませんでした";
				return;
			}
			
			
			if (hasProps<{ student_Name: string }>(written_results[0], ["student_Name"])) {
				student_Name = written_results[0].student_Name;
			}
			const name = `${student_Name ? `(${student_Name})` : ""}`;
			const convTF = [false,true];
			const isInRoom = convTF[written_results[0].isInRoom];
			const action = isInRoom ? "来た" : "帰った";
			const postMsg = `${student_ID}${name}が${action}よ～ (今の人数：${inRoomCount}人)`;
			
			await axios.post('https://slack.com/api/chat.postMessage', {
				channel: SLACK_CHANNEL_ID,
				text: postMsg
			}, {
				headers: {
					Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
					'Content-Type': 'application/json',
				},
			});
			jsonMsg.payload = {
				result: true,
				content: [],
				message: "SlackBotにメッセージを送信しました。"
			}
			return;
		} catch (err) {
			console.error("SlackBot送信エラー:", err);
			jsonMsg.payload = {
				result: false,
				content: [],
				message: "SlackBot送信エラーが発生しました"
			};
			return;
		}

	}

}
