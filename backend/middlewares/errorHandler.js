import { ApiError } from "../utils/ApiError.js";
import { isProd } from "../config/env.js";

export function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found:${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, _req, res, _next) {
  let error = err;

  if (error.name === "ValidationError") {
    const details = Object.values(error.errors).map((e) => e.message);
    error = ApiError.badRequest("Validation failed", details);
  } else if (error.name === "CastError") {
    error = ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);
  } else if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "field";
    error = ApiError.conflict(`${field} already exists`);
  } else if (!(error instanceof ApiError)) {
    error = ApiError.internal(error.message);
  }

  if (!isProd && error.statusCode >= 500) {
    console.error(error);
  }
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    ...(error.details ? { details: error.details } : {}),
  });
}
