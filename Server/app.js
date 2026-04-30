require("dotenv").config();
const express = require('express');
const app = express();
const cors = require('cors');
const loginRoutes = require("./routes/login.route")
app.use(cors());
app.use(express.json());
// Write all the code for backend Here..
app.use("/login", loginRoutes);
module.exports = app;