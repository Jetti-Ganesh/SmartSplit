const app = require('./app');
//Don't change the code .., Write in app.js file
//Don't change the code .., Wrie in app.js file
const connectDB = require("./db/db");
connectDB();
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});