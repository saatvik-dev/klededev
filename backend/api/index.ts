import express, { Request, Response } from 'express';
import { createServer } from '../server/index.js';
import path from 'path';

/**
 * Create and configure the Express application for serverless environment
 */
export default async function handler(req: Request, res: Response) {
  try {
    const { app } = await createServer({ 
      serverless: true,
      rootDir: process.cwd()
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