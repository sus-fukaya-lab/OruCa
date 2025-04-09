import React from 'react';

interface BadgeProps {
	isTrue: boolean;
	text: {
		true: string;
		false: string;
	};
}

const Badge: React.FC<BadgeProps> = ({ isTrue, text }) => {
	// isTrueに基づいてスタイルを決定
	const badgeStyle:React.CSSProperties = {
		padding: '10px 15px',
		borderRadius: '10px',
		color: isTrue ? 'green' : 'red',
		border :"1px solid",
		borderColor: isTrue ? 'green' : 'red',
		backgroundColor: "white",
		fontWeight: 'bold',
	};

	return (
		<span style={badgeStyle}>
			{isTrue ? text.true : text.false}
		</span>
	);
};

export default Badge;
