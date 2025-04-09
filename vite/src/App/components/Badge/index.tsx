import React from 'react';
import {Status,Text} from "@chakra-ui/react";


interface BadgeProps {
	isTrue: boolean;
	text: {
		true: string;
		false: string;
	};
}

const Badge:React.FC<BadgeProps> = ({isTrue,text}) => {
	const color = isTrue ? "green":"red";
	const message = isTrue ? text.true:text.false;

	return (
		<Status.Root
			colorPalette={color} 
			size={"lg"}
			color={`${color}.700`}
			// color={`blackAlpha.700`}
			fontWeight={"bold"}
			backgroundColor={`${color}.100`}
			fontSize={"lg"}
			border={`1px solid ${color}`}
			padding={"8px 15px"}
			borderRadius={10}
			>
			<Status.Indicator />
			<Text ml={3}>{message}</Text>
		</Status.Root>
	)
}

export default Badge;
