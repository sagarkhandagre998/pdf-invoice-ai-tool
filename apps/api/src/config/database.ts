import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    // For development, use local MongoDB to avoid Atlas SSL issues
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pdf-dashboard';
    
    // If the URI contains Atlas connection or has SSL issues, use local MongoDB for development
    const useLocalDB = mongoURI.includes('_mongodb._tcp') || 
                      mongoURI.includes('mongodb+srv://') || 
                      process.env.NODE_ENV === 'development';
    
    const finalURI = useLocalDB ? 'mongodb://localhost:27017/pdf-dashboard' : mongoURI;
    
    console.log(`🔗 Attempting to connect to: ${useLocalDB ? 'Local MongoDB' : 'Atlas MongoDB'}`);
    
    // Simple connection options
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    
    await mongoose.connect(finalURI, options);
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
