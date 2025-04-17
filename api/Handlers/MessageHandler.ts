import { createHash } from "crypto";
import express from "express";
import mysql from "mysql2/promise";
import WebSocket from "ws";
import { TWsMessage, TWsProcessType } from "../config";
import { hasProps, sendWsMessage } from '../utils';

// HandlerFunction型定義
type HandlerFunction = (ws: WebSocket.WebSocket, data: TWsMessage) => void;

type DBresult = {
	"default": [mysql.RowDataPacket[], mysql.ResultSetHeader];
	"noHead": [mysql.RowDataPacket[]];
}

export class MessageHandler {
	private wss: WebSocket.Server;
	private connectionPool: mysql.PoolConnection;
	private expressServer : express.Express;
	
	constructor(es:express.Express,wss: WebSocket.Server, connection:mysql.PoolConnection) {
		this.expressServer = es;
		this.wss = wss;
		this.connectionPool = connection;  // プールを作成
	}

	// 非同期でログを取得し、クライアントに送信
	public async fetchLogs() {
		try {
			const query = "SELECT * FROM student_log_view;";
			const [results] = await this.connectionPool.execute<DBresult["noHead"]>(query);
			return results;
		} catch (err) {
			console.error("データ取得エラー:", err);
			return [];
		}
	}

	// トークンを取得する非同期メソッド
	private async fetchToken(student_ID: string) {
		try {
			const query = "CALL get_student_token(?);"
			const [packet] = await this.connectionPool.execute<DBresult["default"]>(query, [student_ID]);
			const [results] = packet;
			return results;
		} catch (err) {
			console.error("データ取得エラー:", err);
			return [];
		}
	}

	private async updateName(student_ID:string,student_Name:string){
		try {
			const query = "CALL update_student_name(?,?);"
			await this.connectionPool.execute<DBresult["default"]>(query, [student_ID,student_Name]);
		} catch (err) {
			console.error("データ更新エラー:", err);
			throw err;
		}
	}

	private async deleteUser(student_ID:string){
		try {
			const query = `DELETE FROM users WHERE student_ID = ?;`
			await this.connectionPool.execute<DBresult["default"]>(query, [student_ID]);
		} catch (err) {
			console.error("データ削除エラー:", err);
			throw err;
		}
	}
	

