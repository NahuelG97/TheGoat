-- Create Sales and SalesDetails tables for sales tracking
USE RotisserieDB;
GO

-- Create Sales table
CREATE TABLE Sales (
    Id INT PRIMARY KEY IDENTITY(1,1),
    SaleNumber NVARCHAR(50) NOT NULL UNIQUE,
    UserId INT NOT NULL FOREIGN KEY REFERENCES Users(Id),
    TotalAmount DECIMAL(10, 2) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'COMPLETED' CHECK (Status IN ('COMPLETED', 'CANCELLED')),
    Notes NVARCHAR(255),
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

-- Create SalesDetails table
CREATE TABLE SalesDetails (
    Id INT PRIMARY KEY IDENTITY(1,1),
    SaleId INT NOT NULL FOREIGN KEY REFERENCES Sales(Id) ON DELETE CASCADE,
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10, 2) NOT NULL,
    Subtotal DECIMAL(10, 2) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

-- Create StockAdjustments table for tracking stock changes from sales
CREATE TABLE StockAdjustments (
    Id INT PRIMARY KEY IDENTITY(1,1),
    SaleId INT NOT NULL FOREIGN KEY REFERENCES Sales(Id) ON DELETE CASCADE,
    IngredientId INT NOT NULL FOREIGN KEY REFERENCES Ingredients(Id),
    QuantityUsed DECIMAL(10, 3) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

-- Create indexes
CREATE INDEX idx_sales_user ON Sales(UserId);
CREATE INDEX idx_sales_date ON Sales(CreatedAt);
CREATE INDEX idx_saledetails_sale ON SalesDetails(SaleId);
CREATE INDEX idx_saledetails_product ON SalesDetails(ProductId);
CREATE INDEX idx_stockadjustments_sale ON StockAdjustments(SaleId);
CREATE INDEX idx_stockadjustments_ingredient ON StockAdjustments(IngredientId);

GO
