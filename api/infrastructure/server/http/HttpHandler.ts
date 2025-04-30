// HttpHandler.ts
import { SlackService } from "@infra/integrations/SlackServive";
import { DBresult, TWsMessage } from "@src/config";
import { hasProps } from "@src/utils";
import express from "express";
import mysql from "mysql2/promise";

export class HttpHandler {
	private connectionPool: mysql.PoolConnection;
	private slackService: SlackService;
	private onDataUpdated: () => Promise<void>;

	constructor(
		app: express.Express,
		connection: mysql.PoolConnection,
		onDataUpdated: () => Promise<void>
	) {
		this.connectionPool = connection;
		this.slackService = new SlackService();
		this.onDataUpdated = onDataUpdated;
		this.initializeHttpRoutes(app);
	}

	private initializeHttpRoutes(app: express.Express) {
		app.post("/log/write", express.json(), async (req: express.Request, res: express.Response) => {
			console.log("/log/write");

			const { type, payload } = req.body;
			if (!type ||
				!payload ||
				!hasProps<{ content: string }>(payload, ["content"]) ||
				!hasProps<{ student_ID: string }>(payload.content, ["student_ID"])
			) {
				res.status(400).json({ message: 'データの構造が不正です' });
				return;
			}

			const student_ID = payload.content.student_ID;
			const jsonMsg: TWsMessage = {
				type: "log/write",
				payload: {
					result: false,
					content: [],
					message: "不明なエラー",
				},
			};

			try {
				await this.connectionPool.execute("CALL insert_or_update_log(?);", [student_ID]);
				jsonMsg.payload = {
					result: true,
					content: [],
					message: "データが挿入されました"
				};
				res.status(200).json(jsonMsg);

				// 非同期でSlackにポストして、WebSocketクライアントにデータをブロードキャスト
				setTimeout(async () => {
					await this.notifySlackBot(student_ID);
				}, 2000);

				this.onDataUpdated();
				return;
			} catch (error) {
				jsonMsg.payload = {
					result: false,
					content: [],
					message: `データの挿入に失敗しました:${error}`
				};
				res.status(400).json(jsonMsg);
				return;
			}
		});
	}

	private async notifySlackBot(student_ID: string): Promise<void> {
		try {
			const countIsInRoom_query = `
        SELECT COUNT(*) AS inRoomCount
        FROM logs
        WHERE isInRoom = TRUE;
      `;

			const fetchNameByID_query = `
        SELECT student_Name, isInRoom
        FROM student_log_view 
        WHERE student_ID = ?;
      `;

			const [count_results] = await this.connectionPool.execute<DBresult["noHead"]>(countIsInRoom_query);

			if (!hasProps<{ inRoomCount: string }>(count_results[0], ["inRoomCount"])) {
				console.error("在室人数が取得できませんでした");
				return;
			}

			const inRoomCount = count_results[0].inRoomCount;

			const [written_results] = await this.connectionPool.execute<DBresult["noHead"]>(
				fetchNameByID_query, [student_ID]
			);

			if (!hasProps<{ isInRoom: number }>(written_results[0], ["isInRoom"])) {
				console.error("isInRoomが取得できませんでした");
				return;
			}

			let student_Name = "";
			if (hasProps<{ student_Name: string }>(written_results[0], ["student_Name"])) {
				student_Name = written_results[0].student_Name;
			}

			const name = `${student_Name ? `(${student_Name})` : ""}`;
			const convTF = [false, true];
			const isInRoom = convTF[written_results[0].isInRoom];
			const action = isInRoom ? "来た" : "帰った";
			const postMsg = `${student_ID}${name}が${action}よ～ (今の人数：${inRoomCount}人)`;

			await this.slackService.postMessage(postMsg);
		} catch (error) {
			console.error("Slack通知処理でエラーが発生しました:", error);
		}
	}
}