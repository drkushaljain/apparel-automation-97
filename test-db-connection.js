
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the connection string from environment variables
const connectionString = process.env.DATABASE_URL;

console.log('Testing database connection...');
console.log(`Using connection string: ${connectionString ? connectionString.replace(/:[^:@]*@/, ':****@') : 'undefined'}`);

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create a new pool
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test the connection
async function testConnection() {
  let client;
  try {
    console.log('Attempting to connect to the database...');
    client = await pool.connect();
    console.log('Connected to PostgreSQL database successfully!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW()');
    console.log('Query executed successfully. Current timestamp:', result.rows[0].now);
    
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  } finally {
    if (client) {
      client.release();
      console.log('Database connection released');
    }
    
    // Close the pool
    await pool.end();
    console.log('Connection pool closed');
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log('Database connection test completed successfully');
      process.exit(0);
    } else {
      console.error('Database connection test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
