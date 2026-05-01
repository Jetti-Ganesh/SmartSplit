require("dotenv").config();
const express = require('express');
const app = express();
const cors = require('cors');
const loginRoutes = require("./routes/login.route")
app.use(cors());
app.use(express.json());
// Write all the code for backend Here..

const path = require('path');
app.use(express.static(path.join(__dirname, '..','Client','dist')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..','Client','dist','index.html'));
});

app.use("/login", loginRoutes);
module.exports = app;