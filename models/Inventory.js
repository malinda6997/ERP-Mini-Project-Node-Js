const mongoose = require("mongoose");

/**
 * Inventory Schema
 * Manages inventory items with SKU, quantity, and pricing
 */
const inventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      minlength: [2, "Item name must be at least 2 characters long"],
      maxlength: [100, "Item name cannot exceed 100 characters"],
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      uppercase: true,
      trim: true,
      match: [
        /^[A-Z0-9-]+$/,
        "SKU must contain only uppercase letters, numbers, and hyphens",
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },
    category: {
      type: String,
      trim: true,
      enum: [
        "Raw Material",
        "Finished Goods",
        "Components",
        "Supplies",
        "Food & Beverage",
        "Other",
      ],
      default: "Other",
    },
    reorderLevel: {
      type: Number,
      min: [0, "Reorder level cannot be negative"],
      default: 10,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
inventorySchema.index({ sku: 1 });
inventorySchema.index({ itemName: 1 });
inventorySchema.index({ category: 1 });

// Virtual for low stock alert
inventorySchema.virtual("isLowStock").get(function () {
  return this.quantity <= this.reorderLevel;
});

// Ensure virtuals are included in JSON
inventorySchema.set("toJSON", { virtuals: true });
inventorySchema.set("toObject", { virtuals: true });

const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;
