-- Create Database
CREATE DATABASE RotisserieDB;
GO

USE RotisserieDB;
GO

-- Create Users table
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(50) NOT NULL,
    Active BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

-- Create Ingredients table
CREATE TABLE Ingredients (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Unit NVARCHAR(50) NOT NULL,
    CostPerUnit DECIMAL(10, 2) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

-- Create Products table
CREATE TABLE Products (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

-- Create ProductIngredients table
CREATE TABLE ProductIngredients (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id) ON DELETE CASCADE,
    IngredientId INT NOT NULL FOREIGN KEY REFERENCES Ingredients(Id) ON DELETE CASCADE,
    Quantity DECIMAL(10, 3) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

-- Create indexes
CREATE INDEX idx_ingredients_name ON Ingredients(Name);
CREATE INDEX idx_products_name ON Products(Name);
CREATE INDEX idx_productingredients_product ON ProductIngredients(ProductId);
CREATE INDEX idx_productingredients_ingredient ON ProductIngredients(IngredientId);

-- Insert sample user (password: admin123)
-- To generate the password hash, use: bcrypt.hash('admin123', 10) in Node.js
-- For now, we'll use a placeholder. You should generate this properly.
-- Hash for 'admin123': $2a$10$H2RzJzvZxDPFhkKvhZt2uuGTnv.TCzGxvV2H.n5LFEqW.vCR3aKWO
INSERT INTO Users (Username, PasswordHash, Role, Active) 
VALUES ('cajero', '$2a$10$H2RzJzvZxDPFhkKvhZt2uuGTnv.TCzGxvV2H.n5LFEqW.vCR3aKWO', 'CAJERO', 1);

-- Insert sample ingredients
INSERT INTO Ingredients (Name, Unit, CostPerUnit) VALUES 
('Carne de Res', 'kg', 15.50),
('Pan', 'unit', 2.00),
('Tomate', 'kg', 3.50),
('Lechuga', 'kg', 2.80),
('Queso', 'kg', 12.00),
('Harina', 'kg', 1.50),
('Levadura', 'kg', 8.00);

-- Insert sample products
INSERT INTO Products (Name) VALUES ('Lomito'), ('Hamburguesa'), ('Pizza');
