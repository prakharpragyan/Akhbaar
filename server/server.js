// ─── Load environment variables FIRST ────────────────────────────────────────
// dotenv reads .env file and puts values into process.env
// Must be called before anything else uses process.env
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

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allows your React frontend (different port/domain) to call this API
// Without this, browsers block cross-origin requests
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,  // allows cookies if needed later
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
// Prevents brute-force attacks on auth endpoints
// 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max:      100,
  message:  { success: false, message: 'Too many requests — try again later' },
})
app.use('/api/', limiter)

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
