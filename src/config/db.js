const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI;

    if (!connUri) {
      console.error('Error: MONGODB_URI is not defined in environment variables.');
      process.exit(1);
    }

    if (connUri.includes('<username>') || connUri.includes('<password>')) {
      console.warn(
        'Warning: MONGODB_URI contains placeholder values (<username>/<password>). Please update your .env file with valid MongoDB Atlas credentials.'
      );
    }

    const conn = await mongoose.connect(connUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

