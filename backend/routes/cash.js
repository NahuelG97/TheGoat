const express = require('express');
const router = express.Router();
const { queryWithParams, executeWithParams } = require('../db');
const authMiddleware = require('../middleware/auth');

// Get current open cash session for user
router.get('/current', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `SELECT Id, UserId, Status, OpeningAmount, ClosingAmount, ExpectedAmount, Difference, OpenedAt, ClosedAt, Notes FROM CashSessions WHERE UserId = @userId AND Status = 'OPEN' ORDER BY OpenedAt DESC`;
    const results = await queryWithParams(query, { userId: parseInt(userId) });
    if (results.length === 0) return res.json(null);
    res.json(results[0]);
  } catch (error) {
    console.error('Get current cash session:',error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get all sessions for user (including closed ones)
router.get('/history/:userId', authMiddleware, async (req, res) => {
  try {
    const query = `SELECT Id, UserId, Status, OpeningAmount, ClosingAmount, ExpectedAmount, Difference, OpenedAt, ClosedAt, Notes FROM CashSessions WHERE UserId = @userId ORDER BY OpenedAt DESC`;
    const results = await queryWithParams(query, { userId: parseInt(req.params.userId) });
    res.json(results || []);
  } catch (error) {
    console.error('Get cash session history:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Open cash session (new shift)
router.post('/open', authMiddleware, async (req, res) => {
  try {
    const { openingAmount } = req.body;
    const userId = req.user.id;

    if (openingAmount === null || openingAmount === undefined || openingAmount < 0) {
      return res.status(400).json({ error: 'Invalid opening amount' });
    }

    // Check if there's already an open session
    const existingQuery = `SELECT Id FROM CashSessions WHERE UserId = @userId AND Status = 'OPEN'`;
    const existing = await queryWithParams(existingQuery, { userId: parseInt(userId) });
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'There is already an open cash session' });
    }

    // Create new session
    const createQuery = `INSERT INTO CashSessions (UserId, Status, OpeningAmount, OpenedAt) VALUES (@userId, 'OPEN', @openingAmount, GETDATE())`;
    await executeWithParams(createQuery, {
      userId: parseInt(userId),
      openingAmount: parseFloat(openingAmount)
    });

    // Get the created session
    const getQuery = `SELECT TOP 1 Id, UserId, Status, OpeningAmount, OpenedAt FROM CashSessions WHERE UserId = @userId AND Status = 'OPEN' ORDER BY OpenedAt DESC`;
    const results = await queryWithParams(getQuery, { userId: parseInt(userId) });
    res.json(results[0]);
  } catch (error) {
    console.error('Open cash session:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Close cash session and calculate difference
router.post('/close', authMiddleware, async (req, res) => {
  try {
    const { closingAmount, cashSessionId, notes } = req.body;
    const userId = req.user.id;

    console.log('POST /close - Received:', { cashSessionId, closingAmount, notes, userId });

    if (closingAmount === null || closingAmount === undefined || closingAmount < 0) {
      return res.status(400).json({ error: 'Invalid closing amount' });
    }

    if (!cashSessionId) {
      console.error('ERROR: cashSessionId is missing from request body');
      return res.status(400).json({ error: 'Cash session ID is required' });
    }

    // Get session details
    const sessionQuery = `SELECT Id, OpeningAmount, Status, UserId FROM CashSessions WHERE Id = @sessionId AND UserId = @userId`;
    console.log('Running query with params:', { sessionId: cashSessionId, userId: userId });
    const sessions = await queryWithParams(sessionQuery, {
      sessionId: parseInt(cashSessionId),
      userId: parseInt(userId)
    });

    console.log('Query results:', sessions);

    if (sessions.length === 0) {
      console.error('Session not found. Searched for sessionId:', cashSessionId, 'userId:', userId);
      return res.status(404).json({ error: 'Cash session not found' });
    }

    const session = sessions[0];
    if (session.Status !== 'OPEN') {
      return res.status(400).json({ error: 'Cash session is already closed' });
    }

    // Get total sales for this session
    const salesQuery = `SELECT COALESCE(SUM(TotalAmount), 0) as TotalSales FROM Sales WHERE CashSessionId = @sessionId`;
    const salesResults = await queryWithParams(salesQuery, { sessionId: parseInt(cashSessionId) });
    const totalSales = parseFloat(salesResults[0]?.TotalSales || 0);

    // Calculate expected amount
    const expectedAmount = parseFloat(session.OpeningAmount) + totalSales;
    const difference = parseFloat(closingAmount) - expectedAmount;

    // Update session
    const updateQuery = `UPDATE CashSessions SET Status = 'CLOSED', ClosingAmount = @closingAmount, ExpectedAmount = @expectedAmount, Difference = @difference, ClosedAt = GETDATE(), Notes = @notes WHERE Id = @sessionId`;
    await executeWithParams(updateQuery, {
      sessionId: parseInt(cashSessionId),
      closingAmount: parseFloat(closingAmount),
      expectedAmount: expectedAmount,
      difference: difference,
      notes: notes || ''
    });

    // Return updated session
    const getQuery = `SELECT Id, UserId, Status, OpeningAmount, ClosingAmount, ExpectedAmount, Difference, OpenedAt, ClosedAt, Notes FROM CashSessions WHERE Id = @sessionId`;
    const result = await queryWithParams(getQuery, { sessionId: parseInt(cashSessionId) });
    res.json({
      ...result[0],
      totalSales: totalSales
    });
  } catch (error) {
    console.error('Close cash session:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get session details with sales
router.get('/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const sessionQuery = `SELECT Id, UserId, Status, OpeningAmount, ClosingAmount, ExpectedAmount, Difference, OpenedAt, ClosedAt, Notes FROM CashSessions WHERE Id = @sessionId`;
    const sessions = await queryWithParams(sessionQuery, { sessionId: parseInt(sessionId) });
    
    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Cash session not found' });
    }

    const session = sessions[0];

    // Get sales for this session
    const salesQuery = `SELECT s.Id, s.SaleNumber, s.TotalAmount, s.CreatedAt, u.Username FROM Sales s JOIN Users u ON s.UserId = u.Id WHERE s.CashSessionId = @sessionId ORDER BY s.CreatedAt DESC`;
    const sales = await queryWithParams(salesQuery, { sessionId: parseInt(sessionId) });

    res.json({
      session: session,
      sales: sales || [],
      totalSales: sales.reduce((sum, s) => sum + parseFloat(s.TotalAmount || 0), 0)
    });
  } catch (error) {
    console.error('Get session details:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
