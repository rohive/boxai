import express from 'express';
import cors from 'cors';
import { config } from './config';
import { askQuestion, listModels } from './controllers/aiController';

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: config.cors.origin,
  })
);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'BoxAI API is running' });
});

app.get('/models', listModels);
app.post('/ask', askQuestion);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'Something went wrong',
  });
});

const appInstance = app;

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  const PORT = process.env.PORT || 8000;
  appInstance.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export { appInstance as app };
