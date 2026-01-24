const pool = require('../config/database');

const checkUserExists = async (email, username) => {
    const result = await pool.query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
    return result.rows.length > 0;
};

module.exports = checkUserExists;
