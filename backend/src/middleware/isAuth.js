import { redis } from "../config/redis.js";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import { User } from "../model/user.js";
import { isSessionActive } from "../config/generateToken.js";
export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    

    if (!token) {
      return next(new AppError("Please login — no token found", 403));
    }

    // Verify access token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (!decoded) {
      return next(new AppError("Token is invalid or expired", 401));
    }
   const sessionActive= await isSessionActive(
    decoded.id,
    decoded.sessionId
   )
   if(!sessionActive){
      res.clearCookie('refreshToken')
      res.clearCookie('accessToken')
      res.clearCookie('csrfToken')
      return  res.status(401).json({
        message:"Session Expired . you have been logged in from another device"
      })
   }
    // Check Redis cache first
    const cacheUser = await redis.get(`user:${decoded.id}`);

    if (cacheUser) {
      req.user = JSON.parse(cacheUser);
      req.sessionId=decoded.sessionId
      return next();
    }

    // If not found in Redis, fetch from DB
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Store user in Redis cache for 1 hour
    await redis.setEx(`user:${user._id}`, 3600, JSON.stringify(user));

    req.user = user;
     req.sessionId=decoded.sessionId
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    return next(new AppError("Authentication failed", 401));
  }
};

export const authorizedAdmin=async(req,res,next)=>{
  const user=req.user
  if(user.role!=="admin"){
    return res.status(401).json({message:"you are not allowed for this activity"})
  }
  next()
}