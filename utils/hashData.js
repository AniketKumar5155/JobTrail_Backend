const bcrypt = require('bcrypt');

const hashData = async (data) => {
    const SALT_ROUNDS = 10;
    const hashedData  = await bcrypt.hash(data, SALT_ROUNDS);
    return hashedData;
}

module.exports = hashData;