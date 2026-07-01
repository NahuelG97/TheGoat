const { queryWithParams } = require('./db');

async function checkUsers() {
  try {
    const users = await queryWithParams('SELECT Id, Username, Role, Active FROM Users', {});
    console.log('✓ Usuarios en la base de datos:');
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkUsers();
