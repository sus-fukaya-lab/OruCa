import React from "react";
import { IconButton } from "@chakra-ui/react";
import { LuSettings } from "react-icons/lu"
import { useNavigate } from "react-router-dom";

type TSettingButton = {
	address:string
}

const SettingButton:React.FC<TSettingButton> = ({address})=>{
	const navigate = useNavigate();
	const handleClick = () => {
		navigate(address);
	};
	return (
		<IconButton
			aria-label="Open Settings Page"
			backgroundColor={"blue.950"}
			transition="transform 0.6s ease-in-out"
			_hover={{
				transform: 'rotate(180deg)',
			}}
			size={"xl"}
			onClick={handleClick}
		>
			<LuSettings/>
		</IconButton>
	)
}

export default SettingButton;