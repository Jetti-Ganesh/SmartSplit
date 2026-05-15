const mongoose = require('mongoose');
const User = require('./Server/models/user.model');
require('dotenv').config({ path: './Server/.env' });

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartsplit');
    console.log('Connected to DB');
    const users = await User.find({});
    console.log('Users found:', users.length);
    users.forEach(u => {
      console.log(`User: ${u.email}`);
      console.log(`  upiList:`, u.upiList);
      console.log(`  defaultUpi:`, u.defaultUpi);
    });
  } catch (e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
checkDb();
