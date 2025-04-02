import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import morgan from 'morgan';
import cors from 'cors';

// Load environment variables first thing to ensure they're available throughout
const envResult = dotenv.config();
if (envResult.error) {
  console.error('Error loading .env file:', envResult.error);
  console.error('Some features may not work properly without environment variables.');
}

const app = express();
const PORT = process.env.PORT || 8088;

// Get the directory name equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enhanced middleware setup
app.use(cors()); // Add CORS support
app.use(morgan('dev')); // Add request logging

// Make sure these middleware are properly configured for handling request body
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add detailed logging middleware for POST requests
app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log(`POST request to ${req.path}`);
    console.log('Request headers:', req.headers);
    console.log('Request content type:', req.headers['content-type']);
    
    // More detailed logging for the body
    if (req.body) {
      console.log('Request body preview:', 
        JSON.stringify(req.body).substring(0, 500) + 
        (JSON.stringify(req.body).length > 500 ? '...' : '')
      );
      console.log('Request body keys:', Object.keys(req.body));
      console.log('Request body length:', JSON.stringify(req.body).length);
    } else {
      console.log('Request body is empty or not parsed');
    }
  }
  next();
});

// Create upload directories if they don't exist
const uploadDir = path.join(__dirname, 'public', 'uploads');
const productImagesDir = path.join(uploadDir, 'products');
const companyLogosDir = path.join(uploadDir, 'company');
const marketingDir = path.join(uploadDir, 'marketing');

// Ensure directories exist
const ensureDirectoriesExist = () => {
  const directories = [uploadDir, productImagesDir, companyLogosDir, marketingDir];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

ensureDirectoriesExist();

// Display database connection info for debugging
console.log(`Database URL: ${process.env.DATABASE_URL ? 'Set (hidden for security)' : 'NOT SET'}`);
if (!process.env.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL is not set in the environment. Setting default connection string.');
  process.env.DATABASE_URL = 'postgresql://postgres:Kushaljain_28@localhost:5432/postgres';
}

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve uploaded files with proper caching headers
app.use('/uploads', (req, res, next) => {
  // Set cache control headers for uploaded files
  res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
  next();
}, express.static(path.join(__dirname, 'public', 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import and use the API router
import apiRouter from './src/server/router.js';
app.use('/api', apiRouter);

// Global error handler - enhance to provide more details
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  console.error('Error stack:', err.stack);
  console.error('Request path:', req.path);
  console.error('Request method:', req.method);
  console.error('Request body:', req.body);
  
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    path: req.path,
    method: req.method
  });
});

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Uploads directory: ${uploadDir}`);
  console.log(`API endpoints: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // For production, you might want to gracefully shut down
  // process.exit(1);
});
