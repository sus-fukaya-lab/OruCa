import * as WebSocket from "ws";
import mysql from "mysql2/promise";  // mysql2/promiseをインポート
import { MessageHandler } from "./MessageHandler"; // MessageHandlerクラスのインポート
import { TWsMessage } from "../config";
import { sendWsMessage } from "../utils";

export class WebSocketServerHandler {
	private wss: WebSocket.WebSocketServer;
	private connectionPool: mysql.PoolConnection;  // mysql.Pool型に変更
	private messageHandler: MessageHandler;

	constructor(server: any, connection:mysql.PoolConnection) {
		this.wss = new WebSocket.WebSocketServer({ server });
		this.connectionPool = connection;  // プールを作成
		this.messageHandler = new MessageHandler(this.wss, this.connectionPool); // MessageHandlerのインスタンスを作成
		this.initializeWebSocketServer();
	}

	private initializeWebSocketServer() {
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
}
