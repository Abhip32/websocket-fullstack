const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('[SERVER] MongoDB connected successfully');
  } catch (error) {
    console.error('[SERVER] MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
