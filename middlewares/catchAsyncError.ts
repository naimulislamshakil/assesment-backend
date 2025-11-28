import { Request, Response, NextFunction } from 'express';

export const catchAsyncError = (
	func: (req: Request, res: Response, next: NextFunction) => any
) => {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(func(req, res, next)).catch(next);
	};
};
