const pool = require('./database');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const testConnectDB = async () => {
    try {
        const connection = await pool.getConnection(); // gets a single connection from the pool
        for (let i = 0; i < 5; i++) {
            try {
                await connection.ping();
                break;
            }
            catch { await sleep(2000); }
        } // tests the connection by sending a small packet
        console.log('✅ Database connected successfully ✅');
        connection.release(); // releases the connection back to the pool
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1); // exits the process with failure (error code 1)
    }
}

module.exports = testConnectDB;