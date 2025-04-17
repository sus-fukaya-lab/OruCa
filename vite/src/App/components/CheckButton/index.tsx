import { IconButton, IconButtonProps } from '@chakra-ui/react';
import { FaCheck } from "react-icons/fa";

const CheckButton: React.FC<IconButtonProps> = ({...others}) => {
	return (
		<IconButton	
			aria-label="Submit student_Name Change"
			backgroundColor={"green.600"}
			shadow={"md"}
			size={"md"}
			_hover={{
				transform:"scale(1.1)"
			}}
			{...others}
		>
			<FaCheck/>
		</IconButton>)
}

export default CheckButton;