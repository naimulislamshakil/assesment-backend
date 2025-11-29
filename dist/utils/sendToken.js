import jwt from 'jsonwebtoken';
export const sendToken = (id, statusCode, message, res) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET_TOKEN_KEY, {
        expiresIn: '7d',
    });
    // Send response
    res
        .status(statusCode)
        .cookie('token', token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    })
        .json({
        success: true,
        message,
        token,
    });
};
