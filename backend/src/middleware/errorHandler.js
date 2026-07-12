// Global error handler — keep last in the middleware chain.
// The 4-arg signature is required for Express to treat this as an error handler.
function errorHandler(err, req, res, next) {
  console.error('API error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
}

module.exports = errorHandler;
