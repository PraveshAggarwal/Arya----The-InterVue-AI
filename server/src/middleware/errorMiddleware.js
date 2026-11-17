
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

const errorHandler = (error, req, res, next) => {
  console.error("API Error:", error);

  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error.";

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = error.message;
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID.";
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists.";
  }

  if (error.name === "MulterError") {
    statusCode = 400;
    message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Uploaded file exceeds the size limit."
        : error.message;
  }

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production" && statusCode === 500
        ? "Internal server error."
        : message,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
