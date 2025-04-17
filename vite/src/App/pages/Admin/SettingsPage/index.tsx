// src/pages/AdminSetting.tsx
import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import HeadBar from "@components/HeadBar/HeadBar";
import CrossButton from "@components/ReturnButton";
import { Toaster, toaster } from "@snippets/toaster";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import EditableDataTable from "./EditableDataTable";


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
					<Box w={"100%"} h={"100%"} pt={"2%"}>
						<EditableDataTable/>
					</Box>
				</VStack>
			</HeadBar>
			<Toaster />
		</>
	);
}

export default SettingsPage;