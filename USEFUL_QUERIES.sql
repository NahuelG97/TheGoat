-- ============================================
-- Rotisserie Database - Useful Queries
-- ============================================

USE RotisserieDB;

-- ============================================
-- USER MANAGEMENT
-- ============================================

-- View all users
SELECT Id, Username, Role, Active, CreatedAt FROM Users;

-- Create new user (Replace values as needed)
-- Note: PasswordHash should be generated using bcryptjs in Node.js
-- Example hash for 'admin123': $2a$10$H2RzJzvZxDPFhkKvhZt2uuGTnv.TCzGxvV2H.n5LFEqW.vCR3aKWO
INSERT INTO Users (Username, PasswordHash, Role, Active)
VALUES ('manager', '$2a$10$H2RzJzvZxDPFhkKvhZt2uuGTnv.TCzGxvV2H.n5LFEqW.vCR3aKWO', 'CAJERO', 1);

-- Deactivate user
UPDATE Users SET Active = 0 WHERE Username = 'username';

-- ============================================
-- INGREDIENT MANAGEMENT
-- ============================================

-- View all ingredients with costs
SELECT Id, Name, Unit, CostPerUnit FROM Ingredients ORDER BY Name;

-- View ingredients count
SELECT COUNT(*) AS TotalIngredients FROM Ingredients;

-- Find ingredient by name
SELECT * FROM Ingredients WHERE Name LIKE '%carne%';

-- Update ingredient cost
UPDATE Ingredients SET CostPerUnit = 16.00 WHERE Name = 'Carne de Res';

-- Delete ingredient (use with caution!)
DELETE FROM Ingredients WHERE Id = 999;

-- ============================================
-- PRODUCT MANAGEMENT
-- ============================================

-- View all products
SELECT Id, Name, CreatedAt FROM Products ORDER BY Name;

-- View product count
SELECT COUNT(*) AS TotalProducts FROM Products;

-- Find product by name
SELECT * FROM Products WHERE Name = 'Lomito';

-- ============================================
-- RECIPE MANAGEMENT
-- ============================================

-- View full recipe for a product with costs
SELECT 
    p.Id AS ProductId,
    p.Name AS ProductName,
    i.Id AS IngredientId,
    i.Name AS IngredientName,
    pi.Quantity,
    i.Unit,
    i.CostPerUnit,
    (pi.Quantity * i.CostPerUnit) AS IngredientTotalCost
FROM Products p
LEFT JOIN ProductIngredients pi ON p.Id = pi.ProductId
LEFT JOIN Ingredients i ON pi.IngredientId = i.Id
ORDER BY p.Name, i.Name;

-- View recipe for specific product
SELECT 
    i.Name AS IngredientName,
    pi.Quantity,
    i.Unit,
    i.CostPerUnit,
    (pi.Quantity * i.CostPerUnit) AS Cost
FROM ProductIngredients pi
JOIN Ingredients i ON pi.IngredientId = i.Id
WHERE pi.ProductId = 1  -- Replace 1 with product ID
ORDER BY i.Name;

-- ============================================
-- COST CALCULATION
-- ============================================

-- Calculate cost for all products
SELECT 
    p.Id,
    p.Name AS ProductName,
    COUNT(pi.Id) AS IngredientsCount,
    SUM(pi.Quantity * i.CostPerUnit) AS TotalCost
FROM Products p
LEFT JOIN ProductIngredients pi ON p.Id = pi.ProductId
LEFT JOIN Ingredients i ON pi.IngredientId = i.Id
GROUP BY p.Id, p.Name
ORDER BY p.Name;

-- Calculate cost for specific product
SELECT 
    p.Name AS ProductName,
    SUM(pi.Quantity * i.CostPerUnit) AS TotalCost
FROM Products p
JOIN ProductIngredients pi ON p.Id = pi.ProductId
JOIN Ingredients i ON pi.IngredientId = i.Id
WHERE p.Id = 1  -- Replace 1 with product ID
GROUP BY p.Id, p.Name;

-- Products with zero cost/no ingredients
SELECT 
    p.Id,
    p.Name
FROM Products p
LEFT JOIN ProductIngredients pi ON p.Id = pi.ProductId
WHERE pi.Id IS NULL
ORDER BY p.Name;

-- ============================================
-- REPORTING
-- ============================================

-- Cost summary report
SELECT 
    p.Name,
    COUNT(pi.Id) AS Ingredients,
    ROUND(SUM(pi.Quantity * i.CostPerUnit), 2) AS Cost
FROM Products p
LEFT JOIN ProductIngredients pi ON p.Id = pi.ProductId
LEFT JOIN Ingredients i ON pi.IngredientId = i.Id
GROUP BY p.Id, p.Name
ORDER BY Cost DESC;

-- Ingredient usage report (which products use which ingredients)
SELECT 
    i.Name AS IngredientName,
    COUNT(p.Id) AS UsedInProducts,
    STRING_AGG(p.Name, ', ') AS ProductNames
FROM Ingredients i
LEFT JOIN ProductIngredients pi ON i.Id = pi.IngredientId
LEFT JOIN Products p ON pi.ProductId = p.Id
GROUP BY i.Id, i.Name
ORDER BY i.Name;

-- Most expensive products
SELECT TOP 10
    p.Name,
    ROUND(SUM(pi.Quantity * i.CostPerUnit), 2) AS Cost
FROM Products p
LEFT JOIN ProductIngredients pi ON p.Id = pi.ProductId
LEFT JOIN Ingredients i ON pi.IngredientId = i.Id
GROUP BY p.Id, p.Name
ORDER BY Cost DESC;

-- Cheapest products
SELECT TOP 10
    p.Name,
    ROUND(SUM(pi.Quantity * i.CostPerUnit), 2) AS Cost
FROM Products p
LEFT JOIN ProductIngredients pi ON p.Id = pi.ProductId
LEFT JOIN Ingredients i ON pi.IngredientId = i.Id
GROUP BY p.Id, p.Name
ORDER BY Cost ASC;

-- ============================================
-- DATA MAINTENANCE
-- ============================================

-- Backup important data (select and copy)
SELECT * FROM Users;
SELECT * FROM Ingredients;
SELECT * FROM Products;
SELECT * FROM ProductIngredients;

-- Check database size
EXEC sp_helpdb 'RotisserieDB';

-- Verify referential integrity
-- Check for orphaned ProductIngredients
SELECT pi.* FROM ProductIngredients pi
WHERE pi.ProductId NOT IN (SELECT Id FROM Products)
   OR pi.IngredientId NOT IN (SELECT Id FROM Ingredients);

-- ============================================
-- RESET SAMPLE DATA
-- ============================================

-- WARNING: This deletes all data!
-- Uncomment only if you want to reset everything

/*
DELETE FROM ProductIngredients;
DELETE FROM Products;
DELETE FROM Ingredients;

-- Reset identity seeds
DBCC CHECKIDENT ('Products', RESEED, 0);
DBCC CHECKIDENT ('Ingredients', RESEED, 0);
DBCC CHECKIDENT ('ProductIngredients', RESEED, 0);

-- Reload sample data
INSERT INTO Ingredients (Name, Unit, CostPerUnit) VALUES 
('Carne de Res', 'kg', 15.50),
('Pan', 'unit', 2.00),
('Tomate', 'kg', 3.50),
('Lechuga', 'kg', 2.80),
('Queso', 'kg', 12.00),
('Harina', 'kg', 1.50),
('Levadura', 'kg', 8.00);

INSERT INTO Products (Name) VALUES ('Lomito'), ('Hamburguesa'), ('Pizza');
*/
