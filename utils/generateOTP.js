const crypto = require('crypto');

const generateOTP = () => {
  try {
    const otp = crypto.randomInt(10000, 100000).toString().padStart(6, '0');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    return { otp, expiresAt };
  } catch (error) {
    throw new Error('OTP generation failed'); 
  }
};

module.exports = generateOTP;