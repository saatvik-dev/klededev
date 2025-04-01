import express, { Request, Response } from 'express';
import { createServer } from '../server/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Create and configure the Express application for serverless environment
 */
export default async function handler(req: Request, res: Response) {
  try {
    const { app } = await createServer({ 
      serverless: true,
      rootDir: path.resolve(process.cwd(), 'backend')
    });
    
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? undefined : errorMessage,
      stack: process.env.NODE_ENV === 'production' ? undefined : errorStack
    });
  }
} 