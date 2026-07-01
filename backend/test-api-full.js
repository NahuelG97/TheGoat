const axios = require('axios');

async function testApi() {
  try {
    // First login
    console.log('1. Testing login...');
    const loginResp = await axios.post('http://localhost:5000/auth/login', {
      username: 'cajero',
      password: 'admin123'
    });
    const token = loginResp.data.token;
    console.log('✓ Login successful, token obtained');
    
    // Now test /users endpoint
    console.log('\n2. Testing /users endpoint with token...');
    const usersResp = await axios.get('http://localhost:5000/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✓ /users endpoint status:', usersResp.status);
    console.log('✓ Users count:', usersResp.data.length);
    console.log('Users:', usersResp.data.map(u => ({ id: u.Id, username: u.Username, role: u.Role })));
    
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.response?.status, err.response?.data || err.message);
    process.exit(1);
  }
}

testApi();
