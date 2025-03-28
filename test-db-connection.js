
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log('Database Connection Test');
  console.log('=======================');
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  console.log(`Connecting to: ${connectionString.replace(/:[^:@]*@/, ':****@')}`);
  
  // Parse the connection string manually to validate and log parts
  try {
    const match = connectionString.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (match) {
      const [, user, password, host, port, database] = match;
      console.log(`User: ${user}`);
      console.log(`Password: ${password ? '****' : 'Not set'}`);
      console.log(`Host: ${host}`);
      console.log(`Port: ${port}`);
      console.log(`Database: ${database}`);
    } else {
      console.error('WARNING: Could not parse DATABASE_URL, format may be incorrect');
    }
  } catch (error) {
    console.error('Error parsing connection string:', error);
  }

  const { Pool } = pg;
  
  // Try constructing the config object manually first
  try {
    const match = connectionString.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (match) {
      const [, user, password, host, port, database] = match;
      
      const pool = new Pool({
        user,
        password,
        host,
        port: parseInt(port, 10),
        database,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      
      console.log('\nTesting connection with parsed config...');
      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as current_time');
      console.log(`✅ Connection successful! Server time: ${result.rows[0].current_time}`);
      client.release();
      await pool.end();
      
      return true;
    }
  } catch (error) {
    console.error('❌ Connection failed with parsed config:', error.message);
  }
  
  // Try with connection string as fallback
  try {
    console.log('\nTrying connection with connection string...');
    const pool = new Pool({ connectionString });
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`✅ Connection successful! Server time: ${result.rows[0].current_time}`);
    client.release();
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed with connection string:', error.message);
    console.error('\nPossible solutions:');
    console.error('1. Check if PostgreSQL server is running on the specified port');
    console.error('2. Verify username and password are correct');
    console.error('3. Make sure the database exists');
    console.error('4. Check if PostgreSQL is configured to accept password authentication');
    
    return false;
  }
}

testConnection()
  .then(success => {
    if (success) {
      console.log('\nDatabase connection test completed successfully.');
    } else {
      console.error('\nDatabase connection test failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Test error:', error);
    process.exit(1);
  });
