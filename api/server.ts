import express from "express";
import { createServer } from "http";
import { SERVER_CONFIG, DB_CONFIG } from "./config";
import { DatabaseHandler } from "./Handlers/DataBaseHandler"; // DatabaseHandlerクラスのインポート
import { WebSocketServerHandler } from "./Handlers/WebSocketServerHandler"; // WebSocketServerHandlerクラスのインポート

const app = express();
const port = SERVER_CONFIG.port;
const host = SERVER_CONFIG.host;

// MySQL接続
const databaseHandler = new DatabaseHandler(DB_CONFIG);
databaseHandler.connect();

// Expressサーバー作成
const server = createServer(app);
server.listen(port, host, () => {
	console.log(`APIサーバーは http://${host}:${port} で実行中`);
});

// WebSocketサーバーの作成
const webSocketServerHandler = new WebSocketServerHandler(server, databaseHandler.getConnection());
