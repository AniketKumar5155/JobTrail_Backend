module.exports ={
    signupOTPToken: (email) => `signupOtp:${email}`,
    signupOtpRequestCountToken: (email) => `signupOtpReqCount:${email}`,
    passwordResetOTPTokens: (email) => `passResetOtp:${email}`,
}