const bcrypt = require('bcryptjs');

// Generate hash for password "admin123"
const passwordHash = bcrypt.hashSync('admin123', 10);

console.log('Hash para contraseña "admin123":');
console.log(passwordHash);
