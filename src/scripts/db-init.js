
#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * This script initializes the database by:
 * 1. Creating all necessary tables if they don't exist
 * 2. Adding default users if no users exist
 * 
 * Usage: node db-init.js
 */

const dotenv = require('dotenv');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

async function initializeDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    console.error('Please set DATABASE_URL to point to your PostgreSQL database');
    process.exit(1);
  }
  
  console.log('Connecting to database...');
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  try {
    // Test connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now');
    console.log(`Connected to database at ${result.rows[0].now}`);
    client.release();
    
    // Check if users table exists
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('Users table does not exist. Creating database schema...');
      
      // Read schema file
      const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Execute schema
      await pool.query(schema);
      console.log('Database schema created successfully');
    } else {
      console.log('Database schema already exists');
      
      // Check if users table has any records
      const usersResult = await pool.query('SELECT COUNT(*) FROM users');
      
      if (parseInt(usersResult.rows[0].count) === 0) {
        console.log('No users found. Creating default users...');
        
        // Insert default admin user
        await pool.query(`
          INSERT INTO users (name, email, password_hash, password, role, active, permissions)
          VALUES (
            'Admin User',
            'admin@example.com',
            '$2a$10$qLJZFgMoE8vg7NYgDRbZZ.lxK1SFwQn96MNKMoXB1jJjfVbQMQaXm',
            'password',
            'admin',
            true,
            '{"canViewDashboard":true,"canManageProducts":true,"canManageOrders":true,"canManageCustomers":true,"canManageUsers":true,"canExportData":true,"canSendMarketing":true,"canViewReports":true}'
          )
        `);
        
        // Insert default manager user
        await pool.query(`
          INSERT INTO users (name, email, password_hash, password, role, active, permissions)
          VALUES (
            'Manager User',
            'manager@example.com',
            '$2a$10$qLJZFgMoE8vg7NYgDRbZZ.lxK1SFwQn96MNKMoXB1jJjfVbQMQaXm',
            'password',
            'manager',
            true,
            '{"canViewDashboard":true,"canManageProducts":true,"canManageOrders":true,"canManageCustomers":true,"canManageUsers":false,"canExportData":true,"canSendMarketing":true,"canViewReports":true}'
          )
        `);
        
        console.log('Default users created successfully');
      } else {
        console.log('Users already exist in the database');
      }
    }
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Execute the function
initializeDatabase();
