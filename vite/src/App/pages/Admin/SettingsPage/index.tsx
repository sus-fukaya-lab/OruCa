// src/pages/AdminSetting.tsx
import CrossButton from "@components/CrossButton";
import HeadBar from "@components/HeadBar/HeadBar";
import { Box, Heading, Text, Button, VStack } from "@chakra-ui/react";
import { useNavigate,useLocation } from "react-router-dom";
import { Toaster,toaster } from "@snippets/toaster";
import { useEffect } from "react";
import DataTable from "@pages/MainPage/DataTable";


function SettingsPage() {
	const location = useLocation();
	useEffect(()=>{
		if (location.state?.loginStatus) {
			Promise.resolve().then(() => {
				toaster.create({
					title: "ログイン成功",
					type: "success",
					duration: 3000,
				});
			});
			// これがないと戻るときにも表示される可能性があるため state を消す
			window.history.replaceState({}, document.title);
		}
	},[location.state]);
	return (
		<>
			<HeadBar otherElements={[<CrossButton address={"/"} />]}>
				<VStack p={6} gap={4} align={"left"}>
					<Heading size={"2xl"}>管理者用ページ</Heading>
					<Text>ここはログイン済みのユーザーのみアクセス可能です。</Text>
					<Box w={"100%"} h={"100%"} pt={"10%"}>
						<DataTable/>
					</Box>
				</VStack>
			</HeadBar>
			<Toaster />
		</>
	);
}

export default SettingsPage;