import dotenv from "dotenv";
import WebSocket from 'ws';
dotenv.config();

// 型安全な取得関数
function getEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`環境変数 ${name} が設定されていません。`);
	}
	return value;
}

interface IServerConfig{
	port :number;
	host :string;
}

interface IDBConfig {
	host:string;
	user:string;
	password:string;
	database:string;
}

export const SERVER_CONFIG:IServerConfig = {
	port:3000,
	host:"api"
}

export const DB_CONFIG:IDBConfig = {
	host: 'mysql', // Docker Compose内でのサービス名を使用
	user: getEnv("MYSQL_USER"),
	password: getEnv("MYSQL_PASSWORD"),
	database: getEnv("MYSQL_DATABASE"),
}

export type WsProcessType = "log/fetch" | "log/write" | "user/auth" | "user/update_name";
export type WsPayLoad = {
	"log/fetch":{student_ID:string,},
	"log/write":{},
	"user/auth": { student_ID: string, password: string },
	"user/update_name":{}
}
export type WsMessage = {
	type:WsProcessType,
	payload:WsPayLoad[WsProcessType]
}
