# WikiWalkthrough Backend API

A comprehensive backend API for the WikiWalkthrough education platform built with Express.js, TypeScript, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Course Management**: Full CRUD operations for courses, modules, and lessons
- **User Enrollment**: Course enrollment and progress tracking
- **Progress Tracking**: Detailed lesson progress and completion tracking
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation
- **Security**: Rate limiting, CORS, helmet security headers
- **Error Handling**: Centralized error handling with detailed logging
- **Validation**: Input validation with Zod schemas

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Email**: Nodemailer

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/wikiwalkthrough

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

### Production

Build and start the production server:
```bash
npm run build
npm start
```

## API Documentation

When running in development mode, API documentation is available at:
- Swagger UI: `http://localhost:3001/api-docs`
- JSON Schema: `http://localhost:3001/api-docs.json`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `PUT /api/auth/update-profile` - Update user profile

### Courses
- `GET /api/courses` - Get all published courses (with pagination and filtering)
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create new course (instructors only)
- `PUT /api/courses/:id` - Update course (course owner only)
- `DELETE /api/courses/:id` - Delete course (course owner only)
- `GET /api/courses/categories` - Get all course categories
- `GET /api/courses/my-courses` - Get instructor's courses
- `GET /api/courses/enrollments` - Get user's enrollments
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/courses/:id/with-progress` - Get course with user progress
- `PUT /api/courses/lessons/:lessonId/progress` - Update lesson progress

### Health
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health information

## User Roles

- **Learner**: Can enroll in courses and track progress
- **Instructor**: Can create and manage courses
- **Mentor**: Can assist learners and access additional features
- **Admin**: Can manage users and moderate content
- **Super Admin**: Full system access

## Database Models

### User
- Authentication and profile information
- Role-based permissions
- Password reset functionality

### Course
- Course metadata (title, description, level, category)
- Instructor assignment
- Publishing status and enrollment tracking

### Module
- Course organization into modules
- Ordering and publishing status

### Lesson
- Individual learning content
- Support for videos, text, quizzes, assignments
- Resource attachments

### Enrollment
- User-course relationships
- Progress tracking and completion status

### Progress
- Detailed lesson-level progress tracking
- Time spent and completion percentages

## Security Features

- JWT-based authentication
- Rate limiting on all endpoints
- CORS configuration
- Security headers with Helmet
- Input validation and sanitization
- Password hashing with bcrypt

## Error Handling

The API uses a centralized error handling system with:
- Consistent error response format
- Detailed logging with Winston
- Environment-specific error details
- Proper HTTP status codes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
