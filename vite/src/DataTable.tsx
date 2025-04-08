import { useState } from 'react';
import './DataTable.css';
import DeleteTooltip from './DeleteToolTip';  // Tooltipコンポーネントをインポート

// DataTable コンポーネント
function DataTable() {
	type APIData = {
		id: number;
		name: string;
		email: string;
	};

	// 状態管理
	const [data, setData] = useState<APIData[]>([]);
	const [isVisible, setIsVisible] = useState(false);



	// データ取得関数
	const getData = async () => {
		try {
			const response = await fetch('/api/data');
			if (!response.ok) throw new Error('データの取得に失敗しました');
			const jsonData: APIData[] = await response.json();
			setData(jsonData);
			setIsVisible(jsonData.length > 0); // テーブル表示
		} catch (e) {
			console.error('データ取得エラー:', e);
		}
	};

	// 削除関数
	const deleteRecord = async (id: number) => {
		try {
			const response = await fetch('/api/delete', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ id }),
			});
			if (response.ok) {
				// 削除成功後、データを再取得して更新
				const updatedData = data.filter(item => item.id !== id);
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

	return (
		<>
			<button onClick={getData}>データ取得</button>
			{isVisible && (
				<table>
					<thead>
						<tr>
							<th>ID</th>
							<th>名前</th>
							<th colSpan={2}>Email</th>
						</tr>
					</thead>
					<tbody>
						{data.map((item) => (
							<tr key={item.id}>
								<td>{item.id}</td>
								<td>{item.name}</td>
								<td>{item.email}</td>
								<td style={{
									padding:"0 10px"
								}}><DeleteTooltip onDelete={() => deleteRecord(item.id)} /></td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</>
	);
}

export default DataTable;
