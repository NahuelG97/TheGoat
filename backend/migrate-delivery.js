const { executeWithParams } = require('./db');

async function addDeliveryColumns() {
  try {
    console.log('Adding delivery columns to SalesDetails...');
    
    // Check if columns already exist
    const checkColumnQuery = `
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'SalesDetails' AND COLUMN_NAME IN ('DeliveryAmount', 'IncludeDelivery')
    `;
    
    // Add columns if they don't exist
    const alterTableQuery = `
      IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SalesDetails' AND COLUMN_NAME = 'DeliveryAmount')
      BEGIN
        ALTER TABLE SalesDetails ADD DeliveryAmount DECIMAL(10, 2) DEFAULT 0;
        PRINT 'Added DeliveryAmount column';
      END
      
      IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SalesDetails' AND COLUMN_NAME = 'IncludeDelivery')
      BEGIN
        ALTER TABLE SalesDetails ADD IncludeDelivery BIT DEFAULT 0;
        PRINT 'Added IncludeDelivery column';
      END
    `;
    
    await executeWithParams(alterTableQuery, {});
    console.log('✓ Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  }
}

addDeliveryColumns();
