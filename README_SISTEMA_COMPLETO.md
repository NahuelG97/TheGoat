# 🍗 TheGoat - Sistema de Gestión de Rotisería

## 📋 Resumen Ejecutivo

Sistema integral de gestión de costos y ventas para rotisería con:
- ✅ Gestión de ingredientes y stock
- ✅ Cálculo automático de costos de productos
- ✅ Ventas con deducción automática de stock
- ✅✅ **NUEVO: Arqueo de caja por turnos**

---

## 🏗️ Arquitectura del Sistema

```
┌──────────────────────────────────────────────────────────────────┐
│                        ROTISSERIE SYSTEM                          │
├────────────────────────────────────────────────────────────────┬─┤
│                       TECNOLOGÍAS                              │ │
│  Frontend: React 18 + TypeScript + Tailwind CSS               │ │
│  Backend: Node.js + Express.js                                │ │
│  Database: SQL Server (sqlcmd)                                │ │
│  Ports: Frontend 3000 │ Backend 5000                          │ │
└────────────────────────────────────────────────────────────────┴─┘
```

---

## 📦 Módulos Implementados

### 1. **👥 Autenticación & Usuarios**
- Login con JWT
- Roles: ADMIN, CAJERO
- Sesiones seguras

### 2. **📦 Ingredientes**
- CRUD de ingredientes base
- Unidades de medida
- Costo por unidad

### 3. **🍕 Productos**
- Crear productos
- Asignar precio de venta
- Ver ingredientes usados

### 4. **📋 Recetas**
- Asignar ingredientes a productos
- Cantidad de cada ingrediente
- Cálculo automático de costo

### 5. **📊 Stock Control**
- Stock actual por ingrediente
- Mínimos alertados
- Historial de movimientos
- Deducción automática al vender

### 6. **💰 Ventas**
- Registrar ventas con items múltiples
- Notas por item (ej: "sin lechuga")
- Historial de ventas
- Ver detalles de cada venta

### 7. **💳 **NUEVO: Arqueo de Caja por Turnos****
- Abrir caja al iniciar turno
- Cerrar caja con conteo real
- Calcular diferencias
- Soporta turnos cruzando medianoche
- Múltiples turnos por día
- Historial completo de notas

---

## 🗄️ Modelo de Datos

```sql
┌─────────────┐
│   Users     │◄─────┐
├─────────────┤      │
│ Id (PK)     │      │
│ Username    │      │
│ Password    │      │
│ Role        │      │
│ Active      │      │
└─────────────┘      │
                     │
           ┌─────────┴─────────┐
           │                   │
   ┌──────────────┐     ┌─────────────────┐
   │    Sales     │     │  CashSessions   │
   ├──────────────┤     ├─────────────────┤
   │ Id (PK)      │     │ Id (PK)         │
   │ SaleNumber   │     │ UserId (FK)     │
   │ UserId (FK)  ├────►│ Status          │
   │ TotalAmount  │     │ OpeningAmount   │
   │ CashSessionId├────►│ ClosingAmount   │
   │ CreatedAt    │     │ ExpectedAmount  │
   └──────────────┘     │ Difference      │
           │            │ OpenedAt        │
           │            │ ClosedAt        │
           │            │ Notes           │
           │            └─────────────────┘
           │
   ┌───────┴──────────┐
   │                  │
┌─────────────────┐   ├──────────────────┐
│ SalesDetails    │   │  Products        │
├─────────────────┤   ├──────────────────┤
│ Id (PK)         │   │ Id (PK)          │
│ SaleId (FK)     ├──►│ Name             │
│ ProductId (FK)  │   │ Price            │
│ Quantity        │   │ CreatedAt        │
│ UnitPrice       │   └──────────────────┘
│ Subtotal        │           │
│ Notes           │           │
└─────────────────┘           │
                              │
                    ┌─────────┴───────────┐
                    │                     │
             ┌──────────────────┐   ┌─────────────────┐
             │ ProductIngredients   │ IngredientStock │
             ├──────────────────┤   ├─────────────────┤
             │ Id (PK)          │   │ Id (PK)         │
             │ ProductId (FK)   │   │ IngredientId(FK)│
             │ IngredientId(FK) ├──►│ CurrentStock    │
             │ Quantity         │   │ MinimumStock    │
             └──────────────────┘   │ LastUpdated     │
                     △              └─────────────────┘
                     │                      △
                     │                      │
             ┌───────┴──────────────────────┘
             │
       ┌──────────────┐
       │ Ingredients  │
       ├──────────────┤
       │ Id (PK)      │
       │ Name         │
       │ Unit         │
       │ CostPerUnit  │
       └──────────────┘
```

