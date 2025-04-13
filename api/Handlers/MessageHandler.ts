import { TWsMessage, TWsProcessType } from "../config";
import mysql from "mysql2/promise";
import express from "express";
import { createHash } from "crypto";
import WebSocket from "ws";
import { hasProps, sendWsMessage } from '../utils';

// HandlerFunction型定義
type HandlerFunction = (ws: WebSocket.WebSocket, data: TWsMessage) => void;

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
			const [results] = await this.connectionPool.execute<[mysql.RowDataPacket[]]>("SELECT * FROM student_log_view;");
			return results;
		} catch (err) {
			console.error("データ取得エラー:", err);
			return [];
		}
	}

	// トークンを取得する非同期メソッド
	public async fetchToken(student_ID: string) {
		try {
			const [packet] = await this.connectionPool.execute<[mysql.RowDataPacket[], mysql.ResultSetHeader]>("CALL get_student_token(?);", [student_ID]);
			const [results] = packet;
			return results;
		} catch (err) {
			console.error("データ取得エラー:", err);
			return [];
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
					content: result,
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

		}
	};
}
