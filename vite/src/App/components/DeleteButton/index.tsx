import { IconButton, IconButtonProps, Text } from "@chakra-ui/react";
import React from "react";

// DeleteTooltipコンポーネント
const DeleteButton: React.FC<IconButtonProps> = ({ ...props }) => {
	return (
			<IconButton
				aria-label="Delete student"
				backgroundColor={"red.500"}
				color={"white"}
				shadow={"md"}
				size={"md"}
				_hover={{
					transform: "scale(1.1)"
				}}
				w={"50%"}
				{...props}
			>
				<Text>DELETE</Text>
			</IconButton>
	);
}

export default DeleteButton;
