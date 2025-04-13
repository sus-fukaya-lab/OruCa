import { useState, useMemo} from 'react';
import { Table, Box } from '@chakra-ui/react';
import * as dateFns from "date-fns";
import { useWebSocket } from '@Apps/contexts/WebSocketContext';
import Badge from '@components/Badge'; // 既存のBadgeコンポーネントを使用
import { APIData, TWsMessage } from '@Apps/app.env';

function formatTime(isoString: string) {
	const date = dateFns.parseISO(isoString);
	return dateFns.format(date, 'HH:mm:ss'); // JSTの時分秒をフォーマット
}

// DataTable コンポーネント
function DataTable() {

	const comvTF = [true, false];

	// 状態管理
	const [data, setData] = useState<APIData[]>([]);
	const [isVisible, setIsVisible] = useState(false);
	const { socket, requestData } = useWebSocket();

	// WebSocketの初期化
	useMemo(() => {
		if (socket) {
			socket.onmessage = (event) => {
				const d: TWsMessage = JSON.parse(event.data);
				if (d.type === "log/fetch") {
					if (d.payload.content) {
						const newData = d.payload.content as APIData[];
						setData(newData);
						setIsVisible(newData.length > 0);
						}
					}
				}
		};
			// ページ再マウント時にデータをリクエスト
			requestData();
	}, [socket]);

	const thStyles: Table.ColumnHeaderProps = {
		color: "gray.100",
		textAlign: "center",
		fontWeight: "bold",
		textTransform: "uppercase"
	}
	const tdStyles: Table.CellProps = {
		color:"default",
		textAlign: "center",
		letterSpacing: 1,
		fontWeight: "semibold",
		fontSize: "2xl"
	}

	return (
		<Table.ScrollArea borderWidth="2px" rounded="md" shadow={"md"}>
			<Table.Root variant={"outline"} size="md" stickyHeader fontSize={"lg"}>
				<Table.Header bg={"rgb(43, 37, 108)"}>
					<Table.Row>
						<Table.ColumnHeader {...thStyles}>学籍番号</Table.ColumnHeader>
						<Table.ColumnHeader {...thStyles}>氏名</Table.ColumnHeader>
						<Table.ColumnHeader {...thStyles}>在室状況</Table.ColumnHeader>
						<Table.ColumnHeader {...thStyles}>最終更新時</Table.ColumnHeader>
					</Table.Row>
				</Table.Header>
				{isVisible && (
					<Table.Body fontSize={"xl"}>
						{data.map((item) => (
							<Table.Row key={item.student_ID} _hover={{ bg: 'gray.100' }}>
								<Table.Cell {...tdStyles}>{item.student_ID}</Table.Cell>
								<Table.Cell {...tdStyles} color={item.student_Name ? "default" : "none"}>
									{item.student_Name ? item.student_Name : "未登録"}
								</Table.Cell>
								<Table.Cell textAlign={"center"}>
									<Badge isTrue={comvTF[item.isInRoom]} text={{ true: '在室', false: '不在' }} />
								</Table.Cell>
								<Table.Cell {...tdStyles}>{formatTime(item.updated_at)}</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				)}
			</Table.Root>
		</Table.ScrollArea>
	);
}

export default DataTable;
