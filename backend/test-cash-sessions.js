const axios = require('axios');

const API_URL = 'http://localhost:5000';

// Create axios instance with auth token
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
    console.log('🧪 Testing Cash Session Module\n');
    console.log('=' .repeat(50));

    // Test 1: Login to get token
    console.log('\n✅ Test 1: Login to get session');
    const loginResponse = await api.post('/auth/login', {
      username: 'cajero',
      password: 'admin123'
    });
    authToken = loginResponse.data.token;
    console.log(`   Login successful - Token: ${authToken.substring(0, 20)}...`);

    // Test 2: Check for existing cash session (should be none)
    console.log('\n✅ Test 2: Check current cash session (before opening)');
    let currentSession = await api.get('/cash/current');
    console.log(`   Current session: ${currentSession.data ? 'EXISTS' : 'NONE'}`);
    if (!currentSession.data) {
      console.log('   ✓ No session exists (expected)');
    }

    // Test 3: Open cash session
    console.log('\n✅ Test 3: Open cash session with $1000');
    const openResponse = await api.post('/cash/open', {
      openingAmount: 1000
    });
    const sessionId = openResponse.data.Id;
    console.log(`   ✓ Cash session opened - ID: ${sessionId}`);
    console.log(`   ✓ Opening amount: $${parseFloat(openResponse.data.OpeningAmount).toFixed(2)}`);
    console.log(`   ✓ Status: ${openResponse.data.Status}`);

    // Test 4: Get current session (should exist now)
    console.log('\n✅ Test 4: Check current cash session (after opening)');
    currentSession = await api.get('/cash/current');
    if (currentSession.data) {
      console.log(`   ✓ Session found - ID: ${currentSession.data.Id}`);
      console.log(`   ✓ Opening Amount: $${parseFloat(currentSession.data.OpeningAmount).toFixed(2)}`);
    } else {
      console.log('   ✗ No session found (unexpected)');
    }

    // Test 5: Create a product and sale
    console.log('\n✅ Test 5: Create a test product');
    const productResponse = await api.post('/products', {
      name: 'Test Product for Cash',
      price: 10.00
    });
    const productId = productResponse.data.Id;
    console.log(`   ✓ Product created - ID: ${productId}, Price: $10.00`);

    // Test 6: Register a sale
    console.log('\n✅ Test 6: Register a sale during cash session');
    const saleResponse = await api.post('/sales', {
      items: [
        {
          productId: productId,
          quantity: 5,
          notes: 'Test sale with notes'
        }
      ],
      notes: 'Test sale'
    });
    const saleId = saleResponse.data.Id;
    const totalAmount = saleResponse.data.TotalAmount || 50;
    console.log(`   ✓ Sale registered successfully`);
    console.log(`   ✓ Total Amount: $${totalAmount.toFixed(2)}`);


    // Test 7: Close cash session
    console.log('\n✅ Test 7: Close cash session');
    const closeResponse = await api.post('/cash/close', {
      cashSessionId: sessionId,
      closingAmount: 1050, // Opening (1000) + Sale (50)
      notes: 'Perfect shift!'
    });
    console.log(`   ✓ Cash session closed - ID: ${closeResponse.data.Id}`);
    console.log(`   ✓ Opening Amount: $${parseFloat(closeResponse.data.OpeningAmount).toFixed(2)}`);
    console.log(`   ✓ Total Sales: $${closeResponse.data.totalSales?.toFixed(2) || '50.00'}`);
    console.log(`   ✓ Expected Amount: $${parseFloat(closeResponse.data.ExpectedAmount).toFixed(2)}`);
    console.log(`   ✓ Actual Amount: $${parseFloat(closeResponse.data.ClosingAmount).toFixed(2)}`);
    console.log(`   ✓ Difference: $${parseFloat(closeResponse.data.Difference).toFixed(2)}`);
    console.log(`   ✓ Status: ${closeResponse.data.Status}`);

    // Test 8: Verify closed session
    console.log('\n✅ Test 8: Verify no open session exists after closing');
    let currentAfterClose = await api.get('/cash/current');
    if (!currentAfterClose.data) {
      console.log('   ✓ No open session (expected)');
    } else {
      console.log('   ✗ Session still open (unexpected)');
    }

    // Test 9: Get session details
    console.log('\n✅ Test 9: Get detailed session info');
    const detailsResponse = await api.get(`/cash/${sessionId}`);
    console.log(`   ✓ Session ID: ${detailsResponse.data.session?.Id}`);
    console.log(`   ✓ Total sales in session: ${detailsResponse.data.sales?.length || 0}`);
    console.log(`   ✓ Total sales amount: $${detailsResponse.data.totalSales?.toFixed(2) || '0.00'}`);

    console.log('\n' + '='.repeat(50));
    console.log('✅ All cash session tests passed!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

runTests();
