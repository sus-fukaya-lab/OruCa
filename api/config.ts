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
	user: 'my_user',
	password: 'my_password',
	database: 'my_database',
}