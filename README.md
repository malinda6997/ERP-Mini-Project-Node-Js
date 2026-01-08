# Mini-ERP Backend API

Industrial-Grade Mini-ERP API built with Node.js, Express.js, and MongoDB.

## Features

- 🔐 JWT Authentication with RBAC (Admin, Manager, Staff)
- 📦 Inventory Management
- 🏢 Supplier Management
- 📋 Purchase Order Workflow with Auto Stock Updates
- ✅ Request Validation with Joi
- 🛡️ Security Best Practices (Helmet, Rate Limiting)
- 🎯 Consistent API Response Format

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Update the `.env` file with your configurations.

### 3. Run the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Inventory

- `GET /api/inventory` - Get all items
- `GET /api/inventory/:id` - Get single item
- `POST /api/inventory` - Create item (Admin/Manager)
- `PUT /api/inventory/:id` - Update item (Admin/Manager)
- `DELETE /api/inventory/:id` - Delete item (Admin)

### Suppliers

- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get single supplier
- `POST /api/suppliers` - Create supplier (Admin/Manager)
- `PUT /api/suppliers/:id` - Update supplier (Admin/Manager)
- `DELETE /api/suppliers/:id` - Delete supplier (Admin)

### Purchase Orders

- `GET /api/purchase-orders` - Get all POs
- `GET /api/purchase-orders/:id` - Get single PO
- `POST /api/purchase-orders` - Create PO (Admin/Manager)
- `PUT /api/purchase-orders/:id` - Update PO (Admin/Manager)
- `PATCH /api/purchase-orders/:id/status` - Update PO status (Admin/Manager)
- `DELETE /api/purchase-orders/:id` - Delete PO (Admin)

## Response Format

All API responses follow this format:

```json
{
  "status": "success",
  "data": {},
  "message": "Operation completed successfully"
}
```

## Default Admin Credentials

Create an admin user via registration or MongoDB directly with role: "Admin".

## Tech Stack

- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- Joi Validation
- Helmet & CORS
