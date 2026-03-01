# Rotisserie Production Cost Calculator

Full-stack system to calculate production costs for a rotisserie business. Track ingredient prices and automatically compute product costs.

## Features

- **User Authentication**: JWT-based login system
- **Ingredient Management**: Add, edit, and track ingredient costs
- **Product Management**: Create products (Lomito, Hamburger, Pizza)
- **Recipe Management**: Define recipes by adding ingredients with quantities
- **Cost Calculation**: Automatic calculation of product costs based on ingredient prices
- **Responsive UI**: Built with React + Tailwind CSS

## Technology Stack

### Backend
- Node.js
- Express.js
- SQL Server (mssql package)
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Axios for API calls
- React Router for navigation

### Database
- SQL Server with relational schema

## Project Structure

```
TheGoat/
├── backend/
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   ├── ingredients.js  # Ingredient CRUD operations
│   │   ├── products.js     # Product management
│   │   └── recipes.js      # Recipe and cost calculation
│   ├── middleware/
│   │   └── auth.js         # JWT middleware
│   ├── server.js           # Express server
│   ├── db.js               # SQL Server connection
│   ├── .env                # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx        # Login page
│   │   │   └── Cashier.tsx      # Main dashboard
│   │   ├── components/
│   │   │   ├── IngredientsManager.tsx    # Ingredient management
│   │   │   ├── ProductsManager.tsx       # Product management
│   │   │   ├── RecipeEditor.tsx          # Recipe editor
│   │   │   └── ProductCostViewer.tsx     # Cost viewer
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # Authentication context
│   │   ├── services/
│   │   │   └── api.ts          # API client
│   │   ├── App.tsx             # Main app component
│   │   ├── index.tsx           # Entry point
│   │   └── index.css           # Global styles
│   ├── public/
│   │   └── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── database-schema.sql     # SQL schema setup
└── README.md               # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- SQL Server (Express, Developer, or full version)
- npm or yarn

### 1. Setup Database

1. Open SQL Server Management Studio (SSMS)
2. Open the `database-schema.sql` file
3. Execute the script to create the database and tables
4. Verify tables were created:
   - Users
   - Ingredients
   - Products
   - ProductIngredients

**Sample User Credentials:**
- Username: `cajero`
- Password: `admin123`

**Sample Data:**
- Ingredients: Carne de Res, Pan, Tomate, Lechuga, Queso, Harina, Levadura
- Products: Lomito, Hamburguesa, Pizza

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Update .env with your SQL Server credentials
# Edit .env file with:
# - DATABASE_SERVER: localhost or your server name
# - DATABASE_USER: sa or your user
# - DATABASE_PASSWORD: your password
# - DATABASE_NAME: RotisserieDB

# Start server
npm start
```

Server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

App will run on `http://localhost:3000`

## API Endpoints

### Authentication
```
POST   /auth/login              # Login user
```

### Ingredients
```
GET    /ingredients             # Get all ingredients
POST   /ingredients             # Create ingredient
PUT    /ingredients/:id         # Update ingredient
```

### Products
```
GET    /products                # Get all products
POST   /products                # Create product
GET    /products/:id            # Get product with ingredients
```

### Recipes (Cost Calculation)
```
POST   /recipes/:productId/ingredients          # Add ingredient to recipe
DELETE /recipes/:productId/ingredients/:ingredientId  # Remove ingredient
GET    /recipes/:productId/cost                 # Calculate product cost
```

## Database Schema

### Users
```sql
Id (INT PRIMARY KEY)
Username (NVARCHAR)
PasswordHash (NVARCHAR)
Role (NVARCHAR)
Active (BIT)
CreatedAt (DATETIME)
```

### Ingredients
```sql
Id (INT PRIMARY KEY)
Name (NVARCHAR)
Unit (NVARCHAR) -- kg, g, unit, L, ml
CostPerUnit (DECIMAL)
CreatedAt (DATETIME)
```

### Products
```sql
Id (INT PRIMARY KEY)
Name (NVARCHAR)
CreatedAt (DATETIME)
```

### ProductIngredients
```sql
Id (INT PRIMARY KEY)
ProductId (INT FOREIGN KEY)
IngredientId (INT FOREIGN KEY)
Quantity (DECIMAL)
CreatedAt (DATETIME)
```

## Cost Calculation Formula

```
Product Cost = SUM(Quantity × Ingredient.CostPerUnit)
```

For example:
- If a pizza recipe has:
  - 0.5 kg Cheese @ $12/kg = $6
  - 1 kg Dough @ $2/kg = $2
  - 0.2 kg Tomato @ $3.50/kg = $0.70
- **Total Pizza Cost = $8.70**

## Usage

### 1. Login
- Navigate to `http://localhost:3000`
- Enter credentials: `cajero` / `admin123`

### 2. Manage Ingredients
- Go to "📦 Ingredientes" tab
- Add new ingredients with name, unit, and cost
- Edit costs as needed

### 3. Create Products
- Go to "🍕 Productos" tab
- Click "Nuevo Producto"
- Enter product name (Lomito, Hamburguesa, Pizza)

### 4. Create Recipes
- Go to "📋 Recetas" tab
- Select a product
- Add ingredients with quantities
- Remove ingredients if needed

### 5. View Costs
- Go to "💰 Costos" tab
- Select a product
- View the calculated total cost

## Environment Variables

**.env (Backend)**
```
PORT=5000
DATABASE_SERVER=localhost
DATABASE_USER=sa
DATABASE_PASSWORD=YourPassword123!
DATABASE_NAME=RotisserieDB
JWT_SECRET=your_secret_key_change_this_in_production
```

## Authentication Flow

1. User logs in with username/password
2. Backend validates credentials against Users table
3. If valid, JWT token is generated
4. Token is stored in localStorage
5. Token is sent in Authorization header for protected routes
6. Middleware validates token on each request

## Features in Detail

### Ingredient Management
- View all ingredients with costs
- Add new ingredients with units (kg, g, unit, L, ml)
- Edit ingredient costs
- Track cost per unit

### Product Management
- Create menu items (Lomito, Hamburguesa, Pizza, etc.)
- View all products
- Each product can have multiple ingredients

### Recipe Management
- Add ingredients to products with specific quantities
- Edit quantities
- Remove ingredients from recipes
- Automatic ingredient suggestion

### Cost Calculation
- Real-time cost calculation
- Displays total cost and ingredient count
- Updates when recipes change
- Decimal precision for accurate costs

## Troubleshooting

### Database Connection Error
- Verify SQL Server is running
- Check .env credentials
- Ensure database name matches

### Login Failed
- Verify user exists in database
- Check password hash matches (default: admin123)
- Verify user.Active = 1

### CORS Errors
- Backend CORS is enabled for all origins
- Check frontend is on http://localhost:3000
- Check backend is on http://localhost:5000

### API Not Responding
- Verify backend is running on port 5000
- Check network connection
- Review backend console for errors

## Future Enhancements

- [ ] Multiple user roles (Manager, Admin)
- [ ] Product pricing beyond cost
- [ ] Profit margin calculations
- [ ] Sales history tracking
- [ ] Inventory management
- [ ] Barcode scanning
- [ ] PDF report generation
- [ ] Multi-language support
- [ ] Dark mode

## License

MIT

## Contact

For issues or questions, please contact the development team.
