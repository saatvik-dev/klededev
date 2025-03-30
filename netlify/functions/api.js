// Netlify serverless function handler for API routes
const { createServer } = require('../../dist/server');
const serverless = require('serverless-http');

// Create server for serverless environment
exports.handler = async (event, context) => {
  const { app } = await createServer({ serverless: true });
  const handler = serverless(app);
  return handler(event, context);
};