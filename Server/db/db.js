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

      // Drop old non-sparse unique indexes
      try {
        await db.collection('users').dropIndex('email_1');
      } catch (e) {
        
      }

      try {
        await db.collection('users').dropIndex('phone_1');
      } catch (e) {
        
      }

      // Recreate indexes in Mongoose to make sure sparse is applied immediately
      const User = require('../models/user.model');
      await User.createIndexes();

    } catch (cleanErr) {
      console.warn('Non-blocking legacy db index cleanup warning:', cleanErr.message);
    }
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;