---

## 🚀 Pantallazo de Características

### **Página Principal (Dashboar)**
```
┌─────────────────────────────────────────┐
│ 🍗 Rotisseria System                    │
│ Gestión de Costos                       │
├─────────────────────────────────────────┤
│ Usuario: cajero [Salir]                 │
├─────────────────────────────────────────┤
│ [📦 Productos] [📊 Stock] [💰 Ventas]   │
├─────────────────────────────────────────┤
│ Contenido dinámico según selección      │
└─────────────────────────────────────────┘
```

### **Página de Ventas (Con Caja Abierta)**
```
┌────────────────────────────────────────────────────────┐
│ 💰 Ventas                                              │
│ 🟢 Caja abierta - $1000.00                             │
│ [Ver Historial]  [🔐 Cerrar Turno]                     │
├────────────────────────────────────────────────────────┤
│                                                         │
│ ┌──────────────────────────┐   ┌─────────────────────┐ │
│ │ Nueva Venta              │   │ Resumen             │ │
│ │                          │   │                     │ │
│ │ Producto: [Hamburguesa]  │   │ Hamburguesa ($50)   │ │
│ │ Cantidad: [2]            │   │ Notas: sin lechuga  │ │
│ │ Notas: [sin lechuga]     │   │ Subtotal: $100.00   │ │
│ │                          │   │ ─────────────────── │ │
│ │ [+ Agregar Producto]     │   │ TOTAL:  $100.00     │ │
│ │                          │   │                     │ │
│ │                          │   │ [💾 Registrar Venta]│ │
│ └──────────────────────────┘   └─────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### **Modal: Cerrar Turno**
```
┌─────────────────────────────────────┐
│ 🔐 Close Cash Drawer                │
├─────────────────────────────────────┤
│ Apertura:        $1000.00           │
│ Total Ventas:      $150.00          │
│ Esperado:        $1150.00           │
│ ─────────────────────────────────   │
│ Monto Contado:   [_____________]    │
│ Notas (opt):     [_____________]    │
│                                     │
│ [Cancel]  [Close Drawer]            │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ ✅ Cierre Exitoso                   │
│                                     │
│ Esperado:    $1150.00               │
│ Contado:     $1150.00               │
│ Diferencia:     $0.00 ✅             │
│                                     │
│ ¡Perfecto! Turno cuadrado.          │
└─────────────────────────────────────┘
```

---

## 🔄 Flujos Principales

### **Flujo: Crear un Producto**
```
1. Admin → Panel Productos
2. Ingresa:
   - Nombre: "Hamburguesa"
   - Precio: $80.00
3. Sistema guarda producto
4. Admin → Recetas
5. Asigna ingredientes:
   - Pan (1 unidad)
   - Carne (150g)
   - Queso (50g)
6. Sistema calcula costo automático
```

### **Flujo: Registrar una Venta**
```
1. Cajero login → Sistema verifica /cash/current
2. ¿Hay sesión abierta?
   - NO: Mostrar OpenCashScreen
        Ingresa $1000 → Caja abierta ✅
   - SI: Continúa
3. Selecciona Hamburguesa ($80)
4. Cantidad: 2
5. Notas: "sin lechuga"
6. Click "Agregar Producto"
7. Cart se actualiza con item
8. Click "Registrar Venta"
9. Sistema:
   a) Crea Sale con SaleNumber=SALE-0000001
   b) Crea SalesDetails con notas
   c) Crea CashSessionId (sale vinculada a sesión)
   d) Deduce stock automáticamente
   e) Registra ajustes en StockAdjustments
10. ✅ Venta registrada
```

### **Flujo: Cerrar Turno**
```
1. Cajero registró 5 ventas = $380 total
2. Click "🔐 Cerrar Turno"
3. Modal muestra:
   - Apertura: $1000.00
   - Ventas: $380.00
   - Esperado: $1380.00
4. Cajero cuenta dinero en caja → $1380
5. Ingresa ClosingAmount: $1380
6. Notas: "Perfecto"
7. Click "Close Drawer"
8. Sistema calcula:
   - Difference = 1380 - 1380 = $0.00 ✅
9. Session Status → "CLOSED"
   - ClosedAt = Now
   - ClosingAmount guardado
