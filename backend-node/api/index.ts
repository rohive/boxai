import { VercelRequest, VercelResponse } from '@vercel/node';
import { app } from '../src/app';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  const allowedOrigins = [
    'https://boxai-iota.vercel.app',
    'http://localhost:3000' // For local development
  ];
  
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Convert Vercel request to Express format
  const expressReq = {
    ...req,
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.body,
    params: {},
    cookies: {},
    get: (name: string) => req.headers[name.toLowerCase()],
    header: (name: string) => req.headers[name.toLowerCase()],
  } as any;

  // Create Express-compatible response
  const expressRes: any = {
    ...res,
    statusCode: 200,
    status: function(code: number) {
      this.statusCode = code;
      return this;
    },
    json: function(data: any) {
      return res.status(this.statusCode || 200).json(data);
    },
    send: function(data: any) {
      if (typeof data === 'object') {
        return res.status(this.statusCode || 200).json(data);
      }
      return res.status(this.statusCode || 200).send(data);
    },
    end: function() {
      return res.status(this.statusCode || 200).end();
    },
    setHeader: function(name: string, value: string) {
      res.setHeader(name, value);
      return this;
    },
    getHeader: function(name: string) {
      return res.getHeader(name);
    },
    removeHeader: function(name: string) {
      res.removeHeader(name);
      return this;
    }
  };

  // Handle the request with Express app
  try {
    console.log('Processing request with Express app');
    await app(expressReq, expressRes, (err?: any) => {
      if (err) {
        console.error('Error in Express middleware chain:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        const errorStack = err instanceof Error ? err.stack : undefined;
        
        res.status(500).json({
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? errorMessage : 'Something went wrong',
          ...(process.env.NODE_ENV === 'development' && errorStack ? { stack: errorStack } : {})
        });
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Top-level error in API handler:', errorMessage);
    res.status(500).json({ 
      error: 'Internal server error',
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && errorStack ? { stack: errorStack } : {})
    });
  }
}
