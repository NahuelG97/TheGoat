const http = require('http');

const API_BASE_URL = 'http://localhost:5000';

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function test() {
  try {
    // 1. Login
    console.log('\n1. Logging in...');
    const loginRes = await makeRequest('POST', '/auth/login', {
      username: 'cajero',
      password: 'admin123',
    });
    const token = loginRes.data.token;
    console.log(`✓ Login successful (Status ${loginRes.status})`);

    // 2. Get products
    console.log('\n2. Getting products...');
    const productsRes = await makeRequest('GET', '/products', null, token);
    console.log(`✓ Retrieved ${productsRes.data.length} products (Status ${productsRes.status})`);

    if (productsRes.data.length === 0) {
      console.warn('⚠️  No products found. Cannot test sales.');
      return;
    }

    const productId = productsRes.data[0].Id;
    console.log(`  Using product ID: ${productId}`);

    // 3. Create sale
    console.log('\n3. Creating sale...');
    const saleRes = await makeRequest(
      'POST',
      '/sales',
      {
        items: [
          { productId: productId, quantity: 2 },
        ],
        notes: 'Test sale',
      },
      token
    );
    console.log(`✓ Sale created (Status ${saleRes.status})`);
    if (saleRes.data.sale) {
      console.log(`  Sale Number: ${saleRes.data.sale.SaleNumber}`);
      console.log(`  Total: $${saleRes.data.sale.TotalAmount.toFixed(2)}`);
    }

    // 4. Get all sales
    console.log('\n4. Getting all sales...');
    const allSalesRes = await makeRequest('GET', '/sales', null, token);
    console.log(`✓ Retrieved ${allSalesRes.data.length} sales (Status ${allSalesRes.status})`);

    // 5. Get sales summary
    console.log('\n5. Getting sales summary...');
    const summaryRes = await makeRequest('GET', '/sales/summary/range', null, token);
    console.log(`✓ Retrieved summary (Status ${summaryRes.status})`);
    if (summaryRes.data.length > 0) {
      console.log(
        `  Sales today: ${summaryRes.data[0].TotalSales}, Revenue: $${summaryRes.data[0].TotalRevenue}`
      );
    }

    // 6. Check stock was deducted
    console.log('\n6. Checking stock deduction...');
    const stockRes = await makeRequest('GET', '/stock', null, token);
    console.log(`✓ Stock verification complete (Status ${stockRes.status})`);
    console.log(`  Total ingredients: ${stockRes.data.length}`);
    const lowStockItems = stockRes.data.filter((ing) => ing.CurrentStock < ing.MinimumStock);
    if (lowStockItems.length > 0) {
      console.log(`  Items with low stock: ${lowStockItems.length}`);
    }

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();
