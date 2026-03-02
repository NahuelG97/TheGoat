const { queryWithParams, executeWithParams } = require('./db');

async function testCreateSaleWithPayments() {
  try {
    console.log('Testing sale creation with multiple payment methods...\n');

    // First, verify PaymentMethods exist
    const methodsQuery = `SELECT Id, Code, Name FROM PaymentMethods WHERE Active = 1`;
    const methods = await queryWithParams(methodsQuery, {});
    console.log('Available payment methods:', JSON.stringify(methods, null, 2));

    // Verify a product exists
    const productsQuery = `SELECT TOP 1 Id, Name, Price FROM Products`;
    const products = await queryWithParams(productsQuery, {});
    if (products.length === 0) {
      console.log('No products found!');
      return;
    }
    const product = products[0];
    console.log('\nUsing product:', JSON.stringify(product, null, 2));

    // Get a user ID (should be 1 for cajero)
    const userQuery = `SELECT TOP 1 Id, Username FROM Users WHERE Active = 1`;
    const users = await queryWithParams(userQuery, {});
    if (users.length === 0) {
      console.log('No active users found!');
      return;
    }
    const user = users[0];
    console.log('Using user:', JSON.stringify(user, null, 2));

    // Get cash session
    const sessionQuery = `SELECT Id FROM CashSessions WHERE UserId = @userId AND Status = 'OPEN'`;
    const sessions = await queryWithParams(sessionQuery, { userId: parseInt(user.Id) });
    if (sessions.length === 0) {
      console.log('No open cash session for user!');
      return;
    }
    const cashSessionId = parseInt(sessions[0].Id);
    console.log('\nCash session ID:', cashSessionId);

    // Create a test sale
    const saleNumber = 'SALE-TEST-' + Date.now();
    const saleAmount = 100.00;
    
    console.log('\nCreating sale:', saleNumber);
    const createSaleQuery = `INSERT INTO Sales (SaleNumber, UserId, TotalAmount, Notes, CashSessionId, Status) VALUES (@saleNumber, @userId, @totalAmount, @notes, @cashSessionId, 'COMPLETED')`;
    
    console.log('Executing query:', createSaleQuery);
    await executeWithParams(createSaleQuery, {
      saleNumber: saleNumber,
      userId: parseInt(user.Id),
      totalAmount: saleAmount,
      notes: 'Test payment split',
      cashSessionId: cashSessionId
    });
    console.log('Sale INSERT executed');

    // Get the sale ID
    const getSaleIdQuery = `SELECT Id FROM Sales WHERE SaleNumber = @saleNumber`;
    console.log('\nRetrieval query:', getSaleIdQuery);
    const saleIds = await queryWithParams(getSaleIdQuery, { saleNumber: saleNumber });
    console.log('Raw query result:', JSON.stringify(saleIds, null, 2));
    
    if (saleIds.length === 0) {
      console.log('Failed to retrieve sale ID!');
      // Try to verify the sale exists
      const verifyQuery = `SELECT TOP 5 SaleNumber, Id, Status FROM Sales WHERE SaleNumber LIKE @saleNumber`;
      const verify = await queryWithParams(verifyQuery, { saleNumber: '%TEST%' });
      console.log('Sales with TEST in number:', JSON.stringify(verify, null, 2));
      return;
    }
    const saleId = parseInt(saleIds[0].Id);
    console.log('Sale ID:', saleId);

    // Now try to add two payment methods (50% cash, 50% transfer)
    console.log('\nAdding payment methods...');
    
    const cashMethod = methods.find(m => m.Code === 'CASH');
    const transferMethod = methods.find(m => m.Code === 'TRANSFER');

    if (!cashMethod || !transferMethod) {
      console.log('Not all payment methods available!');
      console.log('Available:', methods.map(m => m.Code));
      return;
    }

    console.log(`Adding payment: $50.00 cash (method ID: ${cashMethod.Id})`);
    const payment1Query = `INSERT INTO SalesPayments (SaleId, PaymentMethodId, Amount) VALUES (@saleId, @paymentMethodId, @amount)`;
    await executeWithParams(payment1Query, {
      saleId: saleId,
      paymentMethodId: parseInt(cashMethod.Id),
      amount: 50.00
    });
    console.log('Cash payment added');

    console.log(`Adding payment: $50.00 transfer (method ID: ${transferMethod.Id})`);
    await executeWithParams(payment1Query, {
      saleId: saleId,
      paymentMethodId: parseInt(transferMethod.Id),
      amount: 50.00
    });
    console.log('Transfer payment added');

    // Verify payments were inserted
    const paymentsQuery = `SELECT sp.Id, sp.Amount, pm.Code, pm.Name FROM SalesPayments sp JOIN PaymentMethods pm ON sp.PaymentMethodId = pm.Id WHERE sp.SaleId = @saleId`;
    const payments = await queryWithParams(paymentsQuery, { saleId: saleId });
    console.log('\nPayments recorded:');
    console.log(JSON.stringify(payments, null, 2));

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Error during test:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
  }
}

testCreateSaleWithPayments();
