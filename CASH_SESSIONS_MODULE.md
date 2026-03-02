# 💰 Cash Session Module - Arqueo de Caja por Turnos

## Descripción General

El módulo de arqueo de caja implementa un sistema de gestión de turnos (cash sessions) que permite:

✅ **Abrir caja** al iniciar un turno con monto inicial  
✅ **Registrar ventas** asociadas a la sesión abierta  
✅ **Cerrar caja** al finalizar el turno y calcular diferencias  
✅ **Soportar turnos cruzando medianoche** (no por día)  
✅ **Generar reportes** de arqueo por turno  

---

## Arquitectura

### Base de Datos

**Tabla: CashSessions**
```sql
- Id (PK, int)
- UserId (FK → Users)
- Status ('OPEN' | 'CLOSED')
- OpeningAmount (decimal) - Monto inicial del turno
- ClosingAmount (decimal) - Monto contado real al cerrar
- ExpectedAmount (decimal) - Apertura + Ventas del turno
- Difference (decimal) - ClosingAmount - ExpectedAmount
- OpenedAt (datetime)
- ClosedAt (datetime)
- Notes (nvarchar) - Observaciones del turno
- CreatedAt (datetime)
```

**Relación con Sales:**
- `Sales.CashSessionId` → Cada venta se vincula a su sesión de caja

---

## Flujo de Uso

### 1. **Login del Cajero**
```
Usuario: cajero
Contraseña: admin123
```

### 2. **Pantalla de Apertura de Caja**
Si **NO hay sesión abierta**:
- Se muestra pantalla de apertura con campo para monto inicial
- Cajero ingresa dinero en caja (ej: $1000)
- Click en "Abrir Caja"
- Se crea `CashSession` con Status='OPEN'

### 3. **Durante el Turno**
- Cajero registra ventas normalmente
- Cada venta se guarda con `CashSessionId` actual
- Ejemplo: Hamburguesa $50, Pollo $30, Total: $80

### 4. **Cierre de Turno**
- Click en botón "🔐 Cerrar Turno"
- Modal con:
  - Monto de apertura (informativo)
  - Monto esperado = Apertura + ΣVentas
  - Campo para ingresar monto contado real
  - Campo para notas (opcional)
- Sistema calcula:
  - `Difference = ClosingAmount - ExpectedAmount`
- Resultado:
  - ✅ Si Difference = 0: Perfectamente cuadrado
  - ⚠️ Si Difference > 0: Falta dinero
  - ✅ Si Difference > 0: Sobra dinero

---

## API Endpoints

### **GET `/cash/current`** (Autenticado)
Obtiene la sesión abierta actual del usuario

**Respuesta:**
```json
{
  "Id": 1,
  "UserId": 1,
  "Status": "OPEN",
  "OpeningAmount": "1000.00",
  "ClosingAmount": null,
  "ExpectedAmount": null,
  "Difference": null,
  "OpenedAt": "2026-03-01T10:30:00",
  "ClosedAt": null,
  "Notes": null
}
```

---

### **POST `/cash/open`** (Autenticado)
Abre una nueva sesión de caja

**Body:**
```json
{
  "openingAmount": 1000
}
```

**Respuesta:**
```json
{
  "Id": 1,
  "Status": "OPEN",
  "OpeningAmount": "1000.00",
  "OpenedAt": "2026-03-01T10:30:00"
}
```

**Validaciones:**
- No debe haber otra sesión abierta para el usuario
- `openingAmount` debe ser >= 0

---

### **POST `/cash/close`** (Autenticado)
Cierra la sesión actual y calcula diferencias

**Body:**
```json
{
  "cashSessionId": 1,
  "closingAmount": 1080,
  "notes": "Perfect shift"
}
```

**Respuesta:**
```json
{
  "Id": 1,
  "Status": "CLOSED",
  "OpeningAmount": "1000.00",
  "ClosingAmount": "1080.00",
  "ExpectedAmount": "1080.00",
  "Difference": "0.00",
  "totalSales": "80.00",
  "ClosedAt": "2026-03-01T18:45:00"
}
```

**Lógica:**
```
ExpectedAmount = OpeningAmount + SUM(Sales.TotalAmount WHERE CashSessionId)
Difference = ClosingAmount - ExpectedAmount
```

---

### **GET `/cash/history/:userId`** (Autenticado)
Historial de todas las sesiones del usuario

**Respuesta:**
```json
[
  {
    "Id": 1,
    "Status": "CLOSED",
    "OpeningAmount": "1000.00",
    "ClosingAmount": "1080.00",
    "Difference": "0.00",
    "OpenedAt": "2026-03-01T10:30:00",
    "ClosedAt": "2026-03-01T18:45:00"
  }
]
```

---

### **GET `/cash/:sessionId`** (Autenticado)
Detalles de una sesión incluyendo todas sus ventas

**Respuesta:**
```json
{
  "session": {
    "Id": 1,
    "Status": "CLOSED",
    "OpeningAmount": "1000.00",
    "ClosingAmount": "1080.00",
    "ExpectedAmount": "1080.00",
    "Difference": "0.00"
  },
  "sales": [
    {
      "Id": 1,
      "SaleNumber": "SALE-0000001",
      "TotalAmount": "50.00",
      "CreatedAt": "2026-03-01T11:00:00",
      "Username": "cajero"
    },
    {
      "Id": 2,
      "SaleNumber": "SALE-0000002",
      "TotalAmount": "30.00",
      "CreatedAt": "2026-03-01T12:15:00",
      "Username": "cajero"
    }
  ],
  "totalSales": "80.00"
}
```

