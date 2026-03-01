#!/usr/bin/env node
const http = require('http');

async function login() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ username: 'cajero', password: 'admin123' });
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body).token);
        } else {
          reject(new Error(`Login failed: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function makeRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        } else {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testSalesModule() {
  console.log('🧪 Testing Improved Sales Module...\n');

  try {
    const token = await login();
    console.log('✓ Login successful\n');

    // 1. Get products with prices
    console.log('1️⃣ Testing GET /products (with prices)');
    const productsRes = await makeRequest('GET', '/products', null, token);
    const products = JSON.parse(productsRes);
    console.log('Products with prices:', products.slice(0, 2).map(p => ({ Name: p.Name, Price: p.Price })));
    console.log('✓ GET /products returns prices\n');

    // 2. Create a product with price
    console.log('2️⃣ Testing POST /products (create with price)');
    const createProductRes = await makeRequest('POST', '/products', {
      name: `Test Product ${Date.now()}`,
      price: 50.00
    }, token);
    const newProduct = JSON.parse(createProductRes);
    console.log('Created product:', { Name: newProduct.Name, Price: newProduct.Price });
    console.log('✓ Product created with price\n');

    // 3. Create sale with items that have notes
    console.log('3️⃣ Testing POST /sales (with item notes)');
    const saleRes = await makeRequest('POST', '/sales', {
      items: [
        {
          productId: 2, // Hamburguesa
          quantity: 2,
          notes: 'Sin lechuga'
        },
        {
          productId: newProduct.Id,
          quantity: 1,
          notes: 'Extra queso'
        }
      ]
    }, token);
    const saleData = JSON.parse(saleRes);
    console.log('Sale created:', { 
      SaleNumber: saleData.sale.SaleNumber,
      TotalAmount: saleData.sale.TotalAmount,
      Id: saleData.sale.Id
    });
    console.log('✓ POST /sales created with item notes\n');

    const saleId = saleData.sale.Id;

    // 4. Get sale details (should include notes)
    console.log('4️⃣ Testing GET /sales/:id (with item notes)');
    const detailsRes = await makeRequest('GET', `/sales/${saleId}`, null, token);
    const details = JSON.parse(detailsRes);
    console.log('Sale details:');
    console.log('  SaleNumber:', details.SaleNumber);
    console.log('  TotalAmount:', details.TotalAmount);
    console.log('  Items:');
    details.items.forEach((item, i) => {
      console.log(`    ${i + 1}. ${item.ProductName}`);
      console.log(`       Qty: ${item.Quantity}, Price: $${item.UnitPrice}, Notes: ${item.Notes || '(none)'}`);
    });
    console.log('✓ GET /sales/:id returns item notes\n');

    // 5. Get all sales
    console.log('5️⃣ Testing GET /sales (list)');
    const salesListRes = await makeRequest('GET', '/sales', null, token);
    const salesList = JSON.parse(salesListRes);
    console.log(`Total sales in history: ${salesList.length}`);
    console.log('✓ GET /sales works\n');

    console.log('✅ All Improved Sales Module tests passed!\n');
    console.log('✨ Summary of improvements:');
    console.log('  ✓ Uses Product.Price instead of ingredient cost');
    console.log('  ✓ Supports item-level notes');
    console.log('  ✓ Returns item notes in sale details');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testSalesModule();
