const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/';
  const dbName = process.env.DB_NAME || 'berdVault';

  if (!mongoUri) {
    throw new Error('MONGO_URI must be defined in environment variables.');
  }

  const connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  if (mongoUri.endsWith('/') || !/\/[^/?]+/.test(mongoUri)) {
    connectOptions.dbName = dbName;
  }

  try {
    const conn = await mongoose.connect(mongoUri, connectOptions);

    console.log(`✅ MongoDB connected: ${conn.connection.name}`);

    mongoose.connection.on('error', (error) => {
      console.error(`❌ MongoDB connection error: ${error.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
};

module.exports = connectDB;
