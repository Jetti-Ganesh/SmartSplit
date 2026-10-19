
require("dotenv").config();
const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo').default; 
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
const settleUpRoutes = require("./routes/settlup.route"); // ← add this 
const walletRoutes = require("./routes/wallet.route"); // ← add this

app.set('trust proxy', 1);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

let sessionMiddleware;

app.use('/api', async (req, res, next) => {
  try {
    await connectDB();

    if (!sessionMiddleware) {
      const sessionSecret = process.env.SESSION_SECRET || process.env.JWT_SECRET;
      if (!sessionSecret) {
        throw new Error('SESSION_SECRET or JWT_SECRET must be configured.');
      }

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
          sameSite: 'lax',
          httpOnly: true,
          maxAge: 600000
        }
      });
    }

    const requestOrigin = req.get('origin');
    const allowedOrigins = [
      process.env.CLIENT_URL,
      `https://${req.get('host')}`,
      `http://${req.get('host')}`,
      'http://localhost:5173',
      'http://localhost:5000'
    ].filter(Boolean).map((origin) => origin.replace(/\/$/, ''));

    cors({
      origin: !requestOrigin || allowedOrigins.includes(requestOrigin.replace(/\/$/, '')),
      credentials: true
    })(req, res, (corsError) => {
      if (corsError) return next(corsError);
      sessionMiddleware(req, res, next);
    });
  } catch (error) {
    next(error);
  }
});

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

  // Validation errors (from Mongoose or custom validation)
  if (err.message && err.message.includes('Split amounts must equal total amount')) {
    return res.status(400).json({
      success: false,
      message: 'Split amounts must equal total amount'
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: messages
    });
  }

  // Mongoose cast errors
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

module.exports = app;