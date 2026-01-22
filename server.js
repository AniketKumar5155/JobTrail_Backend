require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const notFoundMiddleware = require('./middlewares/notFoundMiddleware');
const errorHandlerMiddleware = require('./middlewares/errorHandlerMiddleware');
const testConnectDB = require('./config/dbconnect');
const { connectRedis } = require('./config/redisClient');
const otpRouter = require('./routes/otpRoute');
const authRouter = require('./routes/authRoute');
const internshipJobRouter = require('./routes/internshipJobRoute');

const app = express();

const PORT = process.env.PORT || 3000;
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173'
];
// Adds security headers to reduce common web attacks (XSS, clickjacking, info leaks)
app.use(helmet());
// Logs every HTTP request for debugging and monitoring traffic
app.use(morgan('dev'));
// Parses cookies from request headers into req.cookies for auth/session handling
app.use(cookieParser());
// Parses incoming JSON request bodies into req.body
app.use(express.json());

// Allows only approved frontends to call this API and send cookies
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            return callback(null, false);
        }
    },
    credentials: true,
}));
app.post('/ping', (req, res) => {
    res.json({ ok: true, body: req.body });
});
app.use('/otp', otpRouter);
app.use('/auth', authRouter);
app.use('/internshipJob', internshipJobRouter)

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// To ensure that database connection is established before starting the server
(async () => {
    try {
        console.log('🚀 Starting server... 🚀');
        await testConnectDB();
        await connectRedis();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT} 🚀`);
        });
    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
})();