
#!/usr/bin/env node

/**
 * API Health Check Script
 * 
 * This script checks if the API server is running correctly and can connect to the database.
 * 
 * Usage: node check-api.js
 */

const http = require('http');

// API endpoints to check
const endpoints = [
  { path: '/api/health', name: 'Health Check' },
  { path: '/api/db-status', name: 'Database Status' },
  { path: '/api/validate-db', name: 'Database Validation' }
];

// Options for HTTP requests
const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  timeout: 5000, // 5 seconds timeout
  headers: {
    'Accept': 'application/json'
  }
};

console.log('=== API Health Check ===');
console.log(`Checking API server at http://${options.hostname}:${options.port}`);
console.log('');

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
            console.log(`  Response: ${JSON.stringify(parsedData, null, 2).slice(0, 200)}...`);
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
    console.log('All API endpoints are working correctly!');
  } else {
    console.log('Some API endpoints failed. Please check the server logs for more information.');
    console.log('Make sure the server is running with the correct DATABASE_URL environment variable.');
    console.log('Run the server with: npm start');
  }
  
  process.exit(allSuccessful ? 0 : 1);
}

runChecks();
