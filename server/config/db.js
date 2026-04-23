const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    if (error.message.includes('whitelist') || error.message.includes('IP address')) {
      console.error('👉 TIP: Please ensure your current IP address is whitelisted in MongoDB Atlas Network Access settings.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
