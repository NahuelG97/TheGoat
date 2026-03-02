const axios = require('axios');

const API_URL = 'http://localhost:5000';

let authToken = '';
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

async function runTests() {
  try {
    console.log('🧪 Testing Cash Close Debug\n');

    // Test 1: Login
    console.log('Step 1: Login');
    const loginResponse = await api.post('/auth/login', {
      username: 'cajero',
      password: 'admin123'
    });
    authToken = loginResponse.data.token;
    console.log(`✓ Login successful\n`);

    // Test 2: Open cash session
    console.log('Step 2: Open cash session');
    const openResponse = await api.post('/cash/open', {
      openingAmount: 1000
    });
    console.log('Open Response Data:');
    console.log(JSON.stringify(openResponse.data, null, 2));
    const sessionId = openResponse.data.Id;
    console.log(`\n✓ Session opened with ID: ${sessionId}`);
    console.log(`  Type: ${typeof sessionId}\n`);

    // Test 3: Get current session
    console.log('Step 3: Get current session');
    const currentResponse = await api.get('/cash/current');
    console.log('Current Session Response Data:');
    console.log(JSON.stringify(currentResponse.data, null, 2));
    console.log(`\n✓ Current session ID: ${currentResponse.data?.Id}`);
    console.log(`  Type: ${typeof currentResponse.data?.Id}\n`);

    // Test 4: Try to close session
    console.log('Step 4: Close cash session');
    console.log(`Sending close request with sessionId: ${sessionId} (type: ${typeof sessionId})`);
    console.log('Request body:');
    const closeBody = { cashSessionId: sessionId, closingAmount: 1050, notes: 'Test close' };
    console.log(JSON.stringify(closeBody, null, 2));

    try {
      const closeResponse = await api.post('/cash/close', closeBody);
      console.log('\n✓ Close successful!');
      console.log('Response:');
      console.log(JSON.stringify(closeResponse.data, null, 2));
    } catch (closeErr) {
      console.log('\n✗ Close failed!');
      console.log('Error status:', closeErr.response?.status);
      console.log('Error data:');
      console.log(JSON.stringify(closeErr.response?.data, null, 2));
    }

  } catch (err) {
    console.error('\n✗ Error:', err.message);
    if (err.response?.data) {
      console.error('Response:', err.response.data);
    }
  }
}

runTests();
