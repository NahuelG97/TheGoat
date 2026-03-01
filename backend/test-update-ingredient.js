const http = require('http');

async function testUpdateIngredient() {
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
          console.log('✓ Token obtenido\n');
          
          // Obtener un ingrediente para actualizar
          setTimeout(() => getIngredient(token), 500);
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

function getIngredient(token) {
  console.log('2. Obteniendo ingredientes...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/ingredients',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      const ingredients = JSON.parse(body);
      if (ingredients.length > 0) {
        console.log(`✓ Se encontraron ${ingredients.length} ingredientes\n`);
        const ingredient = ingredients[0];
        console.log('Ingrediente a actualizar:', ingredient);
        updateIngredient(token, ingredient.Id);
      } else {
        console.log('No hay ingredientes para actualizar');
      }
    });
  });

  req.on('error', (error) => console.error('Request error:', error.message));
  req.end();
}

function updateIngredient(token, id) {
  console.log(`\n3. Actualizando ingrediente ${id}...\n`);
  
  const updateData = JSON.stringify({
    name: 'Ingrediente_Actualizado_' + Date.now(),
    unit: 'g',
    costPerUnit: 250.75
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/ingredients/${id}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
      'Content-Length': updateData.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:', body);
      
      if (res.statusCode === 200) {
        console.log('\n✓ Ingrediente actualizado exitosamente');
      } else {
        console.log('\n✗ Error al actualizar ingrediente');
      }
    });
  });

  req.on('error', (error) => console.error('Request error:', error.message));
  req.write(updateData);
  req.end();
}

testUpdateIngredient();
