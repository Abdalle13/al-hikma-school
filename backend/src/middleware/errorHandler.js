// central error handler. controllers can throw an ApiError or any Error.
export function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Something went wrong";

  if (process.env.NODE_ENV !== "production") {
    // keep the stack visible during development
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(err.details ? { details: err.details } : {}),
  });
}

export default errorHandler;
