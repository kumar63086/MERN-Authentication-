import crypto from "crypto";
import { redis } from "../config/redis.js";


/**
 * Generate CSRF Token
 */
export const generateCSRFToken = async (userId, res) => {
  const csrfToken = crypto.randomBytes(32).toString("hex");
  const csrfKey = `csrf:${userId}`;

  // Store token in Redis for 1 hour
  await redis.setEx(csrfKey, 60 * 60, csrfToken);

  // Send token as cookie (double-submit cookie pattern)
  res.cookie("csrfToken", csrfToken, {
    httpOnly: false, // frontend must read & send in header
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  return csrfToken;
};

/**
 * Verify CSRF Token Middleware
 */
export const verifyCSRFToken = async (req, res, next) => {
  try {
    // Allow GET requests
    if (req.method === "GET") {
      return next();
    }

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    // Read token from headers
    const clientToken =
      req.headers["x-csrf-token"] ||
      req.headers["x-xsrf-token"] ||
      req.headers["csrf-token"];

    if (!clientToken) {
      return res.status(403).json({
        message: "CSRF token missing. Please refresh the page.",
        code: "CSRF_TOKEN_MISSING",
      });
    }

    const csrfKey = `csrf:${userId}`;
    const storedToken = await redis.get(csrfKey);

    if (!storedToken) {
      return res.status(403).json({
        message: "CSRF token expired. Please try again.",
        code: "CSRF_TOKEN_EXPIRED",
      });
    }

    if (storedToken !== clientToken) {
      return res.status(403).json({
        message: "Invalid CSRF token. Please refresh the page.",
        code: "CSRF_TOKEN_INVALID",
      });
    }

    return next();
  } catch (error) {
    console.error("CSRF verification error:", error);
    return res.status(500).json({
      message: "CSRF verification failed",
      code: "CSRF_VERIFICATION_ERROR",
    });
  }
};

/**
 * Revoke CSRF Token
 */
export const revokeCSRFTOKEN = async (userId) => {
  const csrfKey = `csrf:${userId}`;
  await redis.del(csrfKey);
};

/**
 * Refresh CSRF Token
 */
export const refreshCSRFTOKEN = async (userId, res) => {
  await revokeCSRFTOKEN(userId);
  return generateCSRFToken(userId, res);
};
