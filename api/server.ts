import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
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

// /dataエンドポイントでデータベースからデータを取得
app.get('/data', (req: express.Request, res: express.Response) => {
	db.query('SELECT * FROM users', (err, results) => {
		if (err) {
			res.status(500).send('データベースエラー');
			return;
		}
		res.json(results);
	});
});

// /writeエンドポイントでデータベースに書き込み
app.post('/write', express.json(), (req: express.Request, res: express.Response) => {
	const { name, email } = req.body; // req.bodyからデータを取得

	// nameとemailが提供されていない場合はエラーメッセージを返す
	if (!name || !email) {
		res.status(400).json({ message: 'nameとemailを提供してください' });
		return;
	}

	// SQLクエリでデータを挿入
	const query = 'INSERT INTO users (name, email) VALUES (?, ?)';
	db.execute(query, [name, email], (err, result:mysql.ResultSetHeader) => {  // ここでdbを使用
		if (err) {
			console.error('データ挿入エラー:', err);
			return res.status(500).json({ message: 'データ挿入に失敗しました' });
		}

		// 成功した場合は挿入されたIDを返す
		res.status(200).json({ message: 'データが挿入されました', id: result.insertId });
	});
});

// /deleteエンドポイントで指定したIDのレコードを削除
app.delete('/delete', express.json(), (req: express.Request, res: express.Response) => {
	const { id } = req.body; // req.bodyからIDを取得

	// IDが提供されていない場合はエラーメッセージを返す
	if (!id) {
		res.status(400).json({ message: '削除するIDを提供してください' });
		return;
	}

	// SQLクエリでデータを削除
	const query = 'DELETE FROM users WHERE id = ?';
	db.execute(query, [id], (err, result:mysql.ResultSetHeader) => {
		if (err) {
			console.error('削除エラー:', err);
			res.status(500).json({ message: 'データ削除に失敗しました' });
			return;
		}

		// 結果が0件の場合、IDが存在しないことを知らせる
		if (result.affectedRows === 0) {
			res.status(404).json({ message: '指定されたIDのレコードは存在しません' });
			return;
		}

		// 成功した場合は削除完了メッセージを返す
		res.status(200).json({ message: 'データが削除されました' });
	});
});

// サーバー起動
app.listen(port, host, () => {
	console.log(`APIサーバーはポート http://${host}:${port} で実行中`);
});
