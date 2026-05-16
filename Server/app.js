
require("dotenv").config();
const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');

const loginRoutes = require("./routes/login.route");
const signUpRoutes = require("./routes/signUp.route");
const verifyUserRoutes = require("./routes/verifyUser.route");
const groupRoutes = require("./routes/group.route");
const googleRoutes = require("./routes/google.route");
const profileRoutes = require("./routes/profile.route");
const analyticsRoutes = require("./routes/analytics.routes"); // ← add this
const expensesRoutes = require("./routes/expenses.route"); // ← add this

app.use(session({
    secret : "My_Secret",
    resave : false,
    saveUninitialized:true,
    cookie: {
        secure: false,      // Must be false for non-HTTPS (localhost)
        sameSite: 'lax',    // Works well for local development
        httpOnly: true,   
        maxAge : 600000   // Prevents client-side JS from reading the cookie
    } //session expires in 10mins
}));
app.use(cors({
  origin: 'http://localhost:5173',  // your Vite dev port
  credentials: true
}))

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
app.use("/api/", expensesRoutes);                // ← add this
module.exports = app;