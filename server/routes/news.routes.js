const express = require('express')
const router  = express.Router()
const {
  getNews,
  getPersonalizedNews,
  toggleBookmark,
  getBookmarks,
  searchNews,
  trackClick,
  getTrending,
  getRecommendations,
} = require('../controllers/news.controller')
const { protect } = require('../middleware/auth.middleware')

// Existing routes
router.get('/',             protect, getNews)
router.get('/personalized', protect, getPersonalizedNews)

// Phase 4 routes
router.post('/bookmark',   protect, toggleBookmark)   // POST /api/news/bookmark
router.get('/bookmarks',   protect, getBookmarks)     // GET  /api/news/bookmarks
router.get('/search',      protect, searchNews)       // GET  /api/news/search?q=
router.post('/click',      protect, trackClick)       // POST /api/news/click
router.get('/trending',    protect, getTrending)      // GET  /api/news/trending
router.get('/recommendations', protect, getRecommendations) // GET  /api/news/recommendations
module.exports = router