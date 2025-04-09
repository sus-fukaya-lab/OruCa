import { useState, useMemo } from 'react';
import { Table, Box, Text } from '@chakra-ui/react';
import * as dateFns from "date-fns";
import { useWebSocket } from '@Apps/contexts/WebSocketContext';
import Badge from '@components/Badge'; // 既存のBadgeコンポーネントを使用
import { APIData, WsMessage, WsPayLoad } from '@Apps/app.env';

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
				const d:WsMessage = JSON.parse(event.data);
				if(d.type === "log/fetch"){
					const newData: APIData[] = d.payload as WsPayLoad["log/fetch"];
					setData(newData);
					setIsVisible(newData.length > 0);
				}
			};
			// ページ再マウント時にデータをリクエスト
			requestData();
		}
	}, [socket]);

	const thStyles: Table.ColumnHeaderProps ={
		color:"gray.100",
		textAlign:"center",
		fontWeight:"bold",
		textTransform:"uppercase"
	}
	const tdStyles:Table.CellProps = {
		textAlign:"center",
		letterSpacing:1,
		fontWeight:"semibold",
		fontSize:"lg"
	}

	return (
		<Box
			w={"100%"}
			h={"100%"}
			p={4}
			px={"10%"}
			pt={"10%"}
		>
			<Table.ScrollArea borderWidth="2px" rounded="md">
				<Table.Root variant={"outline"} size="md" stickyHeader>
					<Table.Header bg={"linear-gradient(135deg,rgb(29, 25, 96),rgb(80, 74, 154));"}>
						<Table.Row fontSize={"md"}>
							<Table.ColumnHeader {...thStyles}>学籍番号</Table.ColumnHeader>
							<Table.ColumnHeader {...thStyles}>氏名</Table.ColumnHeader>
							<Table.ColumnHeader {...thStyles}>在室状況</Table.ColumnHeader>
							<Table.ColumnHeader {...thStyles}>最終更新時</Table.ColumnHeader>
						</Table.Row>
					</Table.Header>
					{isVisible && (
						<Table.Body>
							{data.map((item) => (
								<Table.Row key={item.student_ID} _hover={{ bg: 'gray.100' }}>
									<Table.Cell {...tdStyles}>{item.student_ID}</Table.Cell>
									<Table.Cell {...tdStyles}>なまえ</Table.Cell>
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
		</Box>
	);
}

export default DataTable;
