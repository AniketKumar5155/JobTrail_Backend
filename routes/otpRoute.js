const express = require('express');
const otpRouter = express.Router();

const {
    sendOTPController,
    verifyOTPController,
} =  require('../controllers/otpController');

otpRouter.post(
    '/send-otp',
    sendOTPController,
);
otpRouter.post(
    '/verify-otp',
    verifyOTPController,
);

module.exports = otpRouter;

