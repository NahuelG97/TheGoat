const express = require('express');
const router = express.Router();
const { queryWithParams, executeWithParams } = require('../db');
const authMiddleware = require('../middleware/auth');

// Get all payment methods
router.get('/methods', authMiddleware, async (req, res) => {
  try {
    const query = `SELECT Id, Code, Name, Description FROM PaymentMethods WHERE Active = 1 ORDER BY Name`;
    const results = await queryWithParams(query, {});
    res.json(results);
  } catch (error) {
    console.error('Get payment methods:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get payments for a specific sale
router.get('/sale/:saleId', authMiddleware, async (req, res) => {
  try {
    const { saleId } = req.params;
    const query = `SELECT sp.Id, sp.Amount, pm.Id as PaymentMethodId, pm.Code, pm.Name FROM SalesPayments sp JOIN PaymentMethods pm ON sp.PaymentMethodId = pm.Id WHERE sp.SaleId = @saleId ORDER BY sp.CreatedAt`;
    const results = await queryWithParams(query, { saleId: parseInt(saleId) });
    res.json(results || []);
  } catch (error) {
    console.error('Get sale payments:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Add payment method to a sale
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { saleId, paymentMethodId, amount } = req.body;

    if (!saleId || !paymentMethodId || amount === undefined || amount <= 0) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    const insertQuery = `INSERT INTO SalesPayments (SaleId, PaymentMethodId, Amount) VALUES (@saleId, @paymentMethodId, @amount)`;
    await executeWithParams(insertQuery, {
      saleId: parseInt(saleId),
      paymentMethodId: parseInt(paymentMethodId),
      amount: parseFloat(amount)
    });

    // Return the created payment
    const getQuery = `SELECT sp.Id, sp.Amount, pm.Id as PaymentMethodId, pm.Code, pm.Name FROM SalesPayments sp JOIN PaymentMethods pm ON sp.PaymentMethodId = pm.Id WHERE sp.Id = (SELECT MAX(Id) FROM SalesPayments WHERE SaleId = @saleId)`;
    const result = await queryWithParams(getQuery, { saleId: parseInt(saleId) });
    res.json(result[0]);
  } catch (error) {
    console.error('Add payment:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete payment from a sale
router.delete('/:paymentId', authMiddleware, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const deleteQuery = `DELETE FROM SalesPayments WHERE Id = @paymentId`;
    await executeWithParams(deleteQuery, { paymentId: parseInt(paymentId) });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete payment:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
