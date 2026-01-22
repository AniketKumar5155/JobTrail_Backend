const { 
    sendOTPService,
    verifyOTPService
} = require('../services/otpService');
const asyncHandlerMiddleware = require('../middlewares/asyncHandlerMiddleware');

const sendOTPController =asyncHandlerMiddleware(async (req, res) => {
    const { email } = req.body;
    if(!email){
        throw new Error('Email is required');
    }
    const result = await sendOTPService(email);
    
    return res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        data: result,
    })
});

const verifyOTPController = asyncHandlerMiddleware(async (req, res) => {
    const { 
        email,
        otp 
    } = req.body;
        
        if(!email || !otp){
            throw new Error('Email and OTP are required');
        }

        const result = await verifyOTPService(email, otp);

        return res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            data: result,
        })
});

module.exports = {
    sendOTPController,
    verifyOTPController,
};