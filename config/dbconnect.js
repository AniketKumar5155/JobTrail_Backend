const pool = require('./database');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const testConnectDB = async () => {
    try {
        for (let i = 0; i < 5; i++) {
            try {
                await pool.query('SELECT 1');
                break;
            } catch {
                await sleep(2000);
            }
        }
        console.log('✅ Database connected successfully ✅');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

module.exports = testConnectDB;