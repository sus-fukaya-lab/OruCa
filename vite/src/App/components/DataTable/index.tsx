import { useState, useEffect } from 'react';
import './DataTable.css';
import * as fns from 'date-fns';
import Badge from '@components/Badge';

const API_URL = '/socket';

function formatTime(utcString: string) {
	// ISO 8601形式の文字列をDateオブジェクトに変換
	const date = fns.parseISO(utcString);
	// JSTの時分秒をフォーマット
	const jstTime = fns.format(date, 'HH:mm:ss');
	return jstTime;
}

// DataTable コンポーネント
function DataTable() {
	type APIData = {
		student_ID: string;
		isInRoom: number;
		updated_at: string;
	};

	const comvTF = [true, false];

	// 状態管理
	const [data, setData] = useState<APIData[]>([]);
	const [isVisible, setIsVisible] = useState(false);

	// WebSocketの初期化
	useEffect(() => {
		const socket = new WebSocket(API_URL);  // サーバーのWebSocket URL

		socket.onmessage = (event) => {
			const newData: APIData[] = JSON.parse(event.data);
			setData(newData);
			setIsVisible(newData.length > 0); // テーブル表示
		};

		// クリーンアップ処理: コンポーネントがアンマウントされる時にWebSocketを閉じる
		return () => {
			socket.close();
		};
	}, []);

	return (
		<>
			{/* <button>データ取得</button> */}
			<table>
				<thead>
					<tr>
						<th>学籍番号</th>
						<th>在室状況</th>
						<th>最終更新時</th>
					</tr>
				</thead>
				{isVisible && (
					<tbody>
						{data.map((item) => (
							<tr key={item.student_ID}>
								<td>{item.student_ID}</td>
								<td>
									<Badge
										isTrue={comvTF[item.isInRoom]}
										text={{ true: '在室', false: '不在' }}
									/>
								</td>
								<td>{formatTime(item.updated_at)}</td>
								{/* <td style={{ padding: "0 10px" }}><DeleteTooltip onDelete={() => deleteRecord(item.id)} /></td> */}
							</tr>
						))}
					</tbody>
				)}

			</table>
		</>
	);
}

export default DataTable;
