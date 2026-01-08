const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");
const {
  ValidationError,
  UnauthorizedError,
  ConflictError,
} = require("../utils/errors");

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError("A user with this email already exists");
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || "Staff", // Default to Staff if no role provided
  });

  // Generate token
  const token = generateToken(user._id);

  sendSuccess(
    res,
    201,
    {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
    "User registered successfully"
  );
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new ValidationError("Please provide email and password");
  }

  // Find user and include password field
  const user = await User.findOne({ email }).select("+password");

  // Check if user exists and password is correct
  if (!user || !(await user.comparePassword(password))) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Check if user is active
  if (!user.isActive) {
    throw new UnauthorizedError(
      "Your account has been deactivated. Please contact administrator."
    );
  }

  // Generate token
  const token = generateToken(user._id);

  sendSuccess(
    res,
    200,
    {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
    "Login successful"
  );
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  sendSuccess(res, 200, { user }, "User profile retrieved successfully");
});

/**
 * @desc    Update user password
 * @route   PUT /api/auth/update-password
 * @access  Private
 */
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validate input
  if (!currentPassword || !newPassword) {
    throw new ValidationError(
      "Please provide current password and new password"
    );
  }

  // Get user with password
  const user = await User.findById(req.user.id).select("+password");

  // Check if current password is correct
  if (!(await user.comparePassword(currentPassword))) {
    throw new UnauthorizedError("Current password is incorrect");
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = generateToken(user._id);

  sendSuccess(res, 200, { token }, "Password updated successfully");
});
