import jwt from "jsonwebtoken";
import { redis } from "../config/redis.js";
import { generateCSRFToken, revokeCSRFTOKEN } from "./csrfMiddleware.js";

export const generateToken = async (id, res) => {
  const accessToken = jwt.sign(
    { id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES }
  );

  // store refresh token for 7 days
  await redis.set(`refresh_token:${id}`, refreshToken, {
    EX: 7 * 24 * 60 * 60,
  });

  // Access Token cookie
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,      // set true in production
    sameSite: "none",
    maxAge: 1 * 60 * 1000, // 1 min
  });

  // Refresh Token cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
// csrf token cookie
const csrfToken= await generateCSRFToken(id,res)
  return { accessToken, refreshToken ,csrfToken};
};


export const verifyRefreshToken = async (refreshToken) => {
  try {
    // 1. Decode token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    // 2. Get stored refresh-token from Redis
    const storedToken = await redis.get(`refresh_token:${decoded.id}`);

    // 3. Validate refresh-token
    if (!storedToken) {
      return null;
    }

    if (storedToken !== refreshToken) {
      return null;
    }

    return decoded; // valid
  } catch (err) {
    return null;
  }
};

export const generateAccessToken = async (id, res) => {
  const accessToken = jwt.sign(
    { id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES }
  );

  // Set new AccessToken cookie
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,   // true in production
    sameSite: "strict",
    maxAge: 1 * 60 * 1000, // 1 minute
  });

  return accessToken;
};

export const revokeRefershToken=async(userId)=>{
  await redis.del(`refresh_token:${userId}`)
  await revokeCSRFTOKEN()
}