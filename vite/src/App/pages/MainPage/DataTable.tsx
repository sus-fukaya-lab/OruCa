import { APIData, TWsMessage } from '@Apps/app.env';
import { useWebSocket } from '@Apps/contexts/WebSocketContext';
import { Table } from '@chakra-ui/react';
import Badge from '@components/Badge'; // 既存のBadgeコンポーネントを使用
import TableEmptyState from '@components/TableEmptyState';
import * as dateFns from "date-fns";
import { useEffect, useRef, useState } from 'react';

// DataTable コンポーネント
function DataTable() {
	const comvTF = [false, true];

	// 状態管理
	const [data, setData] = useState<APIData[]>([]);
	const { socket, requestData } = useWebSocket();

	// WebSocketの初期化
	useEffect(() => {
		if (!socket)return; 
		const handleMessage = (event: MessageEvent) => {
			const d: TWsMessage = JSON.parse(event.data);
			if (d.type === "log/fetch" && d.payload.content) {
				const newData = d.payload.content as APIData[];
				setData(newData);
			}
		};
		const handleClose = ()=>{
			console.log("close");
						
			didMountRef.current = false;
		}
		socket.addEventListener("message", handleMessage);
		socket.addEventListener("close",handleClose);

		// 初期データ要求
		requestData();

		// クリーンアップ
		return () => {
			socket.removeEventListener("message", handleMessage);
			socket.removeEventListener("close", handleClose);
		};
	}, [socket]);

	const didMountRef = useRef(false);
	useEffect(()=>{
		if (data.length > 0) {
			if (!didMountRef.current) {
				didMountRef.current = true;
				return;
			}else{
				const chance = Math.floor(Math.random() * 8192); // 0〜8191 の整数
				if (chance === 0) {
					// レア音鳴らす処理（1/8192 の確率）
					const src = "./god.mp3";
					const audio = new Audio(src);
					audio.play().catch((e) => {
						console.warn('音声の再生に失敗しました:', e);
					});
				} else {
					// ノーマル音
					playBeep(1200,0.1,0.2);
				}
				return;
			}
		}
		return ()=>{
			didMountRef.current = false;
		}
	},[data]);

	const thStyles: Table.ColumnHeaderProps = {
		color: "gray.100",
		textAlign: "center",
		fontWeight: "bold",
		textTransform: "uppercase"
	}
	const tdStyles: Table.CellProps = {
		color: "default",
		textAlign: "center",
		letterSpacing: 1,
		fontWeight: "semibold",
		fontSize: "xl",
		py: 1
	}


	const TableBody = ()=>{
		if (data.length <= 0) {
			return (
				<Table.Body fontSize={"xl"}>
					<Table.Row>
						<Table.Cell colSpan={4} {...tdStyles}>
							<TableEmptyState />
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			);
		} else {
			return (
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
			);
		}

	}

	return (
		<Table.ScrollArea borderWidth="2px" rounded="md" shadow={"md"}>
			<Table.Root variant={"outline"} tableLayout={"fixed"} size="md" stickyHeader fontSize={"lg"}>
				<Table.Header bg={"rgb(43, 37, 108)"}>
					<Table.Row>
						<Table.ColumnHeader {...thStyles}>学籍番号</Table.ColumnHeader>
						<Table.ColumnHeader {...thStyles}>氏名</Table.ColumnHeader>
						<Table.ColumnHeader {...thStyles}>在室状況</Table.ColumnHeader>
						<Table.ColumnHeader {...thStyles}>最終更新時</Table.ColumnHeader>
					</Table.Row>
				</Table.Header>
				<TableBody/>
			</Table.Root>
		</Table.ScrollArea>
	);
}

function formatTime(isoString: string) {
	const date = dateFns.parseISO(isoString);
	return dateFns.format(date, 'HH:mm:ss'); // JSTの時分秒をフォーマット
}

function playBeep(hz: number, volume: number, length: number) {
	const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
	const oscillator = audioCtx.createOscillator();
	const gainNode = audioCtx.createGain();

	// オシレーター設定：矩形波・周波数は1000Hz
	oscillator.type = "square";
	oscillator.frequency.setValueAtTime(hz, audioCtx.currentTime);

	// 音量設定
	gainNode.gain.setValueAtTime(volume, audioCtx.currentTime); // 適度な音量
	oscillator.connect(gainNode);
	gainNode.connect(audioCtx.destination);

	// 再生
	oscillator.start();
	oscillator.stop(audioCtx.currentTime + length); // 0.1秒後に停止（短い「ピッ」音）
};


export default DataTable;
