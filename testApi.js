const axios = require('axios');

async function testApi() {
  try {
    // 1. Login to get token
    const loginRes = await axios.post('http://localhost:5000/api/login', {
      email: 'jaganachari2006@gmail.com',
      password: 'password123' // guessing password, or we can just bypass and create a token
    }).catch(e => e.response);

    let token = loginRes?.data?.token;

    if (!token) {
      console.log('Login failed, generating manual token...');
      const jwt = require('jsonwebtoken');
      require('dotenv').config({ path: './Server/.env' });
      // We know from checkDb that jaganachari2006@gmail.com exists
      const mongoose = require('mongoose');
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartsplit');
      const User = require('./Server/models/user.model');
      const user = await User.findOne({ email: 'jaganachari2006@gmail.com' });
      if (user) {
         token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
      }
      mongoose.disconnect();
    }

    if (!token) {
      console.log('Could not get token');
      return;
    }

    console.log('Got token:', token.substring(0, 20) + '...');

    // 2. Update Profile
    console.log('Sending PUT /profile...');
    const updateRes = await axios.put('http://localhost:5000/api/profile', {
      upiList: ['new_upi@bank'],
      defaultUpi: 'new_upi@bank'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Update Success:', updateRes.data.success);
    console.log('Updated User:', updateRes.data.user);

  } catch (err) {
    console.error('API Test Error:', err.response?.data || err.message);
  }
}

testApi();
