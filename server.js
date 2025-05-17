const express = require("express")
const cors = require("cors")
const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { db, dbConfig } = require("./db")
const userRoutes = require("./routes/users")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static("uploads"))

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads")
}
if (!fs.existsSync("uploads/profiles")) {
    fs.mkdirSync("uploads/profiles")
}
if (!fs.existsSync("uploads/projects")) {
    fs.mkdirSync("uploads/projects")
}

// Initialize database
async function initDatabase() {
    try {
        // First connect without specifying the database
        const tempDb = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
        })

        // Create the database if it doesn't exist
        await tempDb.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``)
        await tempDb.end()

        // Create tables
        await createTables()
        console.log("Connected to MySQL database")
    } catch (error) {
        console.error("Database connection failed:", error)
    }
}

async function createTables() {
    // Users table (for both students and companies)
    await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      user_type ENUM('student', 'company') NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      company_name VARCHAR(255),
      university VARCHAR(255),
      year_of_study INT,
      industry VARCHAR(100),
      website VARCHAR(255),
      phone VARCHAR(20),
      location VARCHAR(255),
      bio TEXT,
      profile_image VARCHAR(255),
      notification_preferences JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      verification_code VARCHAR(10) NULL,
      verification_expires DATETIME NULL,
      reset_code VARCHAR(10) NULL,
      reset_expires DATETIME NULL,
      is_verified BOOLEAN DEFAULT FALSE,
      INDEX idx_email (email),
      INDEX idx_user_type (user_type),
      INDEX idx_verification (email, verification_code),
      INDEX idx_reset (email, reset_code)
    )
  `)

    // Projects table
    await db.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image VARCHAR(255),
      github_url VARCHAR(255),
      demo_url VARCHAR(255),
      likes_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

    // Project skills table
    await db.query(`
    CREATE TABLE IF NOT EXISTS project_skills (
      id INT AUTO_INCREMENT PRIMARY KEY,
      project_id INT NOT NULL,
      skill_name VARCHAR(100) NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `)

    // Job listings table
    await db.query(`
    CREATE TABLE IF NOT EXISTS job_listings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      requirements TEXT,
      job_type ENUM('internship', 'fulltime', 'parttime', 'contract') NOT NULL,
      location VARCHAR(255),
      salary VARCHAR(100),
      deadline DATE,
      status ENUM('active', 'paused', 'closed') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

    // Job skills table
    await db.query(`
    CREATE TABLE IF NOT EXISTS job_skills (
      id INT AUTO_INCREMENT PRIMARY KEY,
      job_id INT NOT NULL,
      skill_name VARCHAR(100) NOT NULL,
      FOREIGN KEY (job_id) REFERENCES job_listings(id) ON DELETE CASCADE
    )
  `)

    // Applications table
    await db.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      job_id INT NOT NULL,
      student_id INT NOT NULL,
      cover_letter TEXT,
      resume_url VARCHAR(255),
      status ENUM('new', 'reviewed', 'interviewing', 'rejected', 'hired') DEFAULT 'new',
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES job_listings(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_application (job_id, student_id)
    )
  `)

    // Project likes table
    await db.query(`
    CREATE TABLE IF NOT EXISTS project_likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      project_id INT NOT NULL,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_like (project_id, user_id)
    )
  `)

    // Student connections table
    await db.query(`
    CREATE TABLE IF NOT EXISTS student_connections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      requester_id INT NOT NULL,
      receiver_id INT NOT NULL,
      status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_connection (requester_id, receiver_id)
    )
  `)

    // Messages table
    await db.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sender_id INT NOT NULL,
      receiver_id INT NOT NULL,
      subject VARCHAR(255),
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

    console.log("Database tables created successfully")
}

// Improved file upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = file.fieldname === "profileImage" ? "uploads/profiles" : "uploads/projects"
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
    },
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow different file types based on field name
        if (file.fieldname === "resume") {
            // Allow PDF, DOC, DOCX for resumes
            const allowedTypes = /pdf|doc|docx/
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
            const mimetype = /application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)/.test(
                file.mimetype,
            )

            if (mimetype && extname) {
                return cb(null, true)
            } else {
                cb(new Error("Only PDF, DOC, and DOCX files are allowed for resumes"))
            }
        } else {
            // Allow images for profile pictures and project images
            const allowedTypes = /jpeg|jpg|png|gif|webp/
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
            const mimetype = allowedTypes.test(file.mimetype)

            if (mimetype && extname) {
                return cb(null, true)
            } else {
                cb(new Error("Only image files are allowed"))
            }
        }
    },
})

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
        return res.status(401).json({ error: "Authentication required" })
    }

    jwt.verify(token, process.env.JWT_SECRET || "your-secret-key", (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token" })
        }
        req.user = user
        next()
    })
}

// Use user routes
app.use("/api/users", authenticateToken, userRoutes)

// Auth Routes
const authRoutes = require("./routes/auth")
app.use("/api/auth", authRoutes)

// User Profile Routes
app.get("/api/users/profile", authenticateToken, async(req, res) => {
    try {
        const [users] = await db.query("SELECT * FROM users WHERE id = ?", [req.user.userId])

        if (users.length === 0) {
            return res.status(404).json({ error: "User not found" })
        }

        const user = users[0]
        delete user.password // Remove password from response

        res.json(user)
    } catch (error) {
        console.error("Profile fetch error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.put("/api/users/profile", authenticateToken, async(req, res) => {
    try {
        const { firstName, lastName, companyName, university, yearOfStudy, industry, website, phone, location, bio } =
        req.body

        // Convert undefined values to null and handle empty strings
        const sanitizeValue = (value) => {
            if (value === undefined || value === "") return null
            return value
        }

        const updateData = [
            sanitizeValue(firstName),
            sanitizeValue(lastName),
            sanitizeValue(companyName),
            sanitizeValue(university),
            yearOfStudy === undefined || yearOfStudy === "" ? null : Number(yearOfStudy),
            sanitizeValue(industry),
            sanitizeValue(website),
            sanitizeValue(phone),
            sanitizeValue(location),
            sanitizeValue(bio),
            req.user.userId,
        ]

        await db.query(
            `UPDATE users SET 
        first_name = ?, last_name = ?, company_name = ?, university = ?,
        year_of_study = ?, industry = ?, website = ?, phone = ?, location = ?, bio = ?
      WHERE id = ?`,
            updateData,
        )

        res.json({ message: "Profile updated successfully" })
    } catch (error) {
        console.error("Profile update error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Profile image upload route
app.post("/api/users/profile/image", authenticateToken, upload.single("profileImage"), async(req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file uploaded" })
        }

        const imagePath = req.file.path

        // Update user's profile image in database
        await db.query("UPDATE users SET profile_image = ? WHERE id = ?", [imagePath, req.user.userId])

        res.json({
            message: "Profile image updated successfully",
            imagePath: imagePath,
            imageUrl: `/${imagePath}`,
        })
    } catch (error) {
        console.error("Profile image upload error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Get student profile with projects (for companies to view applicants)
app.get("/api/students/:id/profile", authenticateToken, async(req, res) => {
    try {
        if (req.user.userType !== "company") {
            return res.status(403).json({ error: "Only companies can view student profiles" })
        }

        const studentId = req.params.id

        // Get student profile
        const [students] = await db.query(
            "SELECT id, first_name, last_name, university, year_of_study, bio, profile_image, email, phone, location FROM users WHERE id = ? AND user_type = 'student'", [studentId],
        )

        if (students.length === 0) {
            return res.status(404).json({ error: "Student not found" })
        }

        const student = students[0]

        // Get student's projects
        const [projects] = await db.query(
            `SELECT p.*, GROUP_CONCAT(ps.skill_name) as skills
       FROM projects p
       LEFT JOIN project_skills ps ON p.id = ps.project_id
       WHERE p.user_id = ?
       GROUP BY p.id
       ORDER BY p.created_at DESC`, [studentId],
        )

        // Format projects
        const formattedProjects = projects.map((project) => ({
            ...project,
            image: project.image ? project.image.replace(/\\/g, '/') : null,
            skills: project.skills ? project.skills.split(",") : [],
        }))

        res.json({
            ...student,
            projects: formattedProjects,
        })
    } catch (error) {
        console.error("Student profile fetch error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Download resume endpoint
app.get("/api/applications/:id/resume", authenticateToken, async(req, res) => {
    try {
        if (req.user.userType !== "company") {
            return res.status(403).json({ error: "Only companies can download resumes" })
        }

        const applicationId = req.params.id

        // Get application with resume path and verify company ownership
        const [applications] = await db.query(
            `SELECT a.resume_url, j.company_id 
       FROM applications a 
       JOIN job_listings j ON a.job_id = j.id 
       WHERE a.id = ? AND j.company_id = ?`, [applicationId, req.user.userId],
        )

        if (applications.length === 0) {
            return res.status(404).json({ error: "Application not found or not authorized" })
        }

        const resumePath = applications[0].resume_url

        if (!resumePath || !fs.existsSync(resumePath)) {
            return res.status(404).json({ error: "Resume file not found" })
        }

        // Send file for download
        res.download(resumePath, (err) => {
            if (err) {
                console.error("Resume download error:", err)
                res.status(500).json({ error: "Failed to download resume" })
            }
        })
    } catch (error) {
        console.error("Resume download error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Get all students for talent pool
app.get("/api/talent-pool", authenticateToken, async(req, res) => {
    try {
        if (req.user.userType !== "company") {
            return res.status(403).json({ error: "Only companies can access talent pool" })
        }

        const { search, university, skills, yearOfStudy } = req.query

        let query = `
      SELECT DISTINCT u.id, u.first_name, u.last_name, u.university, u.year_of_study, 
             u.bio, u.profile_image, u.location,
             GROUP_CONCAT(DISTINCT ps.skill_name) as skills,
             COUNT(DISTINCT p.id) as project_count
      FROM users u
      LEFT JOIN projects p ON u.id = p.user_id
      LEFT JOIN project_skills ps ON p.id = ps.project_id
      WHERE u.user_type = 'student'
    `

        const params = []
        const conditions = []

        if (search) {
            conditions.push("(u.first_name LIKE ? OR u.last_name LIKE ? OR u.bio LIKE ?)")
            params.push(`%${search}%`, `%${search}%`, `%${search}%`)
        }

        if (university) {
            conditions.push("u.university LIKE ?")
            params.push(`%${university}%`)
        }

        if (yearOfStudy) {
            conditions.push("u.year_of_study = ?")
            params.push(yearOfStudy)
        }

        if (skills) {
            conditions.push("ps.skill_name IN (?)")
            params.push(skills.split(","))
        }

        if (conditions.length > 0) {
            query += " AND " + conditions.join(" AND ")
        }

        query += " GROUP BY u.id ORDER BY u.created_at DESC LIMIT 50"

        const [students] = await db.query(query, params)

        // Format students data
        const formattedStudents = students.map((student) => ({
            ...student,
            image: student.profile_image ? student.profile_image.replace(/\\/g, '/') : null,
            skills: student.skills ? student.skills.split(",") : [],
        }))

        res.json(formattedStudents)
    } catch (error) {
        console.error("Talent pool fetch error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Student connections routes
app.get("/api/connections", authenticateToken, async(req, res) => {
    try {
        if (req.user.userType !== "student") {
            return res.status(403).json({ error: "Only students can access connections" })
        }

        const [connections] = await db.query(
            `SELECT c.*, u.first_name, u.last_name, u.university, u.profile_image
       FROM student_connections c
       JOIN users u ON (c.requester_id = u.id OR c.receiver_id = u.id)
       WHERE (c.requester_id = ? OR c.receiver_id = ?) AND u.id != ? AND c.status = 'accepted'`, [req.user.userId, req.user.userId, req.user.userId],
        )

        res.json(connections)
    } catch (error) {
        console.error("Connections fetch error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post("/api/connections/request", authenticateToken, async(req, res) => {
    try {
        if (req.user.userType !== "student") {
            return res.status(403).json({ error: "Only students can send connection requests" })
        }

        const { receiverId } = req.body

        // Check if connection already exists
        const [existing] = await db.query(
            "SELECT id FROM student_connections WHERE (requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)", [req.user.userId, receiverId, receiverId, req.user.userId],
        )

        if (existing.length > 0) {
            return res.status(400).json({ error: "Connection request already exists" })
        }

        await db.query("INSERT INTO student_connections (requester_id, receiver_id) VALUES (?, ?)", [
            req.user.userId,
            receiverId,
        ])

        res.json({ message: "Connection request sent successfully" })
    } catch (error) {
        console.error("Connection request error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Get connection requests received by the user
app.get("/api/connections/requests", authenticateToken, async(req, res) => {
    try {
        if (req.user.userType !== "student") {
            return res.status(403).json({ error: "Only students can access connection requests" })
        }

        const [requests] = await db.query(
            `SELECT c.*, u.first_name, u.last_name, u.university, u.profile_image, u.bio
       FROM student_connections c
       JOIN users u ON c.requester_id = u.id
       WHERE c.receiver_id = ? AND c.status = 'pending'
       ORDER BY c.created_at DESC`, [req.user.userId],
        )

        res.json(requests)
    } catch (error) {
        console.error("Connection requests fetch error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Accept or decline connection request
app.put("/api/connections/:id/status", authenticateToken, async(req, res) => {
    try {
        if (req.user.userType !== "student") {
            return res.status(403).json({ error: "Only students can manage connections" })
        }

        const connectionId = req.params.id
        const { status } = req.body // 'accepted' or 'rejected'

        // Verify the user is the receiver of this connection request
        const [connections] = await db.query(
            "SELECT receiver_id FROM student_connections WHERE id = ? AND receiver_id = ?", [connectionId, req.user.userId],
        )

        if (connections.length === 0) {
            return res.status(404).json({ error: "Connection request not found" })
        }

        await db.query("UPDATE student_connections SET status = ? WHERE id = ?", [status, connectionId])

        res.json({ message: `Connection request ${status}` })
    } catch (error) {
        console.error("Connection status update error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Get students excluding those already connected or with pending requests
app.get("/api/students/discover", authenticateToken, async(req, res) => {
    try {
        if (req.user.userType !== "student") {
            return res.status(403).json({ error: "Only students can discover other students" })
        }

        const [students] = await db.query(
            `SELECT u.id, u.first_name, u.last_name, u.university, u.bio, u.profile_image
       FROM users u
       WHERE u.user_type = 'student' 
       AND u.id != ?
       AND u.id NOT IN (
         SELECT CASE 
           WHEN requester_id = ? THEN receiver_id 
           ELSE requester_id 
         END
         FROM student_connections 
         WHERE (requester_id = ? OR receiver_id = ?)
         AND status IN ('pending', 'accepted')
       )
       ORDER BY u.created_at DESC`, [req.user.userId, req.user.userId, req.user.userId, req.user.userId],
        )

        res.json(students)
    } catch (error) {
        console.error("Students discover fetch error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Messages routes
app.get("/api/messages", authenticateToken, async(req, res) => {
    try {
        const [messages] = await db.query(
            `SELECT m.*, 
       sender.first_name as sender_first_name, sender.last_name as sender_last_name,
       sender.user_type as sender_user_type, sender.company_name as sender_company_name,
       receiver.first_name as receiver_first_name, receiver.last_name as receiver_last_name,
       receiver.user_type as receiver_user_type, receiver.company_name as receiver_company_name
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       WHERE m.sender_id = ? OR m.receiver_id = ?
       ORDER BY m.sent_at DESC`, [req.user.userId, req.user.userId],
        )

        res.json(messages)
    } catch (error) {
        console.error("Messages fetch error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post("/api/messages", authenticateToken, async(req, res) => {
    try {
        const { receiverId, subject, message } = req.body

        await db.query("INSERT INTO messages (sender_id, receiver_id, subject, message) VALUES (?, ?, ?, ?)", [
            req.user.userId,
            receiverId,
            subject,
            message,
        ])

        res.json({ message: "Message sent successfully" })
    } catch (error) {
        console.error("Message send error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Get other students for discovery
app.get("/api/students", authenticateToken, async(req, res) => {
    try {
        const [students] = await db.query(
            `SELECT id, first_name, last_name, university, bio, profile_image
       FROM users 
       WHERE user_type = 'student' AND id != ?
       ORDER BY created_at DESC`, [req.user.userId],
        )

        res.json(students)
    } catch (error) {
        console.error("Students fetch error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Project Routes
app.get("/api/projects", async(req, res) => {
    try {
        const { userId, search, skills } = req.query
        let query = `
      SELECT p.*, u.first_name, u.last_name, u.university,
             GROUP_CONCAT(ps.skill_name) as skills
      FROM projects p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN project_skills ps ON p.id = ps.project_id
    `

        const params = []
        const conditions = []

        if (userId) {
            conditions.push("p.user_id = ?")
            params.push(userId)
        }

        if (search) {
            conditions.push("(p.title LIKE ? OR p.description LIKE ?)")
            params.push(`%${search}%`, `%${search}%`)
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ")
        }

        query += " GROUP BY p.id ORDER BY p.created_at DESC"

        const [projects] = await db.query(query, params)

        // Convert skills string to array
        const formattedProjects = projects.map((project) => ({
            ...project,
            image: project.image ? project.image.replace(/\\/g, '/') : null,
            skills: project.skills ? project.skills.split(",") : [],
        }))

        res.json(formattedProjects)
    } catch (error) {
        console.error("Projects fetch error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post("/api/projects", authenticateToken, upload.single("projectImage"), async(req, res) => {
    try {
        const { title, description, githubUrl, demoUrl, skills } = req.body
        const imagePath = req.file ? req.file.path : null

        // Insert project
        const [result] = await db.query(
            "INSERT INTO projects (user_id, title, description, image, github_url, demo_url) VALUES (?, ?, ?, ?, ?, ?)", [req.user.userId, title, description, imagePath, githubUrl, demoUrl],
        )

        const projectId = result.insertId

        // Insert skills
        if (skills) {
            const skillsArray = Array.isArray(skills) ? skills : JSON.parse(skills)
            for (const skill of skillsArray) {
                await db.query("INSERT INTO project_skills (project_id, skill_name) VALUES (?, ?)", [projectId, skill])
            }
        }

        res.status(201).json({
            message: "Project created successfully",
            projectId,
        })
    } catch (error) {
        console.error("Project creation error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.put("/api/projects/:id", authenticateToken, upload.single("projectImage"), async(req, res) => {
    try {
        const projectId = req.params.id
        const { title, description, githubUrl, demoUrl, skills } = req.body
        const imagePath = req.file ? req.file.path : null

        // Check if user owns the project
        const [projects] = await db.query("SELECT user_id FROM projects WHERE id = ?", [projectId])

        if (projects.length === 0) {
            return res.status(404).json({ error: "Project not found" })
        }

        if (projects[0].user_id !== req.user.userId) {
            return res.status(403).json({ error: "Not authorized to update this project" })
        }

        // Update project
        let updateQuery = "UPDATE projects SET title = ?, description = ?, github_url = ?, demo_url = ?"
        const params = [title, description, githubUrl, demoUrl]

        if (imagePath) {
            updateQuery += ", image = ?"
            params.push(imagePath)
        }

        updateQuery += " WHERE id = ?"
        params.push(projectId)

        await db.query(updateQuery, params)

        // Update skills
        if (skills) {
            // Delete existing skills
            await db.query("DELETE FROM project_skills WHERE project_id = ?", [projectId])

            // Insert new skills
            const skillsArray = Array.isArray(skills) ? skills : JSON.parse(skills)
            for (const skill of skillsArray) {
                await db.query("INSERT INTO project_skills (project_id, skill_name) VALUES (?, ?)", [projectId, skill])
            }
        }

        res.json({ message: "Project updated successfully" })
    } catch (error) {
        console.error("Project update error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.delete("/api/projects/:id", authenticateToken, async(req, res) => {
    try {
        const projectId = req.params.id

        // Check if user owns the project
        const [projects] = await db.query("SELECT user_id, image FROM projects WHERE id = ?", [projectId])

        if (projects.length === 0) {
            return res.status(404).json({ error: "Project not found" })
        }

        if (projects[0].user_id !== req.user.userId) {
            return res.status(403).json({ error: "Not authorized to delete this project" })
        }

        // Delete image file if exists
        if (projects[0].image && fs.existsSync(projects[0].image)) {
            fs.unlinkSync(projects[0].image)
        }

        // Delete project (skills will be deleted automatically due to foreign key constraint)
        await db.query("DELETE FROM projects WHERE id = ?", [projectId])

        res.json({ message: "Project deleted successfully" })
    } catch (error) {
        console.error("Project deletion error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Project likes
app.post("/api/projects/:id/like", authenticateToken, async(req, res) => {
    try {
        const projectId = req.params.id

        // Check if already liked
        const [existingLikes] = await db.query("SELECT id FROM project_likes WHERE project_id = ? AND user_id = ?", [
            projectId,
            req.user.userId,
        ])

        if (existingLikes.length > 0) {
            // Unlike
            await db.query("DELETE FROM project_likes WHERE project_id = ? AND user_id = ?", [projectId, req.user.userId])

            await db.query("UPDATE projects SET likes_count = likes_count - 1 WHERE id = ?", [projectId])

            res.json({ message: "Project unliked", liked: false })
        } else {
            // Like
            await db.query("INSERT INTO project_likes (project_id, user_id) VALUES (?, ?)", [projectId, req.user.userId])

            await db.query("UPDATE projects SET likes_count = likes_count + 1 WHERE id = ?", [projectId])

            res.json({ message: "Project liked", liked: true })
        }
    } catch (error) {
        console.error("Like toggle error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Job Listings Routes
app.get("/api/jobs", async(req, res) => {
    try {
        const { companyId, search, jobType, location } = req.query
        let query = `
      SELECT j.*, u.company_name, u.location as company_location,
             GROUP_CONCAT(js.skill_name) as skills,
             COUNT(a.id) as applications_count
      FROM job_listings j
      JOIN users u ON j.company_id = u.id
      LEFT JOIN job_skills js ON j.id = js.job_id
      LEFT JOIN applications a ON j.id = a.job_id
    `

        const params = []
        const conditions = []

        if (companyId) {
            conditions.push("j.company_id = ?")
            params.push(companyId)
        }

        if (search) {
            conditions.push("(j.title LIKE ? OR j.description LIKE ?)")
            params.push(`%${search}%`, `%${search}%`)
        }

        if (jobType) {
            conditions.push("j.job_type = ?")
            params.push(jobType)
        }

        if (location) {
            conditions.push("j.location LIKE ?")
            params.push(`%${location}%`)
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ")
        }

        query += " GROUP BY j.id ORDER BY j.created_at DESC"

        const [jobs] = await db.query(query, params)

        // Convert skills string to array
        const formattedJobs = jobs.map((job) => ({
            ...job,
            image: job.image ? job.image.replace(/\\/g, '/') : null,
            skills: job.skills ? job.skills.split(",") : [],
        }))

        res.json(formattedJobs)
    } catch (error) {
        console.error("Jobs fetch error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post("/api/jobs", authenticateToken, async(req, res) => {
    try {
        if (req.user.userType !== "company") {
            return res.status(403).json({ error: "Only companies can post jobs" })
        }

        const { title, description, requirements, jobType, location, salary, deadline, skills } = req.body

        // Insert job listing
        const [result] = await db.query(
            `INSERT INTO job_listings 
       (company_id, title, description, requirements, job_type, location, salary, deadline) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [req.user.userId, title, description, requirements, jobType, location, salary, deadline],
        )

        const jobId = result.insertId

        // Insert skills
        if (skills && skills.length > 0) {
            for (const skill of skills) {
                await db.query("INSERT INTO job_skills (job_id, skill_name) VALUES (?, ?)", [jobId, skill])
            }
        }

        res.status(201).json({
            message: "Job posted successfully",
            jobId,
        })
    } catch (error) {
        console.error("Job creation error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.put("/api/jobs/:id", authenticateToken, async(req, res) => {
    try {
        const jobId = req.params.id
        const { title, description, requirements, jobType, location, salary, deadline, status, skills } = req.body

        // Check if user owns the job
        const [jobs] = await db.query("SELECT company_id FROM job_listings WHERE id = ?", [jobId])

        if (jobs.length === 0) {
            return res.status(404).json({ error: "Job not found" })
        }

        if (jobs[0].company_id !== req.user.userId) {
            return res.status(403).json({ error: "Not authorized to update this job" })
        }

        // Update job listing
        await db.query(
            `UPDATE job_listings SET 
       title = ?, description = ?, requirements = ?, job_type = ?, 
       location = ?, salary = ?, deadline = ?, status = ?
       WHERE id = ?`, [title, description, requirements, jobType, location, salary, deadline, status, jobId],
        )

        // Update skills
        if (skills) {
            // Delete existing skills
            await db.query("DELETE FROM job_skills WHERE job_id = ?", [jobId])

            // Insert new skills
            for (const skill of skills) {
                await db.query("INSERT INTO job_skills (job_id, skill_name) VALUES (?, ?)", [jobId, skill])
            }
        }

        res.json({ message: "Job updated successfully" })
    } catch (error) {
        console.error("Job update error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.delete("/api/jobs/:id", authenticateToken, async(req, res) => {
    try {
        const jobId = req.params.id

        // Check if user owns the job
        const [jobs] = await db.query("SELECT company_id FROM job_listings WHERE id = ?", [jobId])

        if (jobs.length === 0) {
            return res.status(404).json({ error: "Job not found" })
        }

        if (jobs[0].company_id !== req.user.userId) {
            return res.status(403).json({ error: "Not authorized to delete this job" })
        }

        // Delete job (applications and skills will be deleted automatically)
        await db.query("DELETE FROM job_listings WHERE id = ?", [jobId])

        res.json({ message: "Job deleted successfully" })
    } catch (error) {
        console.error("Job deletion error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Applications Routes
app.get("/api/applications", authenticateToken, async(req, res) => {
    try {
        const { jobId, studentId, companyId } = req.query

        let query = `
      SELECT a.*, j.title as job_title, j.job_type, j.location,
             u.first_name, u.last_name, u.university, u.email,
             c.company_name
      FROM applications a
      JOIN job_listings j ON a.job_id = j.id
      JOIN users u ON a.student_id = u.id
      JOIN users c ON j.company_id = c.id
    `

        const params = []
        const conditions = []

        if (jobId) {
            conditions.push("a.job_id = ?")
            params.push(jobId)
        }

        if (studentId) {
            conditions.push("a.student_id = ?")
            params.push(studentId)
        }

        if (companyId) {
            conditions.push("j.company_id = ?")
            params.push(companyId)
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ")
        }

        query += " ORDER BY a.applied_at DESC"

        const [applications] = await db.query(query, params)
        res.json(applications)
    } catch (error) {
        console.error("Applications fetch error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.post("/api/applications", authenticateToken, upload.single("resume"), async(req, res) => {
    try {
        if (req.user.userType !== "student") {
            return res.status(403).json({ error: "Only students can apply for jobs" })
        }

        const { jobId, coverLetter } = req.body
        const resumePath = req.file ? req.file.path : null

        // Check if already applied
        const [existingApplications] = await db.query("SELECT id FROM applications WHERE job_id = ? AND student_id = ?", [
            jobId,
            req.user.userId,
        ])

        if (existingApplications.length > 0) {
            return res.status(400).json({ error: "Already applied for this job" })
        }

        // Insert application
        await db.query("INSERT INTO applications (job_id, student_id, cover_letter, resume_url) VALUES (?, ?, ?, ?)", [
            jobId,
            req.user.userId,
            coverLetter,
            resumePath,
        ])

        res.status(201).json({ message: "Application submitted successfully" })
    } catch (error) {
        console.error("Application submission error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.put("/api/applications/:id/status", authenticateToken, async(req, res) => {
    try {
        const applicationId = req.params.id
        const { status } = req.body

        // Check if user is the company that posted the job
        const [applications] = await db.query(
            `SELECT a.*, j.company_id 
       FROM applications a 
       JOIN job_listings j ON a.job_id = j.id 
       WHERE a.id = ?`, [applicationId],
        )

        if (applications.length === 0) {
            return res.status(404).json({ error: "Application not found" })
        }

        if (applications[0].company_id !== req.user.userId) {
            return res.status(403).json({ error: "Not authorized to update this application" })
        }

        // Update application status
        await db.query("UPDATE applications SET status = ? WHERE id = ?", [status, applicationId])

        res.json({ message: "Application status updated successfully" })
    } catch (error) {
        console.error("Application status update error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Dashboard Stats Routes
app.get("/api/dashboard/stats", authenticateToken, async(req, res) => {
    try {
        let stats = {}

        if (req.user.userType === "student") {
            // Student stats
            const [projectCount] = await db.query("SELECT COUNT(*) as count FROM projects WHERE user_id = ?", [
                req.user.userId,
            ])

            const [applicationCount] = await db.query("SELECT COUNT(*) as count FROM applications WHERE student_id = ?", [
                req.user.userId,
            ])

            // Profile views would be implemented with a separate tracking table
            stats = {
                projects: projectCount[0].count,
                applications: applicationCount[0].count,
                profileViews: 0, // Placeholder
            }
        } else {
            // Company stats
            const [jobCount] = await db.query(
                'SELECT COUNT(*) as count FROM job_listings WHERE company_id = ? AND status = "active"', [req.user.userId],
            )

            const [applicationCount] = await db.query(
                `SELECT COUNT(*) as count FROM applications a
         JOIN job_listings j ON a.job_id = j.id
         WHERE j.company_id = ?`, [req.user.userId],
            )

            stats = {
                activeListings: jobCount[0].count,
                applications: applicationCount[0].count,
                profileViews: 0, // Placeholder
            }
        }

        res.json(stats)
    } catch (error) {
        console.error("Dashboard stats error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// File upload route
app.post("/api/upload", authenticateToken, upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" })
        }

        res.json({
            message: "File uploaded successfully",
            filename: req.file.filename,
            path: req.file.path,
            url: `/${req.file.path}`,
        })
    } catch (error) {
        console.error("File upload error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Delete account endpoint
app.delete("/api/users/delete-account", authenticateToken, async(req, res) => {
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

// Change password endpoint
app.put("/api/users/change-password", authenticateToken, async(req, res) => {
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
app.put("/api/users/notifications", authenticateToken, async(req, res) => {
    try {
        const { preferences } = req.body
        const userId = req.user.userId

        if (!preferences || typeof preferences !== 'object') {
            return res.status(400).json({ error: "Invalid notification preferences" })
        }

        // Store notification preferences in the database
        // Note: You'll need to add a notifications column to the users table
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

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "File too large" })
        }
    }

    if (error.message.includes("Only")) {
        return res.status(400).json({ error: error.message })
    }

    console.error("Unhandled error:", error)
    res.status(500).json({ error: "Internal server error" })
})

// Start server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
})