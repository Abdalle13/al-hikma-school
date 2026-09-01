// small helper so controllers can do: throw new ApiError(404, "not found")
export class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    if (details) this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export default ApiError;
