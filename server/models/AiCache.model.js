const mongoose = require('mongoose')

// Stores AI responses so same article is never processed twice
const aiCacheSchema = new mongoose.Schema(
  {
    // Unique key = article URL + type of AI request
    articleUrl: {
      type:     String,
      required: true,
    },
    type: {
      type:     String,
      required: true,
      enum:     ['summary', 'explain', 'sentiment'],
    },
    // The actual AI response text
    result: {
      type:     String,
      required: true,
    },
  },
  { timestamps: true }
)

// Compound unique index — same URL + same type = one cache entry
aiCacheSchema.index({ articleUrl: 1, type: 1 }, { unique: true })

module.exports = mongoose.model('AiCache', aiCacheSchema)