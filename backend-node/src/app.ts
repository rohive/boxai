import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import { askQuestion, listModels } from './controllers/aiController';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Log environment variables (don't log sensitive ones in production)
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  // Don't log API keys
  HAS_OPENAI_KEY: !!process.env.OPENAI_API_KEY,
  HAS_ANTHROPIC_KEY: !!process.env.ANTHROPIC_API_KEY,
  FRONTEND_URL: process.env.FRONTEND_URL
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
const router = express.Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API endpoints
router.get('/models', (req: Request, res: Response, next: NextFunction) => {
  listModels(req, res, next);
});

router.post('/ask', (req: Request, res: Response, next: NextFunction) => {
  askQuestion(req, res, next);
});

// Mount API routes under /api
app.use('/api', router);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'BoxAI API is running',
    endpoints: [
      'GET /api/health',
      'GET /api/models',
      'POST /api/ask'
    ]
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  console.error(`404 - Not Found - ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    query: req.query
  });

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  const PORT = process.env.PORT || 8000;
  const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Consider restarting the server or performing cleanup
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Consider restarting the server or performing cleanup
    process.exit(1);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

export { app };
