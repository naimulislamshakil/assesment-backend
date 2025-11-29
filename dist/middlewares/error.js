export class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, ErrorHandler.prototype);
    }
}
export const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';
    // JWT Errors (optional)
    if (err.name === 'JsonWebTokenError') {
        err = new ErrorHandler('Token is invalid. Try again.', 400);
    }
    if (err.name === 'TokenExpiredError') {
        err = new ErrorHandler('Token has expired. Try again.', 400);
    }
    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
export default errorMiddleware;
