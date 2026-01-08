const Inventory = require("../models/Inventory");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");
const { NotFoundError, ConflictError } = require("../utils/errors");

/**
 * @desc    Get all inventory items
 * @route   GET /api/inventory
 * @access  Private
 */
exports.getAllInventory = asyncHandler(async (req, res) => {
  const {
    category,
    isLowStock,
    search,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  // Build query
  const query = { isActive: true };

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { itemName: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
  }

  // Get items
  const items = await Inventory.find(query)
    .populate("supplier", "supplierName")
    .populate("createdBy", "name email")
    .sort({ [sortBy]: order === "desc" ? -1 : 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Filter low stock items if requested
  let filteredItems = items;
  if (isLowStock === "true") {
    filteredItems = items.filter((item) => item.quantity <= item.reorderLevel);
  }

  // Get total count
  const total = await Inventory.countDocuments(query);

  sendSuccess(
    res,
    200,
    {
      items: filteredItems,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    },
    "Inventory items retrieved successfully"
  );
});

/**
 * @desc    Get single inventory item
 * @route   GET /api/inventory/:id
 * @access  Private
 */
exports.getInventoryById = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id)
    .populate("supplier", "supplierName email phone")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

  if (!item) {
    throw new NotFoundError("Inventory item not found");
  }

  sendSuccess(res, 200, { item }, "Inventory item retrieved successfully");
});

/**
 * @desc    Create inventory item
 * @route   POST /api/inventory
 * @access  Private (Admin, Manager)
 */
exports.createInventory = asyncHandler(async (req, res) => {
  const {
    itemName,
    sku,
    description,
    quantity,
    unitPrice,
    category,
    reorderLevel,
    supplier,
  } = req.body;

  // Check if SKU already exists
  const existingItem = await Inventory.findOne({ sku });
  if (existingItem) {
    throw new ConflictError("An item with this SKU already exists");
  }

  // Create item
  const item = await Inventory.create({
    itemName,
    sku,
    description,
    quantity,
    unitPrice,
    category,
    reorderLevel,
    supplier,
    createdBy: req.user.id,
  });

  // Populate references
  await item.populate("supplier", "supplierName");
  await item.populate("createdBy", "name email");

  sendSuccess(res, 201, { item }, "Inventory item created successfully");
});

/**
 * @desc    Update inventory item
 * @route   PUT /api/inventory/:id
 * @access  Private (Admin, Manager)
 */
exports.updateInventory = asyncHandler(async (req, res) => {
  const {
    itemName,
    sku,
    description,
    quantity,
    unitPrice,
    category,
    reorderLevel,
    supplier,
  } = req.body;

  let item = await Inventory.findById(req.params.id);

  if (!item) {
    throw new NotFoundError("Inventory item not found");
  }

  // Check if SKU is being changed and if it already exists
  if (sku && sku !== item.sku) {
    const existingItem = await Inventory.findOne({ sku });
    if (existingItem) {
      throw new ConflictError("An item with this SKU already exists");
    }
  }

  // Update item
  item = await Inventory.findByIdAndUpdate(
    req.params.id,
    {
      itemName,
      sku,
      description,
      quantity,
      unitPrice,
      category,
      reorderLevel,
      supplier,
      updatedBy: req.user.id,
    },
    { new: true, runValidators: true }
  )
    .populate("supplier", "supplierName")
    .populate("updatedBy", "name email");

  sendSuccess(res, 200, { item }, "Inventory item updated successfully");
});

/**
 * @desc    Delete inventory item (soft delete)
 * @route   DELETE /api/inventory/:id
 * @access  Private (Admin)
 */
exports.deleteInventory = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);

  if (!item) {
    throw new NotFoundError("Inventory item not found");
  }

  // Soft delete
  item.isActive = false;
  item.updatedBy = req.user.id;
  await item.save();

  sendSuccess(res, 200, {}, "Inventory item deleted successfully");
});

/**
 * @desc    Get low stock items
 * @route   GET /api/inventory/alerts/low-stock
 * @access  Private
 */
exports.getLowStockItems = asyncHandler(async (req, res) => {
  const items = await Inventory.find({ isActive: true })
    .populate("supplier", "supplierName")
    .sort({ quantity: 1 });

  const lowStockItems = items.filter(
    (item) => item.quantity <= item.reorderLevel
  );

  sendSuccess(
    res,
    200,
    {
      items: lowStockItems,
      count: lowStockItems.length,
    },
    "Low stock items retrieved successfully"
  );
});
