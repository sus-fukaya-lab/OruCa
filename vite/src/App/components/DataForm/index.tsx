import { useState } from 'react';

function DataForm() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');

	// フォーム送信処理
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault(); // デフォルトのフォーム送信を無効化

		try {
			const response = await fetch('/api/write', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name, email })
			});

			if (response.ok) {
				setMessage('送信に成功しました。');
				setName(''); // フォームリセット
				setEmail('');
			} else {
				setMessage('送信に失敗しました。');
			}
		} catch (error) {
			console.error('送信エラー:', error);
			setMessage('送信中にエラーが発生しました。');
		}
	};

	return (
		<form onSubmit={handleSubmit} style={formStyle}>
			<h2 style={{ textAlign: 'center', marginBottom: '20px' }}>新規ユーザー登録</h2>

			<div style={inputGroupStyle}>
				<label htmlFor="name">名前</label>
				<input
					type="text"
					id="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
					style={inputStyle}
				/>
			</div>

			<div style={inputGroupStyle}>
				<label htmlFor="email">Email</label>
				<input
					type="email"
					id="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					style={inputStyle}
				/>
			</div>

			<button type="submit" style={buttonStyle}>送信</button>

			{message && <p style={{ textAlign: 'center', marginTop: '20px', color: '#333' }}>{message}</p>}
		</form>
	);
}

// インラインスタイル定義（おしゃれなデザイン）
const formStyle: React.CSSProperties = {
	width: '400px',
	margin: '40px auto',
	padding: '20px',
	borderRadius: '12px',
	boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
	backgroundColor: '#fff',
	fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
};

const inputGroupStyle: React.CSSProperties = {
	marginBottom: '20px',
	display: 'flex',
	flexDirection: 'column',
};

const inputStyle: React.CSSProperties = {
	padding: '10px',
	borderRadius: '6px',
	border: '1px solid #ccc',
	fontSize: '1rem',
	marginTop: '8px',
};

const buttonStyle: React.CSSProperties = {
	width: '100%',
	padding: '12px',
	borderRadius: '8px',
	border: 'none',
	background: 'linear-gradient(135deg, #3b82f6, #4f46e5)',
	color: '#fff',
	fontSize: '1rem',
	cursor: 'pointer',
	transition: 'background 0.3s ease',
};

export default DataForm;
