const express = require('express');
const { queryWithParams, executeWithParams } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all ingredients for a product
router.get('/:productId/ingredients', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await queryWithParams(
      `SELECT pi.Id, pi.ProductId, pi.IngredientId, i.Name, i.Unit, i.CostPerUnit, pi.Quantity FROM ProductIngredients pi JOIN Ingredients i ON pi.IngredientId = i.Id WHERE pi.ProductId = @productId`,
      { productId: parseInt(productId) }
    );

    res.json(result);
  } catch (err) {
    console.error('Error fetching ingredients for product:', err);
    res.status(500).json({ error: 'Failed to fetch recipe ingredients' });
  }
});

// Add ingredient to product recipe
router.post('/:productId/ingredients', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const { ingredientId, quantity } = req.body;

    if (!ingredientId || quantity === undefined) {
      return res.status(400).json({ error: 'Ingredient ID and quantity are required' });
    }

    // Check if product exists
    const products = await queryWithParams(
      'SELECT Id FROM Products WHERE Id = @id',
      { id: parseInt(productId) }
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if ingredient exists
    const ingredients = await queryWithParams(
      'SELECT Id FROM Ingredients WHERE Id = @id',
      { id: parseInt(ingredientId) }
    );

    if (ingredients.length === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    // Check if combination already exists
    const existing = await queryWithParams(
      'SELECT Id FROM ProductIngredients WHERE ProductId = @productId AND IngredientId = @ingredientId',
      { productId: parseInt(productId), ingredientId: parseInt(ingredientId) }
    );

    if (existing.length > 0) {
      // Update quantity
      await executeWithParams(
        'UPDATE ProductIngredients SET Quantity = @quantity WHERE ProductId = @productId AND IngredientId = @ingredientId',
        { 
          productId: parseInt(productId), 
          ingredientId: parseInt(ingredientId), 
          quantity: parseFloat(quantity) 
        }
      );
    } else {
      // Insert new combination
      await executeWithParams(
        'INSERT INTO ProductIngredients (ProductId, IngredientId, Quantity) VALUES (@productId, @ingredientId, @quantity)',
        { 
          productId: parseInt(productId), 
          ingredientId: parseInt(ingredientId), 
          quantity: parseFloat(quantity) 
        }
      );
    }

    const result = await queryWithParams(
      `SELECT pi.Id, pi.IngredientId, i.Name, i.Unit, i.CostPerUnit, pi.Quantity FROM ProductIngredients pi JOIN Ingredients i ON pi.IngredientId = i.Id WHERE pi.ProductId = @productId AND pi.IngredientId = @ingredientId`,
      { productId: parseInt(productId), ingredientId: parseInt(ingredientId) }
    );

    res.json(result[0]);
  } catch (err) {
    console.error('Error adding ingredient to recipe:', err);
    res.status(500).json({ error: 'Failed to add ingredient to recipe' });
  }
});

// Remove ingredient from product recipe
router.delete('/:productId/ingredients/:ingredientId', authMiddleware, async (req, res) => {
  try {
    const { productId, ingredientId } = req.params;

    await executeWithParams(
      'DELETE FROM ProductIngredients WHERE ProductId = @productId AND IngredientId = @ingredientId',
      { productId: parseInt(productId), ingredientId: parseInt(ingredientId) }
    );

    res.json({ message: 'Ingredient removed from recipe' });
  } catch (err) {
    console.error('Error removing ingredient from recipe:', err);
    res.status(500).json({ error: 'Failed to remove ingredient from recipe' });
  }
});

// Calculate product cost
router.get('/:productId/cost', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await queryWithParams(
      `SELECT p.Id, p.Name, SUM(pi.Quantity * i.CostPerUnit) AS TotalCost, COUNT(pi.Id) AS IngredientCount FROM Products p LEFT JOIN ProductIngredients pi ON p.Id = pi.ProductId LEFT JOIN Ingredients i ON pi.IngredientId = i.Id WHERE p.Id = @productId GROUP BY p.Id, p.Name`,
      { productId: parseInt(productId) }
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = result[0];
    res.json({
      id: product.Id,
      name: product.Name,
      totalCost: product.TotalCost || 0,
      ingredientCount: product.IngredientCount || 0
    });
  } catch (err) {
    console.error('Error calculating product cost:', err);
    res.status(500).json({ error: 'Failed to calculate product cost' });
  }
});

module.exports = router;
