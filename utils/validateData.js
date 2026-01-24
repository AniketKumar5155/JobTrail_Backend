const bcrypt = require('bcrypt');

const validateData = async (data, hashedData) => {
    if (!hashedData) {
        throw new Error('Missing data to validate');
    }
    if (!hashedData) {
        throw new Error('Missing hashed data to validate against');
    }
    try {
        return await bcrypt.compare(data, hashedData);
    } catch (error) {
        throw new Error('Data validation failed');
    }
}

module.exports = validateData;