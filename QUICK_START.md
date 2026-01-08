# 🚀 Quick Start Guide - Mini-ERP Backend

## ✅ Prerequisites Checklist

- ✅ Node.js installed (v14 or higher)
- ✅ MongoDB Atlas account (or local MongoDB)
- ✅ Postman or any API testing tool

## 📦 Installation Complete!

All dependencies have been installed. Your project is ready to run.

## 🎯 Start the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Expected output:

```
=================================
🚀 Mini-ERP API Server
=================================
📍 Environment: development
🌐 Server running on port: 5000
🔗 API Base URL: http://localhost:5000/api
💚 Health Check: http://localhost:5000/health
=================================
✅ MongoDB Connected: <your-cluster>
📦 Database: mini-erp
```

## 🧪 Test the API

### 1. Health Check (No Authentication Required)

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "status": "success",
  "message": "Mini-ERP API is running",
  "timestamp": "2026-01-08T10:00:00.000Z"
}
```

### 2. Register First Admin User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@erp.com",
    "password": "admin123",
    "role": "Admin"
  }'
```

**Save the token from the response!**

### 3. Use Postman for Full Testing

Open Postman and import the requests from `POSTMAN_GUIDE.md`

---

## 📋 Complete Testing Workflow

### Phase 1: Setup (Use Postman)

1. **Register Admin User**

   ```
   POST /api/auth/register
   Body: { "name": "Admin", "email": "admin@erp.com", "password": "admin123", "role": "Admin" }
   ```

   **→ Save the token!**

2. **Login (to get fresh token)**

   ```
   POST /api/auth/login
   Body: { "email": "admin@erp.com", "password": "admin123" }
   ```

3. **Set Authorization Header**
   ```
   Authorization: Bearer <your-token>
   ```
   Use this header for ALL subsequent requests.

---

### Phase 2: Create Suppliers

```
POST /api/suppliers
Authorization: Bearer <token>
Body:
{
  "supplierName": "ABC Steel Co.",
  "contactPerson": "John Smith",
  "email": "john@abcsteel.com",
  "phone": "+1-555-0100",
  "address": {
    "street": "123 Industrial Ave",
    "city": "Chicago",
    "state": "IL",
    "country": "USA",
    "postalCode": "60601"
  },
  "paymentTerms": "Net 30",
  "rating": 5
}
```

**→ Save the supplier ID from response!**

---

### Phase 3: Create Inventory Items

```
POST /api/inventory
Authorization: Bearer <token>
Body:
{
  "itemName": "Steel Sheet - Grade A",
  "sku": "STL-A-001",
  "description": "Premium quality steel sheet",
  "quantity": 100,
  "unitPrice": 25.50,
  "category": "Raw Material",
  "reorderLevel": 20,
  "supplier": "<supplier-id-from-phase-2>"
}
```

**→ Save the inventory item ID!**

---

### Phase 4: Create Purchase Order

```
POST /api/purchase-orders
Authorization: Bearer <token>
Body:
{
  "supplier": "<supplier-id>",
  "items": [
    {
      "inventory": "<inventory-id>",
      "quantity": 50,
      "unitPrice": 25.00
    }
  ],
  "expectedDeliveryDate": "2026-01-20",
  "notes": "Urgent order for Q1 production"
}
```

Response will show:

- Auto-generated PO number: `PO-202601-0001`
- Status: `Draft`
- Total amount: `1250` (50 × 25.00)

**→ Save the PO ID!**

---

### Phase 5: Approve Purchase Order

```
PATCH /api/purchase-orders/<po-id>/status
Authorization: Bearer <token>
Body:
{
  "status": "Approved"
}
```

---

### Phase 6: 🎯 TEST AUTO STOCK UPDATE (Critical Feature)

#### Step 1: Check Current Inventory Quantity

```
GET /api/inventory/<inventory-id>
Authorization: Bearer <token>
```

Response shows: `"quantity": 100`

#### Step 2: Mark PO as Received

