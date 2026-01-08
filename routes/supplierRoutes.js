const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");
const { protect, restrictTo } = require("../middleware/auth");
const { validate, validateParams } = require("../middleware/validation");
const { supplierSchema, idSchema } = require("../validators/supplierValidator");

/**
 * Supplier Routes
 */

// @route   GET /api/suppliers
// @desc    Get all suppliers
// @access  Private
router.get("/", protect, supplierController.getAllSuppliers);

// @route   GET /api/suppliers/:id
// @desc    Get single supplier
// @access  Private
router.get(
  "/:id",
  protect,
  validateParams(idSchema),
  supplierController.getSupplierById
);

// @route   POST /api/suppliers
// @desc    Create supplier
// @access  Private (Admin, Manager)
router.post(
  "/",
  protect,
  restrictTo("Admin", "Manager"),
  validate(supplierSchema),
  supplierController.createSupplier
);

// @route   PUT /api/suppliers/:id
// @desc    Update supplier
// @access  Private (Admin, Manager)
router.put(
  "/:id",
  protect,
  restrictTo("Admin", "Manager"),
  validateParams(idSchema),
  validate(supplierSchema),
  supplierController.updateSupplier
);

// @route   DELETE /api/suppliers/:id
// @desc    Delete supplier
// @access  Private (Admin)
router.delete(
  "/:id",
  protect,
  restrictTo("Admin"),
  validateParams(idSchema),
  supplierController.deleteSupplier
);

module.exports = router;
