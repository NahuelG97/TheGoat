const express = require('express');
const router = express.Router();
const { queryWithParams, executeWithParams } = require('../db');
const authMiddleware = require('../middleware/auth');

// Get all ingredients with current stock
router.get('/', authMiddleware, async (req, res) => {
  try {
    const query = `SELECT i.Id, i.Name, i.Unit, i.CostPerUnit, COALESCE(s.CurrentStock, 0) as CurrentStock, COALESCE(s.MinimumStock, 10) as MinimumStock FROM Ingredients i LEFT JOIN IngredientStock s ON i.Id = s.IngredientId ORDER BY i.Name`;
    const results = await queryWithParams(query, {});
    res.json(results);
  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get stock for specific ingredient
router.get('/:ingredientId', authMiddleware, async (req, res) => {
  try {
    const { ingredientId } = req.params;
    const query = `SELECT i.Id, i.Name, i.Unit, COALESCE(s.CurrentStock, 0) as CurrentStock, COALESCE(s.MinimumStock, 10) as MinimumStock, s.LastUpdated FROM Ingredients i LEFT JOIN IngredientStock s ON i.Id = s.IngredientId WHERE i.Id = @ingredientId`;
    const results = await queryWithParams(query, { ingredientId: parseInt(ingredientId) });
    if (results.length === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    res.json(results[0]);
  } catch (error) {
    console.error('Get ingredient stock error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get stock movements for ingredient
router.get('/:ingredientId/movements', authMiddleware, async (req, res) => {
  try {
    const { ingredientId } = req.params;
    const query = `SELECT Id, IngredientId, MovementType, Quantity, PreviousStock, NewStock, UserId, Notes, CreatedAt FROM StockMovements WHERE IngredientId = @ingredientId ORDER BY CreatedAt DESC`;
    const results = await queryWithParams(query, { ingredientId: parseInt(ingredientId) });
    res.json(results);
  } catch (error) {
    console.error('Get movements error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add/Remove stock (create movement)
router.post('/:ingredientId/movement', authMiddleware, async (req, res) => {
  try {
    const { ingredientId } = req.params;
    const { movementType, quantity, notes } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!['IN', 'OUT'].includes(movementType)) {
      return res.status(400).json({ error: 'Invalid movement type. Use IN or OUT' });
    }
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be positive' });
    }

    // Get current stock
    const currentStockQuery = `SELECT COALESCE(CurrentStock, 0) as CurrentStock FROM IngredientStock WHERE IngredientId = @ingredientId`;
    const stockResults = await queryWithParams(currentStockQuery, { ingredientId: parseInt(ingredientId) });
    const previousStock = stockResults.length > 0 ? parseFloat(stockResults[0].CurrentStock) : 0;

    // Calculate new stock
    let newStock = previousStock;
    if (movementType === 'IN') {
      newStock = previousStock + parseFloat(quantity);
    } else {
      newStock = previousStock - parseFloat(quantity);
      if (newStock < 0) {
        return res.status(400).json({ error: 'Insufficient stock for this operation' });
      }
    }

    // Create transaction: Insert movement and update stock
    const insertMovementQuery = `INSERT INTO StockMovements (IngredientId, MovementType, Quantity, PreviousStock, NewStock, UserId, Notes) VALUES (@ingredientId, @movementType, @quantity, @previousStock, @newStock, @userId, @notes); SELECT SCOPE_IDENTITY() as Id`;
    
    const updateStockQuery = `UPDATE IngredientStock SET CurrentStock = @newStock, LastUpdated = GETDATE() WHERE IngredientId = @ingredientId; SELECT IngredientId, CurrentStock, MinimumStock FROM IngredientStock WHERE IngredientId = @ingredientId`;

    await executeWithParams(insertMovementQuery, {
      ingredientId: parseInt(ingredientId),
      movementType: movementType,
      quantity: parseFloat(quantity),
      previousStock: previousStock,
      newStock: newStock,
      userId: userId,
      notes: notes || ''
    });

    const updatedStock = await queryWithParams(updateStockQuery, { 
      newStock: newStock,
      ingredientId: parseInt(ingredientId)
    });

    res.status(201).json({
      success: true,
      message: `Stock ${movementType === 'IN' ? 'added' : 'removed'}`,
      stock: updatedStock[0] || { IngredientId: ingredientId, CurrentStock: newStock }
    });
  } catch (error) {
    console.error('Add stock movement error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update minimum stock for ingredient
router.put('/:ingredientId/minimum', authMiddleware, async (req, res) => {
  try {
    const { ingredientId } = req.params;
    const { minimumStock } = req.body;

    if (!minimumStock || minimumStock < 0) {
      return res.status(400).json({ error: 'Minimum stock must be positive' });
    }

    const query = `UPDATE IngredientStock SET MinimumStock = @minimumStock WHERE IngredientId = @ingredientId; SELECT IngredientId, CurrentStock, MinimumStock FROM IngredientStock WHERE IngredientId = @ingredientId`;
    const results = await queryWithParams(query, { 
      minimumStock: parseFloat(minimumStock),
      ingredientId: parseInt(ingredientId)
    });

    if (results.length === 0) {
      return res.status(404).json({ error: 'Stock record not found' });
    }

    res.json(results[0]);
  } catch (error) {
    console.error('Update minimum stock error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
