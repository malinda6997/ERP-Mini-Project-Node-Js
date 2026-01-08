# Mini-ERP API - Postman Testing Guide

## Base URL

```
http://localhost:5000/api
```

## Response Format

All responses follow this consistent format:

```json
{
  "status": "success" | "error",
  "data": { /* response data */ },
  "message": "Descriptive message"
}
```

---

## 1. AUTHENTICATION ENDPOINTS

### 1.1 Register User

```
POST /api/auth/register
Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Admin"  // Optional: Admin | Manager | Staff (default: Staff)
}

Response (201):
{
  "status": "success",
  "data": {
    "user": {
      "id": "65abc123...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

### 1.2 Login User

```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "status": "success",
  "data": {
    "user": {
      "id": "65abc123...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### 1.3 Get Current User Profile

```
GET /api/auth/me
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": {
    "user": {
      "_id": "65abc123...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Admin",
      "isActive": true,
      "createdAt": "2026-01-08T10:00:00.000Z"
    }
  },
  "message": "User profile retrieved successfully"
}
```

---

## 2. INVENTORY ENDPOINTS

### 2.1 Create Inventory Item

```
POST /api/inventory
Authorization: Bearer <token>
Content-Type: application/json

Required Role: Admin or Manager

Body:
{
  "itemName": "Steel Sheet",
  "sku": "STL-001",
  "description": "Premium quality steel sheet",
  "quantity": 100,
  "unitPrice": 25.50,
  "category": "Raw Material",  // Options: Raw Material, Finished Goods, Components, Supplies, Other
  "reorderLevel": 20,
  "supplier": "65xyz789..."  // Optional: Supplier ID
}

Response (201):
{
  "status": "success",
  "data": {
    "item": {
      "_id": "65def456...",
      "itemName": "Steel Sheet",
      "sku": "STL-001",
      "description": "Premium quality steel sheet",
      "quantity": 100,
      "unitPrice": 25.5,
      "category": "Raw Material",
      "reorderLevel": 20,
      "isLowStock": false,
      "createdAt": "2026-01-08T10:00:00.000Z"
    }
  },
  "message": "Inventory item created successfully"
}
```

### 2.2 Get All Inventory Items

```
GET /api/inventory?page=1&limit=10&category=Raw%20Material&search=steel&isLowStock=false
Authorization: Bearer <token>

Query Parameters (All Optional):
- page: Page number (default: 1)
- limit: Items per page (default: 10)
- category: Filter by category
- search: Search in itemName or SKU
- isLowStock: true/false
- sortBy: Field to sort by (default: createdAt)
- order: asc/desc (default: desc)

Response (200):
{
  "status": "success",
  "data": {
    "items": [ /* array of items */ ],
    "pagination": {
      "total": 50,
      "page": 1,
      "pages": 5
    }
  },
  "message": "Inventory items retrieved successfully"
}
```

### 2.3 Get Single Inventory Item

```
GET /api/inventory/:id
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": {
    "item": { /* item details with populated supplier and creator */ }
  },
  "message": "Inventory item retrieved successfully"
}
```

### 2.4 Update Inventory Item

```
PUT /api/inventory/:id
Authorization: Bearer <token>
Content-Type: application/json

Required Role: Admin or Manager

Body: (All fields optional, provide only what needs to be updated)
{
  "itemName": "Premium Steel Sheet",
  "quantity": 150,
  "unitPrice": 27.00
}

Response (200):
{
  "status": "success",
  "data": {
    "item": { /* updated item */ }
  },
  "message": "Inventory item updated successfully"
}
```

### 2.5 Delete Inventory Item (Soft Delete)

```
DELETE /api/inventory/:id
Authorization: Bearer <token>

Required Role: Admin

Response (200):
{
  "status": "success",
  "data": {},
  "message": "Inventory item deleted successfully"
}
```

### 2.6 Get Low Stock Items

```
GET /api/inventory/alerts/low-stock
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": {
    "items": [ /* array of low stock items */ ],
    "count": 5
  },
  "message": "Low stock items retrieved successfully"
}
```

---

## 3. SUPPLIER ENDPOINTS

### 3.1 Create Supplier

```
POST /api/suppliers
Authorization: Bearer <token>
Content-Type: application/json

Required Role: Admin or Manager

Body:
{
  "supplierName": "ABC Manufacturing Co.",
  "contactPerson": "Jane Smith",
  "email": "jane@abcmanufacturing.com",
  "phone": "+1-555-0123",
  "address": {
    "street": "123 Industrial Ave",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001"
  },
  "taxId": "12-3456789",
  "paymentTerms": "Net 30",  // Options: Net 15, Net 30, Net 45, Net 60, Due on Receipt, Custom
  "rating": 4,  // 1-5
  "notes": "Reliable supplier with good track record"
}

Response (201):
{
  "status": "success",
  "data": {
    "supplier": { /* supplier details */ }
  },
  "message": "Supplier created successfully"
}
```

### 3.2 Get All Suppliers

```
GET /api/suppliers?page=1&limit=10&search=ABC&isActive=true
Authorization: Bearer <token>

Query Parameters (All Optional):
- page: Page number
- limit: Items per page
- search: Search in supplierName, email, or contactPerson
- isActive: true/false
- sortBy: Field to sort by (default: supplierName)
- order: asc/desc (default: asc)

Response (200):
{
  "status": "success",
  "data": {
    "suppliers": [ /* array of suppliers */ ],
    "pagination": { /* pagination info */ }
  },
  "message": "Suppliers retrieved successfully"
}
```

### 3.3 Get Single Supplier

```
GET /api/suppliers/:id
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": {
    "supplier": { /* supplier details */ }
  },
  "message": "Supplier retrieved successfully"
}
```

### 3.4 Update Supplier

```
PUT /api/suppliers/:id
Authorization: Bearer <token>
Content-Type: application/json

Required Role: Admin or Manager

Body: (Provide fields to update)
{
  "phone": "+1-555-9999",
  "rating": 5
}

Response (200):
{
  "status": "success",
  "data": {
    "supplier": { /* updated supplier */ }
  },
  "message": "Supplier updated successfully"
}
```

### 3.5 Delete Supplier (Soft Delete)

```
DELETE /api/suppliers/:id
Authorization: Bearer <token>

Required Role: Admin

Response (200):
{
  "status": "success",
  "data": {},
  "message": "Supplier deleted successfully"
}
```

---

## 4. PURCHASE ORDER ENDPOINTS

### 4.1 Create Purchase Order

```
POST /api/purchase-orders
Authorization: Bearer <token>
Content-Type: application/json

Required Role: Admin or Manager

Body:
{
  "supplier": "65xyz789...",  // Supplier ID
  "items": [
    {
      "inventory": "65def456...",  // Inventory Item ID
      "quantity": 50,
      "unitPrice": 25.00  // Optional: defaults to item's unit price
    },
    {
      "inventory": "65def457...",
      "quantity": 30,
      "unitPrice": 15.50
    }
  ],
  "expectedDeliveryDate": "2026-01-20",
  "notes": "Urgent order for Q1 production"
}

Response (201):
{
  "status": "success",
  "data": {
    "purchaseOrder": {
      "_id": "65ghi890...",
      "poNumber": "PO-202601-0001",  // Auto-generated
      "supplier": { /* supplier details */ },
      "items": [
        {
          "inventory": { /* item details */ },
          "itemName": "Steel Sheet",
          "sku": "STL-001",
          "quantity": 50,
          "unitPrice": 25,
          "totalPrice": 1250
        }
      ],
      "totalAmount": 1715,  // Auto-calculated
      "status": "Draft",
      "orderDate": "2026-01-08T10:00:00.000Z",
      "expectedDeliveryDate": "2026-01-20T00:00:00.000Z"
    }
  },
  "message": "Purchase order created successfully"
}
```

### 4.2 Get All Purchase Orders

```
GET /api/purchase-orders?status=Pending&page=1&limit=10
Authorization: Bearer <token>

Query Parameters (All Optional):
- status: Draft, Pending, Approved, Received, Cancelled
- supplier: Supplier ID
- search: Search in poNumber or notes
- page: Page number
- limit: Items per page
- sortBy: Field to sort by (default: orderDate)
- order: asc/desc (default: desc)

Response (200):
{
  "status": "success",
  "data": {
    "purchaseOrders": [ /* array of POs */ ],
    "pagination": { /* pagination info */ }
  },
  "message": "Purchase orders retrieved successfully"
}
```

### 4.3 Get Single Purchase Order

```
GET /api/purchase-orders/:id
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": {
    "purchaseOrder": { /* detailed PO with all populated references */ }
  },
  "message": "Purchase order retrieved successfully"
}
```

### 4.4 Update Purchase Order

```
PUT /api/purchase-orders/:id
Authorization: Bearer <token>
Content-Type: application/json

Required Role: Admin or Manager

Note: Cannot update orders with status "Received" or "Cancelled"

Body: (Provide fields to update)
{
  "expectedDeliveryDate": "2026-01-25",
  "notes": "Updated delivery date as requested"
}

Response (200):
{
  "status": "success",
  "data": {
    "purchaseOrder": { /* updated PO */ }
  },
  "message": "Purchase order updated successfully"
}
```

### 4.5 Update Purchase Order Status (CRITICAL - Auto Stock Update)

```
PATCH /api/purchase-orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

Required Role: Admin or Manager

Body:
{
  "status": "Received"  // Options: Draft, Pending, Approved, Received, Cancelled
}

⚠️ IMPORTANT: When status is set to "Received":
   - Inventory quantities are AUTOMATICALLY INCREMENTED
   - actualDeliveryDate is set to current date
   - receivedBy is set to current user
   - This operation is wrapped in a database transaction
   - If any inventory update fails, the entire operation is rolled back

Response (200):
{
  "status": "success",
  "data": {
    "purchaseOrder": {
      /* PO with updated status and inventory items showing new quantities */
    }
  },
  "message": "Purchase order marked as received and inventory updated successfully"
}

Example: If PO has:
  - Item A: quantity 50
  - Item B: quantity 30

When status → "Received":
  - Item A inventory.quantity += 50
  - Item B inventory.quantity += 30
```

### 4.6 Delete Purchase Order

```
DELETE /api/purchase-orders/:id
Authorization: Bearer <token>

Required Role: Admin

Note: Cannot delete orders with status "Received"

Response (200):
{
  "status": "success",
  "data": {},
  "message": "Purchase order deleted successfully"
}
```

---

## 5. ERROR RESPONSES

All errors follow this format:

### 400 Bad Request (Validation Error)

```json
{
  "status": "error",
  "message": "Item name must be at least 2 characters long"
}
```

### 401 Unauthorized

```json
{
  "status": "error",
  "message": "You are not logged in. Please log in to access this resource."
}
```

### 403 Forbidden

```json
{
  "status": "error",
  "message": "You do not have permission to perform this action. Required role: Admin or Manager"
}
```

### 404 Not Found

```json
{
  "status": "error",
  "message": "Inventory item not found"
}
```

### 409 Conflict

```json
{
  "status": "error",
  "message": "A user with this email already exists"
}
```

### 500 Internal Server Error

```json
{
  "status": "error",
  "message": "Internal Server Error"
}
```

---

## 6. TESTING WORKFLOW

### Step 1: Register and Login

```
1. POST /api/auth/register (Create Admin user)
2. Copy the token from response
3. Use token in Authorization header for all subsequent requests
```

### Step 2: Create Suppliers

```
POST /api/suppliers (Create 2-3 suppliers)
```

### Step 3: Create Inventory Items

```
POST /api/inventory (Create items with initial quantity)
Example: Steel Sheet with quantity: 100
```

### Step 4: Create Purchase Order

```
POST /api/purchase-orders
- Reference the supplier ID
- Reference the inventory item IDs
- Set status as "Draft"
```

### Step 5: Update PO Status to Approved

```
PATCH /api/purchase-orders/:id/status
Body: { "status": "Approved" }
```

### Step 6: Mark PO as Received (Test Auto Stock Update)

```
PATCH /api/purchase-orders/:id/status
Body: { "status": "Received" }

Then verify:
GET /api/inventory/:id
Check that the quantity has been incremented by the PO quantity
```

---

## 7. ROLE-BASED ACCESS CONTROL (RBAC)

| Endpoint                | Admin | Manager | Staff |
| ----------------------- | ----- | ------- | ----- |
| Auth (Register/Login)   | ✅    | ✅      | ✅    |
| View Inventory          | ✅    | ✅      | ✅    |
| Create/Update Inventory | ✅    | ✅      | ❌    |
| Delete Inventory        | ✅    | ❌      | ❌    |
| View Suppliers          | ✅    | ✅      | ✅    |
| Create/Update Suppliers | ✅    | ✅      | ❌    |
| Delete Suppliers        | ✅    | ❌      | ❌    |
| View Purchase Orders    | ✅    | ✅      | ✅    |
| Create/Update POs       | ✅    | ✅      | ❌    |
| Update PO Status        | ✅    | ✅      | ❌    |
| Delete POs              | ✅    | ❌      | ❌    |

---

## 8. IMPORTANT NOTES

1. **JWT Token**: Save the token from login and use it in the Authorization header: `Bearer <token>`
2. **MongoDB ObjectIDs**: Use valid 24-character hex strings for IDs
3. **Date Format**: Use ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss.sssZ`
4. **SKU Format**: Must be uppercase letters, numbers, and hyphens only (e.g., `STL-001`)
5. **Transaction Safety**: PO status update to "Received" uses database transactions for data integrity
6. **Soft Deletes**: Delete operations set `isActive: false` instead of removing records
7. **Pagination**: Default page size is 10, maximum is 100
8. **Rate Limiting**: 100 requests per 15 minutes per IP address

---

## 9. POSTMAN COLLECTION VARIABLES

Set these as Postman environment variables:

```
base_url: http://localhost:5000/api
token: <paste-token-after-login>
user_id: <paste-user-id-after-login>
supplier_id: <paste-supplier-id-after-creation>
inventory_id: <paste-inventory-id-after-creation>
po_id: <paste-po-id-after-creation>
```

Usage in Postman:

- URL: `{{base_url}}/inventory`
- Header: `Authorization: Bearer {{token}}`
