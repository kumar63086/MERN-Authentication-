import express from "express";
import { login, logout, myprofile,  RefreshToken,  Register, verifyOtp, verifyUser } from "../controllers/user.controller.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

// POST /api/v1/auth/register
router.post("/register", Register);
// POST  /api/v1/auth/verify
router.post("/verify/:token" ,verifyUser)
//POST /api/v1/auth/login
router.post('/login',login)
//POST /api/v1/auth/verifyotp
router.post("/verifyotp",verifyOtp)
//GET /api/v1/auth/me
router.get('/me', isAuth,myprofile)
//Post /api/v1/auth/refreshToken
router.post('/refreshToken',RefreshToken)
//Post /api/v1/auth/logout
router.post('/logout',isAuth,logout)


export default router;
