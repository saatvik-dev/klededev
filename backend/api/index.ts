import { createServer } from '../server/index.js';
import serverless from 'serverless-http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let app: any;

export default async function(req: any, res: any) {
  try {
    if (!app) {
      console.log('Initializing serverless function...');
      console.log('Current directory:', __dirname);
      console.log('Root directory:', path.resolve(__dirname, '..'));
      
      const { app: expressApp } = await createServer({ 
        serverless: true
      });
      app = expressApp;
    }
    
    return serverless(app)(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Current directory:', __dirname);
    console.error('Process cwd:', process.cwd());
    
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
    });
  }
} 