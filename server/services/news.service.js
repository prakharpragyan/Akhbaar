const axios = require('axios')
const News  = require('../models/News.model')

// ─── Cache TTL ────────────────────────────────────────────────────────────────
// How many milliseconds before cache is considered stale
// 30 minutes = 30 * 60 * 1000
const CACHE_TTL_MS = 30 * 60 * 1000

// ─── fetchFromNewsAPI ─────────────────────────────────────────────────────────
// Calls the real NewsAPI and returns articles
// Called only when cache is missing or stale
const fetchFromNewsAPI = async (category) => {
  const url = 'https://newsapi.org/v2/top-headlines'

  const response = await axios.get(url, {
    params: {
      category: category === 'general' ? undefined : category,
      country:  'us',          // India — change to 'us' for US news
      pageSize: 20,            // max articles per request
      apiKey:   process.env.NEWS_API_KEY,
    },
  })

  if (response.data.status !== 'ok') {
    throw new Error('NewsAPI returned an error: ' + response.data.message)
  }

  // Filter out articles with no title or [Removed] content
  return response.data.articles.filter(
    (a) => a.title && a.title !== '[Removed]'
  )
}

// ─── getNewsByCategory ────────────────────────────────────────────────────────
// Main function used by the news controller
//
// Cache-first strategy:
//   1. Check MongoDB for a cached document for this category
//   2. If cache exists AND is fresh (< 30 min old) → return cached articles
//   3. If cache is stale or missing → call NewsAPI → save to MongoDB → return
//
// Why cache?
//   NewsAPI free tier = 100 requests/day. Without caching, 100 users
//   hitting the feed = 100 API calls. With caching, it's just 1 per 30 min.
const getNewsByCategory = async (category = 'general') => {
  const now = Date.now()

  // 1. Look for existing cache
  const cached = await News.findOne({ category })

  // 2. Return cache if it's still fresh
  if (cached && cached.articles.length > 0 && (now - new Date(cached.cachedAt).getTime()) < CACHE_TTL_MS) {
    console.log(`📦 Returning cached news for: ${category}`)
    return cached.articles
  }

  // 3. Cache is stale or missing — fetch fresh data
  console.log(`🌐 Fetching fresh news from NewsAPI for: ${category}`)
  const articles = await fetchFromNewsAPI(category)

  // 4. Upsert: update existing cache doc or create new one
  // findOneAndUpdate with upsert:true = insert if not found, update if found
  await News.findOneAndUpdate(
    { category },
    { articles, cachedAt: new Date() },
    { upsert: true, new: true }
  )

  return articles
}

module.exports = { getNewsByCategory }