```
PATCH /api/purchase-orders/<po-id>/status
Authorization: Bearer <token>
Body:
{
  "status": "Received"
}
```

**Watch for success message:**

```json
{
  "status": "success",
  "message": "Purchase order marked as received and inventory updated successfully"
}
```

#### Step 3: Verify Inventory Auto-Update

```
GET /api/inventory/<inventory-id>
Authorization: Bearer <token>
```

**Expected result:**

```json
{
  "quantity": 150 // 100 (original) + 50 (from PO) = 150 ✅
}
```

**🎉 SUCCESS! The inventory was automatically updated when PO status became "Received"**

---

## 🔍 Additional Tests

### Test Low Stock Alert

```
GET /api/inventory/alerts/low-stock
Authorization: Bearer <token>
```

### Test Search & Filtering

```
GET /api/inventory?search=steel&category=Raw%20Material&page=1&limit=10
Authorization: Bearer <token>
```

### Test RBAC (Create Manager and Staff users)

1. **Register Manager**

   ```
   POST /api/auth/register
   Body: { "name": "Manager", "email": "manager@erp.com", "password": "manager123", "role": "Manager" }
   ```

2. **Register Staff**

   ```
   POST /api/auth/register
   Body: { "name": "Staff", "email": "staff@erp.com", "password": "staff123", "role": "Staff" }
   ```

3. **Test Staff Permissions**
   - Login as Staff
   - Try to create inventory: `POST /api/inventory`
   - **Expected**: `403 Forbidden - You do not have permission to perform this action`

---

## 🐛 Troubleshooting

### Server won't start?

- Check `.env` file has correct MongoDB URI
- Ensure MongoDB Atlas IP whitelist includes your IP (or use 0.0.0.0/0 for development)
- Check port 5000 is not in use: `netstat -ano | findstr :5000`

### Database connection failed?

- Verify MongoDB URI format
- Check network connection
- Ensure database user credentials are correct
- Check MongoDB Atlas cluster status

### Token errors?

- Ensure you're using: `Authorization: Bearer <token>` (note the space after Bearer)
- Token expires after 7 days - login again to get new token
- Check JWT_SECRET is set in `.env`

### CORS errors?

- Update `ALLOWED_ORIGINS` in `.env` to include your frontend URL

---

## 📊 API Response Status Codes

| Code | Meaning                    | Example            |
| ---- | -------------------------- | ------------------ |
| 200  | Success (GET, PUT, DELETE) | Item retrieved     |
| 201  | Created (POST)             | User registered    |
| 400  | Bad Request                | Validation error   |
| 401  | Unauthorized               | Invalid token      |
| 403  | Forbidden                  | Insufficient role  |
| 404  | Not Found                  | Item doesn't exist |
| 409  | Conflict                   | Duplicate SKU      |
| 500  | Server Error               | Database error     |

---

## 🎓 Learn More

- **Full API Documentation**: See `POSTMAN_GUIDE.md`
- **Project Structure**: See `PROJECT_STRUCTURE.md`
- **Architecture Overview**: See `README.md`

---

## 🎯 Key Business Logic Highlight

### Auto Stock Update Workflow

```
Purchase Order Status Change
        ↓
  Status = "Received"?
        ↓
      [YES]
        ↓
   Start Transaction
        ↓
   For Each PO Item:
     - Get Inventory Item
     - Add PO quantity to Inventory quantity
     - Update inventory.updatedBy
     - Save to database
        ↓
   Set PO.actualDeliveryDate = NOW
   Set PO.receivedBy = Current User
   Save PO
        ↓
   Commit Transaction
        ↓
   Return Success Response
```

**Transaction Safety:**

- If ANY inventory update fails, ALL changes are rolled back
- Database consistency is guaranteed
- No partial updates possible

---

## ✅ You're Ready!

Your Industrial-Grade Mini-ERP API is fully set up and ready to use.

**Start the server and begin testing! 🚀**

```bash
npm run dev
```
