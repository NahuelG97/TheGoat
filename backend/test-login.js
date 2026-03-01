const http = require('http');

async function testLogin() {
  try {
    console.log('Intentando login con cajero / admin123...');
    
    const data = JSON.stringify({
      username: 'cajero',
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', body);
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error.message);
    });

    req.write(data);
    req.end();
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testLogin();
