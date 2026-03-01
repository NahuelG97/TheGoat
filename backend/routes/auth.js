const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { queryWithParams, executeWithParams } = require('../db');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    console.log('Login attempt:', { username });

    const users = await queryWithParams(
      'SELECT Id, Username, PasswordHash, Role, Active FROM Users WHERE Username = @username',
      { username }
    );

    console.log('Users found:', users);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    console.log('User data:', { Id: user.Id, Username: user.Username, Role: user.Role, Active: user.Active });
    console.log('Active value details:', { value: user.Active, type: typeof user.Active, toNumber: parseInt(user.Active), bool: Boolean(user.Active) });

    if (!user.Active || parseInt(user.Active) === 0) {
      return res.status(401).json({ error: 'User is not active' });
    }

    const passwordMatch = await bcrypt.compare(password, user.PasswordHash);
    console.log('Password match:', passwordMatch, 'Hash:', user.PasswordHash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.Id, username: user.Username, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.Id, username: user.Username, role: user.Role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
