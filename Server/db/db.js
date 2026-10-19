const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['1.1.1.1', '8.8.8.8']);

let connectionPromise;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (mongoose.connection.readyState !== 2) connectionPromise = null;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be configured.');
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI).then(async () => {
      console.log('MongoDB connected');

      try {
        const db = mongoose.connection.db;
        await db.collection('users').updateMany({ email: null }, { $unset: { email: '' } });
        await db.collection('users').updateMany({ email: '' }, { $unset: { email: '' } });
        await db.collection('users').updateMany({ phone: null }, { $unset: { phone: '' } });
        await db.collection('users').updateMany({ phone: '' }, { $unset: { phone: '' } });

        for (const indexName of ['email_1', 'phone_1']) {
          try {
            await db.collection('users').dropIndex(indexName);
          } catch (error) {
            if (error.codeName !== 'IndexNotFound') throw error;
          }
        }

        const User = require('../models/user.model');
        await User.createIndexes();
      } catch (cleanupError) {
        console.warn('Non-blocking legacy database cleanup warning:', cleanupError.message);
      }
    }).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  await connectionPromise;
}

module.exports = connectDB;
