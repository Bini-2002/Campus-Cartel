const mysql = require("mysql2/promise")

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "campuscraft",
}

// Create a connection pool
const pool = mysql.createPool(dbConfig)

// Export the database connection
module.exports = {
  db: pool,
  dbConfig,
}
