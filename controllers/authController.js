const asyncHandlerMiddleware = require('../middlewares/asyncHandlerMiddleware');
const {
    signupService,
    loginService,
    logoutService,
} = require('../services/authService');

// req.body is already validated by validateZodMiddleware
const signupController = asyncHandlerMiddleware(async (req, res, next) => {
    const {
        name,
        username,
        email,
        phone,
        password,
        otp,
    } = req.body;

    const data = {
        name,
        username,
        email,
        phone,
        password,
        otp,
    }
    const { user, token } = await signupService(data);

    res.cookie("refreshToken", token.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
        token: {
            accessToken: token.accessToken,
        },
    });
});

const loginController = asyncHandlerMiddleware(async (req, res, next) => {
    // const {
        // identifier,
        // password,
    // } = req.body;

    const { user, token } = await loginService(req.body);

    res.cookie("refreshToken", token.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        data: user,
        token: {
            accessToken: token.accessToken,
        },
    });
});

const logoutController = asyncHandlerMiddleware(async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({
            success: false,
            message: "No refresh token provided",
        });
    }

    await logoutService(refreshToken);

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
    });

    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});

module.exports = {
    signupController,
    loginController,
    logoutController,
}

