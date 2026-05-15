const app = require('./app');
//Don't change the code .., Write in app.js file
//Don't change the code .., Wrie in app.js file
const connectDB = require("./db/db");
connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});