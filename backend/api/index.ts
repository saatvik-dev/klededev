import { createServer } from '../server/index.js';
import serverless from 'serverless-http';

let app: any;

export default async function(req: any, res: any) {
  try {
    if (!app) {
      const { app: expressApp } = await createServer({ serverless: true });
      app = expressApp;
    }
    
    return serverless(app)(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 