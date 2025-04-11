import express from "express";
import { createServer } from "http";
import { SERVER_CONFIG, DB_CONFIG } from "./config";
import { DatabaseHandler } from "./Handlers/DataBaseHandler"; // DatabaseHandlerクラスのインポート
import { WebSocketServerHandler } from "./Handlers/WebSocketServerHandler"; // WebSocketServerHandlerクラスのインポート

const app = express();
const port = SERVER_CONFIG.port;
const host = SERVER_CONFIG.host;

// MySQL接続（非同期処理に変更）
const databaseHandler = new DatabaseHandler(DB_CONFIG);

// 非同期で接続を行う
const initializeDatabase = async () => {
	try {
		await databaseHandler.connect();  // 非同期接続
	} catch (err) {
		console.error("MySQL接続エラー:", err);
		process.exit(1);  // 接続エラーが発生した場合はサーバーを停止
	}
};

// Expressサーバー作成
const server = createServer(app);

// WebSocketサーバーの作成
const initializeWebSocket = async() => {
	const connection = await databaseHandler.getConnection();
	new WebSocketServerHandler(server,connection); // WebSocketサーバーを初期化
};

// サーバーを立ち上げる
const startServer = async () => {
	await initializeDatabase(); // DB接続を先に行う
	initializeWebSocket();  // WebSocketサーバーを初期化

	server.listen(port, host, () => {
		console.log(`APIサーバーは http://${host}:${port} で実行中`);
	});
};

startServer();  // サーバー起動処理を実行
