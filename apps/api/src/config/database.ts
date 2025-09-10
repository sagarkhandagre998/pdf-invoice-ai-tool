import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    // If already connected, return
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Using existing MongoDB connection');
      return;
    }
    
    console.log(`🔗 Attempting to connect to MongoDB Atlas...`);
    
    // Optimized connection options for Vercel serverless
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 1, // Limit connection pool for serverless
      minPoolSize: 0, // Allow connections to close
      maxIdleTimeMS: 30000, // Close connections after 30 seconds
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    };
    
    await mongoose.connect(mongoURI, options);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('💡 Check your MONGODB_URI and MongoDB Atlas network access settings');
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB error:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 MongoDB connection closed');
  process.exit(0);
});
