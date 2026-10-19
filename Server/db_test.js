require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db/db');
const User = require('./models/user.model');
const WalletTransaction = require('./models/wallet.model');

async function run() {
  await connectDB();
  const users = await User.find({}, 'name email phone walletBalance');
  console.log('--- USERS ---');
  console.log(JSON.stringify(users, null, 2));

  const txs = await WalletTransaction.find({});
  console.log('--- TRANSACTIONS ---');
  console.log(JSON.stringify(txs, null, 2));

  await mongoose.disconnect();
}
run();
