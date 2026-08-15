const AiCache          = require('../models/AiCache.model')
const { summarizeArticle, explainSimply, analyzeSentiment } = require('../services/ai.service')

// ─── Helper: cache-first AI call ──────────────────────────────────────────
// 1. Check if result exists in MongoDB
// 2. If yes → return it (no AI call)
// 3. If no  → call AI → save to cache → return result
const getCachedOrFetch = async (articleUrl, type, fetchFn) => {
  // 1. Check cache
  const cached = await AiCache.findOne({ articleUrl, type })
  if (cached) {
    console.log(`📦 Returning cached AI ${type} for: ${articleUrl}`)
    return { result: cached.result, cached: true }
  }

  // 2. Call AI
  console.log(`🤖 Calling Groq AI for ${type}: ${articleUrl}`)
  const result = await fetchFn()

  // 3. Save to cache
  await AiCache.create({ articleUrl, type, result })

  return { result, cached: false }
}

// ─── @route  POST /api/ai/summarize ───────────────────────────────────────
// @access Protected
const summarize = async (req, res, next) => {
  try {
    const { title, description, url } = req.body

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: 'title and url are required',
      })
    }

    const { result, cached } = await getCachedOrFetch(
      url,
      'summary',
      () => summarizeArticle(title, description || title)
    )

    res.status(200).json({ success: true, summary: result, cached })

  } catch (error) {
    next(error)
  }
}

// ─── @route  POST /api/ai/explain ─────────────────────────────────────────
// @access Protected
const explain = async (req, res, next) => {
  try {
    const { title, description, url } = req.body

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: 'title and url are required',
      })
    }

    const { result, cached } = await getCachedOrFetch(
      url,
      'explain',
      () => explainSimply(title, description || title)
    )

    res.status(200).json({ success: true, explanation: result, cached })

  } catch (error) {
    next(error)
  }
}

// ─── @route  POST /api/ai/sentiment ───────────────────────────────────────
// @access Protected
const sentiment = async (req, res, next) => {
  try {
    const { title, description, url } = req.body

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: 'title and url are required',
      })
    }

    const { result, cached } = await getCachedOrFetch(
      url,
      'sentiment',
      () => analyzeSentiment(title, description || title)
    )

    res.status(200).json({ success: true, sentiment: result, cached })

  } catch (error) {
    next(error)
  }
}

module.exports = { summarize, explain, sentiment }