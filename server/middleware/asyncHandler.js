/**
 * Wraps an async function to catch any errors and pass them to the next middleware.
 * This ensures that errors in async routes are handled by the global error handler.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
