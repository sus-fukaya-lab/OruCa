// src/pages/AdminLogin.tsx
import { Box, Button, Input, Fieldset, Field, Card } from "@chakra-ui/react";
import { Toaster, toaster } from "@snippets/toaster";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from '@contexts/WebSocketContext';
import { WsMessage, WsPayLoad } from "@Apps/app.env";

export const LoginForm = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [success, setSuccess] = useState(false);
	const navigate = useNavigate();
	const { socket } = useWebSocket();
	useMemo(() => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.onmessage = (event) => {
				const d: WsMessage = JSON.parse(event.data);
				if (d.type === "user/auth") {
					const {result} = d.payload as WsPayLoad["user/auth"];
					setSuccess(result);
				}
			};

		}

	}, [socket]);

	const handleSubmit = () => {
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
			<Box
				w={"100%"}
				h={"100%"}
				display={"flex"}
				alignItems={"center"}
				justifyContent={"center"}
			>
				<Card.Root
					w={"50%"}
					p={10}
					borderColor={"blackAlpha.600"}
				>
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
			</Box>
			<Toaster />
		</>
	);
};

export default LoginForm;