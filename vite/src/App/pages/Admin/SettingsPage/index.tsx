// src/pages/AdminSetting.tsx
import CrossButton from "@components/CrossButton";
import HeadBar from "@components/HeadBar/HeadBar";
import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";


function SettingsPage(){
	const navigate = useNavigate();

	const handleLogout = () => {
		navigate("/admin");
	};
	return (
		<HeadBar otherElements={[<CrossButton address={"/"}/>]}>
			<Box p={6}>
				<Heading>管理者設定ページ</Heading>
				<Text mt={4}>ここはログイン済みのユーザーのみアクセス可能です。</Text>
				<Button mt={4} colorScheme="red" onClick={handleLogout}>
					ログアウト
				</Button>
			</Box>
		</HeadBar>
	);
}

export default SettingsPage;