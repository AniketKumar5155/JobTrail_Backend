const JWT = require('jsonwebtoken');
const { ca } = require('zod/locales');

const generateTokens = (payload) => {
    try{
        const accessToken = JWT.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '15m'
        });
        const refreshToken = JWT.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '7d'
        });
        return { accessToken, refreshToken };
    }catch(error){
        throw new Error('Token generation failed');
    }
};

module.exports = generateTokens;