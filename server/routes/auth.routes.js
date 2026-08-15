const express    = require('express')
const router     = express.Router()
const { register, login, getMe,updatePreferences } = require('../controllers/auth.controller')
const { protect } = require('../middleware/auth.middleware')

// ─── Auth Routes ──────────────────────────────────────────────────────────────
// All prefixed with /api/auth (set in server.js)
//
// Public routes — no JWT needed
router.post('/register', register)   // POST /api/auth/register
router.post('/login',    login)      // POST /api/auth/login

// Protected routes — JWT required
// protect runs first, then getMe
router.get('/me', protect, getMe)    // GET  /api/auth/me
router.put('/preferences', protect, updatePreferences)  // PUT /api/auth/preferences
module.exports = router
