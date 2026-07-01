const { executeWithParams } = require('./db');

executeWithParams(
  'UPDATE Users SET Role = @role WHERE Username = @username',
  { role: 'ADMINISTRADOR', username: 'cajero' }
).then(() => {
  console.log('✓ Usuario "cajero" actualizado a ADMINISTRADOR');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
