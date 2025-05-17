-- CampusCraft Database Schema
-- Run this script to create the database and tables

CREATE DATABASE IF NOT EXISTS campuscraft;
USE campuscraft;

-- Users table (for both students and companies)
CREATE TABLE users (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    verification_code VARCHAR(10) NULL,
    verification_expires DATETIME NULL,
    reset_code VARCHAR(10) NULL,
    reset_expires DATETIME NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type),
    INDEX idx_verification ON users(email, verification_code),
    INDEX idx_reset ON users(email, reset_code)
);

-- Projects table
CREATE TABLE projects (
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Project skills table
CREATE TABLE project_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project_id (project_id),
    INDEX idx_skill_name (skill_name)
);

-- Job listings table
CREATE TABLE job_listings (
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
    FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_company_id (company_id),
    INDEX idx_job_type (job_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Job skills table
CREATE TABLE job_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (job_id) REFERENCES job_listings(id) ON DELETE CASCADE,
    INDEX idx_job_id (job_id),
    INDEX idx_skill_name (skill_name)
);

-- Applications table
CREATE TABLE applications (
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
    UNIQUE KEY unique_application (job_id, student_id),
    INDEX idx_job_id (job_id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status),
    INDEX idx_applied_at (applied_at)
);

-- Project likes table
CREATE TABLE project_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (project_id, user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id)
);

-- Profile views table (for tracking profile visits)
CREATE TABLE profile_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_user_id INT NOT NULL,
    viewer_user_id INT,
    ip_address VARCHAR(45),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (viewer_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_profile_user_id (profile_user_id),
    INDEX idx_viewed_at (viewed_at)
);

-- Messages table (for direct messaging)
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_sent_at (sent_at)
);

-- Insert sample data
INSERT INTO users (email, password, user_type, first_name, last_name, university, year_of_study) VALUES
('john.doe@mit.edu', '$2a$10$example_hashed_password', 'student', 'John', 'Doe', 'MIT', 3),
('jane.smith@stanford.edu', '$2a$10$example_hashed_password', 'student', 'Jane', 'Smith', 'Stanford University', 2);

INSERT INTO users (email, password, user_type, company_name, industry, website, location) VALUES
('hr@techcorp.com', '$2a$10$example_hashed_password', 'company', 'TechCorp Inc.', 'Software Development', 'https://techcorp.com', 'San Francisco, CA'),
('careers@startupx.com', '$2a$10$example_hashed_password', 'company', 'StartupX', 'Technology', 'https://startupx.com', 'New York, NY');
