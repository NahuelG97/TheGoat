const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');

const execAsync = promisify(exec);

// Template for executing sqlcmd commands
async function executeSqlCmd(sqlQuery) {
  try {
    // Build sqlcmd command with proper escaping
    // Use -s to set delimiter (tab character), -h for header lines, -w for line width
    const escapedQuery = sqlQuery.replace(/"/g, '\\"');
    const command = `sqlcmd -E -S localhost -d ${process.env.DATABASE_NAME || 'RotisserieDB'} -Q "${escapedQuery}" -h 1 -s "	" -w 32767 -W`;
    
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 1024 * 1024 * 10,
      shell: 'cmd.exe'
    });
    
    if (stderr && !stderr.includes('Warning')) {
      console.error('SQL Error:', stderr);
    }
    
    return stdout.trim();
  } catch (err) {
    console.error('SQL Execution Error:', err.message);
    throw err;
  }
}

// Format output from sqlcmd into JSON
function parseCSVOutput(csvOutput) {
  if (!csvOutput) return [];
  
  const lines = csvOutput.split('\n').filter(line => line.trim() && !line.includes('rows affected'));
  if (lines.length === 0) return [];
  
  // Split using tab as delimiter (sqlcmd output with -s "\t")
  const delimiter = '\t';
  
  // First line is headers
  const headerLine = lines[0];
  const headers = headerLine.split(delimiter).map(h => h.trim());
  
  const results = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Skip separator lines (mostly dashes or repeated column names)
    const values = line.split(delimiter).map(v => v.trim());
    if (values[0] === '--' || values[0] === headers[0]) continue;
    if (/^-+$/.test(values[0])) continue;
    
    const obj = {};
    headers.forEach((header, idx) => {
      const value = values[idx] || '';
      obj[header] = value === 'NULL' || value === '' ? null : value;
    });
    
    results.push(obj);
  }
  
  return results;
}

async function initializePool() {
  try {
    // Test connection
    const result = await executeSqlCmd('SELECT 1 AS test');
    console.log('Database connected successfully via sqlcmd');
    return true;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    throw err;
  }
}

async function getPool() {
  return true; // Not needed for sqlcmd approach
}

async function query(sqlQuery) {
  try {
    const output = await executeSqlCmd(sqlQuery);
    return parseCSVOutput(output);
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
}

async function queryWithParams(sqlQuery, params) {
  try {
    // Simple parameter replacement (basic protection)
    let finalQuery = sqlQuery;
    for (const [key, value] of Object.entries(params)) {
      const placeholder = `@${key}`;
      const stringValue = typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value;
      finalQuery = finalQuery.replace(new RegExp(placeholder, 'g'), stringValue);
    }
    
    const output = await executeSqlCmd(finalQuery);
    return parseCSVOutput(output);
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
}

async function execute(sqlQuery) {
  try {
    const output = await executeSqlCmd(sqlQuery);
    return { recordset: parseCSVOutput(output) };
  } catch (err) {
    console.error('Execute error:', err);
    throw err;
  }
}

async function executeWithParams(sqlQuery, params) {
  try {
    // Simple parameter replacement
    let finalQuery = sqlQuery;
    for (const [key, value] of Object.entries(params)) {
      const placeholder = `@${key}`;
      const stringValue = typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value;
      finalQuery = finalQuery.replace(new RegExp(placeholder, 'g'), stringValue);
    }
    
    const output = await executeSqlCmd(finalQuery);
    return { recordset: parseCSVOutput(output) };
  } catch (err) {
    console.error('Execute error:', err);
    throw err;
  }
}

module.exports = {
  initializePool,
  getPool,
  query,
  queryWithParams,
  execute,
  executeWithParams
};
