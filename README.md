# CampusCraft Backend API

A comprehensive Node.js backend API for the CampusCraft platform that connects university students with tech companies.

## Features

- **User Authentication**: JWT-based authentication for students and companies
- **User Management**: Profile creation and management for both user types
- **Project Showcase**: Students can upload and manage their projects
- **Job Listings**: Companies can post and manage job opportunities
- **Application System**: Students can apply for jobs, companies can manage applications
- **File Uploads**: Support for project images, profile pictures, and resumes
- **Search & Filtering**: Advanced search capabilities for projects and jobs
- **Like System**: Students can like and interact with projects

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Uploads**: Multer
- **CORS**: Cross-Origin Resource Sharing support

## Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd campuscraft-backend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up MySQL database**
   - Install MySQL on your system
   - Create a new database called `campuscraft`
   - Run the SQL schema from `database/schema.sql`

4. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the database credentials and other settings

5. **Start the server**
   \`\`\`bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   \`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user (student or company)
- `POST /api/auth/login` - Login user

### User Profile
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile

### Projects
- `GET /api/projects` - Get all projects (with optional filters)
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project
- `POST /api/projects/:id/like` - Like/unlike a project

### Job Listings
- `GET /api/jobs` - Get all job listings (with optional filters)
- `POST /api/jobs` - Create a new job listing (companies only)
- `PUT /api/jobs/:id` - Update a job listing
- `DELETE /api/jobs/:id` - Delete a job listing

### Applications
- `GET /api/applications` - Get applications (filtered by user type)
- `POST /api/applications` - Submit a job application (students only)
- `PUT /api/applications/:id/status` - Update application status (companies only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### File Upload
- `POST /api/upload` - Upload files (images, resumes, etc.)

## Database Schema

The database consists of the following main tables:

- **users**: Stores both student and company user data
- **projects**: Student project information
- **project_skills**: Skills associated with projects
- **job_listings**: Company job postings
- **job_skills**: Skills required for jobs
- **applications**: Job applications from students
- **project_likes**: Project like/unlike tracking
- **profile_views**: Profile view tracking
- **messages**: Direct messaging between users

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## File Uploads

Files are uploaded to the `uploads/` directory with the following structure:
- `uploads/profiles/` - Profile pictures
- `uploads/projects/` - Project images
- `uploads/resumes/` - Resume files

## Error Handling

The API returns appropriate HTTP status codes and error messages:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- File upload validation
- SQL injection prevention with parameterized queries
- CORS configuration
- File size limits

## Development

To run in development mode with auto-restart:

\`\`\`bash
npm run dev
\`\`\`

## Environment Variables

Required environment variables:

\`\`\`env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campuscraft
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
