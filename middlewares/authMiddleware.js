const JWT = require('jsonwebtoken');
const pool = require('../config/database');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    try {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
            });
        }

        const token = authHeader.split(' ')[1].trim();

        const decoded = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const [rows] = await pool.query(
            `SELECT id, name, email, role
             FROM users 
             WHERE id = ? LIMIT 1`,
            [decoded.userId]
        );

        if (rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Access denied, Invalid user.',
            });
        }

        const user = rows[0];

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        next();
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};

module.exports = authMiddleware;
