import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import { createServer } from "http";
import { registerRoutes } from "./routes.js";

// Create Express app
const app = express();

// Configure CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Configure session middleware - only in non-serverless environment
if (!process.env.VERCEL) {
  app.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key", // Warning: Use a proper secret in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
}

// Configure Passport
app.use(passport.initialize());
if (!process.env.VERCEL) {
  app.use(passport.session());
}

// Configure Passport serialization
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

// Register routes
const httpServer = await registerRoutes(app);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server if not in serverless environment
if (!process.env.VERCEL && httpServer) {
  const port = process.env.PORT || 3001;
  httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;