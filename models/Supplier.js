const mongoose = require("mongoose");

/**
 * Supplier Schema
 * Manages supplier information
 */
const supplierSchema = new mongoose.Schema(
  {
    supplierName: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true,
      minlength: [2, "Supplier name must be at least 2 characters long"],
      maxlength: [100, "Supplier name cannot exceed 100 characters"],
    },
    contactPerson: {
      type: String,
      required: [true, "Contact person is required"],
      trim: true,
      minlength: [2, "Contact person name must be at least 2 characters long"],
      maxlength: [50, "Contact person name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[0-9+\-\s()]+$/, "Please provide a valid phone number"],
    },
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
      postalCode: {
        type: String,
        trim: true,
      },
    },
    taxId: {
      type: String,
      trim: true,
      sparse: true, // Allows multiple null values but unique non-null values
    },
    paymentTerms: {
      type: String,
      enum: [
        "Net 15",
        "Net 30",
        "Net 45",
        "Net 60",
        "Due on Receipt",
        "Custom",
      ],
      default: "Net 30",
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      default: 3,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
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
supplierSchema.index({ supplierName: 1 });
supplierSchema.index({ email: 1 });

const Supplier = mongoose.model("Supplier", supplierSchema);

module.exports = Supplier;
