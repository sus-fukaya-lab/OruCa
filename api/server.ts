import express from 'express';
import mysql from 'mysql2';
const app = express();
const port = 3000;
const host = "0.0.0.0";

// MySQL接続設定
const db = mysql.createConnection({
	host: 'mysql', // Docker Compose内でサービス名を使用
	user: 'my_user',
	password: 'my_password',
	database: 'my_database'
});

// MySQL接続確認
db.connect((err) => {
	if (err) {
		console.error('MySQL接続エラー:', err);
		return;
	}
	console.log('MySQLに接続しました');
});

app.get('/log/fetch', (req: express.Request, res: express.Response) => {
	const { start_date, limit = 0 } = req.query;

	// 基本のクエリ
	let query = 'SELECT * FROM logs WHERE 1=1';

	// 開始日による絞り込み
	if (start_date) {
		query += ` AND timestamp >= '${start_date}'`;
	}

	// 絞り込んだ結果に件数制限を加える（デフォルトは0で制限なし）
	if (typeof limit === "number" && limit > 0) {
		query += ` LIMIT ${limit}`;
	}

	db.query(query, (err, results) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ message: 'Error fetching logs' }); // エラー時はレスポンスを1回だけ送る
		}

		// 結果がある場合にレスポンス
		if (results && Array.isArray(results) && results.length > 0) {
			return res.json(results);
		}

		// 結果がない場合にメッセージを返す
		res.status(404).json({ message: 'No logs found' });
	});
});


// /writeエンドポイントでデータベースに書き込み
app.post('/log/write', express.json(), (req: express.Request, res: express.Response) => {
	const { student_ID} = req.body; // req.bodyからデータを取得

	// idm,pmm,timestampが提供されていない場合はエラーメッセージを返す
	if (!student_ID) {
		res.status(400).json({ message: 'student_IDを提供してください' });
		return;
	}

	// SQLクエリでデータを挿入
	const query = 
		"INSERT INTO logs (student_ID,isInRoom) "+
		"VALUES (?, TRUE) "+
		"ON DUPLICATE KEY UPDATE "+
		"isInRoom = NOT isInRoom,"+
		"updated_at = CURRENT_TIMESTAMP;";
	db.execute(query, [student_ID], (err, result: mysql.ResultSetHeader) => {  // ここでdbを使用
		if (err) {
			console.error('データ挿入エラー:', err);
			if (!res.headersSent) {  // ヘッダーが送信されていない場合にレスポンスを返す
				return res.status(500).json({ message: 'データ挿入に失敗しました' });
			}
		}
		if (!res.headersSent) {  // ヘッダーが送信されていない場合にレスポンスを返す
			// 成功した場合は挿入されたIDを返す
			res.status(200).json({ message: 'データが挿入されました', id: result.insertId });
		}
	});
});


// サーバー起動
app.listen(port, host, () => {
	console.log(`APIサーバーはポート http://${host}:${port} で実行中`);
});
