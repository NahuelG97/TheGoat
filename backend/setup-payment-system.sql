-- ===================================
-- PAYMENT SYSTEM SETUP
-- ===================================

-- 1. Create PaymentMethods table
CREATE TABLE PaymentMethods (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    Active BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Insert default payment methods
INSERT INTO PaymentMethods (Code, Name, Description) VALUES
('CASH', 'Efectivo', 'Pago en efectivo'),
('TRANSFER', 'Transferencia', 'Transferencia bancaria'),
('CARD', 'Tarjeta', 'Pago con tarjeta de débito/crédito');

-- 2. Create SalesPayments table (link sales to payment methods with amounts)
CREATE TABLE SalesPayments (
    Id INT PRIMARY KEY IDENTITY(1,1),
    SaleId INT NOT NULL,
    PaymentMethodId INT NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (SaleId) REFERENCES Sales(Id) ON DELETE CASCADE,
    FOREIGN KEY (PaymentMethodId) REFERENCES PaymentMethods(Id)
);

-- 3. Create SalesAudit table (track edits and cancellations)
CREATE TABLE SalesAudit (
    Id INT PRIMARY KEY IDENTITY(1,1),
    SaleId INT NOT NULL,
    Action NVARCHAR(50) NOT NULL, -- 'CREATED', 'EDITED', 'CANCELED'
    Reason NVARCHAR(500),
    ChangedBy INT,
    ChangedAt DATETIME DEFAULT GETDATE(),
    OldValues NVARCHAR(MAX), -- JSON
    NewValues NVARCHAR(MAX), -- JSON
    FOREIGN KEY (SaleId) REFERENCES Sales(Id) ON DELETE CASCADE,
    FOREIGN KEY (ChangedBy) REFERENCES Users(Id)
);

-- 4. Add Status column to Sales (if not exists)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Sales' AND COLUMN_NAME = 'Status')
BEGIN
    ALTER TABLE Sales ADD Status NVARCHAR(20) DEFAULT 'ACTIVE';
    CREATE INDEX IX_Sales_Status ON Sales(Status);
END;

-- 5. Modify CashSessions table to include payment breakdown (if columns don't exist)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'CashSessions' AND COLUMN_NAME = 'CashAmount')
BEGIN
    ALTER TABLE CashSessions ADD 
        CashAmount DECIMAL(18,2) NULL,
        TransferAmount DECIMAL(18,2) NULL,
        CardAmount DECIMAL(18,2) NULL;
END;

-- 6. Create an index for efficient sales queries
CREATE INDEX IX_SalesPayments_SaleId ON SalesPayments(SaleId);
CREATE INDEX IX_SalesAudit_SaleId ON SalesAudit(SaleId);
CREATE INDEX IX_SalesAudit_ChangedAt ON SalesAudit(ChangedAt DESC);

PRINT 'Payment system schema created successfully!';
