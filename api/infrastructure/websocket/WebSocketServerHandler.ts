// WebSocketServerHandler.ts
import express from 'express';
import * as http from "http";
import mysql from "mysql2/promise";
import * as WebSocket from "ws";
import { TWsMessage } from "../../config";
import { sendWsMessage } from "../../utils";
import { HttpHandler } from "../http/HttpHandler";
import { MessageHandler } from "./MessageHandler";

export class WebSocketServerHandler {
	private httpServer: http.Server;
	private wss: WebSocket.WebSocketServer;
	private connectionPool: mysql.PoolConnection;
	private messageHandler: MessageHandler;
	private httpHandler: HttpHandler;

	constructor(app: express.Express, connection: mysql.PoolConnection) {
		// Expressサーバー作成
		const server = http.createServer(app);

		this.httpServer = server;
		this.wss = new WebSocket.WebSocketServer({ server });
		this.connectionPool = connection;

		// MessageHandlerのインスタンスを作成
		this.messageHandler = new MessageHandler(this.wss, this.connectionPool);

		// HTTPハンドラを初期化
		this.httpHandler = new HttpHandler(
			app,
			this.connectionPool,
			this.messageHandler.broadcastData.bind(this.messageHandler)
		);

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

	public getServer(): http.Server {
		return this.httpServer;
	}
}