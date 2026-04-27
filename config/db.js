const mongoose = require('mongoose');

// ─── In-memory data store (used when MongoDB is unavailable) ──
let useInMemory = false;
const memoryStore = {
  orders: [],
  users: [],
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️  MongoDB unavailable: ${error.message}`);
    console.log('📦 Using in-memory data store for demonstration...');
    useInMemory = true;
  }
};

// Export helpers so controllers can check
const isInMemory = () => useInMemory;
const getStore = () => memoryStore;

module.exports = { connectDB, isInMemory, getStore };
