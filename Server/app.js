
require("dotenv").config();
const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo').default; 

const loginRoutes = require("./routes/login.route");
const signUpRoutes = require("./routes/signUp.route");
const verifyUserRoutes = require("./routes/verifyUser.route");
const groupRoutes = require("./routes/group.route");
const googleRoutes = require("./routes/google.route");
const profileRoutes = require("./routes/profile.route");
const analyticsRoutes = require("./routes/analytics.routes");
const expensesRoutes = require("./routes/expenses.route");
const forgotPasswordRoutes = require("./routes/forgotPassword.route");
const notificationsRoutes = require("./routes/notifications.route");
const settleUpRoutes = require("./routes/settlup.route"); // ← add this 

app.use(session({
    secret : "My_Secret",
    resave : false,
    saveUninitialized:true,
     store: new MongoStore({
        mongoUrl: process.env.MONGO_URI,  // ← USE YOUR MONGO DB
        touchAfter: 24 * 3600  // Lazy session update
    }),
    cookie: {
        secure: false,      // Must be false for non-HTTPS (localhost)
        sameSite: 'lax',    // Works well for local development
        httpOnly: true,   
        maxAge : 600000   // Prevents client-side JS from reading the cookie
    } //session expires in 10mins
}));
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Normalize both by stripping any trailing slash
    const normalizedOrigin = origin.replace(/\/$/, "");
    const normalizedAllowed = allowedOrigin.replace(/\/$/, "");
    
    if (normalizedOrigin === normalizedAllowed || normalizedOrigin === 'http://localhost:5173') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Increase JSON payload limit to handle base64 images (up to 5MB)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'Client', 'dist')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Client', 'dist', 'index.html'));
});




app.use("/api/", loginRoutes);
app.use("/api/", signUpRoutes);
app.use("/api/", verifyUserRoutes);
app.use("/api/", groupRoutes);
app.use("/api/", googleRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/", analyticsRoutes);
app.use("/api/", expensesRoutes);
app.use("/api/", forgotPasswordRoutes);
app.use("/api/", notificationsRoutes);
app.use("/api/settlements", settleUpRoutes);      // ← add this
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