export type APIData = {
	student_ID: string;
	student_Name:string|undefined;
	isInRoom: number;
	updated_at: string;
};


export type WsProcessType = "log/fetch" | "user/auth" | "user/update_name";
export type WsPayLoad = {
	"log/fetch": APIData[],
	"user/auth": { result:boolean},
	"user/update_name": {result:boolean}
}
export type WsMessage = {
	type: WsProcessType,
	payload: WsPayLoad[WsProcessType]
}

