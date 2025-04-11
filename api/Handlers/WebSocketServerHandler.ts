import * as WebSocket from "ws";
import mysql from "mysql2/promise";
import { MessageHandler } from "./MessageHandler";
import { TWsMessage } from "../config";
import { hasProps, sendWsMessage } from "../utils";
import express from 'express';
import * as http from "http";

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
			const { type, payload } = req.body;
			if (!type ||
				!payload ||
				!hasProps<{ content: string }>(payload, ["content"]) ||
				!hasProps<{ student_ID: string }>(payload.content, ["student_ID"])
			) {
				res.status(400).json({ message: 'データの構造が不正です' });
				return;
			}

			const jsonMsg: TWsMessage = {
				type: "log/write",
				payload: {
					result: false,
					content: undefined,
					message: "不明なエラー",
				},
			};
			try {
				await this.connectionPool.execute("CALL insert_or_update_log(?);", [payload.content.student_ID]);
				jsonMsg.payload = {
					result: true,
					content: undefined,
					message: "データが挿入されました"
				}
				res.status(200).json(jsonMsg);
				return;
			} catch (error) {
				jsonMsg.payload = {
					result: false,
					content: undefined,
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
}
