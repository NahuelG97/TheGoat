const express = require('express');
const router = express.Router();
const { queryWithParams, executeWithParams } = require('../db');
const authMiddleware = require('../middleware/auth');

// Get all sales
router.get('/', authMiddleware, async (req, res) => {
  try {
    const query = `SELECT s.Id, s.SaleNumber, s.TotalAmount, s.Status, s.CreatedAt, u.Username FROM Sales s JOIN Users u ON s.UserId = u.Id ORDER BY s.CreatedAt DESC`;
    const results = await queryWithParams(query, {});
    res.json(results);
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get sale details
router.get('/:saleId', authMiddleware, async (req, res) => {
  try {
    const { saleId } = req.params;
    const saleQuery = `SELECT s.Id, s.SaleNumber, s.TotalAmount, s.Status, s.CreatedAt, u.Username FROM Sales s JOIN Users u ON s.UserId = u.Id WHERE s.Id = @saleId`;
    const saleResults = await queryWithParams(saleQuery, { saleId: parseInt(saleId) });
    
    if (saleResults.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const detailsQuery = `SELECT sd.Id, sd.ProductId, p.Name as ProductName, sd.Quantity, sd.UnitPrice, sd.Subtotal, sd.Notes FROM SalesDetails sd JOIN Products p ON sd.ProductId = p.Id WHERE sd.SaleId = @saleId`;
    const details = await queryWithParams(detailsQuery, { saleId: parseInt(saleId) });

    res.json({
      ...saleResults[0],
      items: details
    });
  } catch (error) {
    console.error('Get sale details error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create sale with automatic stock deduction
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, notes } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Sale must have at least one item' });
    }

    // Validate each item and get product info
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ error: 'Invalid item: missing productId or quantity' });
      }

      // Get product to verify and validate
      const productQuery = `SELECT p.Id, p.Name FROM Products p WHERE p.Id = @productId`;
      const productResults = await queryWithParams(productQuery, { productId: parseInt(item.productId) });
      
      if (productResults.length === 0) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      // Get product price (use selling price, not ingredient cost)
      const priceQuery = `SELECT COALESCE(Price, 0) as ProductPrice FROM Products WHERE Id = @productId`;
      const priceResults = await queryWithParams(priceQuery, { productId: parseInt(item.productId) });
      const unitPrice = parseFloat(priceResults[0]?.ProductPrice || 0);
      const subtotal = unitPrice * item.quantity;
      
      totalAmount += subtotal;
      validatedItems.push({
        productId: parseInt(item.productId),
        productName: productResults[0].Name,
        quantity: parseInt(item.quantity),
        unitPrice: unitPrice,
        subtotal: subtotal,
        notes: item.notes || ''
      });
    }

    if (totalAmount <= 0) {
      return res.status(400).json({ error: 'Invalid total amount' });
    }

    // Generate sale number
    const saleNumberQuery = `SELECT 'SALE-' + FORMAT(MAX(CAST(REPLACE(SaleNumber, 'SALE-', '') AS INT)) + 1, '0000000') as NextNumber FROM Sales WHERE SaleNumber LIKE 'SALE-%'`;
    const saleNumberResults = await queryWithParams(saleNumberQuery, {});
    const saleNumber = saleNumberResults[0]?.NextNumber || 'SALE-0000001';

    // Create sale
    const createSaleQuery = `INSERT INTO Sales (SaleNumber, UserId, TotalAmount, Notes) VALUES (@saleNumber, @userId, @totalAmount, @notes)`;
    await executeWithParams(createSaleQuery, {
      saleNumber: saleNumber,
      userId: userId,
      totalAmount: totalAmount,
      notes: notes || ''
    });

    // Get the sale ID we just created
    const getSaleIdQuery = `SELECT Id FROM Sales WHERE SaleNumber = @saleNumber`;
    const saleIdResults = await queryWithParams(getSaleIdQuery, { saleNumber: saleNumber });
    const saleId = parseInt(saleIdResults[0]?.Id, 10) || 0;

    if (saleId === 0) {
      console.error('Failed to get sale ID for', saleNumber);
      console.error('saleIdResults:', saleIdResults);
      return res.status(500).json({ error: 'Failed to get sale ID' });
    }

    // Insert sale details and process stock deduction
    for (const item of validatedItems) {
      // Insert sale detail with notes
      const detailQuery = `INSERT INTO SalesDetails (SaleId, ProductId, Quantity, UnitPrice, Subtotal, Notes) VALUES (@saleId, @productId, @quantity, @unitPrice, @subtotal, @notes)`;
      await executeWithParams(detailQuery, {
        saleId: saleId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        notes: item.notes || ''
      });

      // Get recipe for product
      const recipeQuery = `SELECT pi.IngredientId, i.Name, pi.Quantity FROM ProductIngredients pi JOIN Ingredients i ON pi.IngredientId = i.Id WHERE pi.ProductId = @productId`;
      const recipeResults = await queryWithParams(recipeQuery, { productId: item.productId });

      // Deduct stock for each ingredient
      for (const ingredient of recipeResults) {
        const quantityToDeduct = parseFloat(ingredient.Quantity) * item.quantity;

        // Get current stock
        const currentStockQuery = `SELECT COALESCE(CurrentStock, 0) as CurrentStock FROM IngredientStock WHERE IngredientId = @ingredientId`;
        const stockResults = await queryWithParams(currentStockQuery, { ingredientId: parseInt(ingredient.IngredientId) });
        const currentStock = parseFloat(stockResults[0]?.CurrentStock || 0);

        // Update stock
        const updateStockQuery = `UPDATE IngredientStock SET CurrentStock = CurrentStock - @quantity, LastUpdated = GETDATE() WHERE IngredientId = @ingredientId`;
        await executeWithParams(updateStockQuery, {
          quantity: quantityToDeduct,
          ingredientId: parseInt(ingredient.IngredientId)
        });

        // Record stock adjustment
        const adjustmentQuery = `INSERT INTO StockAdjustments (SaleId, IngredientId, QuantityUsed) VALUES (@saleId, @ingredientId, @quantity)`;
        await executeWithParams(adjustmentQuery, {
          saleId: saleId,
          ingredientId: parseInt(ingredient.IngredientId),
          quantity: quantityToDeduct
        });

        // Create stock movement entry
        const newStock = currentStock - quantityToDeduct;
        const movementQuery = `INSERT INTO StockMovements (IngredientId, MovementType, Quantity, PreviousStock, NewStock, UserId, Notes) VALUES (@ingredientId, 'OUT', @quantity, @previousStock, @newStock, @userId, @notes)`;
        await executeWithParams(movementQuery, {
          ingredientId: parseInt(ingredient.IngredientId),
          quantity: quantityToDeduct,
          previousStock: currentStock,
          newStock: newStock,
          userId: userId,
          notes: `Sale ${saleNumber}`
        });
      }
    }

    // Get sale details to return
    const finalSaleQuery = `SELECT s.Id, s.SaleNumber, s.TotalAmount, s.Status, s.CreatedAt FROM Sales s WHERE s.Id = @saleId`;
    const finalSaleResults = await queryWithParams(finalSaleQuery, { saleId: saleId });

    res.status(201).json({
      success: true,
      message: 'Sale registered successfully',
      sale: finalSaleResults[0] || { Id: saleId, SaleNumber: saleNumber, TotalAmount: totalAmount }
    });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get sales summary by date range
router.get('/summary/range', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = `SELECT CAST(CreatedAt AS DATE) as SaleDate, COUNT(*) as TotalSales, SUM(TotalAmount) as TotalRevenue FROM Sales WHERE Status = 'COMPLETED'`;
    const params = {};

    if (startDate) {
      query += ` AND CreatedAt >= @startDate`;
      params.startDate = startDate;
    }
    if (endDate) {
      query += ` AND CreatedAt <= @endDate`;
      params.endDate = endDate;
    }

    query += ` GROUP BY CAST(CreatedAt AS DATE) ORDER BY SaleDate DESC`;
    
    const results = await queryWithParams(query, params);
    res.json(results);
  } catch (error) {
    console.error('Get sales summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
