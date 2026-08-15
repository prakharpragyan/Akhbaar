const { getNewsByCategory } = require('../services/news.service')
const User = require('../models/User.model')
const News = require('../models/News.model')

// Valid categories — matches the frontend CategoryFilter options
const VALID_CATEGORIES = [
  'general', 'technology', 'business',
  'science', 'health', 'sports',
  'entertainment',
]

// ─── @route  GET /api/news ────────────────────────────────────────────────────
// @desc   Fetch news articles for a category (with caching)
// @access Protected (requires JWT)
// @query  ?category=technology
const getNews = async (req, res, next) => {
  try {
    // Read category from query string, default to 'general'
    let { category = 'general' } = req.query

    // Sanitize input — only allow known categories
    category = category.toLowerCase()
    if (!VALID_CATEGORIES.includes(category)) {
      category = 'general'
    }

    // Delegate to service layer (handles caching + NewsAPI call)
    const articles = await getNewsByCategory(category)

    res.status(200).json({
      success:  true,
      category,
      count:    articles.length,
      articles,
    })
    console.log(`✅ Successfully returned news for category: ${category}`)

  } catch (error) {
    // If NewsAPI fails, send a clear message
    if (error.response?.status === 401) {
      return res.status(500).json({
        success: false,
        message: 'Invalid NewsAPI key — check your .env file',
      })
    }
    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'NewsAPI rate limit reached — try again later',
      })
    }
    next(error)
  }
}
const getPersonalizedNews = async (req, res, next) => {
  try{
    const preferences=req.user.preferences?.length>0?req.user.preferences:['general']
    const results=await Promise.all(preferences.map
    (category=>getNewsByCategory(category)))
    const articles=results.flat()
    res.status(200).json({
      success:true,
      preferences,
      count:articles.length,
      articles,
    })
  }catch(error){
    next(error)
  }
    
}

const toggleBookmark = async (req, res, next) => {
  try {
    const { url, title, description, urlToImage, source, publishedAt, category } = req.body

    if (!url) return res.status(400).json({ success: false, message: 'Article URL required' })

    const user = await User.findById(req.user._id)
    const isBookmarked = user.bookmarks.some((b) => b.url === url)

    if (isBookmarked) {
      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { bookmarks: { url } } }
      )
    } else {
      await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { bookmarks: { url, title, description, urlToImage, source, publishedAt, category } } }
      )
    }

    res.status(200).json({
      success: true,
      bookmarked: !isBookmarked,
      message: isBookmarked ? 'Bookmark removed' : 'Article bookmarked',
    })
  } catch (error) {
    next(error)
  }
}

const getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)

    res.status(200).json({
      success: true,
      count: user.bookmarks.length,
      bookmarks: user.bookmarks,
    })
  } catch (error) {
    next(error)
  }
}

const searchNews = async (req, res, next) => {
  try {
    const { q } = req.query
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query too short' })
    }

    const newsDocs = await News.find({})
    const allArticles = newsDocs.flatMap((doc) => doc.articles)
    const regex = new RegExp(q.trim(), 'i')
    const results = allArticles.filter(
      (a) => regex.test(a.title) || regex.test(a.description)
    )

    res.status(200).json({
      success: true,
      query: q,
      count: results.length,
      articles: results,
    })
  } catch (error) {
    next(error)
  }
}
const trackClick = async (req, res, next) => {
  try {
    const { url } = req.body
    if (!url) return res.status(400).json({ success: false, message: 'URL required' })

    // Find the news document that contains this article
    const newsDoc = await News.findOne({ 'articles.url': url })

    if (!newsDoc) {
      // Article not in cache yet — still return success
      // (don't error out just because article isn't cached)
      return res.status(200).json({ success: true, message: 'Click noted' })
    }

    // Find the article index inside the articles array
    const articleIndex = newsDoc.articles.findIndex((a) => a.url === url)

    if (articleIndex === -1) {
      return res.status(200).json({ success: true, message: 'Click noted' })
    }

    // Increment clicks at the exact index
    newsDoc.articles[articleIndex].clicks =
      (newsDoc.articles[articleIndex].clicks || 0) + 1

    // Save the updated document
    await newsDoc.save()

    res.status(200).json({
      success: true,
      message: 'Click tracked',
      clicks:  newsDoc.articles[articleIndex].clicks,
    })
  } catch (error) {
    next(error)
  }
}


const getTrending = async (req, res, next) => {
  try {
    const newsDocs = await News.find({})

    // Flatten all articles from all categories
    const allArticles = newsDocs.flatMap((doc) => doc.articles)

    // Sort by clicks — treat missing clicks as 0
    const trending = allArticles
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 10)

    res.status(200).json({
      success:  true,
      count:    trending.length,
      articles: trending,
    })
  } catch (error) {
    next(error)
  }
}

const getRecommendations=async(req,res,next)=>{
  try{
    const newsDocs=await News.find({})
    const allArticles=newsDocs.flatMap((doc)=>doc.articles)
    const clickedArticles=allArticles.filter((a)=>(a.clicks || 0)>0)
    const categoryScore={}
    clickedArticles.forEach((a)=>{
      if(a.category){
        categoryScore[a.category]=(categoryScore[a.category]||0)+(a.clicks || 1)
      }
    })
    const topCategories=Object.entries(categoryScore)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,2)
      .map(([cat])=>cat)

      const categories=topCategories.length>0?topCategories:(req.user.preferences||['general'])
      const results=await Promise.all(categories.map((cat)=>getNewsByCategory(cat)))
      const clickedUrls=new Set(clickedArticles.map((a)=>a.url))
      const recommnedations=results.flat().filter((a)=>!clickedUrls.has(a.url)).slice(0,12)
      res.status(200).json({
        success:true,
        basedOn: categories,
        count: recommnedations.length,
        articles: recommnedations,
      })
  } catch (error) {
    next(error)
  }
}

module.exports = { getNews, getPersonalizedNews, toggleBookmark, getBookmarks, searchNews, trackClick, getTrending, getRecommendations }
