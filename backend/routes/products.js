const express = require('express');
const { query, queryWithParams, executeWithParams } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all products
router.get('/', authMiddleware, async (req, res) => {
  try {
    const products = await query('SELECT Id, Name FROM Products ORDER BY Name');
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create product
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    await executeWithParams(
      `INSERT INTO Products (Name) VALUES (@name)`,
      { name }
    );

    const newProduct = await queryWithParams(
      'SELECT TOP 1 Id, Name FROM Products WHERE Name = @name ORDER BY Id DESC',
      { name }
    );

    res.status(201).json(newProduct[0]);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Get product with ingredients
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const products = await queryWithParams(
      'SELECT Id, Name FROM Products WHERE Id = @id',
      { id: parseInt(id) }
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];

    const ingredients = await queryWithParams(
      `SELECT pi.Id, pi.IngredientId, i.Name, i.Unit, i.CostPerUnit, pi.Quantity FROM ProductIngredients pi JOIN Ingredients i ON pi.IngredientId = i.Id WHERE pi.ProductId = @productId ORDER BY i.Name`,
      { productId: parseInt(id) }
    );

    res.json({ ...product, ingredients });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;
