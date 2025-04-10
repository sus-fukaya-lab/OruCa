import dotenv from "dotenv";
import WebSocket from 'ws';
import mysql from "mysql2";
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

export type TWsProcessType = "log/fetch" | "log/write" | "user/auth" | "user/update_name";
export type TWsPayLoad = {
	result:boolean,
	content: undefined | mysql.QueryResult,
	message:string,
}
export type TWsMessage = {
	type:TWsProcessType,
	payload:TWsPayLoad
}
