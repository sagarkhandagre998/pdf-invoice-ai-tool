import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    // Use a local MongoDB connection for development
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pdf-dashboard';
    
    // If the URI looks like it's trying to connect to a non-existent service, use local
    const finalURI = mongoURI.includes('_mongodb._tcp') ? 'mongodb://localhost:27017/pdf-dashboard' : mongoURI;
    
    await mongoose.connect(finalURI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('💡 Make sure MongoDB is running locally or update MONGODB_URI in your environment');
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
