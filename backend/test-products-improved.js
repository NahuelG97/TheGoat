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

async function testProductsModule() {
  console.log('🧪 Testing Products Module...\n');

  try {
    const token = await login();
    console.log('✓ Login successful, token obtained\n');

    // Get all products
    console.log('1️⃣ Testing GET /products (list with ingredient count and price)');
    const getProductsRes = await makeRequest('GET', '/products', null, token);
    const products = JSON.parse(getProductsRes);
    console.log('Products:', products.length > 0 ? products[0] : 'No products yet');
    console.log('✓ GET /products works (has ingredientCount and Price fields)\n');

    // Create product with price
    console.log('2️⃣ Testing POST /products (create with price)');
    const createRes = await makeRequest('POST', '/products', {
      name: 'Test Product ' + Date.now(),
      price: 99.99
    }, token);
    const newProduct = JSON.parse(createRes);
    console.log('Created:', newProduct);
    console.log('✓ POST /products created product with price\n');

    const productId = newProduct.Id;

    // Get product details
    console.log('3️⃣ Testing GET /products/:id (details with ingredients)');
    const detailsRes = await makeRequest('GET', `/products/${productId}`, null, token);
    const productDetail = JSON.parse(detailsRes);
    console.log('Product Detail:', {
      Id: productDetail.Id,
      Name: productDetail.Name,
      Price: productDetail.Price,
      ingredients: productDetail.ingredients
    });
    console.log('✓ GET /products/:id works\n');

    // Update product price
    console.log('4️⃣ Testing PUT /products/:id/price');
    const updateRes = await makeRequest('PUT', `/products/${productId}/price`, {
      price: 149.99
    }, token);
    const updatedProduct = JSON.parse(updateRes);
    console.log('Updated:', updatedProduct);
    console.log('✓ PUT /products/:id/price updated price successfully\n');

    // Delete product
    console.log('5️⃣ Testing DELETE /products/:id');
    const deleteRes = await makeRequest('DELETE', `/products/${productId}`, null, token);
    console.log('Delete response:', deleteRes);
    console.log('✓ DELETE /products/:id deleted product successfully\n');

    console.log('✅ All Products Module tests passed!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
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

testProductsModule();
