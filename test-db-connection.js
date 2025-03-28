
import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

// Ensure environment variables are loaded
dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Kushaljain_28@localhost:5432/postgres';
console.log('Testing connection to:', connectionString.replace(/:[^:@]*@/, ':****@'));

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL!');
    const result = await client.query('SELECT NOW()');
    console.log('Current database time:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    return false;
  } finally {
    // Close the pool
    await pool.end();
  }
}

testConnection()
  .then(success => {
    console.log(success ? 'Database connection test completed successfully.' : 'Database connection test failed.');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error during connection test:', err);
    process.exit(1);
  });
