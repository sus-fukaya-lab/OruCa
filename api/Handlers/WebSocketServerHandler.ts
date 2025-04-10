import * as WebSocket from "ws";
import mysql from "mysql2";
import { MessageHandler } from "./MessageHandler"; // MessageHandlerクラスのインポート
import { TWsMessage } from "../config";
import { sendWsMessage } from "../utils";

export class WebSocketServerHandler {
	private wss: WebSocket.WebSocketServer;
	private db: mysql.Connection;
	private messageHandler: MessageHandler;

	constructor(server: any, db: mysql.Connection) {
		this.wss = new WebSocket.WebSocketServer({ server });
		this.db = db;
		this.messageHandler = new MessageHandler(this.wss, this.db); // MessageHandlerのインスタンスを作成
		this.initializeWebSocketServer();
	}

	private initializeWebSocketServer() {
		this.wss.on("connection", this.handleConnection);
	}

	private handleConnection(ws: WebSocket.WebSocket) {
		console.log("クライアントが接続しました");

		// 初期データをこのクライアントに送信
		this.messageHandler.fetchAndSendLogs((r) => {
			const jsonMsg: TWsMessage = {
				type: "log/fetch",
				payload: {
					result: true,
					content: r,
					message: "在室データ",
				},
			};
			sendWsMessage(ws, jsonMsg);
		});

		// メッセージ受信処理
		ws.on("message", (message) => {
			try {
				const data: TWsMessage = JSON.parse(message.toString("utf-8"));
				const handler = this.messageHandler.handlers[data.type];
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
}
