const http = require('http');

async function testIngredient() {
  try {
    // Primero obtenemos el token
    console.log('1. Obteniendo token...');
    const loginData = JSON.stringify({
      username: 'cajero',
      password: 'admin123'
    });

    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };

    let token = '';
    
    const loginReq = http.request(loginOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const response = JSON.parse(body);
        if (response.token) {
          token = response.token;
          console.log('✓ Token obtenido:', token.substring(0, 20) + '...');
          
          // Ahora crear ingrediente
          setTimeout(() => createIngredient(token), 500);
        }
      });
    });

    loginReq.on('error', (error) => console.error('Login error:', error.message));
    loginReq.write(loginData);
    loginReq.end();

  } catch (error) {
    console.log('Error:', error.message);
  }
}

function createIngredient(token) {
  console.log('\n2. Creando ingrediente...');
  
  const ingredientData = JSON.stringify({
    name: 'TestIngredient_' + Date.now(),
    unit: 'kg',
    costPerUnit: 100.50
  });

  const ingredientOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/ingredients',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
      'Content-Length': ingredientData.length
    }
  };

  const req = http.request(ingredientOptions, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:', body);
      
      if (res.statusCode === 201) {
        console.log('\n✓ Ingrediente creado exitosamente');
      } else {
        console.log('\n✗ Error al crear ingrediente');
      }
    });
  });

  req.on('error', (error) => console.error('Request error:', error.message));
  req.write(ingredientData);
  req.end();
}

testIngredient();
