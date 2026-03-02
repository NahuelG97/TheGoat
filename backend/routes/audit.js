const express = require('express');
const router = express.Router();
const { queryWithParams, executeWithParams } = require('../db');
const authMiddleware = require('../middleware/auth');

// Get sale audit history
router.get('/sale/:saleId', authMiddleware, async (req, res) => {
  try {
    const { saleId } = req.params;
    const query = `SELECT sa.Id, sa.Action, sa.Reason, sa.ChangedAt, u.Username as ChangedByUser, sa.OldValues, sa.NewValues FROM SalesAudit sa LEFT JOIN Users u ON sa.ChangedBy = u.Id WHERE sa.SaleId = @saleId ORDER BY sa.ChangedAt DESC`;
    const results = await queryWithParams(query, { saleId: parseInt(saleId) });
    res.json(results || []);
  } catch (error) {
    console.error('Get audit history:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Edit sale (update items and payment methods)
router.put('/:saleId', authMiddleware, async (req, res) => {
  try {
    const { saleId } = req.params;
    const { items, payments, reason } = req.body;
    const userId = req.user.id;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'Reason is required for editing' });
    }

    // Get current sale
    const currentSaleQuery = `SELECT s.*, JSON_QUERY((SELECT PaymentMethodId, Amount FROM SalesPayments WHERE SaleId = s.Id FOR JSON AUTO)) as CurrentPayments FROM Sales s WHERE s.Id = @saleId`;
    const currentSales = await queryWithParams(currentSaleQuery, { saleId: parseInt(saleId) });
    
    if (currentSales.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const currentSale = currentSales[0];
    let oldValues = JSON.stringify({ items: currentSale.CurrentPayments });

    // Delete old sale items
    const deleteItemsQuery = `DELETE FROM SaleItems WHERE SaleId = @saleId`;
    await executeWithParams(deleteItemsQuery, { saleId: parseInt(saleId) });

    // Delete old payments
    const deletePaymentsQuery = `DELETE FROM SalesPayments WHERE SaleId = @saleId`;
    await executeWithParams(deletePaymentsQuery, { saleId: parseInt(saleId) });

    // Insert new items
    let newTotalAmount = 0;
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const insertItemQuery = `INSERT INTO SaleItems (SaleId, ProductId, Quantity, UnitPrice, Subtotal, Notes) VALUES (@saleId, @productId, @quantity, @unitPrice, @subtotal, @notes)`;
        const subtotal = parseFloat(item.quantity) * parseFloat(item.unitPrice);
        newTotalAmount += subtotal;
        
        await executeWithParams(insertItemQuery, {
          saleId: parseInt(saleId),
          productId: parseInt(item.productId),
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          subtotal: subtotal,
          notes: item.notes || ''
        });
      }
    }

    // Insert new payments
    if (payments && Array.isArray(payments)) {
      for (const payment of payments) {
        const insertPaymentQuery = `INSERT INTO SalesPayments (SaleId, PaymentMethodId, Amount) VALUES (@saleId, @paymentMethodId, @amount)`;
        await executeWithParams(insertPaymentQuery, {
          saleId: parseInt(saleId),
          paymentMethodId: parseInt(payment.paymentMethodId),
          amount: parseFloat(payment.amount)
        });
      }
    }

    // Update sale total
    const updateSaleQuery = `UPDATE Sales SET TotalAmount = @totalAmount WHERE Id = @saleId`;
    await executeWithParams(updateSaleQuery, {
      saleId: parseInt(saleId),
      totalAmount: newTotalAmount
    });

    // Record audit
    const newValues = JSON.stringify({ items, payments, totalAmount: newTotalAmount });
    const auditQuery = `INSERT INTO SalesAudit (SaleId, Action, Reason, ChangedBy, OldValues, NewValues) VALUES (@saleId, 'EDITED', @reason, @changedBy, @oldValues, @newValues)`;
    await executeWithParams(auditQuery, {
      saleId: parseInt(saleId),
      reason: reason,
      changedBy: parseInt(userId),
      oldValues: oldValues,
      newValues: newValues
    });

    // Return updated sale
    const getSaleQuery = `SELECT s.*, u.Username FROM Sales s JOIN Users u ON s.UserId = u.Id WHERE s.Id = @saleId`;
    const updatedSale = await queryWithParams(getSaleQuery, { saleId: parseInt(saleId) });
    res.json(updatedSale[0]);
  } catch (error) {
    console.error('Edit sale:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Cancel sale
router.post('/:saleId/cancel', authMiddleware, async (req, res) => {
  try {
    const { saleId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'Reason is required for cancellation' });
    }

    // Get current sale
    const currentSaleQuery = `SELECT * FROM Sales WHERE Id = @saleId`;
    const currentSales = await queryWithParams(currentSaleQuery, { saleId: parseInt(saleId) });
    
    if (currentSales.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const currentSale = currentSales[0];

    // Mark sale as CANCELLED
    const updateSaleQuery = `UPDATE Sales SET Status = 'CANCELLED' WHERE Id = @saleId`;
    await executeWithParams(updateSaleQuery, { saleId: parseInt(saleId) });

    // Record audit
    const auditQuery = `INSERT INTO SalesAudit (SaleId, Action, Reason, ChangedBy) VALUES (@saleId, 'CANCELLED', @reason, @changedBy)`;
    await executeWithParams(auditQuery, {
      saleId: parseInt(saleId),
      reason: reason,
      changedBy: parseInt(userId)
    });

    res.json({ success: true, message: 'Sale cancelled successfully' });
  } catch (error) {
    console.error('Cancel sale:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
