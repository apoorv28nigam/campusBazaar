const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const initSocket = require('./socket');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Build allowed origins list — strip any trailing slash to avoid CORS mismatch
const rawOrigin = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
const allowedOrigins = [
  rawOrigin,
  'http://localhost:5173',
  'http://localhost:5174',
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Socket.io: CORS not allowed for ' + origin));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Attach io to app so routes can use it
app.set('io', io);

// Init socket handlers
initSocket(io);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS not allowed for ' + origin));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
// Morgan request logger — dev only (saves noise in Render logs)
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/items', require('./routes/items'));
app.use('/api/borrow', require('./routes/borrow'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/requests', require('./routes/requests'));

// Root & health check
app.get('/', (req, res) => res.send('🚀 CampusBazaar Backend is Running'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// 404 handler — must come after all routes
app.use((req, res) => {
  res.status(404).json({ message: `Not Found — ${req.method} ${req.originalUrl}` });
});

// Global error handler — must be last
app.use(errorHandler);

// Graceful shutdown guards (prevents Render dyno restart on unhandled async errors)
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 CampusBazaar server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
