// src/pages/AdminLogin.tsx
import { TWsMessage } from "@Apps/app.env";
import { Box, Button, Card, Field, Fieldset, Input } from "@chakra-ui/react";
import { useWebSocket } from '@contexts/WebSocketContext';
import { Toaster, toaster } from "@snippets/toaster";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const LoginForm = () => {
	const defalutFocus = useRef<HTMLInputElement>(null);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();
	const location = useLocation();
	const { socket } = useWebSocket();

	useMemo(() => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.onmessage = (event) => {
				const d: TWsMessage = JSON.parse(event.data);
				if (d.type === "user/auth" && d.payload.content) {
					const { result } = d.payload;
					if (result) {
						navigate("/admin/settings", { state: { loginStatus: true } });
					} else {
						toaster.create({
							title: "ログイン失敗",
							description: "ユーザー名またはパスワードが間違っています。",
							type: "error",
							duration: 3000,
						});
					}
				}
			};

		}
	}, [socket]);

	useEffect(() => {
		if (location.state?.loginStatus === false) {
			Promise.resolve().then(() => {
				toaster.create({
					title: "ログイン失敗",
					description: "アクセスに失敗しました",
					type: "error",
					duration: 3000,
				});
			});
			// これがないと戻るときにも表示される可能性があるため state を消す
			window.history.replaceState({}, document.title);
		}
	}, [location.state]);
	
	useEffect(() => {
		defalutFocus.current?.focus();
	}, []);

	const handleSubmit = () => {
		if (!socket) {
			toaster.create({
				title: "ログイン失敗",
				description: "認証サーバーとの通信が出来ませんでした",
				type: "error",
				duration: 3000,
			});
			return;
		}
		const jsonMsg: TWsMessage = {
			type: "user/auth",
			payload: {
				result: true,
				content: [{ student_ID: username, password: password }],
				message: "認証"
			}
		}
		socket.send(JSON.stringify(jsonMsg));
		window.history.replaceState({}, document.title);
	};


	return (
		<>
			<Box
				w={"100%"}
				h={"80%"}
				display={"flex"}
				alignItems={"center"}
				justifyContent={"center"}
			>
				<Card.Root
					w={"50%"}
					p={10}
					borderWidth={2}
					borderColor={"default/20"}
					shadow={"md"}
				>
					<Card.Body>
						<Fieldset.Root gap={7} size={"lg"}>
							<Fieldset.Legend
								fontSize={"2xl"} color={"default"} fontWeight={"semibold"} pb={2}
							>
								管理者ログイン
							</Fieldset.Legend>
							<Fieldset.Content gap={12} color={"default"}>
								<Field.Root>
									<Field.Label fontSize={"lg"}>ユーザー名</Field.Label>
									<Input
										name="name"
										type="text"
										fontSize={"lg"}
										value={username}
										onChange={(e) => setUsername(e.target.value)} 	
										ref={defalutFocus}
									/>
								</Field.Root>
								<Field.Root>
									<Field.Label fontSize={"lg"}>パスワード</Field.Label>
									<Input
										type="password"
										name="password"
										fontSize={"lg"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
									/>
								</Field.Root>
							</Fieldset.Content>
							<Button
								transition={"backgrounds"}
								transitionDuration="fast"
								bgColor={{
									base: "default",
									_hover: "rgb(83, 63, 194)"
								}}
								py={5}
								fontSize={"lg"}
								onClick={handleSubmit}
							>
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