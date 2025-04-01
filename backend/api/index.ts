import express from "express";
import serverless from "serverless-http";
import serverApp from "../server/index.js";

// Create Express app
const app = express();

// Mount the server app
app.use("/", serverApp);

// Export the serverless handler
export default serverless(app); 