const mongoose = require('mongoose')

// connectDB is called once when the server starts
// Mongoose maintains a connection pool automatically after this
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)

    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`)
    // Exit the process — app cannot run without DB
    process.exit(1)
  }
}

module.exports = connectDB