	// データ更新のブロードキャスト
	public async broadcastData() {
		try {
			const logs = await this.fetchLogs();  // 非同期でログを取得
			this.wss.clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					const jsonMsg: TWsMessage = {
						type: "log/fetch",
						payload: {
							result: true,
							content: logs,
							message: "在室データ",
						},
					};
					sendWsMessage(client, jsonMsg);
				}
			});
		} catch (err) {
			console.error("データのブロードキャストエラー:", err);
		}
	}

	// 各メッセージの処理
	public handlers: Record<TWsProcessType, HandlerFunction> = {
		"ack":async (ws,data)=>{
			const jsonMsg: TWsMessage = {
				type: "ack",
				payload: {
					result: false,
					content: [{ status: false }],
					message: "通信ステータス",
				},
			};
			try {
				jsonMsg.payload.result = true;
				jsonMsg.payload.content = [{status:true}];
				sendWsMessage(ws, jsonMsg);
			} catch (error) {
				jsonMsg.payload.result = false;
				jsonMsg.payload.content = [{ status: false }];
				sendWsMessage(ws,jsonMsg)
			}
		},
		"log/fetch": async (ws, data) => {
			try {
				const logs = await this.fetchLogs();  // 非同期でログを取得
				const jsonMsg: TWsMessage = {
					type: "log/fetch",
					payload: {
						result: true,
						content: logs,
						message: "在室データ",
					},
				};
				sendWsMessage(ws, jsonMsg);
			} catch (error) {
				console.error("ログ取得エラー:", error);
			}
		},
		"log/write": async (ws, data) => {
			const content = data.payload?.content;
			if (!hasProps<{ student_ID: string}>(content, ["student_ID"])) return;

			try {
				await this.connectionPool.execute("CALL insert_or_update_log(?);", [content.student_ID]);
				const jsonMsg: TWsMessage = {
					type: "log/write",
					payload: {
						result: true,
						content: [],
						message: `データが挿入されました`,
					},
				};
				sendWsMessage(ws, jsonMsg);
				this.broadcastData();  // 更新データを全クライアントに送信
			} catch (err) {
				const jsonMsg: TWsMessage = {
					type: "log/write",
					payload: {
						result: false,
						content: [],
						message: `データ挿入エラー:${err}`,
					},
				};
				sendWsMessage(ws, jsonMsg);
			}
		},
		"user/fetchToken": async (ws,data)=>{
			const content = data.payload?.content;
			const jsonMsg: TWsMessage = {
				type: "user/fetchToken",
				payload: {
					result: false,
					content: [],
					message: "不明なエラー",
				},
			};
			try {
				if (!hasProps<{ student_ID: string }>(content, ["student_ID"])){
					jsonMsg.payload = {
						result:false,
						content:[],
						message:"student_IDがありません"
					}
					sendWsMessage(ws, jsonMsg);
					return;
				};

				const result = await this.fetchToken(content.student_ID);
				
				if (!hasProps<{ student_token: string }>(result, ["student_token"])){
					jsonMsg.payload = {
						result: false,
						content: [],
						message: "student_tokenがありません"
					}
					sendWsMessage(ws, jsonMsg);
					return;
				};

				jsonMsg.payload = {
					result: true,
					content: [result],
					message: "認証トークンのfetch"
				}
				sendWsMessage(ws,jsonMsg);
			} catch (err) {
				console.error("トークンフェッチエラー:", err);
			}
		},
		"user/auth": async (ws, data) => {
			const [content] = data.payload?.content;
			const jsonMsg: TWsMessage = {
				type: "user/auth",
				payload: {
					result: false,
					content: [],
					message: "不明なエラー",
				},
			};

			try {
				if (!hasProps<{ student_ID: string; password: string }>(content, ["student_ID", "password"])) {
					jsonMsg.payload = {
						result: false,
						content: [],
						message: "student_ID または password がありません"
					};
					sendWsMessage(ws, jsonMsg);
					return;
				}

				const [result] = await this.fetchToken(content.student_ID);

				if (!hasProps<{ student_token: string }>(result, ["student_token"])) {
					jsonMsg.payload = {
						result: false,
						content: [],
						message: "student_tokenが取得できませんでした"
					};
					sendWsMessage(ws, jsonMsg);
					return;
				}

				const { student_token } = result;

				const generateSHA256Hash = (input: string): string => {
					const hash = createHash("sha256");
					hash.update(input);
					return hash.digest("hex");
				};

				const salt = generateSHA256Hash(content.student_ID);
				const expectedToken = generateSHA256Hash(`${content.student_ID}${content.password}${salt}`);

				const isValid = student_token === expectedToken;

				jsonMsg.payload = {
					result: isValid,
					content: [],
					message: isValid ? "認証成功" : "認証エラー",
				};
				sendWsMessage(ws, jsonMsg);
			} catch (err) {
				console.error("認証エラー:", err);
				jsonMsg.payload = {
					result: false,
					content: [],
					message: "サーバー内部エラーが発生しました"
				};
				sendWsMessage(ws, jsonMsg);
			}
		},
		"user/update_name":async (ws,data)=>{
			const [content] = data.payload?.content;
			const jsonMsg: TWsMessage = {
				type: "user/update_name",
				payload: {
					result: false,
					content: [],
					message: "不明なエラー",
				},
			};
			try {
				if (!hasProps<{ student_ID: string; student_Name: string }>(content, ["student_ID", "student_Name"])) {
					jsonMsg.payload = {
						result: false,
						content: [],
						message: "student_ID または student_Name がありません"
					};
					sendWsMessage(ws, jsonMsg);
					return;
				}
				const {student_ID,student_Name} = content;
				
				await this.updateName(student_ID,student_Name);
				jsonMsg.payload = {
					result: true,
					content: [],
					message: `更新完了（${student_ID}：${student_Name}）`,
				};
				sendWsMessage(ws, jsonMsg);
			} catch (err) {
				console.error("更新エラー:", err);
				jsonMsg.payload = {
					result: false,
					content: [],
					message: "更新失敗"
				};
				sendWsMessage(ws, jsonMsg);
			}
		},
		"user/delete":async (ws,data) => {
			const [content] = data.payload?.content;
			const jsonMsg: TWsMessage = {
				type: "user/delete",
				payload: {
					result: false,
					content: [],
					message: "不明なエラー",
				},
			};
			try {
				if (!hasProps<{ student_ID: string}>(content, ["student_ID"])) {
					jsonMsg.payload = {
						result: false,
						content: [],
						message: "student_IDがありません"
					};
					sendWsMessage(ws, jsonMsg);
					return;
				}
				const { student_ID} = content;

				await this.deleteUser(student_ID);

				jsonMsg.payload = {
					result: true,
					content: [],
					message: `削除完了（${student_ID}）`,
				};
				sendWsMessage(ws, jsonMsg);
			} catch (err) {
				console.error("削除エラー:", err);
				jsonMsg.payload = {
					result: false,
					content: [],
					message: "削除失敗"
				};
				sendWsMessage(ws, jsonMsg);
			}

		}
	};
}
