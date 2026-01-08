const Supplier = require("../models/Supplier");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");
const { NotFoundError } = require("../utils/errors");

/**
 * @desc    Get all suppliers
 * @route   GET /api/suppliers
 * @access  Private
 */
exports.getAllSuppliers = asyncHandler(async (req, res) => {
  const {
    search,
    isActive,
    page = 1,
    limit = 10,
    sortBy = "supplierName",
    order = "asc",
  } = req.query;

  // Build query
  const query = {};

  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  if (search) {
    query.$or = [
      { supplierName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { contactPerson: { $regex: search, $options: "i" } },
    ];
  }

  // Get suppliers
  const suppliers = await Supplier.find(query)
    .populate("createdBy", "name email")
    .sort({ [sortBy]: order === "desc" ? -1 : 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Get total count
  const total = await Supplier.countDocuments(query);

  sendSuccess(
    res,
    200,
    {
      suppliers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    },
    "Suppliers retrieved successfully"
  );
});

/**
 * @desc    Get single supplier
 * @route   GET /api/suppliers/:id
 * @access  Private
 */
exports.getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id)
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

  if (!supplier) {
    throw new NotFoundError("Supplier not found");
  }

  sendSuccess(res, 200, { supplier }, "Supplier retrieved successfully");
});

/**
 * @desc    Create supplier
 * @route   POST /api/suppliers
 * @access  Private (Admin, Manager)
 */
exports.createSupplier = asyncHandler(async (req, res) => {
  const supplierData = {
    ...req.body,
    createdBy: req.user.id,
  };

  const supplier = await Supplier.create(supplierData);

  // Populate references
  await supplier.populate("createdBy", "name email");

  sendSuccess(res, 201, { supplier }, "Supplier created successfully");
});

/**
 * @desc    Update supplier
 * @route   PUT /api/suppliers/:id
 * @access  Private (Admin, Manager)
 */
exports.updateSupplier = asyncHandler(async (req, res) => {
  let supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    throw new NotFoundError("Supplier not found");
  }

  // Update supplier
  supplier = await Supplier.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      updatedBy: req.user.id,
    },
    { new: true, runValidators: true }
  ).populate("updatedBy", "name email");

  sendSuccess(res, 200, { supplier }, "Supplier updated successfully");
});

/**
 * @desc    Delete supplier (soft delete)
 * @route   DELETE /api/suppliers/:id
 * @access  Private (Admin)
 */
exports.deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    throw new NotFoundError("Supplier not found");
  }

  // Soft delete
  supplier.isActive = false;
  supplier.updatedBy = req.user.id;
  await supplier.save();

  sendSuccess(res, 200, {}, "Supplier deleted successfully");
});
