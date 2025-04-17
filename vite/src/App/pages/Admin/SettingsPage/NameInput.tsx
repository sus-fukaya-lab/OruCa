import { Box, HStack, Input, Text } from "@chakra-ui/react";
import CheckButton from "@components/CheckButton";
import CrossButton from "@components/CrossButton";
import EditButton from "@components/EditButton";
import React, { ChangeEvent, useRef, useState } from "react";

type NameInputProps = {
	student_ID: string;
	student_Name: string | undefined;
	onClick: (student_ID: string, student_Name: string) => void;
};

const NameInput: React.FC<NameInputProps> = ({ student_ID, student_Name, onClick }) => {
	const [isEditable, setIsEditable] = useState(false);
	const [value, setValue] = useState<string>(student_Name ?? "");
	const inputRef = useRef<HTMLInputElement>(null);

	// 入力が変更された際にvalueを更新する
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
	};

	const openInput = () => {
		setIsEditable(true);
		setTimeout(() => {
			inputRef.current?.focus();
		}, 0);
	}
	const closeInput = ()=>{
		setIsEditable(false);
	}

	const handleSubmit = () => {
		onClick(student_ID, value);
		closeInput();
	}
	const handleInputKeyDown = (e:React.KeyboardEvent<HTMLInputElement>) => {
		e.preventDefault(); // フォーム送信などのデフォルト動作を防止
		if (e.key === "Enter") {
			handleSubmit();
		} else if (e.key === "Escape") {
			closeInput();
		}
	}

	return (
		<Box w={"100%"}>
			{isEditable ? <>
				<HStack w={"100%"} justify={"right"}>
					<Input
						placeholder="名前を入力"
						w="80%"
						value={value}
						onChange={handleChange}
						borderColor="blackAlpha.400"
						borderWidth={1}
						fontSize="lg"
						py={5}
						ref={inputRef}
						letterSpacing={1}
						onKeyDown={handleInputKeyDown}
					/>
					<CheckButton onClick={handleSubmit} />
					<CrossButton onClick={closeInput}/>
				</HStack>
			</> : <>
				<HStack w="100%" justify={"right"}>
						<Text w={"100%"} textAlign={"center"} color={student_Name ? "default" :"none"}>
							{student_Name ? student_Name : "未入力"}
						</Text>
					<EditButton onClick={openInput} />
				</HStack>
			</>}
		</Box>
	);
};

export default NameInput;
