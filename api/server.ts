import { DatabaseHandler } from "@infra/database/DataBaseHandler"; // DatabaseHandlerクラスのインポート
import { WebSocketServerHandler } from "@infra/server/websocket/WebSocketHandler"; // WebSocketServerHandlerクラスのインポート
import { DB_CONFIG, SERVER_CONFIG } from "@src/config";
import express from "express";

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

// WebSocketサーバーの作成
const initializeWebSocket = async() => {
	const connection = await databaseHandler.getConnection();
	const wssh = new WebSocketServerHandler(app,connection);
	return wssh.getServer();
};

// サーバーを立ち上げる
const startServer = async () => {
	await initializeDatabase(); // DB接続を先に行う
	const server = await initializeWebSocket();  // WebSocketサーバーを初期化

	server.listen(port, host, () => {
		console.log(`APIサーバーは http://${host}:${port} で実行中`);
	});
};

startServer();  // サーバー起動処理を実行
