// WebSocketHandler.ts
import { MessageHandler } from "@infra/server/websocket/MessageHandler";
import { TWsMessage } from "@src/config";
import { sendWsMessage } from "@src/utils";
import * as http from "http";
import mysql from "mysql2/promise";
import * as WebSocket from "ws";

export class WebSocketHandler {
	private wss: WebSocket.WebSocketServer;
	private connectionPool: mysql.PoolConnection;
	private messageHandler: MessageHandler;

	constructor(httpServer: http.Server, connection: mysql.PoolConnection) {
		this.wss = new WebSocket.WebSocketServer({ server: httpServer });
		this.connectionPool = connection;

		// MessageHandlerのインスタンスを作成
		this.messageHandler = new MessageHandler(this.wss, this.connectionPool);

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
		sendWsMessage(ws, {
			type: "log/fetch",
			payload: {
				result: true,
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

	public broadcastData(): Promise<void> {
		return this.messageHandler.broadcastData();
	}
}