import { APIData, TWsMessage } from '@Apps/app.env';
import { useWebSocket } from '@Apps/contexts/WebSocketContext';
import { Table } from '@chakra-ui/react';
import DeleteButton from '@components/DeleteButton';
import TableEmptyState from '@components/TableEmptyState';
import { toaster, Toaster } from "@snippets/toaster";
import { useEffect, useState } from 'react';
import DeleteDialog from './DeleteDialog';
import NameInput from './NameInput';


// DataTable コンポーネント
function EditableDataTable() {
	// 状態管理
	const [data, setData] = useState<APIData[]>([]);
	const { socket, requestData, sendMessage } = useWebSocket();
	const [_isSubmit, setIsSubmit] = useState(false);


	// WebSocketの初期化
	useEffect(() => {
		if (!socket) return;
		const handleMessage = (event: MessageEvent) => {
			const d: TWsMessage = JSON.parse(event.data);
			if (d.type === "log/fetch" && d.payload.content) {
				const newData = d.payload.content as APIData[];
				setData(newData);
				console.log("fetch");
			}
			if (d.type === "user/update_name" && d.payload.result) {
				if (d.payload.result) {
					toaster.create({
						title: "名前を変更しました！",
						description: "",
						type: "success",
						duration: 3000,
					});
				} else {
					toaster.create({
						title: "名前を変更出来ませんでした",
						description: "",
						type: "error",
						duration: 3000,
					});
				}
				setIsSubmit(false);
				requestData();
			}
			if (d.type === "user/delete" && d.payload.result) {
				if (d.payload.result) {
					toaster.create({
						title: "ユーザーを削除しました！",
						description: "",
						type: "success",
						duration: 3000,
					});
				} else {
					toaster.create({
						title: "ユーザーを削除出来ませんでした",
						description: "",
						type: "error",
						duration: 3000,
					});
				}
				requestData();
			}
		};
		socket.addEventListener("message", handleMessage);
		// クリーンアップ
		return () => {
			socket.removeEventListener("message", handleMessage);
		};
	}, [socket]);

	// ボタンクリック時の処理
	const handleSubmit = (student_ID: string, student_Name: string) => {
		if (!socket) return;
		setIsSubmit(true);
		if(student_Name === "")return;
		sendMessage({
			type: "user/update_name",
			payload: {
				result: true,
				content: [{ student_ID, student_Name }],
				message: `${student_ID}の名前を${student_Name}に変更`
			}
		});

		return;
	};

	const deleteUser = (student_ID:string)=>{
		if(!socket)return;
		sendMessage({
			type: "user/delete",
			payload: {
				result: true,
				content: [{ student_ID}],
				message: `ID:${student_ID}を削除`
			}
		});
		return;
	}

	useEffect(()=>{
		requestData();
	},[socket]);

	const thStyles: Table.ColumnHeaderProps = {
		color: "gray.100",
		textAlign: "center",
		fontWeight: "bold",
		textTransform: "uppercase",
	}
	const tdStyles: Table.CellProps = {
		color: "default",
		textAlign: "center",
		letterSpacing: 1,
		fontWeight: "semibold",
		fontSize: "xl",
		py: 3
	}

	const TableBody = () => {

		if (data.length <= 0) {
			return (
				<Table.Row>
					<Table.Cell colSpan={4} {...tdStyles}>
						<TableEmptyState />
					</Table.Cell>
				</Table.Row>
			);
		} else {
			return (
				<>
					{
						data.map((item) => (
							<Table.Row key={item.student_ID} _hover={{ bg: 'gray.100' }}>
								<Table.Cell {...tdStyles}>{item.student_ID}</Table.Cell>
								<Table.Cell {...tdStyles}>
									<NameInput
										student_ID={item.student_ID}
										student_Name={item.student_Name}
										onClick={handleSubmit}
									/>
								</Table.Cell>
								<Table.Cell {...tdStyles}>
									<DeleteDialog
										trigger={<DeleteButton />}
										student_ID={item.student_ID}
										student_Name={item.student_Name}
										onApproved={() => deleteUser(item.student_ID)}
									/>
								</Table.Cell>
							</Table.Row>
						))
					}
				</>
			);
		}
	}


	return (
		<>
			<Table.ScrollArea borderWidth="2px" rounded="md" shadow={"md"} maxH={"80vh"}>
				<Table.Root variant={"outline"} size="md" stickyHeader fontSize={"lg"}>
					<Table.Header bg={"rgb(43, 37, 108)"}>
						<Table.Row>
							<Table.ColumnHeader {...thStyles} w={"25%"}>学籍番号</Table.ColumnHeader>
							<Table.ColumnHeader {...thStyles} w={"50%"}>氏名</Table.ColumnHeader>
							<Table.ColumnHeader {...thStyles} w={"25%"}>削除ボタン</Table.ColumnHeader>
						</Table.Row>
					</Table.Header>
					<Table.Body fontSize={"xl"}>
						<TableBody/>
					</Table.Body>
				</Table.Root>
			</Table.ScrollArea>
			<Toaster />
		</>
	);
}



export default EditableDataTable;
