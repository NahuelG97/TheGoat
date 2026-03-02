require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializePool } = require('./db');

// Import routes
const authRoutes = require('./routes/auth');
const ingredientsRoutes = require('./routes/ingredients');
const productsRoutes = require('./routes/products');
const recipesRoutes = require('./routes/recipes');
const stockRoutes = require('./routes/stock');
const salesRoutes = require('./routes/sales');
const cashRoutes = require('./routes/cash');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/auth', authRoutes);
app.use('/ingredients', ingredientsRoutes);
app.use('/products', productsRoutes);
app.use('/recipes', recipesRoutes);
app.use('/stock', stockRoutes);
app.use('/sales', salesRoutes);
app.use('/cash', cashRoutes);

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
