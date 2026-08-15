const jwt  = require('jsonwebtoken')
const User = require('../models/User.model')

// ─── protect middleware ───────────────────────────────────────────────────────
// Attach this to any route that requires the user to be logged in
// Usage: router.get('/profile', protect, controller)
//
// Flow:
//   1. Read the Authorization header: "Bearer eyJhbGci..."
//   2. Extract and verify the token
//   3. Look up the user in MongoDB
//   4. Attach user to req.user so the controller can use it
//   5. Call next() to pass control to the actual route handler

const protect = async (req, res, next) => {
  try {
    // 1. Check header exists and starts with "Bearer"
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — no token provided',
      })
    }

    // 2. Extract token (everything after "Bearer ")
    const token = authHeader.split(' ')[1]

    // 3. Verify the token — throws if expired or tampered with
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // decoded = { id: "64abc...", iat: 1234567, exp: 1234567 }

    // 4. Find the user — exclude password field (select: false in schema)
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user no longer exists',
      })
    }

    // 5. Attach to request so controllers can use req.user
    req.user = user
    next()

  } catch (error) {
    // JWT expired or invalid signature
    return res.status(401).json({
      success: false,
      message: 'Not authorized — invalid or expired token',
    })
  }
}

module.exports = { protect }

