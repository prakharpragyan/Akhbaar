const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })
require('dotenv').config()

const express     = require('express')
const cors        = require('cors')
const morgan      = require('morgan')
const rateLimit   = require('express-rate-limit')

const connectDB             = require('./config/db')
const authRoutes            = require('./routes/auth.routes')
const newsRoutes            = require('./routes/news.routes')
const { errorHandler }      = require('./middleware/error.middleware')
const aiRoutes=require('./routes/ai.routes')

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB()

// ─── Create Express App ───────────────────────────────────────────────────────
const app = express()

// Trust reverse proxy (Render, Railway, Heroku, Nginx) for accurate IP rate limiting
app.set('trust proxy', 1)

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allows React frontend to call this API, handling trailing slashes and multiple environments
const clientOrigin = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '')
const allowedOrigins = Array.from(new Set([clientOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173']))

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true)
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    callback(null, false)
  },
  credentials: true,
}))

// ─── Body Parser ─────────────────────────────────────────────────────────────
// Parses incoming JSON bodies so req.body works
// Without this, req.body is undefined
app.use(express.json({ limit: '10kb' }))      // max 10kb body size
app.use(express.urlencoded({ extended: true }))

// ─── HTTP Logger ──────────────────────────────────────────────────────────────
// Morgan logs every request: "POST /api/auth/login 200 45ms"
// 'dev' format is colorful and great for development
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// A single global limiter shared across every /api/* route was too strict for
// real usage: a single feed load fires one request per article for AI
// sentiment, plus the feed/personalized/recommendations calls themselves —
// easily 20-30+ requests in a few seconds. That burned through the shared
// budget almost immediately, after which EVERY route (including unrelated
// ones like /api/news/bookmarks) started returning 429, even though only the
// login/register endpoints actually need brute-force protection.
//
// Fix: a strict limiter only on the auth routes that need it, and a much
// more generous one for everything else (news + AI), sized for a feed page
// that can trigger dozens of calls per load.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max:      30,              // login/register attempts per IP
  message:  { success: false, message: 'Too many attempts — try again later' },
})

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,   // 5 minutes
  max:      500,             // generous enough for a feed of AI-annotated cards
  message:  { success: false, message: 'Too many requests — try again in a moment' },
})

app.use('/api/auth', authLimiter)
app.use('/api/news', apiLimiter)
app.use('/api/ai', apiLimiter)

// ─── Health Check ─────────────────────────────────────────────────────────────
// Simple endpoint to verify the server is running
// Visit http://localhost:5000/api/health in browser to confirm
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Akhbaar API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  })
})

// ─── Routes ───────────────────────────────────────────────────────────────────
// Mount route files — prefix all routes with /api
app.use('/api/auth', authRoutes)   // /api/auth/register, /api/auth/login, /api/auth/me
app.use('/api/news', newsRoutes)   // /api/news?category=technology
app.use('/api/ai', aiRoutes)    // /api/ai/summarize, /api/ai/explain, /api/ai/sentiment

// ─── 404 Handler ─────────────────────────────────────────────────────────────
// Catches any request to a route that doesn't exist
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
})

// ─── Global Error Handler ─────────────────────────────────────────────────────
// MUST be last middleware — catches all errors passed via next(error)
app.use(errorHandler)

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Akhbaar server running on http://localhost:${PORT}`)
  console.log(`📰 Environment: ${process.env.NODE_ENV || 'development'}`)
})