const AppError = require("../utils/apperror");

const handelCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return AppError(message, 400);
};

const handelJWTError = () =>
  new AppError("Invalid token. Please login again..", 401);

const handelJWTExpiredError = () =>
  new AppError("Please login again!!! Your sesion is expired....", 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err };
  if (error.name === "ValidatorError") err = handelCastErrorDB(error);
  if (error.name === "JsonWebTokenError") err = handelJWTError();
  if (error.name === "TokenExpiredError") err = handelJWTExpiredError();

  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).render("error", {
      title: "Somethinf wenr wrong!",
      msg: err.message,
    });
  }
};