10. Listo para siguiente turno
```

---

## 🧪 Testing

Incluye tests para validar:

✅ **test-login.js** - Autenticación  
✅ **test-products-improved.js** - Gestión de productos  
✅ **test-recipe.js** - Recetas e ingredientes  
✅ **test-sales-improved.js** - Ventas y stock  
✅ **test-cash-sessions.js** - **Nuevo: Arqueo de caja** 

**Todos los tests pasan exitosamente ✅**

---

## 📁 Estructura del Proyecto

```
TheGoat/
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── ingredients.js
│   │   ├── products.js
│   │   ├── recipes.js
│   │   ├── stock.js
│   │   ├── sales.js
│   │   └── cash.js ⭐ NUEVO
│   ├── middleware/
│   │   └── auth.js
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── test-*.js (múltiples tests)
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Sales.tsx ⭐ ACTUALIZADO
│   │   │   ├── StockControl.tsx
│   │   │   └── Cashier.tsx
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── ProductDetailsModal.tsx
│   │   │   ├── SaleDetailsModal.tsx
│   │   │   ├── CashDrawerModal.tsx ⭐ NUEVO
│   │   │   ├── CloseCashDrawerModal.tsx ⭐ NUEVO
│   │   │   ├── OpenCashScreen.tsx ⭐ NUEVO
│   │   │   └── ... (otros componentes)
│   │   ├── services/
│   │   │   ├── api.ts ⭐ ACTUALIZADO
│   │   │   └── auth.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── build/ (producción)
│
└── CASH_SESSIONS_MODULE.md ⭐ NUEVO - Documentación
```

---

## 🚀 Cómo Usar

### **Iniciar Sistema**

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
# Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Compiled successfully - Open http://localhost:3000
```

### **Acceder**
```
URL: http://localhost:3000
Usuario: cajero
Contraseña: admin123
```

### **Pruebas**
```bash
cd backend
node test-cash-sessions.js
# ✅ All cash session tests passed!
```

---

## 🎯 Casos de Uso Reales

### **Caso 1: Turno de Almuerzo (11:00-16:00)**
```
11:00 - Cajero abre caja con $500
11:30 - Venta: Hamburguesa + Gaseosa ($35)
12:00 - Venta: Pollo + Papas ($40)
13:00 - Venta: 3x Hamburguesa ($105)
...
15:45 - Total ventas: $320
16:00 - Cajero cierra: Contó $820
       Sistema: Esperado=$820, Real=$820, Diferencia=$0 ✅
```

### **Caso 2: Turno Nocturno (22:00-06:00)**
```
22:00 (Día 1) - Abre caja con $1000
23:30 (Día 1) - Ventas por $300
MEDIANOCHE (cruza a Día 2)
01:00 (Día 2) - Ventas por $200
...
05:45 (Día 2) - Total ventas: $800
06:00 (Día 2) - Cierra: Contó $1850
               Esperado=$1800, Real=$1850, Diferencia=+$50
               ⚠️ Hay $50 extra (verificar)
```

### **Caso 3: Cierre de Caja con Diferencia**
```
Turno registró valores pero hay faltantes
Sistema alerta: Diferencia negativa
Cajero registra notas en modal
Auditor ve en historial qué pasó
```

---

## 📊 Beneficios de la Implementación

✅ **Transparencia Total**
- Cada turno tiene su propio arqueo
- Notas por turno para explicar diferencias
- Historial completo de todas las sesiones

✅ **Control de Cajeros**
- Saber exactamente cuándo abrió/cerró cada uno
- Quién registró cada venta
- Cuántos turnos completó hoy

✅ **Detección de Errores**
- Diferencias calculadas automáticamente
- Alertas visuales si hay problemas
- Facilita auditorías

✅ **Seguridad**
- No se puede vender sin caja abierta
- No se pueden abrir 2 cajas simultáneas
- Datos atados a sesión específica

✅ **Reportes**
- Ver rentabilidad por turno
- Comparar turnos diferentes
- Estadísticas por cajero
- Histórico completo

---

## 🔐 Seguridad Implementada

✅ Autenticación JWT en todos los endpoints  
✅ Validación de usuario en acciones  
✅ Encriptación de contraseñas (bcrypt)  
✅ Validación de parámetros  
✅ Prevención de múltiples sesiones  
✅ Auditoría de cambios  

---

## 📝 Notas Técnicas

- **Database**: SQL Server con sqlcmd
- **API**: RESTful con parámetros named (@param)
- **Frontend**: React Hooks + TypeScript
- **Styling**: Tailwind CSS (responsive)
- **Estado**: Local component state
- **Autenticación**: JWT Bearer tokens

---

## 🎉 Conclusión

✅ **Módulo de Arqueo Implementado**
- Totalmente funcional
- Con tests que validan
- Integrado con ventas
- Documentado completamente
- Listo para producción

Sistema gastronómico profesional con control de turnos real.

🍗 **TheGoat - Sistema de Rotisería: ¡Listo para operar!** 🍗
