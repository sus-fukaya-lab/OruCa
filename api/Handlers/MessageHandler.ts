import { TWsMessage } from "../config";
import mysql from "mysql2";
import { createHash } from "crypto";
import WebSocket from "ws";
import { hasProps, sendWsMessage } from '../utils';

// HandlerFunction型定義
type HandlerFunction = (ws: WebSocket.WebSocket, data: TWsMessage) => void;

export class MessageHandler {
	private wss: WebSocket.Server;
	private db: mysql.Connection;

	constructor(wss: WebSocket.Server, db: mysql.Connection) {
		this.wss = wss;
		this.db = db;
	}

	public fetchAndSendLogs(callback: (results: mysql.QueryResult) => void) {
		// データをクライアントに送信
		this.db.query("SELECT * FROM student_log_view;", (err, results) => {
			if (err) {
				console.error("データ取得エラー:", err);
				return;
			}
			callback(results);
		});
	}

	public fetchToken(student_ID: string, callback: (results: mysql.QueryResult) => void) {
		this.db.execute("CALL get_student_token(?);", [student_ID], (err, results) => {
			if (err) {
				console.error("データ取得エラー:", err);
				return;
			}
			callback(results);
		});
	}

	// データ更新のブロードキャスト
	public broadcastData() {
		this.fetchAndSendLogs((r) => {
			// 全クライアントに更新データを送信
			this.wss.clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					const jsonMsg: TWsMessage = {
						type: "log/fetch",
						payload: {
							result: true,
							content: r,
							message: "在室データ",
						},
					};
					sendWsMessage(client,jsonMsg);
				}
			});
		});
	}

	// 各メッセージの処理
	public handlers: Record<string, HandlerFunction> = {
		"log/fetch": (ws, data) => {
			this.fetchAndSendLogs((r) => {
				const jsonMsg: TWsMessage = {
					type: "log/fetch",
					payload: {
						result: true,
						content: r,
						message: "在室データ",
					},
				};
				sendWsMessage(ws,jsonMsg);
			});
		},

		"log/write": (ws, data) => {
			const content = data.payload?.content;
			if (!hasProps<{ student_ID: string }>(content, ["student_ID"])) return;

			this.db.execute(`CALL insert_or_update_log(?);`, [content.student_ID], (err, result: mysql.ResultSetHeader) => {
				const jsonMsg: TWsMessage = {
					type: "log/fetch",
					payload: {
						result: !err,
						content: undefined,
						message: err ? `データ挿入エラー:${err}` : `データが挿入されました:${result.insertId}`,
					},
				};
				sendWsMessage(ws,jsonMsg)
				if (!err) this.broadcastData();
			});
		},

		"user/auth": (ws, data) => {
			const content = data.payload?.content;
			if (!hasProps<{ student_ID: string; password: string }>(content, ["student_ID", "password"])) return;

			this.fetchToken(content.student_ID, (r) => {
				if (!hasProps<{ token: string }>(r, ["token"])) return;

				const { token } = r as unknown as { token: string };

				const generateSHA256Hash = (input: string): string => {
					const hash = createHash("sha256");
					hash.update(input);
					return hash.digest("hex");
				};

				const salt = generateSHA256Hash(content.student_ID);
				const expectedToken = generateSHA256Hash(`${content.student_ID}${content.password}${salt}`);
				const jsonMsg: TWsMessage = {
					type: "user/auth",
					payload: {
						result: token === expectedToken,
						content: undefined,
						message: token === expectedToken ? "認証成功" : "認証エラー"
					},
				};
				sendWsMessage(ws,jsonMsg)
			});
		},
	};
}
