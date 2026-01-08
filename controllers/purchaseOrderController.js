const PurchaseOrder = require("../models/PurchaseOrder");
const Inventory = require("../models/Inventory");
const Supplier = require("../models/Supplier");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");
const { NotFoundError, ValidationError } = require("../utils/errors");
const mongoose = require("mongoose");

/**
 * @desc    Get all purchase orders
 * @route   GET /api/purchase-orders
 * @access  Private
 */
exports.getAllPurchaseOrders = asyncHandler(async (req, res) => {
  const {
    status,
    supplier,
    search,
    page = 1,
    limit = 10,
    sortBy = "orderDate",
    order = "desc",
  } = req.query;

  // Build query
  const query = {};

  if (status) {
    query.status = status;
  }

  if (supplier) {
    query.supplier = supplier;
  }

  if (search) {
    query.$or = [
      { poNumber: { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } },
    ];
  }

  // Get purchase orders
  const purchaseOrders = await PurchaseOrder.find(query)
    .populate("supplier", "supplierName email phone")
    .populate("items.inventory", "itemName sku")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .populate("approvedBy", "name email")
    .populate("receivedBy", "name email")
    .sort({ [sortBy]: order === "desc" ? -1 : 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Get total count
  const total = await PurchaseOrder.countDocuments(query);

  sendSuccess(
    res,
    200,
    {
      purchaseOrders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    },
    "Purchase orders retrieved successfully"
  );
});

/**
 * @desc    Get single purchase order
 * @route   GET /api/purchase-orders/:id
 * @access  Private
 */
exports.getPurchaseOrderById = asyncHandler(async (req, res) => {
  const purchaseOrder = await PurchaseOrder.findById(req.params.id)
    .populate("supplier", "supplierName email phone address")
    .populate("items.inventory", "itemName sku category")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .populate("approvedBy", "name email")
    .populate("receivedBy", "name email");

  if (!purchaseOrder) {
    throw new NotFoundError("Purchase order not found");
  }

  sendSuccess(
    res,
    200,
    { purchaseOrder },
    "Purchase order retrieved successfully"
  );
});

/**
 * @desc    Create purchase order
 * @route   POST /api/purchase-orders
 * @access  Private (Admin, Manager)
 */
exports.createPurchaseOrder = asyncHandler(async (req, res) => {
  const { supplier, items, expectedDeliveryDate, notes } = req.body;

  // Verify supplier exists
  const supplierExists = await Supplier.findById(supplier);
  if (!supplierExists) {
    throw new NotFoundError("Supplier not found");
  }

  // Validate and enrich items data
  const enrichedItems = [];
  for (const item of items) {
    const inventoryItem = await Inventory.findById(item.inventory);
    if (!inventoryItem) {
      throw new NotFoundError(
        `Inventory item with ID ${item.inventory} not found`
      );
    }

    enrichedItems.push({
      inventory: item.inventory,
      itemName: inventoryItem.itemName,
      sku: inventoryItem.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice || inventoryItem.unitPrice,
      totalPrice: item.quantity * (item.unitPrice || inventoryItem.unitPrice),
    });
  }

  // Generate PO number
  const poNumber = await PurchaseOrder.generatePONumber();

  // Create purchase order
  const purchaseOrder = await PurchaseOrder.create({
    poNumber,
    supplier,
    items: enrichedItems,
    expectedDeliveryDate,
    notes,
    createdBy: req.user.id,
  });

  // Populate references
  await purchaseOrder.populate("supplier", "supplierName email");
  await purchaseOrder.populate("items.inventory", "itemName sku");
  await purchaseOrder.populate("createdBy", "name email");

  sendSuccess(
    res,
    201,
    { purchaseOrder },
    "Purchase order created successfully"
  );
});

/**
 * @desc    Update purchase order
 * @route   PUT /api/purchase-orders/:id
 * @access  Private (Admin, Manager)
 */
exports.updatePurchaseOrder = asyncHandler(async (req, res) => {
  let purchaseOrder = await PurchaseOrder.findById(req.params.id);

  if (!purchaseOrder) {
    throw new NotFoundError("Purchase order not found");
  }

  // Prevent updates to Received or Cancelled orders
  if (["Received", "Cancelled"].includes(purchaseOrder.status)) {
    throw new ValidationError(
      `Cannot update purchase order with status: ${purchaseOrder.status}`
    );
  }

  const { supplier, items, expectedDeliveryDate, notes } = req.body;

  // If items are being updated, validate and enrich them
  let enrichedItems = purchaseOrder.items;
  if (items) {
    enrichedItems = [];
    for (const item of items) {
      const inventoryItem = await Inventory.findById(item.inventory);
      if (!inventoryItem) {
        throw new NotFoundError(
          `Inventory item with ID ${item.inventory} not found`
        );
      }

      enrichedItems.push({
        inventory: item.inventory,
        itemName: inventoryItem.itemName,
        sku: inventoryItem.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice || inventoryItem.unitPrice,
        totalPrice: item.quantity * (item.unitPrice || inventoryItem.unitPrice),
      });
    }
  }

  // Update purchase order
  purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
    req.params.id,
    {
      supplier: supplier || purchaseOrder.supplier,
      items: enrichedItems,
      expectedDeliveryDate:
        expectedDeliveryDate || purchaseOrder.expectedDeliveryDate,
      notes: notes !== undefined ? notes : purchaseOrder.notes,
      updatedBy: req.user.id,
    },
    { new: true, runValidators: true }
  )
    .populate("supplier", "supplierName email")
    .populate("items.inventory", "itemName sku")
    .populate("updatedBy", "name email");

  sendSuccess(
    res,
    200,
    { purchaseOrder },
    "Purchase order updated successfully"
  );
});

/**
 * @desc    Update purchase order status
 * @route   PATCH /api/purchase-orders/:id/status
 * @access  Private (Admin, Manager)
 * @note    When status is updated to "Received", inventory is automatically updated
 */
exports.updatePurchaseOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    throw new ValidationError("Status is required");
  }

  const purchaseOrder = await PurchaseOrder.findById(req.params.id);

  if (!purchaseOrder) {
    throw new NotFoundError("Purchase order not found");
  }

  // Validate status transition
  const validStatuses = [
    "Draft",
    "Pending",
    "Approved",
    "Received",
    "Cancelled",
  ];
  if (!validStatuses.includes(status)) {
    throw new ValidationError(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  // Prevent updating already received or cancelled orders
  if (["Received", "Cancelled"].includes(purchaseOrder.status)) {
    throw new ValidationError(
      `Cannot change status from ${purchaseOrder.status}`
    );
  }

  // Start a database session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update purchase order status
    purchaseOrder.status = status;
    purchaseOrder.updatedBy = req.user.id;

    // Set approved by if status is Approved
    if (status === "Approved" && !purchaseOrder.approvedBy) {
      purchaseOrder.approvedBy = req.user.id;
    }

    // CRITICAL BUSINESS LOGIC: Auto-update inventory when status is "Received"
    if (status === "Received") {
      purchaseOrder.actualDeliveryDate = new Date();
      purchaseOrder.receivedBy = req.user.id;

      // Update inventory quantities
      for (const item of purchaseOrder.items) {
        const inventoryItem = await Inventory.findById(item.inventory).session(
          session
        );

        if (!inventoryItem) {
          throw new NotFoundError(
            `Inventory item ${item.itemName} (${item.sku}) not found`
          );
        }

        // Increment stock quantity
        inventoryItem.quantity += item.quantity;
        inventoryItem.updatedBy = req.user.id;
        await inventoryItem.save({ session });
      }
    }

    await purchaseOrder.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // Populate references
    await purchaseOrder.populate("supplier", "supplierName email");
    await purchaseOrder.populate("items.inventory", "itemName sku quantity");
    await purchaseOrder.populate("updatedBy", "name email");
    await purchaseOrder.populate("receivedBy", "name email");

    let message = "Purchase order status updated successfully";
    if (status === "Received") {
      message =
        "Purchase order marked as received and inventory updated successfully";
    }

    sendSuccess(res, 200, { purchaseOrder }, message);
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Delete purchase order
 * @route   DELETE /api/purchase-orders/:id
 * @access  Private (Admin)
 */
exports.deletePurchaseOrder = asyncHandler(async (req, res) => {
  const purchaseOrder = await PurchaseOrder.findById(req.params.id);

  if (!purchaseOrder) {
    throw new NotFoundError("Purchase order not found");
  }

  // Prevent deletion of received orders
  if (purchaseOrder.status === "Received") {
    throw new ValidationError("Cannot delete a received purchase order");
  }

  await purchaseOrder.deleteOne();

  sendSuccess(res, 200, {}, "Purchase order deleted successfully");
});
