// ─── Global Error Handler ─────────────────────────────────────────────────────
// This is the LAST middleware in server.js (app.use(errorHandler))
// Any error passed via next(error) lands here
// This means controllers never need to format error responses —
// they just throw or call next(err)

const errorHandler = (err, req, res, next) => {
  // Log for debugging (use a proper logger like Winston in production)
  console.error(`❌ ${err.message}`)

  let statusCode = err.statusCode || 500
  let message    = err.message    || 'Internal Server Error'

  // ── Mongoose: duplicate key (e.g. email already exists) ──
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    message    = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
    statusCode = 400
  }

  // ── Mongoose: validation error ──
  if (err.name === 'ValidationError') {
    message    = Object.values(err.errors).map((e) => e.message).join(', ')
    statusCode = 400
  }

  // ── Mongoose: invalid ObjectId ──
  if (err.name === 'CastError') {
    message    = `Invalid ${err.path}`
    statusCode = 400
  }

  // ── JWT errors ──
  if (err.name === 'JsonWebTokenError') {
    message    = 'Invalid token'
    statusCode = 401
  }
  if (err.name === 'TokenExpiredError') {
    message    = 'Token expired — please login again'
    statusCode = 401
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only show stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

module.exports = { errorHandler }
