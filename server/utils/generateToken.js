const jwt = require('jsonwebtoken')

// Generates a JWT token for a given user ID
// This token is sent to the frontend after login/register
// The frontend stores it and sends it back with every request
//
// What's INSIDE the token (the "payload"):
//   { id: "64abc..." }   ← the user's MongoDB _id
//
// The token is SIGNED with JWT_SECRET — the backend can verify
// it hasn't been tampered with, without hitting the database
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },               // payload
    process.env.JWT_SECRET,       // secret key
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }  // expiry
  )
}

module.exports = generateToken
