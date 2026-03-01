const express = require('express');
const { query, queryWithParams, executeWithParams } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all ingredients
router.get('/', authMiddleware, async (req, res) => {
  try {
    const ingredients = await query('SELECT Id, Name, Unit, CostPerUnit FROM Ingredients ORDER BY Name');
    res.json(ingredients);
  } catch (err) {
    console.error('Error fetching ingredients:', err);
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

// Create ingredient
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, unit, costPerUnit } = req.body;

    if (!name || !unit || costPerUnit === undefined) {
      return res.status(400).json({ error: 'Name, unit, and cost are required' });
    }

    // Insert directly with the name
    await executeWithParams(
      `INSERT INTO Ingredients (Name, Unit, CostPerUnit) VALUES (@name, @unit, @costPerUnit)`,
      { name, unit, costPerUnit: parseFloat(costPerUnit) }
    );

    // Get the last inserted record by name (ordered by ID DESC)
    await new Promise(r => setTimeout(r, 100)); // Small delay
    
    const result = await query(
      `SELECT TOP 1 Id, Name, Unit, CostPerUnit FROM Ingredients ORDER BY Id DESC`
    );

    if (!result || result.length === 0) {
      return res.status(500).json({ error: 'Failed to retrieve created ingredient' });
    }

    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Error creating ingredient:', err);
    res.status(500).json({ error: 'Failed to create ingredient', details: err.message });
  }
});

// Update ingredient
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, costPerUnit } = req.body;

    console.log('PUT /ingredients/:id called with:', { id, name, unit, costPerUnit });

    if (!name || !unit || costPerUnit === undefined) {
      return res.status(400).json({ error: 'Name, unit, and cost are required' });
    }

    const numId = parseInt(id);
    console.log('Parsed ID:', numId);

    const result = await executeWithParams(
      `UPDATE Ingredients SET Name = @name, Unit = @unit, CostPerUnit = @costPerUnit WHERE Id = @id`,
      {
        id: numId,
        name,
        unit,
        costPerUnit: parseFloat(costPerUnit)
      }
    );

    console.log('UPDATE executed, result:', result);

    // Add small delay and then fetch all ingredients
    await new Promise(r => setTimeout(r, 50));

    const allIngredients = await query(
      `SELECT Id, Name, Unit, CostPerUnit FROM Ingredients ORDER BY Id`
    );

    console.log('All ingredients after update:', allIngredients);

    const updated = allIngredients.find(ing => parseInt(ing.Id) === numId);

    console.log('Found updated ingredient:', updated);

    if (!updated) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updating ingredient:', err);
    res.status(500).json({ error: 'Failed to update ingredient', details: err.message });
  }
});

module.exports = router;
