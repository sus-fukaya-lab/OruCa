import express from 'express';
import mysql from 'mysql2';
import WebSocket from 'ws';
import { createHash } from 'crypto';

// 設定定数のインポート
import { DB_CONFIG, SERVER_CONFIG, WsMessage, WsPayLoad } from './config';

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

const fetchAndSendLogs = (callback: (results: mysql.QueryResult) =>void)=>{
	// 初期データをこのクライアントに送信
	db.query('SELECT * FROM student__view;', (err, results) => {
		if (err) {
			console.error('データ取得エラー:', err);
			return;
		}
		callback(results);
	});
}

const fetchToken = (student_ID:string,callback: (results: mysql.QueryResult) => void)=>{
	// 初期データをこのクライアントに送信
	db.execute("CALL get_student_token('?');",[student_ID],(err, results) => {
		if (err) {
			console.error('データ取得エラー:', err);
			return;
		}
		callback(results);
	});
}

// WebSocket接続の処理
const handleWebSocketConnection = (ws: WebSocket) => {
	console.log('クライアントが接続しました');
	
	// 初期データをこのクライアントに送信
	fetchAndSendLogs((r) => ws.send(JSON.stringify(r)))

	// メッセージ受信処理
	ws.on('message', (message) => {
		try {
			const data:WsMessage = JSON.parse(message.toString("utf-8"));
			switch (data.type) {
				case "log/fetch":
					// 最新のデータをこのクライアントに送信
					fetchAndSendLogs((r) => {
						const jsonMsg = {
							type: "log/fetch",
							payload: r
						}
						ws.send(JSON.stringify(jsonMsg));
					})
					break;
				case "user/auth":
					const {student_ID,password} = data.payload as WsPayLoad["user/auth"];
					fetchToken(student_ID,(r)=>{
						const { token } = r as unknown as { token: string };
						function generateSHA256Hash(input: string): string {
							const hash = createHash('sha256');
							hash.update(input);
							return hash.digest('hex');
						}
						const salt = generateSHA256Hash(student_ID);
						const gen_token_raw = `${student_ID}${password}${salt}`;
						const gen_token_hash = generateSHA256Hash(gen_token_raw);
						const jsonMsg = {
							type: "user/auth",
							payload: {
								result: false
							}
						}
						if (gen_token_hash === token) {
							jsonMsg.payload.result = true;
							ws.send(JSON.stringify(jsonMsg));
							return;
						}else{
							jsonMsg.payload.result = false;
							ws.send(JSON.stringify(jsonMsg));
						}
					});
				default:
					break;
			}

		} catch (error) {
			
		}
	});

	// 接続が切れた場合
	ws.on('close', () => {
		console.log('クライアントが切断しました');
	});
};

wss.on('connection', handleWebSocketConnection);

// データ更新のブロードキャスト
const broadcastData = () => {
	fetchAndSendLogs((r) =>{
		// 全クライアントに更新データを送信
		wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(r));
			}
		});
	})
};

// /writeエンドポイントでデータベースに書き込み
app.post('/log/write', express.json(), (req: express.Request, res: express.Response) => {
	const { student_ID } = req.body;

	if (!student_ID) {
		res.status(400).json({ message: 'student_IDを提供してください' });
		return;
	}

	const query = `CALL insert_or_update_log('?');`;

	db.execute(query, [student_ID], (err, result: mysql.ResultSetHeader) => {
		if (err) {
			console.error('データ挿入エラー:', err);
			res.status(500).json({ message: 'データ挿入に失敗しました' });
			return ;
		}

		// データ更新後、WebSocketで全クライアントに通知
		broadcastData();

		res.status(200).json({ message: 'データが挿入されました', id: result.insertId });
	});
});

