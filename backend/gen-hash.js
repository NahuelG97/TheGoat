const bcrypt = require('bcryptjs');

// Generar hash para palabra "admin123"
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);

console.log('Hash generado:');
console.log(hash);
console.log('');
console.log('Comando SQL para actualizar:');
console.log(`UPDATE Users SET PasswordHash = '${hash}' WHERE Username = 'nahuel'`);
