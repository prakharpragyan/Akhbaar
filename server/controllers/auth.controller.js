const User          = require('../models/User.model')
const generateToken = require('../utils/generateToken')

// ─── Helper: build the user response object ───────────────────────────────────
// We never send the password — this shapes what the frontend receives
const userResponse = (user, token) => ({
  token,
  user: {
    id:          user._id,
    name:        user.name,
    email:       user.email,
    preferences: user.preferences,
  },
})

// ─── @route  POST /api/auth/register ─────────────────────────────────────────
// @desc   Create a new user account
// @access Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, preferences } = req.body

    // Basic field check — Mongoose validation catches the rest
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password',
      })
    }

    // Check if email is already registered
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      })
    }

    // Create user — password hashing happens in the pre-save hook
    // (see User.model.js — we never hash manually here)
    const user = await User.create({
      name,
      email,
      password,
      preferences: preferences?.length ? preferences : ['general'],
    })

    // Generate JWT for this user
    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      ...userResponse(user, token),
    })

  } catch (error) {
    // Pass to global error handler (error.middleware.js)
    next(error)
  }
}

// ─── @route  POST /api/auth/login ────────────────────────────────────────────
// @desc   Login with email + password → returns JWT
// @access Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      })
    }

    // Find user and INCLUDE password field (it's select:false by default)
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({
        success: false,
        // Intentionally vague — don't reveal if email exists or not
        message: 'Invalid email or password',
      })
    }

    // Compare plain password against bcrypt hash
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      ...userResponse(user, token),
    })

  } catch (error) {
    next(error)
  }
}

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
// @desc   Get current logged-in user's profile
// @access Protected (requires JWT)
const getMe = async (req, res, next) => {
  try {
    // req.user is attached by the protect middleware
    res.status(200).json({
      success: true,
      user: {
        id:          req.user._id,
        name:        req.user.name,
        email:       req.user.email,
        preferences: req.user.preferences,
      },
    })
  } catch (error) {
    next(error)
  }
}

const updatePreferences=async(req,res,next)=>{
  try{
    const { preferences } = req.body // Expecting an array of categories
    if (!preferences || !Array.isArray(preferences)) {
      return res.status(400).json({
        success: false,
        message: 'Preferences must be an array',
      })
    }
    // Update the user's preferences
    req.user.preferences = preferences
    await req.user.save()


    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: req.user.preferences,
    })
  }catch(error){
    next(error)
  }
}

module.exports = { register, login, getMe, updatePreferences }
