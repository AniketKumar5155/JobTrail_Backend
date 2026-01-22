const pool = require('../config/database');

const checkUserExists = async (email, username) => {
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    return rows.length > 0;
};

module.exports = checkUserExists;
