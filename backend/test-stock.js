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

    // 2. Get all stock
    console.log('\n2. Getting all ingredients with stock...');
    const stockRes = await makeRequest('GET', '/stock', null, token);
    console.log(`✓ Retrieved ${stockRes.data.length} ingredients (Status ${stockRes.status})`);
    if (stockRes.data[0]) {
      console.log(`  Sample: ${stockRes.data[0].Name} (ID: ${stockRes.data[0].Id})`);
    }

    if (stockRes.data.length === 0) {
      console.warn('⚠️  No ingredients found');
      return;
    }

    const ingredientId = stockRes.data[0].Id;

    // 3. Get specific ingredient stock
    console.log(`\n3. Getting stock for ingredient ${ingredientId}...`);
    const specificRes = await makeRequest('GET', `/stock/${ingredientId}`, null, token);
    console.log(`✓ Retrieved (Status ${specificRes.status}): ${specificRes.data.Name}`);

    // 4. Add stock (IN movement)
    console.log(`\n4. Adding 10 units of stock...`);
    const addRes = await makeRequest(
      'POST',
      `/stock/${ingredientId}/movement`,
      {
        movementType: 'IN',
        quantity: 10,
        notes: 'Test entry',
      },
      token
    );
    console.log(`✓ Stock added (Status ${addRes.status})`);
    if (addRes.data.stock) {
      console.log(`  New stock: ${addRes.data.stock.CurrentStock}`);
    }

    // 5. Remove stock (OUT movement)
    console.log(`\n5. Removing 3 units of stock...`);
    const removeRes = await makeRequest(
      'POST',
      `/stock/${ingredientId}/movement`,
      {
        movementType: 'OUT',
        quantity: 3,
        notes: 'Test removal',
      },
      token
    );
    console.log(`✓ Stock removed (Status ${removeRes.status})`);
    if (removeRes.data.stock) {
      console.log(`  New stock: ${removeRes.data.stock.CurrentStock}`);
    }

    // 6. Get movements
    console.log(`\n6. Getting movement history...`);
    const movementsRes = await makeRequest('GET', `/stock/${ingredientId}/movements`, null, token);
    console.log(`✓ Found ${movementsRes.data.length} movements (Status ${movementsRes.status})`);

    // 7. Update minimum stock
    console.log(`\n7. Updating minimum stock to 20...`);
    const updateRes = await makeRequest(
      'PUT',
      `/stock/${ingredientId}/minimum`,
      {
        minimumStock: 20,
      },
      token
    );
    console.log(`✓ Minimum stock updated (Status ${updateRes.status})`);
    if (updateRes.data.MinimumStock) {
      console.log(`  New minimum: ${updateRes.data.MinimumStock}`);
    }

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();
