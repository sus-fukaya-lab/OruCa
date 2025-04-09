// src/pages/AdminLogin.tsx
import { Box, Button, Input, VStack, Fieldset, Field, Card} from "@chakra-ui/react";
import { Toaster,toaster } from "@snippets/toaster";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@Apps/utils/auth";

export const LoginForm = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const handleSubmit = () => {
		const success = auth.login(username, password);
		if (success) {
			toaster.create({
				title: "ログイン成功",
				type: "success",
				duration: 3000,
			});
			navigate("/admin/settings");
		} else {
			toaster.create({
				title: "ログイン失敗",
				description: "ユーザー名またはパスワードが間違っています。",
				type: "error",
				duration: 3000,
			});
		}
	};

	return (
		<>
			<Card.Root w={"70%"} p={10} m={"30% auto"} borderColor={"blackAlpha.600"}>
				<Card.Body gap="2">
					<Fieldset.Root gap={7} size={"lg"}>
						<Fieldset.Legend fontSize={"2xl"}>管理者ログイン</Fieldset.Legend>
						<Fieldset.Content gap={10}>
							<Field.Root>
								<Field.Label>ユーザー名</Field.Label>
								<Input
									name="name"
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)} />
							</Field.Root>
							<Field.Root>
								<Field.Label>パスワード</Field.Label>
								<Input
									type="password"
									name="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</Field.Root>
						</Fieldset.Content>
						<Button
							backgroundColor="teal"
							onClick={handleSubmit}>
							ログイン
						</Button>
					</Fieldset.Root>
				</Card.Body>
			</Card.Root>
			<Toaster/>
		</>
	);
};

export default LoginForm;