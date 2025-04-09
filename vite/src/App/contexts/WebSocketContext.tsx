// WebSocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const API_URL = '/socket';

type TWebSocketContext = {
	socket: WebSocket | null;
	sendMessage: (message: string) => void;
}
type TWebSocketProvider = {
	children?:React.ReactNode
}

const WebSocketContext = createContext<TWebSocketContext | undefined>(undefined);

export const WebSocketProvider: React.FC<TWebSocketProvider> = ({ children }) => {
	const [socket, setSocket] = useState<WebSocket | null>(null);

	useEffect(() => {
		const ws = new WebSocket(API_URL); // WebSocketサーバーのURLを指定
		ws.onopen = () => {
			console.log('WebSocket connected');
		};
		ws.onclose = () => {
			console.log('WebSocket disconnected');
		};
		ws.onerror = (error) => {
			console.log('WebSocket error:', error);
		};

		setSocket(ws);

		// クリーンアップ
		return () => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.close();
			}
		};
	}, []);

	const sendMessage = (message: string) => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(message);
		}
	};

	return (
		<WebSocketContext.Provider value={{ socket, sendMessage }}>
			{children}
		</WebSocketContext.Provider>
	);
};

export const useWebSocket = (): TWebSocketContext => {
	const context = useContext(WebSocketContext);
	if (!context) {
		throw new Error('useWebSocketはWebSocketProvider');
	}
	if (!context.socket && !context.sendMessage){
		throw new Error('WebSocketの確立に失敗している可能性があります');
	}
	return context;
};
