import { catchAsyncError } from './catchAsyncError';
import jwt from 'jsonwebtoken';
import { ErrorHandler } from './error';
import { db } from '../app';
export const isAuthenticated = catchAsyncError(async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return next(new ErrorHandler('User is not authenticated.', 401));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN_KEY);
        const userDoc = await db.collection('users').doc(decoded.id).get();
        if (!userDoc.exists) {
            return next(new ErrorHandler('User not found.', 404));
        }
        req.user = { ...userDoc.data(), id: userDoc.id };
        next();
    }
    catch (error) {
        return next(new ErrorHandler('Invalid or expired token.', 401));
    }
});
