import express from 'express';
import mysql from 'mysql2';
import WebSocket from 'ws';

// 設定定数のインポート
import { DB_CONFIG, SERVER_CONFIG } from './config';

const app = express();
const port = SERVER_CONFIG.port;
const host = SERVER_CONFIG.host;

// MySQL接続設定
const db = mysql.createConnection(DB_CONFIG);

// MySQL接続確認
const connectToDatabase = () => {
	db.connect((err) => {
		if (err) {
			console.error('MySQL接続エラー:', err);
			return;
		}
		console.log('MySQLに接続しました');
	});
};

connectToDatabase();

// expressサーバーの作成
const server = app.listen(port, host, () => {
	console.log(`APIサーバーはポート http://${host}:${port} で実行中`);
});

// WebSocketサーバーの作成
const wss = new WebSocket.Server({ server });

// WebSocket接続の処理
const handleWebSocketConnection = (ws: WebSocket) => {
	console.log('クライアントが接続しました');
	// 初期データ送信
	db.query('SELECT * FROM logs;', (err, results) => {
		if (err) {
			console.error('データ取得エラー:', err);
			return;
		}
		ws.send(JSON.stringify(results));
	});

	// メッセージ受信処理
	ws.on('message', (message) => {
		console.log('受信したメッセージ:', message);
	});

	// 接続が切れた場合
	ws.on('close', () => {
		console.log('クライアントが切断しました');
	});
};

wss.on('connection', handleWebSocketConnection);

// データ更新のブロードキャスト
const broadcastData = () => {
	db.query('SELECT * FROM logs;', (err, results) => {
		if (err) {
			console.error('データ取得エラー:', err);
			return;
		}
		// 全クライアントに更新データを送信
		wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(results));
			}
		});
	});
};

// /writeエンドポイントでデータベースに書き込み
app.post('/log/write', express.json(), (req: express.Request, res: express.Response) => {
	const { student_ID } = req.body;

	if (!student_ID) {
		res.status(400).json({ message: 'student_IDを提供してください' });
		return;
	}

	const query = `
    INSERT INTO logs (student_ID, isInRoom) 
    VALUES (?, TRUE)
    ON DUPLICATE KEY UPDATE
    isInRoom = NOT isInRoom,
    updated_at = CURRENT_TIMESTAMP;
  `;

	db.execute(query, [student_ID], (err, result: mysql.ResultSetHeader) => {
		if (err) {
			console.error('データ挿入エラー:', err);
			res.status(500).json({ message: 'データ挿入に失敗しました' });
			return ;
		}

		// データ更新後、WebSocketで全クライアントに通知
		broadcastData();

		res.status(200).json({ message: 'データが挿入されました', id: result.insertId });
		return ;
	});
});
