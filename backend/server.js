require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializePool } = require('./db');
const { authMiddleware } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const ingredientsRoutes = require('./routes/ingredients');
const productsRoutes = require('./routes/products');
const recipesRoutes = require('./routes/recipes');
const stockRoutes = require('./routes/stock');
const salesRoutes = require('./routes/sales');
const cashRoutes = require('./routes/cash');
const paymentsRoutes = require('./routes/payments');
const auditRoutes = require('./routes/audit');
const arqueosRoutes = require('./routes/arqueos');
const usersRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/auth', authRoutes);
app.use('/ingredients', authMiddleware, ingredientsRoutes);
app.use('/products', authMiddleware, productsRoutes);
app.use('/recipes', authMiddleware, recipesRoutes);
app.use('/stock', authMiddleware, stockRoutes);
app.use('/sales', authMiddleware, salesRoutes);
app.use('/cash', authMiddleware, cashRoutes);
app.use('/payments', authMiddleware, paymentsRoutes);
app.use('/audit', authMiddleware, auditRoutes);
app.use('/arqueos', authMiddleware, arqueosRoutes);
app.use('/users', authMiddleware, usersRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initializePool();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
