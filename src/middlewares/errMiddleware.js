import dotenv from "dotenv";
dotenv.config();
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// const errHandler = (err, req, res, next) => {
//   // Check if headers are already sent
//   if (res.headersSent) {
//     return next(err); // Pass to default Express error handler
//   }

//   // Determine status code
//   const statusCode =
//     err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

//   // Set error message
//   const message = err.message || "Internal Server Error";

//   // Send JSON response
//   res.status(statusCode).json({
//     success: false,
//     message,
//     stack: process.env.NODE_ENV === "production" ? null : err.stack,
//   });
// };
const errHandler = (err, req, res, next) => {
  // Check if headers are already sent
  if (res.headersSent) {
    return next(err); // Pass to default Express error handler
  }
  console.error("Error Handler - Full Error Object:", err); // Add this line!!!

  // Determine status code
  const statusCode =
    err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  // Set error message
  const message = err.message || "Internal Server Error";

  // Send JSON response
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export { notFound, errHandler };
