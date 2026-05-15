const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config({ path: './.env' });

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartsplit');
    console.log('Connected to DB');
    const user = await User.findOne({});
    if (user) {
      console.log('Modifying user:', user.email);
      user.upiList = ['test@ybl'];
      user.defaultUpi = 'test@ybl';
      await user.save();
      console.log('Saved successfully');
      
      const updatedUser = await User.findById(user._id);
      console.log('Updated user upiList:', updatedUser.upiList);
    }
  } catch (e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
checkDb();
