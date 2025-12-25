import {AppError} from "../utils/AppError.js";

// Development errors
const devErrors = (res, error) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stackTrace: error.stack,
    error: error,
  });
};

// Handle Mongoose CastError
const castErrorHandler = (err) => {
  const msg = `Invalid value for ${err.path}: ${err.value}!`;
  return new AppError(msg, 400);
};

// Handle Mongoose duplicate key
const duplicateKeyErrorHandler = (err) => {
  const name = err.keyValue.name;
  const msg = `There is already a movie with name ${name}. Please use another name!`;
  return new AppError(msg, 400);
};

// Handle Mongoose validation error
const validationErrorHandler = (err) => {
  const errors = Object.values(err.errors).map((val) => val.message);
  const errorMessages = errors.join(". ");
  const msg = `Invalid input data: ${errorMessages}`;
  return new AppError(msg, 400);
};

// Production errors
const prodErrors = (res, error) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong! Please try again later.",
    });
  }
};

// Main error handler middleware
export const globalErrorHandler = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    
    devErrors(res, error);
  } else if (process.env.NODE_ENV === "production") {
    if (error.name === "CastError") error = castErrorHandler(error);
    if (error.code === 11000) error = duplicateKeyErrorHandler(error);
    if (error.name === "ValidationError") error = validationErrorHandler(error);

    prodErrors(res, error);
  }
};


