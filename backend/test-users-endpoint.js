const axios = require('axios');

const testUsersEndpoint = async () => {
  try {
    // Primero login para obtener token
    const loginRes = await axios.post('http://localhost:5000/auth/login', {
      username: 'nahuel',
      password: 'admin123'
    });

    const token = loginRes.data.token;
    console.log('Token obtenido:', token.substring(0, 30) + '...');

    // Ahora llamar GET /users
    const usersRes = await axios.get('http://localhost:5000/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('\n=== RESPUESTA DE GET /users ===');
    console.log(JSON.stringify(usersRes.data, null, 2));
    
    if (usersRes.data && usersRes.data.length > 0) {
      console.log('\n=== CAMPOS DEL PRIMER USUARIO ===');
      console.log('Keys:', Object.keys(usersRes.data[0]));
      console.log('\n=== VALORES DEL PRIMER USUARIO ===');
      Object.entries(usersRes.data[0]).forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testUsersEndpoint();
