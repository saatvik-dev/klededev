import { Handler } from '@netlify/functions';
import serverless from 'serverless-http';
import { createServer } from '../../server/index';

// Create the Express app for serverless environment
const app = await createServer({ serverless: true });

// Export the serverless handler
export const handler: Handler = serverless(app);