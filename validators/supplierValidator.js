const Joi = require("joi");

/**
 * Validation Schemas for Supplier
 */

// Create/Update supplier validation
exports.supplierSchema = Joi.object({
  supplierName: Joi.string().min(2).max(100).required().messages({
    "string.min": "Supplier name must be at least 2 characters long",
    "string.max": "Supplier name cannot exceed 100 characters",
    "any.required": "Supplier name is required",
  }),
  contactPerson: Joi.string().min(2).max(50).required().messages({
    "string.min": "Contact person name must be at least 2 characters long",
    "string.max": "Contact person name cannot exceed 50 characters",
    "any.required": "Contact person is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  phone: Joi.string()
    .pattern(/^[0-9+\-\s()]+$/)
    .required()
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
      "any.required": "Phone number is required",
    }),
  address: Joi.object({
    street: Joi.string().allow(""),
    city: Joi.string().allow(""),
    state: Joi.string().allow(""),
    country: Joi.string().allow(""),
    postalCode: Joi.string().allow(""),
  }),
  taxId: Joi.string().allow(""),
  paymentTerms: Joi.string()
    .valid("Net 15", "Net 30", "Net 45", "Net 60", "Due on Receipt", "Custom")
    .default("Net 30"),
  rating: Joi.number().min(1).max(5).default(3),
  notes: Joi.string().max(1000).allow(""),
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
