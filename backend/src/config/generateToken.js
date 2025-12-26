import jwt from "jsonwebtoken";
import { redis } from "../config/redis.js";
import { generateCSRFToken, revokeCSRFTOKEN } from "./csrfMiddleware.js";
import crypto from "crypto";

export const generateToken = async (id, res) => {
  const sessionId = crypto.randomBytes(16).toString("hex");

  const accessToken = jwt.sign(
    { id, sessionId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { id, sessionId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES }
  );

  const activeSessionKey = `active_session:${id}`;
  const sessionDataKey = `session:${sessionId}`;

  const existingSession = await redis.get(activeSessionKey);
  if (existingSession) {
    await redis.del(`session:${existingSession}`);
    await redis.del(`refresh_token:${id}`);
  }

  const sessionData = {
    userId: id,
    sessionId,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  };

  await redis.set(`refresh_token:${id}`, refreshToken, {
    EX: 7 * 24 * 60 * 60,
  });

  await redis.set(sessionDataKey, JSON.stringify(sessionData), {
    EX: 7 * 24 * 60 * 60,
  });

  await redis.set(activeSessionKey, sessionId, {
    EX: 7 * 24 * 60 * 60,
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const csrfToken = await generateCSRFToken(id, res);

  return { accessToken, refreshToken, csrfToken, sessionId };
};

export const verifyRefreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const storedToken = await redis.get(`refresh_token:${decoded.id}`);
    if (!storedToken || storedToken !== refreshToken) return null;

    const activeSessionId = await redis.get(
      `active_session:${decoded.id}`
    );
    if (activeSessionId !== decoded.sessionId) return null;

    const sessionData = await redis.get(
      `session:${decoded.sessionId}`
    );
    if (!sessionData) return null;

    const parsed = JSON.parse(sessionData);
    parsed.lastActivity = new Date().toISOString();

    await redis.setEx(
      `session:${decoded.sessionId}`,
      7 * 24 * 60 * 60,
      JSON.stringify(parsed)
    );

    return decoded;
  } catch {
    return null;
  }
};

export const generateAccessToken = async (id, sessionId, res) => {
  const accessToken = jwt.sign(
    { id, sessionId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES }
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 1000,
  });

  return accessToken;
};

export const revokeRefershToken = async (userId) => {
  const activeSessionId = await redis.get(`active_session:${userId}`);

  await redis.del(`refresh_token:${userId}`);
  await redis.del(`active_session:${userId}`);

  if (activeSessionId) {
    await redis.del(`session:${activeSessionId}`);
  }

  await revokeCSRFTOKEN(userId);
};

export const isSessionActive = async (userId, sessionId) => {
  const activeSessionId = await redis.get(`active_session:${userId}`);
  return activeSessionId === sessionId;
};
