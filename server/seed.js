require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

async function seed() {
  try {
    await connectDB();
    console.log('Database connected.');

    const email = 'narded2007@gmail.com';
    const password = 'Bernardo@2007';

    let user = await User.findOne({ email });

    if (user) {
      user.role = 'superadmin';
      user.password = password;
      user.adminStatus = 'approved';
      await user.save();
      console.log('User already existed, updated to superadmin with new password.');
    } else {
      user = new User({
        name: 'Super Admin',
        email: email,
        password: password,
        role: 'superadmin',
        adminStatus: 'approved'
      });
      await user.save();
      console.log('Super admin user created successfully.');
    }

    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Seed error:', error);
    mongoose.connection.close();
  }
}

seed();
