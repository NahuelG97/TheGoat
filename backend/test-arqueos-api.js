const http = require('http');

// Test token generation
const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: 1, role: 'admin' }, 'your_secret_key_change_this_in_production');

console.log('Generated token:', token);
console.log('\nTesting date parameter formatting...');

const filterDate = '2026-03-02';
const stringValue = `'${filterDate.replace(/'/g, "''")}'`;
console.log('filterDate:', filterDate);
console.log('stringValue:', stringValue);

const query = `
  SELECT 
    CAST(cs.ClosedAt AS DATE) as ClosedDate
  FROM CashSessions cs
  WHERE CAST(cs.ClosedAt AS DATE) = CAST(@filterDate AS DATE)
`;

const finalQuery = query.replace(/@filterDate/g, stringValue);
console.log('\nFinal query:');
console.log(finalQuery);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/arqueos/list?date=2026-03-02',
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
    console.log('Response:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('\nParsed JSON:');
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Could not parse as JSON');
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
