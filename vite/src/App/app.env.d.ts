export type APIData = {
	student_ID: string;
	student_Name:string|undefined;
	isInRoom: number;
	updated_at: string;
};


export type TWsProcessType = "log/fetch" | "log/write" | "user/auth" | "user/update_name";
export type TWsPayLoad = {
	result: boolean,
	content: undefined | mysql.QueryResult,
	message: string,
}
export type TWsMessage = {
	type: TWsProcessType,
	payload: TWsPayLoad
}
