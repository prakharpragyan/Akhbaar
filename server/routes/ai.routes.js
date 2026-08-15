const express    = require('express')
const router     = express.Router()
const { summarize, explain, sentiment } = require('../controllers/ai.controller')
const { protect } = require('../middleware/auth.middleware')

// All AI routes are protected — user must be logged in
router.post('/summarize', protect, summarize)   // POST /api/ai/summarize
router.post('/explain',   protect, explain)     // POST /api/ai/explain
router.post('/sentiment', protect, sentiment)   // POST /api/ai/sentiment

module.exports = router