const Joi = require("joi");

/**
 * Validation Schemas for Purchase Order
 */

// Create purchase order validation
exports.createPurchaseOrderSchema = Joi.object({
  supplier: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Supplier must be a valid ID",
      "any.required": "Supplier is required",
    }),
  items: Joi.array()
    .min(1)
    .items(
      Joi.object({
        inventory: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required()
          .messages({
            "string.pattern.base": "Inventory item must be a valid ID",
            "any.required": "Inventory item is required",
          }),
        quantity: Joi.number().min(1).required().messages({
          "number.min": "Quantity must be at least 1",
          "any.required": "Quantity is required",
        }),
        unitPrice: Joi.number().min(0).messages({
          "number.min": "Unit price cannot be negative",
        }),
      })
    )
    .required()
    .messages({
      "array.min": "At least one item is required",
      "any.required": "Items are required",
    }),
  expectedDeliveryDate: Joi.date().min("now").required().messages({
    "date.min": "Expected delivery date must be in the future",
    "any.required": "Expected delivery date is required",
  }),
  notes: Joi.string().max(1000).allow(""),
});

// Update purchase order validation
exports.updatePurchaseOrderSchema = Joi.object({
  supplier: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "Supplier must be a valid ID",
    }),
  items: Joi.array()
    .min(1)
    .items(
      Joi.object({
        inventory: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required()
          .messages({
            "string.pattern.base": "Inventory item must be a valid ID",
            "any.required": "Inventory item is required",
          }),
        quantity: Joi.number().min(1).required().messages({
          "number.min": "Quantity must be at least 1",
          "any.required": "Quantity is required",
        }),
        unitPrice: Joi.number().min(0).messages({
          "number.min": "Unit price cannot be negative",
        }),
      })
    )
    .messages({
      "array.min": "At least one item is required",
    }),
  expectedDeliveryDate: Joi.date().min("now").messages({
    "date.min": "Expected delivery date must be in the future",
  }),
  notes: Joi.string().max(1000).allow(""),
});

// Update status validation
exports.updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid("Draft", "Pending", "Approved", "Received", "Cancelled")
    .required()
    .messages({
      "any.only":
        "Status must be one of: Draft, Pending, Approved, Received, Cancelled",
      "any.required": "Status is required",
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
