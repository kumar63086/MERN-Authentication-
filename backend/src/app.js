import express from "express";
import cors from "cors";
import {globalErrorHandler} from "./middleware/ErrorHanlere.js";
import { swaggerSpec, swaggerUiMiddleware } from "./config/swagger.js";
import { AppError } from "./utils/AppError.js";
import userRoutes from "./router/User.Router.js";
import './config/redis.js'
import morgan from "morgan";
import nocache from "nocache"
import cookieParser from "cookie-parser";
const app = express();


app.use(express.json({ limit: "4gb" }));
app.use(express.urlencoded({ limit: "4gb", extended: true }));
app.use(cookieParser())
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
}));

 //Use morgan only in development mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(nocache())
app.enable("trust proxy");
app.get("/", (req, res) => {
  res.status(200).json({message:"Mern Stack Authentication Api Tesings Working...!"});
});
app.use("/api-docs", swaggerUiMiddleware.serve, swaggerUiMiddleware.setup(swaggerSpec));
app.use("/api/v1/auth", userRoutes);

// 404
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
 
// ERROR HANDLER
app.use(globalErrorHandler);
export default app;

