const { ZodError } = require("zod");

function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-unused-vars
  const status = err.statusCode || 500;

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation error",
      details: err.issues,
    });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }

  // eslint-disable-next-line no-console
  console.error("API error:", err);

  return res.status(status).json({
    error: err.message || "Internal server error",
  });
}

module.exports = { errorHandler };

