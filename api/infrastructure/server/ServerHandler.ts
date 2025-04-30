// ServerHandler.ts
import { HttpHandler } from "@infra/server/http/HttpHandler";
import { WebSocketHandler } from "@infra/server/websocket/WebSocketHandler";
import express from 'express';
import * as http from "http";
import mysql from "mysql2/promise";

export class ServerHandler {
	private httpServer: http.Server;
	private app: express.Express;
	private connectionPool: mysql.PoolConnection;
	private webSocketHandler: WebSocketHandler;
	private httpHandler: HttpHandler;

	constructor(app: express.Express, connection: mysql.PoolConnection) {
		this.app = app;
		this.connectionPool = connection;

		// HTTP Serverの初期化
		this.httpServer = http.createServer(app);

		// WebSocketHandlerを初期化
		this.webSocketHandler = new WebSocketHandler(this.httpServer, this.connectionPool);

		// HTTPHandlerを初期化（データ更新時のコールバック関数を渡す）
		this.httpHandler = new HttpHandler(
			this.app,
			this.connectionPool,
			this.webSocketHandler.broadcastData.bind(this.webSocketHandler)
		);
	}

	public getServer(): http.Server {
		return this.httpServer;
	}
}