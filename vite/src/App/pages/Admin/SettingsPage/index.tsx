// src/pages/AdminSetting.tsx
import CrossButton from "@components/CrossButton";
import HeadBar from "@components/HeadBar/HeadBar";
import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { auth } from "@Apps/utils/auth";
import { useNavigate } from "react-router-dom";


function SettingsPage(){
	const navigate = useNavigate();

	const handleLogout = () => {
		auth.logout();
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