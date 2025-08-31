import { config } from './config';
import { app } from './app';

const port = config.port;

const server = app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`CORS enabled for: ${config.cors.origin}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

// Handle termination signals
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export { server };
