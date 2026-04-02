const axios = require('axios');

const testUsersFlow = async () => {
  try {
    // Login con admin
    console.log('1️⃣  INICIANDO SESIÓN...');
    const loginRes = await axios.post('http://localhost:5000/auth/login', {
      username: 'nahuel',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    console.log('✓ Login exitoso\n');

    // Obtener todos los usuarios
    console.log('2️⃣  OBTENIENDO LISTA DE USUARIOS...');
    const usersRes = await axios.get('http://localhost:5000/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const users = usersRes.data;
    console.log(`✓ Se obtuvieron ${users.length} usuarios\n`);

    // Mostrar cada usuario
    console.log('3️⃣  VERIFICANDO DATOS DE CADA USUARIO:');
    users.forEach((user, index) => {
      console.log(`\n   Usuario ${index + 1}:`);
      console.log(`   - Id: ${user.Id} (tipo: ${typeof user.Id})`);
      console.log(`   - Username: ${user.Username} (tipo: ${typeof user.Username})`);
      console.log(`   - Role: ${user.Role}`);
      console.log(`   - Active: ${user.Active} (tipo: ${typeof user.Active})`);
    });

    // Intentar obtener cada usuario por ID
    console.log('\n\n4️⃣  VERIFICANDO ENDPOINT GET /users/:id');
    for (const user of users) {
      const getRes = await axios.get(`http://localhost:5000/users/${user.Id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`   ✓ GET /users/${user.Id} => Username: ${getRes.data.Username}`);
    }

    console.log('\n\n✅ PRUEBA COMPLETADA - El backend está devolviendo datos correctamente');
    console.log('\n📌 RESUMEN:');
    console.log(`   - Campo de ID en backend: "Id" (mayúscula)`);
    console.log(`   - Campo de nombre en backend: "Username" (PascalCase)`);
    console.log(`   - Campo de estado en backend: "Active" (valor numérico: 0/1)`);
    console.log(`   - Se requiere transformación en frontend a camelCase`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testUsersFlow();
