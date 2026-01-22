const { redisClient } = require('../config/redisClient');

const setCache = async (key, value, expirationInSeconds = 3600) => {
        await redisClient.set(key, JSON.stringify(value), { EX: expirationInSeconds });
}

const getCache = async (key) => {
       const fetchedValue = await redisClient.get(key);
       return fetchedValue ? JSON.parse(fetchedValue) : null;
}

const delCache = async (key) => {
        await redisClient.del(key);
}

module.exports = {
    setCache,
    getCache,
    delCache,
}