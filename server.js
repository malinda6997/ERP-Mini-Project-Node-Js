require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/database");

/**
 * Server Configuration and Startup
 */

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Connect to database
connectDB();

// Server Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Start server
const server = app.listen(PORT, () => {
  console.log("=================================");
  console.log("🚀 Mini-ERP API Server");
  console.log("=================================");
  console.log(`📍 Environment: ${NODE_ENV}`);
  console.log(`🌐 Server running on port: ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log("=================================");
  console.log("📚 Available Routes:");
  console.log("   - POST   /api/auth/register");
  console.log("   - POST   /api/auth/login");
  console.log("   - GET    /api/auth/me");
  console.log("   - GET    /api/inventory");
  console.log("   - POST   /api/inventory");
  console.log("   - GET    /api/suppliers");
  console.log("   - POST   /api/suppliers");
  console.log("   - GET    /api/purchase-orders");
  console.log("   - POST   /api/purchase-orders");
  console.log("   - PATCH  /api/purchase-orders/:id/status");
  console.log("=================================");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
