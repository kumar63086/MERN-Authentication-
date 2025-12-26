import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../model/user.js";
import { loginSchema, registerSchema } from "../validators/auth.validators.js";
import sanitize from "mongo-sanitize";
import bcrypt from "bcryptjs";
import { AppError } from "../utils/AppError.js";
import { redis } from "../config/redis.js";
import { sendMail } from "../config/mailer.js";
import { getOtpHtml, getVerifyEmailHtml } from "../config/html.js";
import crypto from "crypto";
import {
  generateAccessToken,
  generateToken,
  revokeRefershToken,
  verifyRefreshToken,
} from "../config/generateToken.js";
import { generateCSRFToken } from "../config/csrfMiddleware.js";


// ===============================
// REGISTER
// ===============================
export const Register = asyncHandler(async (req, res) => {
  const sanitizeBody = sanitize(req.body);

  const { success, data, error } = registerSchema.safeParse(sanitizeBody);
  if (!success) {
    const errors = error.issues.map(e => e.message);
    throw new AppError(`Validation failed: ${errors.join(", ")}`, 400);
  }

  const { name, email, password } = data;
  const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;

  if (await redis.get(rateLimitKey)) {
    throw new AppError("Too many requests, try again later", 429);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email is already registered", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const verifyToken = crypto.randomBytes(32).toString("hex");
  const verifyKey = `verify:${verifyToken}`;

  await redis.set(
    verifyKey,
    JSON.stringify({
      name,
      email,
      password: hashedPassword,
    }),
    { EX: 300 }
  );

  await sendMail({
    email,
    subject: "Verify Your Email",
    html: getVerifyEmailHtml({ email, token: verifyToken }),
  });

  await redis.set(rateLimitKey, "1", { EX: 60 });

  res.status(201).json({
    success: true,
    message: "Verification link sent to email (valid for 5 minutes)",
  });
});


// ===============================
// VERIFY EMAIL
// ===============================
export const verifyUser = asyncHandler(async (req, res) => {
  const { token } = req.params;
  if (!token) throw new AppError("Token required", 400);

  const verifyKey = `verify:${token}`;
  const data = await redis.get(verifyKey);

  if (!data) throw new AppError("Link expired or invalid", 400);

  const userData = JSON.parse(data);
  await redis.del(verifyKey);

  const exists = await User.findOne({ email: userData.email });
  if (exists) throw new AppError("Email already verified", 400);

  const user = await User.create(userData);

  res.status(201).json({
    success: true,
    message: "Email verified successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});


// ===============================
// LOGIN (SEND OTP)
// ===============================
export const login = asyncHandler(async (req, res) => {
  const sanitizeBody = sanitize(req.body);

  const { success, data, error } = loginSchema.safeParse(sanitizeBody);
  if (!success) {
    const errors = error.issues.map(e => e.message);
    throw new AppError(`Validation failed: ${errors.join(", ")}`, 400);
  }

  const { email, password } = data;
  const rateLimitKey = `login-rate-limit:${req.ip}:${email}`;

  if (await redis.get(rateLimitKey)) {
    throw new AppError("Too many attempts, try again later", 429);
  }

  await redis.set(rateLimitKey, "1", { EX: 60 });

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError("Invalid credentials", 400);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.set(`otp:${email}`, otp, { EX: 300 });

  await sendMail({
    email,
    subject: "Your Login OTP",
    html: getOtpHtml({ email, otp }),
  });

  res.json({
    success: true,
    message: "OTP sent to your email (valid for 5 minutes)",
  });
});


// ===============================
// VERIFY OTP
// ===============================
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new AppError("Email & OTP required", 400);

  const storedOtp = await redis.get(`otp:${email}`);
  if (!storedOtp || storedOtp !== otp.toString()) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  await redis.del(`otp:${email}`);

  const user = await User.findOne({ email });
  if (!user) throw new AppError("User not found", 404);

  const tokenData = await generateToken(user._id, res);

  res.status(200).json({
    success: true,
    message: `Welcome ${user.name}`,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    tokenData,
    sessionInfo: {
      sessionId: tokenData.sessionId,
      loginTime: new Date().toISOString(),
      csrfToken: tokenData.csrfToken,
    },
  });
});


// ===============================
// MY PROFILE
// ===============================
export const myprofile = asyncHandler(async (req, res) => {
  const sessionId = req.sessionId;
  const sessionData = await redis.get(`session:${sessionId}`);

  let sessionInfo = null;
  if (sessionData) {
    const parsed = JSON.parse(sessionData);
    sessionInfo = {
      sessionId,
      loginTime: parsed.createdAt,
      lastActivity: parsed.lastActivity,
    };
  }

  res.json({
    user: req.user,
    sessionInfo,
  });
});


// ===============================
// REFRESH TOKEN
// ===============================
export const RefreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return next(new AppError("Invalid refresh token", 401));

  const decoded = await verifyRefreshToken(refreshToken);
  if (!decoded) {
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.clearCookie("csrfToken");
    return next(new AppError("Session expired, login again", 401));
  }

  const newAccessToken = await generateAccessToken(
    decoded.id,
    decoded.sessionId,
    res
  );

  res.json({
    success: true,
    message: "Access token refreshed",
    accessToken: newAccessToken,
  });
});


// ===============================
// LOGOUT
// ===============================
export const logout = asyncHandler(async (req, res) => {
  await revokeRefershToken(req.user._id);
  await redis.del(`session:${req.sessionId}`);

  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  res.clearCookie("csrfToken");

  res.json({ message: "Logout successful" });
});


// ===============================
// REFRESH CSRF
// ===============================
export const refreshCSRF = asyncHandler(async (req, res) => {
  const csrfToken = await generateCSRFToken(req.user._id, res);

  res.json({
    success: true,
    message: "CSRF refreshed",
    csrfToken,
  });
});


// ===============================
// ADMIN
// ===============================
export const adminController = asyncHandler(async (req, res) => {
  res.json({ message: "Hello Admin" });
});
