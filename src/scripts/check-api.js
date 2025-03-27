
#!/usr/bin/env node

/**
 * API Health Check Script
 * 
 * This script checks if the API server is running correctly and can connect to the database.
 * 
 * Usage: node check-api.js [hostname] [port]
 */

const http = require('http');
const { execSync } = require('child_process');

// API endpoints to check
const endpoints = [
  { path: '/api/health', name: 'Health Check' },
  { path: '/api/db-status', name: 'Database Status' },
  { path: '/api/validate-db', name: 'Database Validation' }
];

// Get hostname and port from command line args if provided
const hostname = process.argv[2] || 'localhost';
const port = process.argv[3] || process.env.PORT || 3000;

// Options for HTTP requests
const options = {
  hostname: hostname,
  port: port,
  timeout: 5000, // 5 seconds timeout
  headers: {
    'Accept': 'application/json'
  }
};

// Check if DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL;

console.log('=== API Health Check ===');
console.log(`Checking API server at http://${options.hostname}:${options.port}`);
console.log('Environment: NODE_ENV=' + (process.env.NODE_ENV || 'not set'));
console.log('Database URL: ' + (databaseUrl ? 'Set (hidden for security)' : 'NOT SET - This is required!'));
if (!databaseUrl) {
  console.log('\nWARNING: DATABASE_URL environment variable is not set!');
  console.log('The application requires this to connect to PostgreSQL.');
  console.log('Example: postgres://username:password@localhost:5432/apparel_management');
}
console.log('');

// Check if PostgreSQL is available (if on local machine)
if (hostname === 'localhost' || hostname === '127.0.0.1') {
  try {
    console.log('Checking PostgreSQL server status...');
    // Try to run pg_isready to check if PostgreSQL is running
    try {
      const output = execSync('pg_isready -h localhost -p 5432', { timeout: 2000 }).toString();
      console.log('PostgreSQL server status: ' + output.trim());
    } catch (error) {
      console.log('PostgreSQL server check failed. Is PostgreSQL installed and running?');
      console.log(`Error: ${error.message}`);
    }
    console.log('');
  } catch (error) {
    // Ignore errors, pg_isready might not be available
  }
}

// Check each endpoint
async function checkEndpoint(endpoint) {
  return new Promise((resolve) => {
    const req = http.get(
      { ...options, path: endpoint.path },
      (res) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'] || '';
        
        console.log(`${endpoint.name}: ${statusCode} ${res.statusMessage}`);
        
        let error;
        if (statusCode !== 200) {
          error = `Status Code: ${statusCode}`;
        } else if (!/^application\/json/.test(contentType)) {
          error = `Invalid content-type: ${contentType}`;
          console.log(`  Expected application/json but received ${contentType}`);
        }
        
        if (error) {
          console.log(`  Error: ${error}`);
          res.resume(); // Consume response to free up memory
          resolve(false);
          return;
        }
        
        res.setEncoding('utf8');
        let rawData = '';
        
        res.on('data', (chunk) => { rawData += chunk; });
        
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            
            // For db-status endpoint, add more specific feedback
            if (endpoint.path === '/api/db-status') {
              if (parsedData.connected) {
                console.log(`  Database Connection: SUCCESS`);
                console.log(`  Database Type: ${parsedData.type}`);
                console.log(`  Message: ${parsedData.message}`);
                if (parsedData.timestamp) {
                  console.log(`  Server Time: ${parsedData.timestamp}`);
                }
              } else {
                console.log(`  Database Connection: FAILED`);
                console.log(`  Reason: ${parsedData.message}`);
                if (parsedData.error) {
                  console.log(`  Error Details: ${parsedData.error}`);
                }
                
                if (parsedData.message.includes('DATABASE_URL not configured')) {
                  console.log(`\n  To fix this issue, set the DATABASE_URL environment variable:`);
                  console.log(`  On Windows: set DATABASE_URL=postgres://username:password@localhost:5432/dbname`);
                  console.log(`  On Mac/Linux: export DATABASE_URL=postgres://username:password@localhost:5432/dbname`);
                }
              }
            } 
            // For validate-db endpoint, show table details
            else if (endpoint.path === '/api/validate-db') {
              if (parsedData.success) {
                console.log(`  Database Schema: VALID`);
                console.log(`  Tables Found: ${parsedData.tables.length}`);
                console.log(`  Table Counts:`);
                for (const [table, count] of Object.entries(parsedData.counts)) {
                  console.log(`    - ${table}: ${count} records`);
                }
              } else {
                console.log(`  Database Schema: INVALID`);
                console.log(`  Reason: ${parsedData.message}`);
                if (parsedData.tables) {
                  console.log(`  Existing Tables: ${parsedData.tables.length > 0 ? parsedData.tables.join(', ') : 'None'}`);
                }
                if (parsedData.missingTables) {
                  console.log(`  Missing Tables: ${parsedData.missingTables.join(', ')}`);
                }
              }
            } 
            // For other endpoints, just show the response
            else {
              console.log(`  Response: ${JSON.stringify(parsedData, null, 2).slice(0, 200)}...`);
            }
            
            resolve(true);
          } catch (e) {
            console.log(`  Error parsing JSON: ${e.message}`);
            resolve(false);
          }
        });
      }
    ).on('error', (e) => {
      console.log(`${endpoint.name}: ERROR`);
      console.log(`  Error: ${e.message}`);
      
      // If connection is refused, the server might not be running
      if (e.code === 'ECONNREFUSED') {
        console.log('  The server appears to be offline. Make sure you have started the server with "npm start".');
      }
      
      resolve(false);
    }).on('timeout', () => {
      console.log(`${endpoint.name}: TIMEOUT`);
      console.log('  Request timed out after 5 seconds');
      req.destroy();
      resolve(false);
    });
  });
}

async function runChecks() {
  let allSuccessful = true;
  
  for (const endpoint of endpoints) {
    const success = await checkEndpoint(endpoint);
    allSuccessful = allSuccessful && success;
    console.log(''); // Add a blank line between endpoint checks
  }
  
  console.log('=== Summary ===');
  if (allSuccessful) {
    console.log('✅ All API endpoints are working correctly!');
    
    // Additional diagnostic information if everything is OK
    console.log('\nYou can now run the application:');
    console.log('1. Make sure the DATABASE_URL is set correctly');
    console.log('2. Start the server with: npm start');
    console.log('3. Open http://localhost:3000 in your browser');
    console.log('4. Log in with:');
    console.log('   - Email: admin@example.com');
    console.log('   - Password: password');
  } else {
    console.log('❌ Some API endpoints failed. Please check the issues above.');
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure the server is running with: npm start');
    console.log('2. Check if DATABASE_URL environment variable is set correctly');
    console.log('3. Verify PostgreSQL is running and accessible');
    console.log('4. Run setup script to initialize the database: ./setup-db.sh (Linux/Mac) or setup-db.bat (Windows)');
    console.log('5. If DATABASE_URL is set but connection fails, try connecting directly with:');
    console.log('   psql $DATABASE_URL');
  }
  
  process.exit(allSuccessful ? 0 : 1);
}

runChecks();
