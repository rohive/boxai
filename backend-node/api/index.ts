import { VercelRequest, VercelResponse } from '@vercel/node';
import { app } from '../src/app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Incoming request:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body
  });

  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-V, Authorization'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

  // Convert Vercel request/response to Express format
  const expressReq = {
    ...req,
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
  } as any;

  const expressRes = {
    ...res,
    status: (code: number) => ({
      ...res,
      statusCode: code,
      json: (data: any) => res.status(code).json(data),
      send: (data: any) => res.status(code).send(data),
      end: () => res.status(code).end(),
    }),
    json: (data: any) => res.json(data),
    send: (data: any) => res.send(data),
    end: () => res.end(),
  } as any;

    // Handle the request with Express app
    try {
      console.log('Processing request with Express app');
      await app(expressReq, expressRes);
    } catch (error) {
      console.error('Error in Express app:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  } catch (error) {
    console.error('Top-level error in API handler:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
