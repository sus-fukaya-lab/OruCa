import { useState,useEffect } from 'react';
import './DataTable.css';
import DeleteTooltip from './DeleteToolTip';  // Tooltipコンポーネントをインポート
import * as fns from "date-fns";
import Badge from './Badge';

const API_URL = "http://api:3000"

function formatTime(utcString:string){
	// ISO 8601形式の文字列をDateオブジェクトに変換
	const date = fns.parseISO(utcString);

	// UTCからJSTに9時間を加算
	const jstDate = fns.addHours(date, 9);

	// JSTの時分秒をフォーマット
	const jstTime = fns.format(jstDate, 'HH:mm:ss');

	return jstTime;
}

// DataTable コンポーネント
function DataTable() {
	type APIData = {
		student_ID:string;
		isInRoom:number;
		updated_at:string;
	};

	const comvTF = [true,false];

	// 状態管理
	const [data, setData] = useState<APIData[]>([]);
	const [isVisible, setIsVisible] = useState(false);

	// データ取得関数
	const getData = async () => {
		try {			
			const response = await fetch(`/api/log/fetch`);

			if (!response.ok) throw new Error('データの取得に失敗しました');
			const jsonData: APIData[] = await response.json();
			setData(jsonData);
			setIsVisible(jsonData.length > 0); // テーブル表示
		} catch (e) {
			console.error('データ取得エラー:', e);
		}
	};

	// 削除関数
	const deleteRecord = async (student_ID:string) => {
		try {
			const response = await fetch('/api/delete', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ student_ID }),
			});
			if (response.ok) {
				// 削除成功後、データを再取得して更新
				const updatedData = data.filter(item => item.student_ID !== student_ID);
				setData(updatedData);
				alert('データが削除されました');
			} else {
				alert('削除に失敗しました');
			}
		} catch (e) {
			console.error('削除エラー:', e);
			alert('削除に失敗しました');
		}
	};
	
	useEffect(() => {
		// 2秒ごとにgetDataを実行
		const intervalId = setInterval(getData, 300);

		// クリーンアップ処理: コンポーネントがアンマウントされる時にintervalをクリア
		return () => {
			clearInterval(intervalId);
		};
	}, []);  // 空の依存配列: 初回マウント時にのみ実行

	return (
		<>
			<button>データ取得</button>
			{isVisible && (
				<table>
					<thead>
						<tr>
							<th>学籍番号</th>
							<th>在室状況</th>
							<th>最終更新時</th>
						</tr>
					</thead>
					<tbody>
						{data.map((item) => (
							<tr key={item.student_ID}>
								<td>{item.student_ID}</td>
								<td>
									<Badge 
									isTrue={comvTF[item.isInRoom]} 
									text={{true:"居るよ",false:"居ないよ"}}/>
								</td>
								<td>{formatTime(item.updated_at)}</td>
								{/* <td style={{
									padding:"0 10px"
								}}><DeleteTooltip onDelete={() => deleteRecord(item.id)} /></td> */}
							</tr>
						))}
					</tbody>
				</table>
			)}
		</>
	);
}

export default DataTable;
