const http = require('http');

// Test token generation
const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: 1, role: 'admin' }, 'your_secret_key_change_this_in_production');

console.log('Testing /arqueos/detail/:id endpoint...');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/arqueos/detail/16',  // Using one of the test IDs
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nStatus:', res.statusCode);
    try {
      const parsed = JSON.parse(data);
      console.log('\nParsed JSON (formatted):');
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
