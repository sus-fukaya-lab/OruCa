import React from "react";
import { RxCross2 } from "react-icons/rx";
import { IconButton } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

type TSettingButton = {
	address:string
}

const CrossButton:React.FC<TSettingButton> = ({address})=>{
	const navigate = useNavigate();
	const handleClick = () => {
		navigate(address);
	};
	return (
		<IconButton
			aria-label="Open Settings Page"
			backgroundColor={"red"}
			shadow={"md"}
			transition="transform 0.6s ease-in-out"
			_hover={{
				transform: 'rotate(180deg)',
			}}
			size={"xl"}
			onClick={handleClick}
		>
			<RxCross2/>
		</IconButton>
	)
}

export default CrossButton;