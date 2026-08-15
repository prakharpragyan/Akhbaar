const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

// ─── Schema ──────────────────────────────────────────────────────────────────
// This defines the shape of every User document in MongoDB
// Think of it like a table definition in SQL
const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,         // removes accidental whitespace
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type:     String,
      required: [true, 'Email is required'],
      unique:   true,         // MongoDB creates a unique index on this field
      lowercase: true,        // stored as lowercase always
      trim:     true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select:    false,       // IMPORTANT: never returned in queries by default
    },

    // Phase 2: user's chosen topics — stored as array of strings
    // e.g. ["technology", "finance", "sports"]
    preferences: {
      type:    [String],
      default: ['general'],
      enum: [                 // only these values allowed
        'general', 'technology', 'business',
        'finance', 'science', 'health', 'sports',
        'entertainment', 'politics', 'world',
      ],
    },

    // Phase 4: bookmarked article URLs
    // Replace the old bookmarks field
bookmarks: {
  type: [
    {
      url:         { type: String },
      title:       { type: String },
      description: { type: String },
      urlToImage:  { type: String },
      publishedAt: { type: Date   },
      category:    { type: String },
      source: {
        id:   { type: String },
        name: { type: String },
      },
    },
  ],
  default: [],
},
    
    
    
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
)

// ─── Pre-save Hook ────────────────────────────────────────────────────────────
// This runs BEFORE every .save() call
// It hashes the password if it was modified (or is new)
// This way we NEVER store plain text passwords in the DB
userSchema.pre('save', async function (next) {
  // If password wasn't changed, skip hashing
  if (!this.isModified('password')) return next()

  // Salt rounds = 12 → higher = more secure but slower
  // 12 is the industry standard balance
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// ─── Instance Method ─────────────────────────────────────────────────────────
// Called on a user document to check if a plain password matches the hash
// Usage: const isMatch = await user.comparePassword('plaintext')
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
