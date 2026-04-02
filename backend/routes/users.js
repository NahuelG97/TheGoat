const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { queryWithParams } = require('../db');

// Middleware: Verificar que solo ADMINISTRADOR puede acceder
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMINISTRADOR') {
    return res.status(403).json({ error: 'Solo administradores pueden acceder' });
  }
  next();
};

// GET /users - Listar usuarios
router.get('/', requireAdmin, async (req, res) => {
  try {
    const query = `
      SELECT Id, Username, Role, Active, CreatedAt, CreatedByUsername
      FROM Users
      ORDER BY CreatedAt DESC
    `;
    const results = await queryWithParams(query, {});
    
    res.json(results || []);
  } catch (error) {
    console.error('Get users:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /users/:id - Obtener usuario por ID
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT Id, Username, Role, Active, CreatedAt, CreatedByUsername
      FROM Users
      WHERE Id = @id
    `;
    const results = await queryWithParams(query, { id });
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(results[0]);
  } catch (error) {
    console.error('Get user:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /users - Crear usuario
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Validar inputs
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'username, password y role son requeridos' });
    }
    
    if (!['ADMINISTRADOR', 'ENCARGADO', 'COCINA'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }
    
    // Verificar si usuario ya existe
    const checkQuery = 'SELECT Id FROM Users WHERE Username = @username';
    const existing = await queryWithParams(checkQuery, { username });
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }
    
    // Generar hash
    const passwordHash = bcrypt.hashSync(password, 10);
    
    // Insertar usuario
    const insertQuery = `
      INSERT INTO Users (Username, PasswordHash, Role, Active, CreatedAt, CreatedByUserId, CreatedByUsername)
      VALUES (@username, @passwordHash, @role, 1, GETDATE(), @createdByUserId, @createdByUsername);
      SELECT CAST(SCOPE_IDENTITY() as int) as Id;
    `;
    
    const result = await queryWithParams(insertQuery, {
      username,
      passwordHash,
      role,
      createdByUserId: req.user.id,
      createdByUsername: req.user.username
    });
    
    const newUserId = result[result.length - 1].Id;
    
    // Retornar usuario creado
    const getQuery = `
      SELECT Id, Username, Role, Active, CreatedAt, CreatedByUserId, CreatedByUsername
      FROM Users
      WHERE Id = @id
    `;
    const newUser = await queryWithParams(getQuery, { id: newUserId });
    
    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Create user:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT /users/:id - Actualizar usuario
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role, active } = req.body;
    
    // Obtener usuario actual
    const getUserQuery = 'SELECT * FROM Users WHERE Id = @id';
    const userResults = await queryWithParams(getUserQuery, { id });
    
    if (userResults.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const currentUser = userResults[0];
    
    // Validar rol si se intenta cambiar
    if (role && !['ADMINISTRADOR', 'ENCARGADO', 'COCINA'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }
    
    // Verificar si el nuevo username ya existe
    if (username && username !== currentUser.Username) {
      const checkQuery = 'SELECT Id FROM Users WHERE Username = @username';
      const existing = await queryWithParams(checkQuery, { username });
      
      if (existing.length > 0) {
        return res.status(400).json({ error: 'El usuario ya existe' });
      }
    }
    
    // Construir query de actualización
    const updates = [];
    const params = { id };
    
    if (username) {
      updates.push('Username = @username');
      params.username = username;
    }
    
    if (password) {
      updates.push('PasswordHash = @passwordHash');
      params.passwordHash = bcrypt.hashSync(password, 10);
    }
    
    if (role) {
      updates.push('Role = @role');
      params.role = role;
    }
    
    if (active !== undefined) {
      updates.push('Active = @active');
      params.active = active ? 1 : 0;
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }
    
    const updateQuery = `
      UPDATE Users
      SET ${updates.join(', ')}
      WHERE Id = @id
    `;
    
    await queryWithParams(updateQuery, params);
    
    // Retornar usuario actualizado
    const getQuery = `
      SELECT Id, Username, Role, Active, CreatedAt
      FROM Users
      WHERE Id = @id
    `;
    const updatedUser = await queryWithParams(getQuery, { id });
    
    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Update user:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /users/:id - Eliminar usuario
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // No permitir que se elimine a sí mismo si es el único ADMINISTRADOR
    if (req.user.id == id) {
      // Contar administradores
      const countQuery = 'SELECT COUNT(*) as count FROM Users WHERE Role = @role';
      const countResults = await queryWithParams(countQuery, { role: 'ADMINISTRADOR' });
      
      if (countResults[0].count === 1) {
        return res.status(400).json({ error: 'No puedes eliminarte a ti mismo si eres el único administrador' });
      }
    }
    
    // Verificar que usuario existe
    const checkQuery = 'SELECT Id FROM Users WHERE Id = @id';
    const existing = await queryWithParams(checkQuery, { id });
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Eliminar usuario
    const deleteQuery = 'DELETE FROM Users WHERE Id = @id';
    await queryWithParams(deleteQuery, { id });
    
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Delete user:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
