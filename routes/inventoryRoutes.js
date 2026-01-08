const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const { protect, restrictTo } = require("../middleware/auth");
const { validate, validateParams } = require("../middleware/validation");
const {
  inventorySchema,
  idSchema,
} = require("../validators/inventoryValidator");

/**
 * Inventory Routes
 */

// @route   GET /api/inventory/alerts/low-stock
// @desc    Get low stock items
// @access  Private
router.get("/alerts/low-stock", protect, inventoryController.getLowStockItems);

// @route   GET /api/inventory
// @desc    Get all inventory items
// @access  Private
router.get("/", protect, inventoryController.getAllInventory);

// @route   GET /api/inventory/:id
// @desc    Get single inventory item
// @access  Private
router.get(
  "/:id",
  protect,
  validateParams(idSchema),
  inventoryController.getInventoryById
);

// @route   POST /api/inventory
// @desc    Create inventory item
// @access  Private (Admin, Manager)
router.post(
  "/",
  protect,
  restrictTo("Admin", "Manager"),
  validate(inventorySchema),
  inventoryController.createInventory
);

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private (Admin, Manager)
router.put(
  "/:id",
  protect,
  restrictTo("Admin", "Manager"),
  validateParams(idSchema),
  validate(inventorySchema),
  inventoryController.updateInventory
);

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Private (Admin)
router.delete(
  "/:id",
  protect,
  restrictTo("Admin"),
  validateParams(idSchema),
  inventoryController.deleteInventory
);

module.exports = router;
