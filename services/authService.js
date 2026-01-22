const pool = require(`../config/database`);
const checkUserExists = require(`../utils/checkUserExist`);
const generateTokens = require(`../utils/generateTokens`);
const hashData = require(`../utils/hashData`);
const validateData = require(`../utils/validateData`);
const {
    verifyOTPService
} = require(`./otpService`);


const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS);

const signupService = async (userData) => {
    const expiresAt = new Date(
        Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
    );
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const {
            name,
            username,
            email,
            phone,
            password,
            otp,
        } = userData;

        const userExists = await checkUserExists(email, username);

        if (userExists) throw new Error(`Account already exist. Please login`);

        await verifyOTPService(email, otp);

        const hashedPassword = await hashData(password);

        const [newUser] = await connection.query(
            `INSERT INTO users
             (name, username, email, phone, password_hash) 
             VALUES (?, ?, ?, ?, ?)`,
            [name, username, email, phone, hashedPassword]
        );

        const payload = {
            userId: newUser.insertId,
            email,
            username,
        }
        const { accessToken, refreshToken } = generateTokens(payload);

        const hashedRefreshToken = await hashData(refreshToken);

        await connection.query(
            `INSERT INTO refresh_tokens
             (user_id, refresh_token, expires_at) 
             VALUES (?, ?, ?)`,
            [newUser.insertId, hashedRefreshToken, expiresAt]
        );

        await connection.commit();

        return {
            success: true,
            message: `User registered successfully`,
            user: {
                userId: newUser.insertId,
                name,
                email,
                username,
                phone,
            },
            token: {
                accessToken,
                refreshToken,
            },
        }
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const loginService = async ({ identifier, password} ) => {
    const expiresAt = new Date(
        Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
    );
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        if (!identifier) {
            throw new Error(`Email or Username is required for login`);
        }
        if (!password) {
            throw new Error(`Password is required for login`);
        }
        const [rows] = await connection.query(
            `SELECT id, name, email, username, phone, password_hash
             FROM users WHERE email = ? OR username = ?
             LIMIT 1`,
            [identifier, identifier]
        )

        const user = rows[0];

        if (!user) {
            throw new Error(`Invalid credentials`);
        }
        const storedPasswordHash = user.password_hash;
        const isPasswordValid = await validateData(password, storedPasswordHash);

        if (!isPasswordValid) {
            throw new Error(`Invalid credentials`);
        }

        const payload = {
            userId: user.id,
            email: user.email,
            username: user.username,
        };
        const { accessToken, refreshToken } = generateTokens(payload);

        const hashedRefreshToken = await hashData(refreshToken);

        await connection.query(
            `INSERT INTO refresh_tokens
             (user_id, refresh_token, expires_at)
             VALUES (?, ?, ?)`,
            [user.id, hashedRefreshToken, expiresAt]
        );

        await connection.commit();

        return {
            success: true,
            message: `Login successful`,
            user: {
                userId: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                phone: user.phone,
            },
            token: {
                accessToken,
                refreshToken,
            },
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

const logoutService = async (refreshToken) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const hashedToken = await hashData(refreshToken);

        await connection.query(
            "DELETE FROM refresh_tokens WHERE refresh_token = ?",
            [hashedToken]
        );

        await connection.commit();

        return {
            success: true,
            message: "Logout successful",
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    signupService,
    loginService,
    logoutService,
};