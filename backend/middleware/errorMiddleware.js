// 404 handler, runs when no route matched
export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
}

// central error handler. controllers use try/catch and call next(err) or throw.
export function errorHandler(err, req, res, next) {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Something went wrong";

  // map the common mongoose errors to sensible status codes
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(", ") || message;
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = "That value is already in use";
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
}
