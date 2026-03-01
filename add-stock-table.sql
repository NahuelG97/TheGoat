-- Add IngredientStock table for inventory tracking
USE RotisserieDB;
GO

-- Create IngredientStock table
CREATE TABLE IngredientStock (
    Id INT PRIMARY KEY IDENTITY(1,1),
    IngredientId INT NOT NULL FOREIGN KEY REFERENCES Ingredients(Id) ON DELETE CASCADE,
    CurrentStock DECIMAL(10, 3) NOT NULL DEFAULT 0,
    MinimumStock DECIMAL(10, 3) NOT NULL DEFAULT 10,
    LastUpdated DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

-- Create StockMovements table for audit trail
CREATE TABLE StockMovements (
    Id INT PRIMARY KEY IDENTITY(1,1),
    IngredientId INT NOT NULL FOREIGN KEY REFERENCES Ingredients(Id) ON DELETE CASCADE,
    MovementType NVARCHAR(10) NOT NULL CHECK (MovementType IN ('IN', 'OUT')),
    Quantity DECIMAL(10, 3) NOT NULL,
    PreviousStock DECIMAL(10, 3) NOT NULL,
    NewStock DECIMAL(10, 3) NOT NULL,
    UserId INT FOREIGN KEY REFERENCES Users(Id),
    Notes NVARCHAR(255),
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

-- Create indexes
CREATE INDEX idx_ingredientstock_ingredientid ON IngredientStock(IngredientId);
CREATE INDEX idx_stockmovements_ingredientid ON StockMovements(IngredientId);
CREATE INDEX idx_stockmovements_date ON StockMovements(CreatedAt);

-- Initialize stock for existing ingredients (0 stock, 10 units minimum)
INSERT INTO IngredientStock (IngredientId, CurrentStock, MinimumStock)
SELECT Id, 0, 10 FROM Ingredients
WHERE Id NOT IN (SELECT IngredientId FROM IngredientStock);

GO
