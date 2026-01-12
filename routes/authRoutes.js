const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect, restrictTo } = require("../middleware/auth");
const { validate, validateParams } = require("../middleware/validation");
const {
  registerSchema,
  loginSchema,
  updatePasswordSchema,
  updateUserSchema,
  idSchema,
} = require("../validators/authValidator");

/**
 * Authentication Routes
 */

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post("/register", validate(registerSchema), authController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", validate(loginSchema), authController.login);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", protect, authController.getMe);

// @route   GET /api/auth/users
// @desc    Get all users (Admin can filter by role)
// @access  Private (Admin only)
router.get("/users", protect, restrictTo("Admin"), authController.getAllUsers);

// @route   GET /api/auth/users/:id
// @desc    Get single user by ID
// @access  Private (Admin only)
router.get(
  "/users/:id",
  protect,
  restrictTo("Admin"),
  validateParams(idSchema),
  authController.getUserById
);

// @route   PUT /api/auth/users/:id
// @desc    Update user
// @access  Private (Admin only)
router.put(
  "/users/:id",
  protect,
  restrictTo("Admin"),
  validateParams(idSchema),
  validate(updateUserSchema),
  authController.updateUser
);

// @route   DELETE /api/auth/users/:id
// @desc    Delete user (soft delete)
// @access  Private (Admin only)
router.delete(
  "/users/:id",
  protect,
  restrictTo("Admin"),
  validateParams(idSchema),
  authController.deleteUser
);

// @route   PUT /api/auth/update-password
// @desc    Update user password
// @access  Private
router.put(
  "/update-password",
  protect,
  validate(updatePasswordSchema),
  authController.updatePassword
);

module.exports = router;
