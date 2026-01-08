# 📁 Mini-ERP Backend - Project Structure

```
ERP Backend/
│
├── 📄 server.js                    # Main server entry point
├── 📄 app.js                       # Express app configuration
├── 📄 package.json                 # Dependencies and scripts
├── 📄 .env                         # Environment variables (DO NOT COMMIT)
├── 📄 .gitignore                   # Git ignore rules
├── 📄 README.md                    # Project documentation
├── 📄 POSTMAN_GUIDE.md            # Comprehensive Postman testing guide
│
├── 📁 config/                      # Configuration files
│   └── 📄 database.js             # MongoDB connection setup
│
├── 📁 models/                      # Mongoose schemas
│   ├── 📄 User.js                 # User model (with password hashing)
│   ├── 📄 Inventory.js            # Inventory model (SKU, quantity, pricing)
│   ├── 📄 Supplier.js             # Supplier model
│   └── 📄 PurchaseOrder.js        # Purchase Order model (auto-stock update logic)
│
├── 📁 controllers/                 # Business logic handlers
│   ├── 📄 authController.js       # Authentication (register, login, JWT)
│   ├── 📄 inventoryController.js  # Inventory CRUD operations
│   ├── 📄 supplierController.js   # Supplier CRUD operations
│   └── 📄 purchaseOrderController.js  # PO CRUD + auto-stock update
│
├── 📁 routes/                      # API route definitions
│   ├── 📄 authRoutes.js           # Auth endpoints
│   ├── 📄 inventoryRoutes.js      # Inventory endpoints
│   ├── 📄 supplierRoutes.js       # Supplier endpoints
│   └── 📄 purchaseOrderRoutes.js  # Purchase Order endpoints
│
├── 📁 middleware/                  # Custom middleware
│   ├── 📄 auth.js                 # JWT authentication + RBAC (Admin, Manager, Staff)
│   ├── 📄 validation.js           # Joi validation middleware
│   └── 📄 errorHandler.js         # Global error handler
│
├── 📁 validators/                  # Joi validation schemas
│   ├── 📄 authValidator.js        # Auth validation schemas
│   ├── 📄 inventoryValidator.js   # Inventory validation schemas
│   ├── 📄 supplierValidator.js    # Supplier validation schemas
│   └── 📄 purchaseOrderValidator.js  # Purchase Order validation schemas
│
└── 📁 utils/                       # Helper functions and utilities
    ├── 📄 errors.js               # Custom error classes (AppError, ValidationError, etc.)
    ├── 📄 responseHandler.js      # Standard response formatters
    └── 📄 asyncHandler.js         # Async/await error wrapper

```

## 📊 Module Overview

### 🔐 Authentication Module

- **Files**: `authController.js`, `authRoutes.js`, `User.js`, `auth.js`
- **Features**:
  - User registration with password hashing (bcrypt)
  - JWT-based authentication
  - Role-Based Access Control (RBAC): Admin, Manager, Staff
  - Protected routes middleware
  - Password update functionality

### 📦 Inventory Module

- **Files**: `inventoryController.js`, `inventoryRoutes.js`, `Inventory.js`
- **Features**:
  - CRUD operations for inventory items
  - SKU-based tracking
  - Quantity and pricing management
  - Low stock alerts
  - Category-based filtering
  - Search and pagination

### 🏢 Supplier Module

- **Files**: `supplierController.js`, `supplierRoutes.js`, `Supplier.js`
- **Features**:
  - CRUD operations for suppliers
  - Contact information management
  - Address and tax ID tracking
  - Payment terms configuration
  - Supplier rating system

### 📋 Purchase Order Module (CORE FEATURE)

- **Files**: `purchaseOrderController.js`, `purchaseOrderRoutes.js`, `PurchaseOrder.js`
- **Features**:
  - CRUD operations for purchase orders
  - Auto-generated PO numbers (PO-YYYYMM-XXXX)
  - Multiple items per PO
  - Status workflow: Draft → Pending → Approved → Received → Cancelled
  - **🎯 AUTO STOCK UPDATE**: When PO status → "Received", inventory quantities automatically increment
  - Transaction-based updates for data integrity
  - Price calculation and total amount

## 🔄 Data Flow: Purchase Order → Inventory Update

```
1. Create Purchase Order
   ↓
   Status: "Draft"
   ↓
2. Update Status: "Approved"
   ↓
   Status: "Approved"
   ↓
3. Update Status: "Received"  ← 🎯 CRITICAL STEP
   ↓
   ├─→ actualDeliveryDate = NOW
   ├─→ receivedBy = current user
   ├─→ FOR EACH item in PO:
   │      inventory.quantity += item.quantity
   │      inventory.updatedBy = current user
   └─→ Status: "Received"
```

## 🛡️ Security Features

1. **Helmet**: Security headers
2. **CORS**: Configurable cross-origin requests
3. **Rate Limiting**: 100 requests per 15 minutes per IP
4. **JWT Authentication**: Secure token-based auth
5. **Password Hashing**: bcrypt with cost factor 12
6. **Input Validation**: Joi schemas for all endpoints
7. **RBAC**: Role-based access control
8. **Error Handling**: Global error handler with consistent responses

## 🎯 Consistent API Response Format

### Success Response

```json
{
  "status": "success",
  "data": {
    /* response data */
  },
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Error description"
}
```

## 📝 HTTP Status Codes Used

- **200**: OK (GET, PUT, PATCH, DELETE success)
- **201**: Created (POST success)
- **400**: Bad Request (Validation errors)
- **401**: Unauthorized (Authentication required)
- **403**: Forbidden (Insufficient permissions)
- **404**: Not Found (Resource doesn't exist)
- **409**: Conflict (Duplicate resource)
- **500**: Internal Server Error

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Run in development mode (with nodemon)
npm run dev

# Run in production mode
npm start
```

## 🔧 Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mini-erp
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
```

## 📚 Dependencies

### Core Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **joi**: Request validation
- **dotenv**: Environment variables
- **cors**: Cross-origin resource sharing
- **helmet**: Security headers
- **express-rate-limit**: Rate limiting

### Dev Dependencies

- **nodemon**: Auto-restart on file changes

## 🎓 Key Design Patterns

1. **MVC Architecture**: Models, Controllers, Routes separation
2. **Middleware Pattern**: Reusable auth, validation, error handling
3. **Repository Pattern**: Mongoose models as data access layer
4. **Factory Pattern**: Error classes for consistent error handling
5. **Transaction Pattern**: Database transactions for PO → Inventory updates

## 🧪 Testing with Postman

Refer to `POSTMAN_GUIDE.md` for:

- Complete API documentation
- Request/response examples
- Authentication setup
- Testing workflows
- RBAC testing scenarios
- Error response examples
