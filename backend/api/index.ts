import express from 'express';
import { createServer } from '../server/index.js';
import serverless from 'serverless-http';

// Create the Express app
const app = express();

// Initialize the server
createServer({ serverless: true }).then(({ app: serverApp }) => {
  // Mount the server app
  app.use('/', serverApp);
}).catch(error => {
  console.error('Failed to initialize server:', error);
});

// Export the serverless handler
export default serverless(app); 