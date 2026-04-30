const express = require('express');
const app = express();
// Write all the code for backend Here..

const path = require('path');
app.use(express.static(path.join(__dirname, '..','Client','dist')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..','Client','dist','index.html'));
});

module.exports = app;