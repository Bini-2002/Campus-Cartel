const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const { db } = require("../db")

// Change password endpoint
router.put("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.userId

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" })
    }

    // Get user's current password
    const [users] = await db.query("SELECT password FROM users WHERE id = ?", [userId])
    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Current password is incorrect" })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId])

    res.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Password change error:", error)
    res.status(500).json({ error: "Failed to update password" })
  }
})

// Update notification preferences endpoint
router.put("/notifications", async (req, res) => {
  try {
    const { preferences } = req.body
    const userId = req.user.userId

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ error: "Invalid notification preferences" })
    }

    // Store notification preferences in the database
    await db.query("UPDATE users SET notification_preferences = ? WHERE id = ?", [
      JSON.stringify(preferences),
      userId,
    ])

    res.json({ message: "Notification preferences updated successfully" })
  } catch (error) {
    console.error("Notification preferences update error:", error)
    res.status(500).json({ error: "Failed to update notification preferences" })
  }
})

// Delete account endpoint
router.delete("/delete-account", async (req, res) => {
  try {
    const userId = req.user.userId

    // Delete user's projects and related data first (due to foreign key constraints)
    await db.query("DELETE FROM projects WHERE user_id = ?", [userId])
    
    // Delete user's job listings and related data
    await db.query("DELETE FROM job_listings WHERE company_id = ?", [userId])
    
    // Delete user's applications
    await db.query("DELETE FROM applications WHERE student_id = ?", [userId])
    
    // Delete user's messages
    await db.query("DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?", [userId, userId])
    
    // Delete user's connections
    await db.query("DELETE FROM student_connections WHERE requester_id = ? OR receiver_id = ?", [userId, userId])
    
    // Finally, delete the user
    await db.query("DELETE FROM users WHERE id = ?", [userId])

    res.json({ message: "Account deleted successfully" })
  } catch (error) {
    console.error("Account deletion error:", error)
    res.status(500).json({ error: "Failed to delete account" })
  }
})

module.exports = router 