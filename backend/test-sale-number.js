const { queryWithParams } = require('./db');

async function testSaleNumberGeneration() {
  try {
    console.log('Testing sale number generation...\n');

    // First, check existing sales
    const existingQuery = `SELECT TOP 10 SaleNumber, Id FROM Sales ORDER BY Id DESC`;
    const existing = await queryWithParams(existingQuery, {});
    console.log('Existing sales (top 10):');
    console.log(JSON.stringify(existing, null, 2));

    // Test the sale number generation query
    console.log('\n\nTesting sale number generation query...');
    const saleNumberQuery = `SELECT 'SALE-' + FORMAT(COALESCE(MAX(TRY_CAST(REPLACE(SaleNumber, 'SALE-', '') AS INT)), 0) + 1, '0000000') as NextNumber FROM Sales WHERE SaleNumber LIKE 'SALE-%'`;
    console.log('Query:', saleNumberQuery);
    
    const result = await queryWithParams(saleNumberQuery, {});
    console.log('\nRaw result:');
    console.log(JSON.stringify(result, null, 2));

    if (result.length > 0) {
      const nextNumber = result[0]?.NextNumber || 'SALE-0000001';
      console.log('\nNext number would be:', nextNumber);
    }

  } catch (error) {
    console.error('❌ Error:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
  }
}

testSaleNumberGeneration();