---

## Componentes Frontend

### **OpenCashScreen.tsx**
Pantalla que se muestra cuando NO hay sesión abierta
- Grande, visible, invita a abrir caja
- Abre modal `CashDrawerModal` al hacer click

### **CashDrawerModal.tsx**
Modal para ingresar monto de apertura
- Campo de entrada para monto inicial
- Validación de monto
- Manejo de errores

### **CloseCashDrawerModal.tsx**
Modal para cerrar sesión y calcular diferencia
- Muestra monto de apertura (informativo)
- Campo para monto contado real
- Campo opcional de notas
- Resultado en tiempo real del cálculo
- Moestra diferencia en color (✅ si está ok)

### **Sales.tsx (actualizado)**
- Verifica sesión al cargar
- Si no hay sesión: muestra `OpenCashScreen`
- Si hay sesión: muestra interfaz de ventas normal
- Botón "Cerrar Turno" en header

---

## Flujo Técnico Diagramado

```
┌─────────────────────────────────────────────────────────────┐
│                    Login (cajero / admin123)                 │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              GET /cash/current                               │
│              ¿Hay sesión abierta?                            │
└────┬─────────────────────────────┬─────────────────────────┘
     │                             │
   NO║                             │ SI
     │                             │
     ▼                             ▼
┌──────────────────────┐    ┌──────────────────────┐
│  OpenCashScreen      │    │ Sales Interface      │
│  "Abrir Caja"        │    │ (Ventas normales)    │
└──────────┬───────────┘    │ + Botón "Cerrar"     │
           │                └─────────┬────────────┘
           │                          │
           │ POST /cash/open          │ POST /sales (incluye CashSessionId)
           │ openingAmount: 1000      │
           │                          │
           ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Turno ACTIVO                                     │
│              Status: OPEN                                     │
│              Ventas se registran con CashSessionId            │
└────────┬────────────────────────────────────────────────────┘
         │
         │ Usuario click "Cerrar Turno"
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│     CloseCashDrawerModal                                      │
│     Ingresa: closingAmount (1080)                             │
│     Calcula: Difference = 1080 - (1000 + 80) = 0             │
└────────┬────────────────────────────────────────────────────┘
         │
         │ POST /cash/close
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│     CashSession CLOSED                                        │
│     - ClosingAmount: 1080                                     │
│     - ExpectedAmount: 1080                                    │
│     - Difference: 0.00 ✅                                      │
│     - ClosedAt: now                                           │
└────────┬────────────────────────────────────────────────────┘
         │
         │ Redirect a nueva apertura o historial
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              Listo para siguiente turno                       │
│              Volver a GET /cash/current → null               │
│              Se muestra OpenCashScreen nuevamente             │
└─────────────────────────────────────────────────────────────┘
```

---

## Características Principales

✅ **Múltiples turnos por día**
- No limitado a 1 turno/día
- Cada turno es independiente

✅ **Turnos cruzando medianoche**
- Abre a las 22:00 de un día
- Cierra a las 02:00 del siguiente
- Timestamps correctos en DB

✅ **Notas por turno**
- Campo opcional de observaciones
- Útil para diferencias grandes

✅ **Validación completa**
- No permite vender sin caja abierta
- Previene múltiples sesiones abiertas
- Validtodosaciónes de montos

✅ **Reportes e historial**
- Ver historial de todos los turnos
- Ver detalles de ventas por turno
- Reporte de diferencias

---

## Testing

Se incluye `test-cash-sessions.js` que valida:

1. ✅ Login del usuario
2. ✅ Verificar que no hay sesión abierta
3. ✅ Abrir nueva sesión
4. ✅ Verificar sesión abierta
5. ✅ Crear producto de prueba
6. ✅ Registrar venta durante la sesión
7. ✅ Cerrar sesión (con diferencia = 0)
8. ✅ Verificar sesión cerrada
9. ✅ Ver detalles de todas las ventas de la sesión

**Todos los tests pasan ✅**

---

## Base de Datos - Cambios Realizados

```sql
-- Tabla nueva
CREATE TABLE CashSessions (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL REFERENCES Users(Id),
    Status NVARCHAR(20) DEFAULT 'OPEN',
    OpeningAmount DECIMAL(18,2) NOT NULL,
    ClosingAmount DECIMAL(18,2) NULL,
    ExpectedAmount DECIMAL(18,2) NULL,
    Difference DECIMAL(18,2) NULL,
    OpenedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ClosedAt DATETIME NULL,
    Notes NVARCHAR(500) NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Alteración a tabla existente
ALTER TABLE Sales ADD CashSessionId INT NULL REFERENCES CashSessions(Id);
```

---

## Seguridad

✅ Autenticación middleware en todos los endpoints  
✅ Validación de que usuario solo ve sus propias sesiones  
✅ Nuevas sesiones solo pueden abrirse si no hay otra abierta  
✅ Solo se pueden cerrar sesiones del usuario autenticado  
✅ Ventas requieren sesión abierta del usuario

---

## Próximas Mejoras Sugeridas

1. 📊 Dashboard con estadísticas por turno
2. 💾 Exportar reportes de arqueo a PDF
3. 🔔 Alertas cuando hay diferencias grandes
4. 👥 Admin pueda ver sesiones de otros cajeros
5. 🔐 Historial de quien abrió/cerró cada caja
6. 📱 Foto/evidencia del conteo
7. 🚫 Permisos especiales para abrir múltiples cajas
