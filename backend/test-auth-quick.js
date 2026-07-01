const http = require('http');

const data = JSON.stringify({ username: 'cajero', password: 'admin123' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
};

console.log('Testing login...');
const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
    process.exit(0);
  });
});

req.on('error', err => {
  console.error('Error:', err.message);
  process.exit(1);
});

req.write(data);
req.end();
