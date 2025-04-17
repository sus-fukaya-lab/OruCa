import { IconButton } from "@chakra-ui/react";
import React from "react";
import { BsArrowReturnLeft } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

type TSettingButton = {
	address:string
}

const ReturnButton:React.FC<TSettingButton> = ({address})=>{
	const navigate = useNavigate();
	const handleClick = () => {
		navigate(address);
	};
	return (
		<IconButton
			aria-label="Open Settings Page"
			backgroundColor={"red.500"}
			shadow={"md"}
			transition="transform 0.8s ease-in-out"
			_hover={{
				transform: 'rotate(360deg)',
			}}
			size={"xl"}
			onClick={handleClick}
		>
			<BsArrowReturnLeft/>
		</IconButton>
	)
}

export default ReturnButton;