export interface User {
	fullName: string;
	email: string;
	password: string;
	phone: string;
	createAt: number;
	role?: 'user' | 'admin';
}
