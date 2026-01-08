const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { UnauthorizedError, ForbiddenError } = require("../utils/errors");

/**
 * Protect routes - Verify JWT token and authenticate user
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Check if token exists
  if (!token) {
    throw new UnauthorizedError(
      "You are not logged in. Please log in to access this resource."
    );
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id).select("+isActive");
    if (!user) {
      throw new UnauthorizedError(
        "The user belonging to this token no longer exists."
      );
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError(
        "Your account has been deactivated. Please contact administrator."
      );
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new UnauthorizedError("Invalid token. Please log in again.");
    } else if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError(
        "Your token has expired. Please log in again."
      );
    }
    throw error;
  }
});

/**
 * Restrict access to specific roles
 * @param  {...string} roles - Allowed roles
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user's role is allowed
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(
        `You do not have permission to perform this action. Required role: ${roles.join(
          " or "
        )}`
      );
    }
    next();
  };
};

/**
 * Optional authentication - Set user if token is provided but don't require it
 */
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional auth
    }
  }

  next();
});
