const mongoose = require('mongoose')

// ─── Schema ──────────────────────────────────────────────────────────────────
// We cache news articles fetched from NewsAPI in MongoDB
// This saves API quota — instead of calling NewsAPI every request,
// we check if we have a fresh cache first (< 30 minutes old)
const newsSchema = new mongoose.Schema(
  {
    category: {
      type:    String,
      required: true,
      lowercase: true,
      // One cache document per category
      index: true,
    },

    // The full array of articles returned by NewsAPI for this category
    articles: [
      {
        title:       { type: String },
        description: { type: String },
        url:         { type: String },
        urlToImage:  { type: String },
        publishedAt: { type: Date },
        source: {
          id:   { type: String },
          name: { type: String },
        },
        // Phase 4: track click count for "Trending" feature
        clicks: { type: Number, default: 0 },
      },
    ],

    // When this cache was last refreshed from NewsAPI
    // Used to decide if cache is stale (> 30 min old)
    cachedAt: {
      type:    Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

// ─── Index ────────────────────────────────────────────────────────────────────
// Unique index on category so each category has exactly one cache doc
newsSchema.index({ category: 1 }, { unique: true })

module.exports = mongoose.model('News', newsSchema)
