require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db/db');
const User = require('./models/user.model');
const { topUp } = require('./controllers/walletTransaction.controller');

async function run() {
  await connectDB();
  
  // Find a test user
  const user = await User.findOne({});
  if (!user) {
    console.log('No users found in database');
    await mongoose.disconnect();
    return;
  }
  
  console.log(`Testing topup for user: ${user.name} (Balance before: ${user.walletBalance})`);
  
  const req = {
    user: { _id: user._id },
    body: { amount: 1500 }
  };
  
  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      console.log('Response JSON:', data);
    }
  };
  
  try {
    await topUp(req, res);
    
    // Fetch user again to verify balance
    const updatedUser = await User.findById(user._id);
    console.log(`Balance after topup: ${updatedUser.walletBalance}`);
  } catch (err) {
    console.error('Error during test:', err);
  }
  
  await mongoose.disconnect();
}
run();
