const Joi = require("joi");

/**
 * Validation Schemas for Inventory
 */

// Create/Update inventory validation
exports.inventorySchema = Joi.object({
  itemName: Joi.string().min(2).max(100).required().messages({
    "string.min": "Item name must be at least 2 characters long",
    "string.max": "Item name cannot exceed 100 characters",
    "any.required": "Item name is required",
  }),
  sku: Joi.string()
    .uppercase()
    .pattern(/^[A-Z0-9-]+$/)
    .required()
    .messages({
      "string.pattern.base":
        "SKU must contain only uppercase letters, numbers, and hyphens",
      "any.required": "SKU is required",
    }),
  description: Joi.string().max(500).allow(""),
  quantity: Joi.number().min(0).required().messages({
    "number.min": "Quantity cannot be negative",
    "any.required": "Quantity is required",
  }),
  unitPrice: Joi.number().min(0).required().messages({
    "number.min": "Unit price cannot be negative",
    "any.required": "Unit price is required",
  }),
  category: Joi.string()
    .valid("Raw Material", "Finished Goods", "Components", "Supplies", "Food & Beverage", "Other")
    .default("Other"),
  reorderLevel: Joi.number().min(0).default(10),
  supplier: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null)
    .messages({
      "string.pattern.base": "Supplier must be a valid ID",
    }),
});

// MongoDB ObjectId validation
exports.idSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid ID format",
    }),
});
