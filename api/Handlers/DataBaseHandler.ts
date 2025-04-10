import mysql from "mysql2";

export class DatabaseHandler {
	private db: mysql.Connection;

	constructor(dbConfig: mysql.ConnectionOptions) {
		this.db = mysql.createConnection(dbConfig);
	}

	public connect(): void {
		this.db.connect((err) => {
			if (err) {
				console.error("MySQL接続エラー:", err);
				return;
			}
			console.log("MySQLに接続しました");
		});
	}

	public getConnection(): mysql.Connection {
		return this.db;
	}
}
