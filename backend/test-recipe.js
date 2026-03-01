const http = require('http');

async function testRecipe() {
  try {
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
          setTimeout(() => addIngredientToRecipe(token), 500);
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

function addIngredientToRecipe(token) {
  console.log('2. Agregando ingrediente a receta...');
  console.log('   Producto ID: 1, Ingrediente ID: 1, Cantidad: 2.5\n');
  
  const data = JSON.stringify({
    ingredientId: 1,
    quantity: 2.5
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/recipes/1/ingredients`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:', body);
      
      if (res.statusCode === 200) {
        console.log('\n✓ Ingrediente agregado a receta exitosamente\n');
        setTimeout(() => deleteIngredientFromRecipe(token), 500);
      } else {
        console.log('\n✗ Error al agregar ingrediente a receta');
      }
    });
  });

  req.on('error', (error) => console.error('Request error:', error.message));
  req.write(data);
  req.end();
}

function deleteIngredientFromRecipe(token) {
  console.log('3. Eliminando ingrediente de receta...');
  console.log('   Producto ID: 1, Ingrediente ID: 1\n');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/recipes/1/ingredients/1`,
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:', body);
      
      if (res.statusCode === 200) {
        console.log('\n✓ Ingrediente eliminado de receta exitosamente');
      } else {
        console.log('\n✗ Error al eliminar ingrediente de receta');
      }
    });
  });

  req.on('error', (error) => console.error('Request error:', error.message));
  req.end();
}

testRecipe();
