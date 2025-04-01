import { createServer } from '../server/index.js';
import serverless from 'serverless-http';

let app: any;

export default async function(req: any, res: any) {
  if (!app) {
    const { app: expressApp } = await createServer({ serverless: true });
    app = expressApp;
  }
  
  return serverless(app)(req, res);
} 