import mysql from "mysql2/promise";  // promise版をインポート

export class DatabaseHandler {
	private dbPool: mysql.Pool;  // プールの型をmysql.Poolに変更

	constructor(dbConfig: mysql.PoolOptions) {
		this.dbPool = mysql.createPool(dbConfig);  // プールの作成
	}

	// 非同期接続メソッド
	public async connect(): Promise<void> {
		try {
			const connection = await this.dbPool.getConnection();  // プールから接続を取得
			console.log("MySQLに接続しました");
			connection.release();  // 使用後は必ず接続をリリース
		} catch (err) {
			console.error("MySQL接続エラー:", err);
		}
	}

	// プールから接続を取得
	public async getConnection(): Promise<mysql.PoolConnection> {
		return await this.dbPool.getConnection();  // プールから非同期で接続を取得
	}

	// プールを閉じる
	public close(): void {
		this.dbPool.end();  // プールを閉じる
	}
}
