import WebSocket from "ws";
import { TWsMessage } from "./config";

export const hasProps = <T extends object>(obj: any, props: (keyof T)[]): obj is T => {
	return props.every((prop) => prop in obj);
};

/**
 * WebSocketのsend処理をラップする関数
 * @param ws WebSocketクライアント
 * @param data 送信するメッセージデータ
 */
export const sendWsMessage = (ws: WebSocket.WebSocket, data: TWsMessage): void => {
	try {
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(data));
		} else {
			console.error('WebSocketが開かれていません');
		}
	} catch (error) {
		console.error('メッセージ送信エラー:', error);
	}
};
