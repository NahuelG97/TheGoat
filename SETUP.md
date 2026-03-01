# Complete Setup Guide - Rotisserie Production Cost Calculator

## Prerequisites Checklist

- [ ] Node.js v16+ installed ([Download](https://nodejs.org/))
- [ ] SQL Server installed (Express or Developer edition)
- [ ] SQL Server Management Studio (SSMS) installed
- [ ] Terminal/Command Prompt access
- [ ] Text editor or IDE (VS Code recommended)

## Step 1: Database Setup (SQL Server)

### 1.1 Open SQL Server Management Studio

1. Launch **SQL Server Management Studio (SSMS)**
2. Connect to your SQL Server instance
   - Server name: `localhost` or `.`
   - Authentication: Windows or SQL Server Authentication

### 1.2 Create Database and Tables

1. Open the `database-schema.sql` file from the project root
   - Path: `c:\Users\nahue\Desktop\The Goat Pages\TheGoat\database-schema.sql`

2. Copy all the SQL code

3. In SSMS:
   - New Query
   - Paste the SQL code
   - Click **Execute** (or press F5)

4. Verify creation:
   ```sql
   USE RotisserieDB;
   SELECT name FROM sysobjects WHERE xtype='U';
   ```
   You should see:
   - Users
   - Ingredients
   - Products
   - ProductIngredients

### 1.3 Verify Sample Data

```sql
USE RotisserieDB;
SELECT * FROM Users;
SELECT * FROM Ingredients;
SELECT * FROM Products;
```

Should show:
- User: `cajero` with role `CAJERO`
- 7 sample ingredients
- 3 sample products

---

## Step 2: Backend Setup (Node.js + Express)

### 2.1 Navigate to Backend Directory

```bash
cd "c:\Users\nahue\Desktop\The Goat Pages\TheGoat\backend"
```

### 2.2 Install Dependencies

```bash
npm install
```

This will install:
- express
- mssql
- jsonwebtoken
- bcryptjs
- cors
- dotenv

### 2.3 Configure Environment Variables

1. Open `.env` file in the backend directory

2. Update with your SQL Server details:
   ```env
   PORT=5000
   DATABASE_SERVER=localhost
   DATABASE_USER=sa
   DATABASE_PASSWORD=your_sql_password
   DATABASE_NAME=RotisserieDB
   JWT_SECRET=your_secret_key_12345
   ```

3. Replace:
   - `DATABASE_SERVER`: Your SQL Server hostname
   - `DATABASE_USER`: SQL Server login username (usually 'sa')
   - `DATABASE_PASSWORD`: SQL Server login password
   - `JWT_SECRET`: Any random string (change in production)

### 2.4 Test Backend Connection

Start the server:
```bash
npm start
```

Expected output:
```
Database connected successfully
Server running on port 5000
```

### 2.5 Test Backend Endpoints

Open another terminal and test:

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"cajero\",\"password\":\"admin123\"}"
```

Expected response (contains token):
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "cajero",
    "role": "CAJERO"
  }
}
```

**Keep the backend running in this terminal**

---

## Step 3: Frontend Setup (React + TypeScript)

### 3.1 Open New Terminal, Navigate to Frontend

```bash
cd "c:\Users\nahue\Desktop\The Goat Pages\TheGoat\frontend"
```

### 3.2 Install Dependencies

```bash
npm install
```

This will install:
- react & react-dom
- react-router-dom
- axios
- typescript
- tailwindcss
- All required dev dependencies

**Note:** This may take a few minutes

### 3.3 Configure Environment (Optional)

The frontend API URL is hardcoded to `http://localhost:5000`

If needed, create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 3.4 Start Development Server

```bash
npm start
```

Expected output:
```
Compiled successfully!
You can now view rotisserie-frontend in the browser.

Local:            http://localhost:3000
```

The browser should automatically open at `http://localhost:3000`

---

## Step 4: First Login

1. If browser didn't open automatically, go to: `http://localhost:3000`

2. You should see the login page

3. Enter credentials:
   - **Username:** `cajero`
   - **Password:** `admin123`

4. Click **Ingresar** (Enter)

5. You should be redirected to the Cashier Dashboard

---

## Step 5: Test the System

### 5.1 Manage Ingredients

1. Click **📦 Ingredientes** tab
2. Click **+ Nuevo Ingrediente**
3. Add an ingredient:
   - Name: `Cebolla`
   - Unit: `kg`
   - Cost: `1.50`
4. Click Create
5. You should see it in the list

### 5.2 Manage Products

1. Click **🍕 Productos** tab
2. Click **+ Nuevo Producto**
3. Enter: `Sándwich de Pollo`
4. Click Create
5. Product appears in grid

### 5.3 Create Recipe

1. Click **📋 Recetas** tab
2. Left panel: Select **Sándwich de Pollo**
3. Right panel: Shows "Sin ingredientes"
4. Bottom form:
   - Select ingredient: `Carne de Res`
   - Quantity: `0.5`
   - Click **Agregar**
5. Ingredient appears in recipe
6. Repeat to add more ingredients

### 5.4 View Costs

1. Click **💰 Costos** tab
2. Left panel: Select **Sándwich de Pollo**
3. Right panel: Shows total cost
   - Example: `$7.75` (0.5 kg × $15.50)

---

## Terminal Commands Reference

### Backend Terminal

```bash
# Navigate to backend
cd "c:\Users\nahue\Desktop\The Goat Pages\TheGoat\backend"

# Install dependencies
npm install

# Start server
npm start

# Stop server (Ctrl + C)
```

### Frontend Terminal

```bash
# Navigate to frontend
cd "c:\Users\nahue\Desktop\The Goat Pages\TheGoat\frontend"

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm build

# Stop server (Ctrl + C)
```

---

## API Endpoints Reference

**Base URL:** `http://localhost:5000`

### Authentication
```
POST /auth/login
Body: { "username": "cajero", "password": "admin123" }
Response: { "token": "...", "user": {...} }
```

### Ingredients
```
GET    /ingredients                    # Get all
POST   /ingredients                    # Create
Headers: { "Authorization": "Bearer {token}" }

PUT    /ingredients/:id                # Update
Headers: { "Authorization": "Bearer {token}" }
```

### Products
```
GET    /products                       # Get all
POST   /products                       # Create
Headers: { "Authorization": "Bearer {token}" }

GET    /products/:id                   # Get with ingredients
```

### Recipes & Costs
```
POST   /recipes/:productId/ingredients
DELETE /recipes/:productId/ingredients/:ingredientId
GET    /recipes/:productId/cost        # Calculate cost
Headers: { "Authorization": "Bearer {token}" }
```

---

## Troubleshooting

### Issue: "Cannot connect to database"

**Solutions:**
1. Verify SQL Server is running:
   ```bash
   sqlcmd -S localhost -U sa -P "password"
   ```
   
2. Check database name in .env matches `RotisserieDB`

3. Verify credentials are correct

4. Check firewall isn't blocking port 1433

### Issue: "Login failed"

**Solutions:**
1. Verify user exists:
   ```sql
   SELECT * FROM Users WHERE Username = 'cajero';
   ```

2. Verify Active = 1

3. Credentials are: `cajero` / `admin123`

### Issue: "CORS error in frontend"

**Solutions:**
1. Backend must be running on port 5000
2. Check backend is running in separate terminal
3. Verify frontend .env has correct API URL

### Issue: Frontend shows blank page

**Solutions:**
1. Open browser console (F12) to see errors
2. Check if backend is running
3. Hard refresh: Ctrl + F5
4. Clear browser cache

### Issue: "Module not found" after npm install

**Solutions:**
1. Delete `node_modules` folder and `package-lock.json`
2. Run `npm install` again
3. This can take several minutes

---

## File Structure Verification

Verify all these files exist:

**Backend:**
```
backend/
├── server.js
├── db.js
├── .env
├── .env.example
├── package.json
├── .gitignore
├── routes/
│   ├── auth.js
│   ├── ingredients.js
│   ├── products.js
│   └── recipes.js
└── middleware/
    └── auth.js
```

**Frontend:**
```
frontend/
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── .env
├── .env.example
├── .gitignore
├── public/
│   └── index.html
└── src/
    ├── index.tsx
    ├── index.css
    ├── App.tsx
    ├── pages/
    │   ├── Login.tsx
    │   └── Cashier.tsx
    ├── components/
    │   ├── IngredientsManager.tsx
    │   ├── ProductsManager.tsx
    │   ├── RecipeEditor.tsx
    │   └── ProductCostViewer.tsx
    ├── context/
    │   └── AuthContext.tsx
    └── services/
        └── api.ts
```

---

## Production Deployment Tips

1. **Change JWT Secret:**
   Update .env JWT_SECRET to a strong random string

2. **Change SQL Password:**
   Update DATABASE_PASSWORD to your production SQL password

3. **Set NODE_ENV:**
   Add `NODE_ENV=production` to .env

4. **Build Frontend:**
   ```bash
   cd frontend
   npm run build
   ```
   This creates optimized files in `build/` folder

5. **Use Production Database:**
   Update DATABASE_SERVER in .env

6. **Setup HTTPS:**
   Use reverse proxy (nginx, IIS) for SSL/TLS

7. **Environment Variables:**
   Never commit .env file to Git (add to .gitignore)

---

## Support & Debugging

### Enable Debug Logging

**Backend:**
Add to server.js before routes:
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

**Frontend:**
Add to api.ts:
```javascript
api.interceptors.response.use(
  response => {
    console.log('API Response:', response.data);
    return response;
  }
);
```

### View Database Records

```sql
USE RotisserieDB;

-- View all users
SELECT * FROM Users;

-- View all ingredients
SELECT * FROM Ingredients;

-- View all products
SELECT * FROM Products;

-- View product recipes
SELECT p.Name, i.Name, pi.Quantity, i.Unit, i.CostPerUnit,
       (pi.Quantity * i.CostPerUnit) AS Cost
FROM Products p
JOIN ProductIngredients pi ON p.Id = pi.ProductId
JOIN Ingredients i ON pi.IngredientId = i.Id
ORDER BY p.Name;

-- Calculate product costs
SELECT p.Name,
       SUM(pi.Quantity * i.CostPerUnit) AS TotalCost
FROM Products p
LEFT JOIN ProductIngredients pi ON p.Id = pi.ProductId
LEFT JOIN Ingredients i ON pi.IngredientId = i.Id
GROUP BY p.Id, p.Name;
```

---

## Common URLs

- **Frontend:** `http://localhost:3000`
- **Backend Health:** `http://localhost:5000/health`
- **SQL Server:** `localhost` (in SSMS)

---

## Next Steps

1. Add more ingredients
2. Create all menu items
3. Define recipes
4. Monitor costs
5. Adjust prices as needed

Enjoy your Rotisserie Cost Calculator!
