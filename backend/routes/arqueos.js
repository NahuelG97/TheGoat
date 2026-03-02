const express = require('express');
const router = express.Router();
const { queryWithParams, executeWithParams } = require('../db');
const authMiddleware = require('../middleware/auth');

// Get all closed cash sessions grouped by date
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const { date } = req.query; // date format: YYYY-MM-DD
    const filterDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    // Get all closed sessions for the given date, grouped by date
    const query = `
      SELECT 
        cs.Id,
        cs.UserId,
        u.Username,
        cs.Status,
        cs.OpeningAmount,
        cs.ClosingAmount,
        cs.ExpectedAmount,
        cs.Difference,
        cs.OpenedAt,
        cs.ClosedAt,
        cs.Notes,
        CAST(cs.ClosedAt AS DATE) as ClosedDate,
        COUNT(DISTINCT CASE WHEN s.Status = 'COMPLETED' THEN s.Id END) as CompletedSalesCount,
        COUNT(DISTINCT CASE WHEN s.Status = 'CANCELLED' THEN s.Id END) as CancelledSalesCount,
        ISNULL(SUM(CASE WHEN s.Status = 'COMPLETED' THEN s.TotalAmount ELSE 0 END), 0) as CompletedSalesTotal,
        ISNULL(SUM(CASE WHEN s.Status = 'CANCELLED' THEN s.TotalAmount ELSE 0 END), 0) as CancelledSalesTotal
      FROM CashSessions cs
      INNER JOIN Users u ON cs.UserId = u.Id
      LEFT JOIN Sales s ON cs.Id = s.CashSessionId
      WHERE cs.Status = 'CLOSED'
        AND CAST(cs.ClosedAt AS DATE) = CAST(@filterDate AS DATE)
      GROUP BY 
        cs.Id, cs.UserId, u.Username, cs.Status, cs.OpeningAmount, cs.ClosingAmount,
        cs.ExpectedAmount, cs.Difference, cs.OpenedAt, cs.ClosedAt, cs.Notes
      ORDER BY cs.ClosedAt DESC
    `;

    const results = await queryWithParams(query, { 
      filterDate: filterDate 
    });

    res.json(results || []);
  } catch (error) {
    console.error('Get arqueos list:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get detail of a specific closed session (Arqueo Z)
router.get('/detail/:cashSessionId', authMiddleware, async (req, res) => {
  try {
    const cashSessionId = parseInt(req.params.cashSessionId);

    // Get cash session info
    const sessionQuery = `
      SELECT 
        cs.Id,
        cs.UserId,
        u.Username,
        u.Id as UserId,
        cs.Status,
        cs.OpeningAmount,
        cs.ClosingAmount,
        cs.ExpectedAmount,
        cs.Difference,
        cs.OpenedAt,
        cs.ClosedAt,
        cs.Notes
      FROM CashSessions cs
      INNER JOIN Users u ON cs.UserId = u.Id
      WHERE cs.Id = @sessionId AND cs.Status = 'CLOSED'
    `;

    const sessions = await queryWithParams(sessionQuery, { sessionId: cashSessionId });
    
    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Closed cash session not found' });
    }

    const session = sessions[0];

    // Get all sales for this session with cost calculation
    const salesQuery = `
      SELECT 
        s.Id,
        s.SaleNumber,
        s.TotalAmount,
        s.Status,
        s.CreatedAt,
        ISNULL(STRING_AGG(pm.Name, ', ') WITHIN GROUP (ORDER BY pm.Name), 'N/A') as PaymentMethods,
        ISNULL(SUM(CASE WHEN s.Status = 'COMPLETED' THEN ISNULL(sd.Quantity * p.Cost, 0) ELSE 0 END), 0) as TotalCost
      FROM Sales s
      LEFT JOIN SalesPayments sp ON s.Id = sp.SaleId
      LEFT JOIN PaymentMethods pm ON sp.PaymentMethodId = pm.Id
      LEFT JOIN SalesDetails sd ON s.Id = sd.SaleId
      LEFT JOIN Products p ON sd.ProductId = p.Id
      WHERE s.CashSessionId = @sessionId
      GROUP BY s.Id, s.SaleNumber, s.TotalAmount, s.Status, s.CreatedAt
      ORDER BY s.CreatedAt DESC
    `;

    const sales = await queryWithParams(salesQuery, { sessionId: cashSessionId });
    console.log(`[ARQUEOS] Sales retrieved for CashSessionId ${cashSessionId}: ${sales.length} sales found`);
    if (sales.length > 0) {
      const completedCount = sales.filter(s => s.Status === 'COMPLETED').length;
      const totalSalesAmount = sales.reduce((sum, s) => sum + (s.TotalAmount || 0), 0);
      console.log(`[ARQUEOS] Breakdown: ${completedCount} COMPLETED, Total Amount: ${totalSalesAmount}`);
    }

    // Get payment method summary for completed sales
    const paymentSummaryQuery = `
      SELECT 
        pm.Id,
        pm.Name as PaymentMethod,
        COUNT(sp.Id) as TransactionCount,
        ISNULL(SUM(sp.Amount), 0) as Total
      FROM SalesPayments sp
      INNER JOIN PaymentMethods pm ON sp.PaymentMethodId = pm.Id
      INNER JOIN Sales s ON sp.SaleId = s.Id
      WHERE s.CashSessionId = @sessionId AND s.Status = 'COMPLETED'
      GROUP BY pm.Id, pm.Name
      ORDER BY pm.Name
    `;

    const paymentSummary = await queryWithParams(paymentSummaryQuery, { sessionId: cashSessionId });

    // Calculate costs for completed sales
    const costDetailQuery = `
      SELECT 
        s.Id as SaleId,
        ISNULL(SUM(sd.Quantity * p.Cost), 0) as SaleCost
      FROM Sales s
      LEFT JOIN SalesDetails sd ON s.Id = sd.SaleId
      LEFT JOIN Products p ON sd.ProductId = p.Id
      WHERE s.CashSessionId = @sessionId AND s.Status = 'COMPLETED'
      GROUP BY s.Id
    `;

    const costDetails = await queryWithParams(costDetailQuery, { sessionId: cashSessionId });
    const costMap = {};
    costDetails.forEach(cd => {
      costMap[cd.SaleId] = parseFloat(cd.SaleCost) || 0;
    });
    const totalCostCalculated = Object.values(costMap).reduce((sum, cost) => sum + cost, 0);
    console.log(`[ARQUEOS] Cost calculation: ${costDetails.length} sales with costs, Total Cost: ${totalCostCalculated}`);

    // Calculate totals
    const completedSales = sales.filter(s => s.Status === 'COMPLETED');
    const cancelledSales = sales.filter(s => s.Status === 'CANCELLED');

    const completedSalesTotal = completedSales.reduce((sum, s) => sum + (parseFloat(s.TotalAmount) || 0), 0);
    const cancelledSalesTotal = cancelledSales.reduce((sum, s) => sum + (parseFloat(s.TotalAmount) || 0), 0);
    const totalCost = completedSales.reduce((sum, s) => sum + (parseFloat(costMap[s.Id]) || 0), 0);
    const netProfit = completedSalesTotal - totalCost;

    const totalPaymentAmount = paymentSummary.reduce((sum, p) => sum + (parseFloat(p.Total) || 0), 0);
    // Conciliation difference: Expected - Closing Amount (not payment-based)
    const conciliationDifference = session.ClosingAmount - session.ExpectedAmount;

    res.json({
      session: {
        id: session.Id,
        username: session.Username,
        userId: session.UserId,
        status: session.Status,
        openingAmount: session.OpeningAmount,
        closingAmount: session.ClosingAmount,
        expectedAmount: session.ExpectedAmount,
        difference: session.Difference,
        openedAt: session.OpenedAt,
        closedAt: session.ClosedAt,
        notes: session.Notes
      },
      sales: {
        completed: completedSales,
        cancelled: cancelledSales,
        completedCount: completedSales.length,
        cancelledCount: cancelledSales.length,
        completedTotal: completedSalesTotal,
        cancelledTotal: cancelledSalesTotal
      },
      profitability: {
        totalSales: completedSalesTotal,
        totalCosts: totalCost,
        netProfit: netProfit,
        profitMargin: completedSalesTotal > 0 ? ((netProfit / completedSalesTotal) * 100).toFixed(2) : 0
      },
      paymentSummary: paymentSummary,
      totalPaymentAmount: totalPaymentAmount,
      difference: conciliationDifference
    });
  } catch (error) {
    console.error('Get arqueo detail:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get sales detail for read-only view in closed session
router.get('/sale-detail/:saleId', authMiddleware, async (req, res) => {
  try {
    const saleId = parseInt(req.params.saleId);

    // Get sale basic info
    const saleQuery = `
      SELECT 
        s.Id,
        s.SaleNumber,
        s.TotalAmount,
        s.Status,
        s.CreatedAt,
        s.CashSessionId,
        cs.Status as CashSessionStatus
      FROM Sales s
      INNER JOIN CashSessions cs ON s.CashSessionId = cs.Id
      WHERE s.Id = @saleId
    `;

    const sales = await queryWithParams(saleQuery, { saleId });
    
    if (sales.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const sale = sales[0];

    // Get sale items
    const itemsQuery = `
      SELECT 
        sd.Id,
        sd.ProductId,
        p.Name as ProductName,
        sd.Quantity,
        sd.UnitPrice,
        sd.Subtotal,
        sd.Notes
      FROM SalesDetails sd
      INNER JOIN Products p ON sd.ProductId = p.Id
      WHERE sd.SaleId = @saleId
      ORDER BY sd.Id
    `;

    const items = await queryWithParams(itemsQuery, { saleId });
    console.log(`[ARQUEOS] Sale items retrieved for SaleId ${saleId}: ${items.length} items found`);
    if (items.length > 0) {
      const itemsTotal = items.reduce((sum, item) => sum + (item.Subtotal || 0), 0);
      console.log(`[ARQUEOS] Items breakdown: ${items.length} products, Total items amount: ${itemsTotal}`);
    }

    // Get payments
    const paymentsQuery = `
      SELECT 
        sp.Id,
        sp.PaymentMethodId,
        pm.Name as PaymentMethodName,
        sp.Amount
      FROM SalesPayments sp
      INNER JOIN PaymentMethods pm ON sp.PaymentMethodId = pm.Id
      WHERE sp.SaleId = @saleId
      ORDER BY sp.Id
    `;

    const payments = await queryWithParams(paymentsQuery, { saleId });

    res.json({
      id: sale.Id,
      saleNumber: sale.SaleNumber,
      totalAmount: sale.TotalAmount,
      status: sale.Status,
      createdAt: sale.CreatedAt,
      cashSessionStatus: sale.CashSessionStatus,
      isClosed: sale.CashSessionStatus === 'CLOSED',
      items,
      payments
    });
  } catch (error) {
    console.error('Get sale detail from arqueo:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
