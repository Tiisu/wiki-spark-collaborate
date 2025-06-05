# Wiki Spark Collaborate - Backend API

Backend API for Wiki Spark Collaborate, a comprehensive Wikimedia education platform inspired by HackerBoost but focused on Wikipedia contribution skills.

## 🚀 Features

- **Authentication & Authorization** - JWT-based auth with role-based access control
- **User Management** - Registration, profiles, email verification
- **Course Management** - Structured learning paths with modules and lessons
- **Progress Tracking** - Lesson completion, achievements, certificates
- **Community Features** - Forums, mentorship, collaboration
- **Admin Dashboard** - User management, analytics, content moderation
- **API Documentation** - Swagger/OpenAPI documentation
- **Rate Limiting** - Protection against abuse
- **File Uploads** - Avatar and content file management
- **Email Integration** - Verification and notifications

## 🛠️ Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with bcrypt
- **Validation:** Zod
- **Documentation:** Swagger/OpenAPI
- **Logging:** Winston
- **Security:** Helmet, CORS, Rate limiting

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## 🔧 Installation

1. **Clone and navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/wiki_spark_collaborate"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=3001
   # ... other variables
   ```

4. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

## 🚀 Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

The server will start on `http://localhost:3001`

## 📚 API Documentation

Once the server is running, visit:
- **API Docs:** http://localhost:3001/api-docs
- **Health Check:** http://localhost:3001/health

## 🗄️ Database Schema

The database includes the following main entities:

- **Users** - Authentication and profiles
- **Courses** - Learning content structure
- **Modules** - Course sections
- **Lessons** - Individual learning units
- **Enrollments** - User course registrations
- **Progress** - Learning progress tracking
- **Achievements** - Gamification system
- **Forum** - Community discussions
- **Mentorships** - Mentor-learner relationships

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Sample Users (after seeding)

- **Admin:** admin@wikisparkcollab.org / WikiSpark2025!
- **Instructor:** instructor@wikisparkcollab.org / Instructor123!
- **Learner:** learner@wikisparkcollab.org / Learner123!

## 📖 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/change-password` - Change password

### Courses
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course (instructor+)
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/enroll` - Enroll in course

### Learning
- `GET /api/learning/progress` - Get learning progress
- `POST /api/learning/lessons/:id/complete` - Mark lesson complete
- `GET /api/learning/achievements` - Get achievements

### Community
- `GET /api/community/forum/posts` - Get forum posts
- `POST /api/community/forum/posts` - Create forum post
- `GET /api/community/mentorship` - Get mentorship opportunities

### Admin
- `GET /api/admin/users` - List all users (admin only)
- `GET /api/admin/analytics` - Platform analytics (admin only)

## 🧪 Testing

```bash
npm test
```

## 📝 Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Create and run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Seed database
npm run db:seed
```

## 🔒 Security Features

- **Rate Limiting** - Prevents abuse and DoS attacks
- **Input Validation** - Zod schemas for all inputs
- **SQL Injection Protection** - Prisma ORM with parameterized queries
- **XSS Protection** - Helmet middleware
- **CORS Configuration** - Controlled cross-origin requests
- **Password Hashing** - bcrypt with salt rounds
- **JWT Security** - Secure token generation and validation

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
FRONTEND_URL="https://your-frontend-domain.com"
```

### Docker Deployment (Optional)

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: api@wikisparkcollab.org

---

**Wiki Spark Collaborate** - Empowering African Wikipedia contributors through structured education and community collaboration.
