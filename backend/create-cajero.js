const bcrypt = require('bcryptjs');
const { executeWithParams } = require('./db');

async function createCajeroUser() {
  try {
    const username = 'cajero';
    const password = 'admin123';
    const role = 'ENCARGADO';
    const active = 1;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Creating user...');
    console.log(`Username: ${username}`);
    console.log(`Role: ${role}`);
    console.log(`Hashed Password: ${hashedPassword.substring(0, 20)}...`);
    
    // First check if user exists
    const { queryWithParams } = require('./db');
    const existing = await queryWithParams('SELECT * FROM Users WHERE Username = @username', { username });
    
    if (existing.length > 0) {
      console.log('✗ Usuario "cajero" ya existe');
      // Update instead
      await executeWithParams(
        'UPDATE Users SET PasswordHash = @hash, Role = @role, Active = @active WHERE Username = @username',
        { hash: hashedPassword, role, active, username }
      );
      console.log('✓ Usuario actualizado');
    } else {
      // Create new
      await executeWithParams(
        'INSERT INTO Users (Username, PasswordHash, Role, Active) VALUES (@username, @hash, @role, @active)',
        { username, hash: hashedPassword, role, active }
      );
      console.log('✓ Usuario creado');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createCajeroUser();
