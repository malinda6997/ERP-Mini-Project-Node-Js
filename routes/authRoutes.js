const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validation");
const {
  registerSchema,
  loginSchema,
  updatePasswordSchema,
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
