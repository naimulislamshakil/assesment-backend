import { db } from '../app';
import { catchAsyncError } from '../middlewares/catchAsyncError';
import { ErrorHandler } from '../middlewares/error';
import { User } from '../types/userType';
import { sendToken } from '../utils/sendToken';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
	user?: User & { id: string };
}

export const register = catchAsyncError(
	async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const { email, password, fullName, phone } = req.body;

			if (!email || !password || !fullName || !phone) {
				return next(new ErrorHandler('All field are required', 400));
			}

			const existingUser = await db
				.collection('users')
				.where('email', '==', email)
				.limit(1)
				.get();

			if (!existingUser.empty) {
				return next(new ErrorHandler('User Already Register.', 400));
			}

			const userData: User = {
				email,
				password,
				phone,
				fullName,
				createAt: Date.now(),
				role: 'user',
			};

			const user = await db.collection('users').doc().set(userData);

			res.status(200).json({
				success: true,
				message: 'User Register Successfully.',
			});
		} catch (error: any) {
			next(new ErrorHandler(error.message, 400));
		}
	}
);

export const login = catchAsyncError(
	async (req: AuthRequest, res: Response, next: NextFunction) => {
		const { email, password } = req.body;

		if (!email || !password) {
			return next(new ErrorHandler('All fields are required.', 400));
		}

		const userSnapshot = await db
			.collection('users')
			.where('email', '==', email)
			.limit(1)
			.get();

		if (userSnapshot.empty) {
			return next(new ErrorHandler('Invalid Email or password', 400));
		}

		const userDoc = userSnapshot.docs[0];
		const user = userDoc.data();
		const userId = userDoc.id;

		// Compare password using bcrypt

		if (password !== user.password) {
			return next(new ErrorHandler('Invalid Email or password', 400));
		}

		// Send token
		sendToken(userId, 200, 'User logged in successfully', res);
	}
);

export const getUser = catchAsyncError(
	async (req: AuthRequest, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: 'User not authenticated',
			});
		}

		res.status(200).json({
			success: true,
			user: req.user,
		});
	}
);

export const logout = catchAsyncError(
	async (req: Request, res: Response, next: NextFunction) => {
		res
			.status(200)
			.cookie('token', '', {
				expires: new Date(Date.now()),
				httpOnly: true,
			})
			.json({
				success: true,
				message: 'Logged out successfully.',
			});
	}
);
