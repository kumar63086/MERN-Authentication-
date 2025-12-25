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
import { generateAccessToken, generateToken, revokeRefershToken, verifyRefreshToken } from "../config/generateToken.js";

// ===============================
// REGISTER CONTROLLER
// ===============================
export const Register = asyncHandler(async (req, res) => {
  const sanitizeBody = sanitize(req.body);

  // Validate with Zod
  const { success, data, error } = registerSchema.safeParse(sanitizeBody);

  if (!success) {
    const errors = error.issues.map((e) => e.message);
    throw new AppError(`Validation failed: ${errors.join(", ")}`, 400);
  }

  const { name, email, password } = data;

  // Rate limit key
  const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;

  // If user hits API again within 60 sec → block
  if (await redis.get(rateLimitKey)) {
    throw new AppError("Too many requests, try again later", 429);
  }

  // If email already exists → do NOT allow register
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email is already registered", 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Generate email verify token
  const verifyToken = crypto.randomBytes(32).toString("hex");
  const verifyKey = `verify:${verifyToken}`;

  // Store temp data in Redis for 5 minutes
  const tempData = JSON.stringify({
    name,
    email,
    password: hashedPassword,
  });

  await redis.set(verifyKey, tempData, { ex: 300 });

  // Send verification email
  const subject = "Verify Your Email";
  const html = getVerifyEmailHtml({ email, token: verifyToken });

  await sendMail({ email, subject, html });

  // Apply rate-limit for next 60 sec
  await redis.set(rateLimitKey, "true", { ex: 60 });

  // Response
  return res.status(201).json({
    success: true,
    message:
      "A verification link has been sent to your email. It expires in 5 minutes.",
  });
});


// ===============================
// VERIFY USER CONTROLLER
// ===============================
export const verifyUser = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    throw new AppError("Verification token is required", 400);
  }

  const verifyKey = `verify:${token}`;

  // Read temp data
  const userDataJson = await redis.get(verifyKey);

  if (!userDataJson) {
    throw new AppError("Verification link expired or invalid", 400);
  }

  const userData = JSON.parse(userDataJson);

  // Delete token immediately
  await redis.del(verifyKey);

  // Check again if email already verified before
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new AppError("Email already verified, please login", 400);
  }

  // Create user permanently
  const newUser = await User.create({
    name: userData.name,
    email: userData.email,
    password: userData.password,
  });

  return res.status(201).json({
    success: true,
    message: "Email verified successfully! Your account is created.",
    user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const sanitizeBody = sanitize(req.body);
   console.log("Body:", req.body);


  // Zod validation
  const { success, data, error } = loginSchema.safeParse(sanitizeBody);
  if (!success) {
    const errors = error.issues.map((e) => e.message);
    throw new AppError(`Validation failed: ${errors.join(", ")}`, 400);
  }

  const { email, password } = data;

  // Rate limit key (IP + email)
  const rateLimitKey = `login-rate-limit:${req.ip}:${email}`;

  // If user tries again in 60 sec → block
  if (await redis.get(rateLimitKey)) {
    throw new AppError("Too many requests, try again later", 429);
  }

  // Set 60-sec lock
  await redis.set(rateLimitKey, "1", { EX: 60 });

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid credentials", 400);
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 400);
  }

  // Generate OTP (6 digits)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // OTP key
  const otpKey = `otp:${email}`;

  // Store in Redis (expires in 5 minutes)
  await redis.set(otpKey, otp, { EX: 300 });

  // Send email
  const subject = `Your OTP for verification`;
  const html = getOtpHtml({ email, otp });

  await sendMail({ email, subject, html });

  // Response
  res.json({
    success: true,
    message: "If your email is valid, an OTP has been sent. It will be valid for 5 minutes.",
  });
});


export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError("Email and OTP are required", 400);
  }

  const otpKey = `otp:${email}`;

  // Get stored OTP (it's already a string)
  const storedOtp = await redis.get(otpKey);
  if (!storedOtp) {
    throw new AppError("OTP expired or not found", 400);
  }

  // Check OTP match
  if (storedOtp !== otp.toString()) {
    throw new AppError("Invalid OTP", 400);
  }

  // Delete OTP so it cannot be reused
  await redis.del(otpKey);

  // Get user
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Issue tokens
  const tokenData = await generateToken(user._id, res);


  return res.status(200).json({
    success: true,
    message: `Welcome ${user.name}`,
    tokenData,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
});

export const myprofile=asyncHandler(async(req,res)=>{
  const user=req.user
  res.json(user)
})


export const RefreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  

  if (!refreshToken) {
    return next(new AppError("Invalid refresh token", 401));
  }

  const decoded = await verifyRefreshToken(refreshToken);

  if (!decoded) {
    return next(new AppError("Invalid refresh token", 401));
  }

  // Generate a new Access Token
  const newAccessToken = await generateAccessToken(decoded.id, res);

  return res.status(200).json({
    success: true,
    message: "Access token refreshed",
    accessToken: newAccessToken, // send new AT to frontend
  });
});

export const logout= asyncHandler(async(req,res)=>{
  const userId =req.user._id
  await revokeRefershToken(userId)
  res.clearCookie('refreshToken')
  res.clearCookie('accessToken')
  await redis.del(`user:${userId}`)
res.json({
  message:'Logged out succesfully'
})

})