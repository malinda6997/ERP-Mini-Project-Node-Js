const express = require("express");
const router = express.Router();
const purchaseOrderController = require("../controllers/purchaseOrderController");
const { protect, restrictTo } = require("../middleware/auth");
const { validate, validateParams } = require("../middleware/validation");
const {
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  updateStatusSchema,
  idSchema,
} = require("../validators/purchaseOrderValidator");

/**
 * Purchase Order Routes
 */

// @route   GET /api/purchase-orders
// @desc    Get all purchase orders
// @access  Private
router.get("/", protect, purchaseOrderController.getAllPurchaseOrders);

// @route   GET /api/purchase-orders/:id
// @desc    Get single purchase order
// @access  Private
router.get(
  "/:id",
  protect,
  validateParams(idSchema),
  purchaseOrderController.getPurchaseOrderById
);

// @route   POST /api/purchase-orders
// @desc    Create purchase order
// @access  Private (Admin, Manager)
router.post(
  "/",
  protect,
  restrictTo("Admin", "Manager"),
  validate(createPurchaseOrderSchema),
  purchaseOrderController.createPurchaseOrder
);

// @route   PUT /api/purchase-orders/:id
// @desc    Update purchase order
// @access  Private (Admin, Manager)
router.put(
  "/:id",
  protect,
  restrictTo("Admin", "Manager"),
  validateParams(idSchema),
  validate(updatePurchaseOrderSchema),
  purchaseOrderController.updatePurchaseOrder
);

// @route   PATCH /api/purchase-orders/:id/status
// @desc    Update purchase order status (Auto-updates inventory when status = "Received")
// @access  Private (Admin, Manager)
router.patch(
  "/:id/status",
  protect,
  restrictTo("Admin", "Manager"),
  validateParams(idSchema),
  validate(updateStatusSchema),
  purchaseOrderController.updatePurchaseOrderStatus
);

// @route   DELETE /api/purchase-orders/:id
// @desc    Delete purchase order
// @access  Private (Admin)
router.delete(
  "/:id",
  protect,
  restrictTo("Admin"),
  validateParams(idSchema),
  purchaseOrderController.deletePurchaseOrder
);

module.exports = router;
