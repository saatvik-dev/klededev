// This is a standalone Netlify function that avoids import.meta issues
// Uses the .cjs extension to properly signal it's a CommonJS module
const express = require('express');
const serverless = require('serverless-http');
const { Pool } = require('pg');

// Create express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers
app.use((req, res, next) => {
  // Allow requests from Netlify frontend domain
  // In production, replace * with your Netlify domain (e.g. https://your-app.netlify.app)
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://your-app.netlify.app', // Replace with your actual Netlify domain
    'https://your-app.vercel.app'  // Replace with your actual Vercel domain
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Basic routes for waitlist functionality
app.post('/api/waitlist', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    
    // Check if email exists
    const checkResult = await pool.query(
      'SELECT * FROM waitlist_entries WHERE email = $1',
      [email]
    );
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Add to waitlist
    const result = await pool.query(
      'INSERT INTO waitlist_entries (email, created_at) VALUES ($1, NOW()) RETURNING *',
      [email]
    );
    
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all waitlist entries (admin only)
app.get('/api/waitlist', async (req, res) => {
  try {
    // In a real app, you would add authentication here
    const result = await pool.query('SELECT * FROM waitlist_entries ORDER BY created_at DESC');
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete a waitlist entry (admin only)
app.delete('/api/waitlist/:id', async (req, res) => {
  try {
    // In a real app, you would add authentication here
    const { id } = req.params;
    await pool.query('DELETE FROM waitlist_entries WHERE id = $1', [id]);
    return res.status(200).json({ message: 'Entry deleted' });
  } catch (error) {
    console.error('Error deleting waitlist entry:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  // Very basic authentication - in production use a proper auth system
  if (username === 'admin' && password === 'admin') {
    return res.status(200).json({ message: 'Logged in successfully' });
  }
  
  return res.status(401).json({ message: 'Invalid credentials' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// Export the serverless handler
// Using module.exports for CommonJS compatibility
module.exports = {
  handler: serverless(app)
};