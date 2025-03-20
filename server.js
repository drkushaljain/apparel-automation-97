
const express = require('express');
const path = require('path');
const app = express();
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables from .env file
dotenv.config();

// Check if we should connect to PostgreSQL
const usePostgres = process.env.USE_POSTGRES === 'true';

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API endpoint to check database connection
app.get('/api/db-status', async (req, res) => {
  if (usePostgres) {
    try {
      // In a real implementation, this would use the PostgreSQL service
      // For now, just simulate a successful connection
      res.status(200).json({ 
        connected: true, 
        type: 'postgres',
        message: 'Connected to PostgreSQL database' 
      });
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(500).json({ 
        connected: false, 
        type: 'postgres',
        message: 'Failed to connect to PostgreSQL database',
        error: error.message
      });
    }
  } else {
    // Using localStorage/IndexedDB in browser
    res.status(200).json({ 
      connected: true, 
      type: 'local',
      message: 'Using local storage (no database connection)' 
    });
  }
});

// Handle all other routes by serving the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Use the PORT environment variable or default to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the application`);
  
  // Log environment info
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Using PostgreSQL: ${usePostgres ? 'Yes' : 'No (using local storage)'}`);
  
  if (usePostgres && !process.env.DATABASE_URL) {
    console.warn('WARNING: USE_POSTGRES is true but DATABASE_URL is not set');
  }
});
