require("dotenv").config();
const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const connectDB = require("./db/db");

const loginRoutes = require("./routes/login.route");
const signUpRoutes = require("./routes/signUp.route");
const verifyUserRoutes = require("./routes/verifyUser.route");
const groupRoutes = require("./routes/group.route");
const profileRoutes = require("./routes/profile.route");
const analyticsRoutes = require("./routes/analytics.routes");
const expensesRoutes = require("./routes/expenses.route");
const forgotPasswordRoutes = require("./routes/forgotPassword.route");
const notificationsRoutes = require("./routes/notifications.route");
const settleUpRoutes = require("./routes/settlup.route");
const walletRoutes = require("./routes/wallet.route");

app.set('trust proxy', 1);

// Standard parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Global CORS Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://smart-split-k56c.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
].filter(Boolean).map((origin) => origin.replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin.includes('localhost')
    ) {
      return callback(null, true);
    }
    // Allow by default to prevent blocking unexpected Vercel preview domains
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Root and Health Check Endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SmartSplit API server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SmartSplit API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Session middleware initialization
let sessionMiddleware;

app.use('/api', async (req, res, next) => {
  try {
    await connectDB();

    if (!sessionMiddleware && process.env.MONGO_URI) {
      const sessionSecret = process.env.SESSION_SECRET || process.env.JWT_SECRET || 'smartsplit_secret';
      const MongoStore = require('connect-mongo').default || require('connect-mongo');
      
      sessionMiddleware = session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          mongoUrl: process.env.MONGO_URI,
          touchAfter: 24 * 3600
        }),
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          httpOnly: true,
          maxAge: 24 * 3600 * 1000
        }
      });
    }

    if (sessionMiddleware) {
      return sessionMiddleware(req, res, next);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Route Mounts
app.use("/api/", loginRoutes);
app.use("/api/", signUpRoutes);
app.use("/api/", verifyUserRoutes);
app.use("/api/", groupRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/", analyticsRoutes);
app.use("/api/", expensesRoutes);
app.use("/api/", forgotPasswordRoutes);
app.use("/api/", notificationsRoutes);
app.use("/api/settlements", settleUpRoutes);
app.use("/api/", walletRoutes);

// Global Error Handler Middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.message && err.message.includes('Split amounts must equal total amount')) {
    return res.status(400).json({
      success: false,
      message: 'Split amounts must equal total amount'
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: messages
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

module.exports = app;
