const express = require('express');
const {
    signupController,
    loginController,
    logoutController,
} =  require('../controllers/authController');
const validateZodMiddleware = require('../middlewares/validateZodMiddleware');
const signupSchema = require('../schemas/signupSchema');
const loginSchema = require('../schemas/loginschema');
const authMiddleware = require("../middlewares/authMiddleware")

const authRouter = express.Router();

authRouter.post(
    '/signup',
    validateZodMiddleware(signupSchema),
    signupController,
);

authRouter.post(
    '/login',
    validateZodMiddleware(loginSchema),
    loginController,
);

authRouter.post(
    '/logout',
    authMiddleware,
    logoutController,
)

module.exports = authRouter;