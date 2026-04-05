const mongoose = require('mongoose');

/** Atlas / local URI — same value can be set as MONGO_URI or MONGODB_URI */
const getMongoUri = () =>
  process.env.MONGO_URI || process.env.MONGODB_URI || '';

const connectDB = async () => {
  const mongoUri = getMongoUri();
  if (!mongoUri) {
    console.error(
      'MongoDB: No connection string. Set MONGO_URI or MONGODB_URI in Backend/.env'
    );
    process.exit(1);
  }
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,        // 30 second timeout for server selection
      socketTimeoutMS: 45000,                 // 45 second socket timeout
      retryWrites: false,                     // Disable retry writes temporarily to isolate issue
      directConnection: false,                // Allow load balancing
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 45000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('Ensure: 1) MongoDB Atlas cluster is running');
    console.error('2) Your IP is whitelisted in MongoDB Atlas');
    console.error('3) Credentials in MONGO_URI / MONGODB_URI are correct');
    process.exit(1);
  }
};

module.exports = connectDB;
