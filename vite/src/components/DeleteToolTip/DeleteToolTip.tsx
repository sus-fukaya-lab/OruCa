import "./DeleteTooltip.css";

// DeleteTooltipコンポーネント
function DeleteTooltip({ onDelete }: { onDelete: () => void }) {

	return (
		<div
			className="tooltip-container"
		>
			{/* ホバー時に削除ボタンを表示 */}
			
				<button className="delete-button" onClick={onDelete}>
					削除
				</button>
			</div>
	);
}

export default DeleteTooltip;
