// src/auth.ts

class AuthService {
	private isLoggedIn: boolean = false;
	private token: string | null = null;

	login(username: string, password: string): boolean {
		// DB/API接続前のモックロジック
		if (username === "admin" && password === "password") {
			this.isLoggedIn = true;
			this.token = "mock-token";
			return true;
		}
		return false;
	}

	logout(): void {
		this.isLoggedIn = false;
		this.token = null;
	}

	getToken(): string | null {
		return this.token;
	}

	isAuthenticated(): boolean {
		return this.isLoggedIn;
	}
}

export const auth = new AuthService();
