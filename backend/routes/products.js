const express = require('express');
const { query, queryWithParams, executeWithParams } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Ensure Products table has Active column for soft delete / hide behavior
(async function ensureProductsActiveColumn() {
  try {
    await executeWithParams(
      `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'Active')\n       ALTER TABLE Products ADD Active BIT NOT NULL DEFAULT 1`,
      {}
    );
  } catch (err) {
    console.error('Could not ensure Products.Active column exists:', err);
  }
})();

// Get all products
router.get('/', authMiddleware, async (req, res) => {
  try {
    const products = await query('SELECT Id, Name, Price, Active FROM Products WHERE Active = 1 ORDER BY Name');
    // Get ingredient count for each product
    const productsWithCount = await Promise.all(
      products.map(async (product) => {
        const count = await queryWithParams(
          'SELECT COUNT(*) as count FROM ProductIngredients WHERE ProductId = @id',
          { id: product.Id }
        );
        return { ...product, ingredientCount: count[0].count };
      })
    );
    res.json(productsWithCount);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create product
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    const productPrice = price || 0;

    await executeWithParams(
      `INSERT INTO Products (Name, Price, Active) VALUES (@name, @price, 1)`,
      { name, price: productPrice }
    );

    const newProduct = await queryWithParams(
      'SELECT TOP 1 Id, Name, Price FROM Products WHERE Name = @name ORDER BY Id DESC',
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
      'SELECT Id, Name, Price, Active FROM Products WHERE Id = @id AND Active = 1',
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

// Update product price
router.put('/:id/price', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    if (price === undefined || price === null) {
      return res.status(400).json({ error: 'Price is required' });
    }

    await executeWithParams(
      `UPDATE Products SET Price = @price WHERE Id = @id AND Active = 1`,
      { id: parseInt(id), price: parseFloat(price) }
    );

    const updated = await queryWithParams(
      'SELECT Id, Name, Price FROM Products WHERE Id = @id AND Active = 1',
      { id: parseInt(id) }
    );

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(updated[0]);
  } catch (err) {
    console.error('Error updating product price:', err);
    res.status(500).json({ error: 'Failed to update product price' });
  }
});

// Delete product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const products = await queryWithParams(
      'SELECT Id FROM Products WHERE Id = @id',
      { id: parseInt(id) }
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const salesReference = await queryWithParams(
      'SELECT COUNT(*) as count FROM SalesDetails WHERE ProductId = @id',
      { id: parseInt(id) }
    );

    if (salesReference[0]?.count > 0) {
      // Keep sales history intact by hiding the product instead of deleting it
      await executeWithParams(
        'UPDATE Products SET Active = 0 WHERE Id = @id',
        { id: parseInt(id) }
      );

      return res.json({
        message: 'Producto ocultado porque tiene ventas asociadas.'
      });
    }

    // Remove related recipe ingredients before deleting the product
    await executeWithParams(
      'DELETE FROM ProductIngredients WHERE ProductId = @id',
      { id: parseInt(id) }
    );

    await executeWithParams(
      'DELETE FROM Products WHERE Id = @id',
      { id: parseInt(id) }
    );

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
