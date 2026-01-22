const generateOTP = require('../utils/generateOTP');
const {
    signupOTPToken,
    signupOtpRequestCountToken
} = require('../constants/redisKeys');
const checkUserExist = require('../utils/checkUserExist');
const sendEmail = require('../utils/sendEmail');

const {
    setCache,
    getCache,
    delCache,
} = require('../utils/redisCache');

const sendOTPService = async (email) => {
    const checkExistingUserResult = await checkUserExist(email);
    if (checkExistingUserResult) {
        throw new Error('Account already exist. Please login');
    }
    let attempts = 0;
    const maxAttempts = 5;
    const maxAttemptsKey = signupOtpRequestCountToken(email);
    const existingAttempts = await getCache(maxAttemptsKey);
    if (existingAttempts) {
        attempts = parseInt(existingAttempts, 10) || 0;
    }
    if (attempts >= maxAttempts) {
        throw new Error('Maximum OTP requests exceeded. Please try again later.');
    }
    const { otp, expiresAt } = generateOTP();
    const ttlInSeconds = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    const redisKey = signupOTPToken(email);
    await setCache(redisKey, otp, ttlInSeconds);

    attempts += 1;
    await setCache(maxAttemptsKey, attempts, 3600);

    const emailSubject = 'Your OTP Code';
    const emailBody = `Your OTP code is: ${otp}. It will expire in 10 minutes.`;
    await sendEmail({
        to: email,
        subject: emailSubject,
        text: emailBody,
    });

    return {
        success: true,
        message: 'OTP sent successfully',
    }
}; 

const verifyOTPService = async (email, otp) => {
    const redisKey = signupOTPToken(email);
    let storedOtp = await getCache(redisKey);
    storedOtp = storedOtp ? storedOtp.toString() : null;

    if (!storedOtp) {
        throw new Error('OTP has expired or does not exist');
    }
    const isMatch = String(storedOtp.toString()) === String(otp.toString());
    if (!isMatch) {
        throw new Error('Invalid OTP');
    }

    await delCache(redisKey);
    await delCache(signupOtpRequestCountToken(email));

    return {
        success: true,
        message: 'OTP verified successfully',
    }
};

module.exports = {
    sendOTPService,
    verifyOTPService,
}
