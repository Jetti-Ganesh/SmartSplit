// db/db.js
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['1.1.1.1','8.8.8.8']);
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // ← no options needed
    console.log('MongoDB connected');
    
    // Clean up any legacy email/phone records set to null or empty string so unique sparse index functions correctly
    try {
      const db = mongoose.connection.db;
      
      // Unset null/empty fields
      await db.collection('users').updateMany({ email: null }, { $unset: { email: "" } });
      await db.collection('users').updateMany({ email: "" }, { $unset: { email: "" } });
      await db.collection('users').updateMany({ phone: null }, { $unset: { phone: "" } });
      await db.collection('users').updateMany({ phone: "" }, { $unset: { phone: "" } });
      console.log('Successfully cleaned up legacy null/empty string email & phone records.');

      // Drop old non-sparse unique indexes
      try {
        await db.collection('users').dropIndex('email_1');
        console.log('Dropped legacy email_1 index.');
      } catch (e) {
        console.log('Index email_1 was already dropped or did not exist.');
      }

      try {
        await db.collection('users').dropIndex('phone_1');
        console.log('Dropped legacy phone_1 index.');
      } catch (e) {
        console.log('Index phone_1 was already dropped or did not exist.');
      }

      // Recreate indexes in Mongoose to make sure sparse is applied immediately
      const User = require('../models/user.model');
      await User.createIndexes();
      console.log('Successfully rebuilt indexes with sparse: true constraint.');

    } catch (cleanErr) {
      console.warn('Non-blocking legacy db index cleanup warning:', cleanErr.message);
    }
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;