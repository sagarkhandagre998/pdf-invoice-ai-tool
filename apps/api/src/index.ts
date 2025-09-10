import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import uploadRoutes from './routes/upload.js';
import extractRoutes from './routes/extract.js';
import invoiceRoutes from './routes/invoices.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Root route for debugging
app.get('/', (req, res) => {
  res.json({ 
    message: 'PDF Dashboard API is running!',
    endpoints: [
      'POST /api/upload - Upload PDF files',
      'POST /api/extract - Extract data from PDF',
      'GET /api/invoices - List all invoices',
      'POST /api/invoices - Create new invoice',
      'PUT /api/invoices/:id - Update invoice',
      'DELETE /api/invoices/:id - Delete invoice',
      'GET /api/health - Health check'
    ],
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test route to verify routing works
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route is working!', timestamp: new Date().toISOString() });
});

// API Routes
console.log('🔧 Mounting API routes...');
app.use('/api/upload', uploadRoutes);
console.log('✅ Upload route mounted');
app.use('/api/extract', extractRoutes);
console.log('✅ Extract route mounted');
app.use('/api/invoices', invoiceRoutes);
console.log('✅ Invoices route mounted');

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler (must be last)
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Try to connect to MongoDB, but don't fail if it's not available
    try {
      await connectDB();
    } catch (dbError) {
      console.warn('⚠️ MongoDB connection failed, continuing without database...');
      console.warn('💡 Some features may not work without a database connection');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 API server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
