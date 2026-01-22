const { createClient } = require('redis');

const redisClient = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    }
});

redisClient.on('connect', () => {
    console.log('🔄 Redis connecting... 🔄');
});

redisClient.on('ready', () => {
    console.log('✅ Redis ready ✅');
});

redisClient.on('error', (error) => {
    console.error('❌ Redis error:', error, '❌');
});

const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
};

module.exports = {
    redisClient,
    connectRedis
};
