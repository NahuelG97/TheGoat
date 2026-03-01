# Quick Start Guide

## 🚀 Fast Track Setup (5 minutes)

### Step 1: Database (1 min)
```sql
-- Open SSMS, execute database-schema.sql
```

### Step 2: Backend (2 min)
```bash
cd backend
npm install
npm start
```
Wait for: `Server running on port 5000`

### Step 3: Frontend (2 min)
```bash
cd frontend
npm install
npm start
```
Browser opens to: `http://localhost:3000`

### Step 4: Login
- Username: `cajero`
- Password: `admin123`
- Click **Ingresar**

✅ Done! You're ready to use the system.

---

## 📋 System Features

### Dashboard Tabs

| Tab | Function |
|-----|----------|
| 📦 Ingredientes | Add/edit ingredient costs |
| 🍕 Productos | Create menu items |
| 📋 Recetas | Build recipes with ingredients |
| 💰 Costos | View product costs |

### Quick Actions

**Add Ingredient:**
1. Ingredientes tab → + Nuevo Ingrediente
2. Enter: Name, Unit, Cost
3. Click Create

**Create Product:**
1. Productos tab → + Nuevo Producto
2. Enter product name
3. Click Create

**Define Recipe:**
1. Recetas tab
2. Select product
3. Add ingredients with quantities

**View Cost:**
1. Costos tab
2. Select product
3. See calculated total

---

## 🔑 Default Login

```
Username: cajero
Password: admin123
```

---

## 🐛 If Something Breaks

### Backend error?
```bash
cd backend
npm start
```

### Frontend error?
```bash
cd frontend
npm start
```

### Database issue?
1. Open SSMS
2. Re-execute `database-schema.sql`

### Port conflicts?
- Backend: `netstat -ano | findstr :5000`
- Frontend: `netstat -ano | findstr :3000`

---

## 📁 File Locations

- Database setup: `database-schema.sql`
- Full docs: `README.md`
- Setup guide: `SETUP.md`
- SQL queries: `USEFUL_QUERIES.sql`

---

## 💡 Tips

- Products cost = Sum of (Ingredient Quantity × Unit Cost)
- Edit ingredient costs anytime, costs recalculate automatically
- Add multiple ingredients to one product
- No ingredient quantity limit

---

## 🎯 Example: Create Lomito

1. **Add Ingredient** (if not exists):
   - Name: Salsa BBQ
   - Unit: kg
   - Cost: 5.00

2. **Create Product**:
   - Name: Lomito

3. **Add to Recipe**:
   - Carne de Res: 0.5 kg
   - Pan: 1 unit
   - Salsa BBQ: 0.1 kg

4. **View Cost**:
   - Costs tab → Select Lomito
   - Shows: $10.35
   - (0.5 × 15.50) + (1 × 2.00) + (0.1 × 5.00)

---

For detailed setup, see `SETUP.md`
