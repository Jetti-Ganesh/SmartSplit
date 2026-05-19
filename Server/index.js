const app = require('./app');
//Don't change the code .., Write in app.js file
//Don't change the code .., Wrie in app.js file
const connectDB = require("./db/db");
const dns = require('dns');
dns.setServers(['8.8.8.8'],['1.1.1.1']);
connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server Running at Port ${process.env.PORT}..`);
});