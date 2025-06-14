# WikiWalkthrough

A comprehensive Wikimedia education platform that helps users learn to contribute effectively to Wikipedia and its sister projects through structured learning paths, interactive exercises, community collaboration, and expert mentorship. Built like Udemy but specifically focused on Wikipedia contribution skills.

## Features

### ✅ Completed Features

#### User Registration & Authentication
- **User Registration**: Complete registration form with validation
- **Email Verification**: Automated email verification system
- **Password Security**: Strong password requirements with visual indicators
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against brute force attacks

#### User Management
- Multi-role system (Learner, Instructor, Mentor, Admin, Super Admin)
- User profiles with bio, country, timezone, and preferred language
- Password reset functionality
- Email verification and welcome emails

#### Backend Infrastructure
- RESTful API with Express.js and TypeScript
- MongoDB database with Mongoose ODM
- Comprehensive error handling and logging
- API documentation with Swagger
- Security middleware (Helmet, CORS, rate limiting)
- Email service with HTML templates

#### Frontend
- Modern React application with TypeScript
- Responsive design with Tailwind CSS
- Form validation with React Hook Form and Zod
- State management with TanStack Query
- Toast notifications and loading states
- Password strength indicator

### ✅ Wikipedia-Specific Features

#### Course Content & Structure
- **Wikipedia-focused curriculum**: Comprehensive courses covering editing basics, citation guidelines, content policies, conflict resolution, and advanced techniques
- **Sister project courses**: Specialized training for Wikimedia Commons, Wikidata, Wiktionary, Wikibooks, and other projects
- **Skill-based learning paths**: Structured progression from beginner to advanced Wikipedia editing
- **Interactive Wikipedia editor**: Practice editing in sandbox, guided, and live modes
- **Assessment and certification**: Competency-based evaluations with digital certificates

#### Learning Experience
- **Interactive editing exercises**: Hands-on practice with real Wikipedia markup and tools
- **Wikipedia sandbox integration**: Safe practice environment for new editors
- **Live editing capabilities**: Transition to real Wikipedia editing with guidance
- **Progress tracking**: Monitor learning objectives and skill acquisition
- **Prerequisite management**: Structured learning paths with course dependencies

#### Community & Collaboration
- **Peer review system**: Practice giving and receiving feedback on Wikipedia contributions
- **Mentorship matching**: Connect learners with experienced Wikipedia editors
- **Discussion forums**: Course-specific and general Wikipedia editing discussions
- **Study groups**: Collaborative learning opportunities

### 🚧 In Development
- Advanced gamification features
- Real-time collaboration tools
- Wikipedia API integration for live statistics
- Mobile app development
- Multi-language course content

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- SMTP server for email functionality

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wikiwalkthrough
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd server
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp server/.env.example server/.env
   ```

4. **Configure Environment Variables**

   **Frontend (.env):**
   ```env
   VITE_API_URL=http://localhost:3001
   ```

   **Backend (server/.env):**
   ```env
   MONGODB_URI=mongodb://localhost:27017/wikiwalkthrough
   JWT_SECRET=your-super-secret-jwt-key
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=noreply@wikiwalkthrough.org
   ```

5. **Start Development Servers**
   ```bash
   # Start backend (from server directory)
   cd server
   npm run dev

   # Start frontend (from root directory)
   npm run dev
   ```

6. **Seed the Database with Wikipedia Courses**
   ```bash
   # From server directory
   npm run seed
   ```

7. **Access the Application**
   - Frontend: http://localhost:5173 (or the port shown in terminal)
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api-docs

## Wikipedia Course Catalog

The platform includes a comprehensive curriculum designed to teach Wikipedia contribution skills:

### Beginner Courses
- **Wikipedia Editing Fundamentals** - Learn the basics of editing Wikipedia articles
- **Wikitext Markup Mastery** - Master the markup language used in Wikipedia
- **Reliable Sources and Citations** - Understand how to find and cite reliable sources

### Intermediate Courses
- **Wikipedia Content Policies Deep Dive** - Master NPOV, Verifiability, and No Original Research
- **Article Creation Workshop** - Learn to create new Wikipedia articles from scratch
- **Community Collaboration and Conflict Resolution** - Handle disagreements and build consensus

### Advanced Courses
- **Advanced Wikipedia Editing Techniques** - Complex templates, parser functions, and Lua scripting
- **Wikimedia Commons: Media and Licensing** - Contribute media files and understand copyright
- **Wikidata Editing and Structured Data** - Work with structured data and SPARQL queries

### Course Features
- **Interactive exercises** with real Wikipedia editing practice
- **Assessment and certification** for completed courses
- **Prerequisite tracking** to ensure proper learning progression
- **Skill-based learning objectives** with clear outcomes
- **Multiple Wikipedia projects** including Commons, Wikidata, and more

## User Registration Flow

### 1. Registration Process
1. User visits `/register` page
2. Fills out registration form with:
   - Email address
   - Username (unique, 3-30 characters)
   - First and last name
   - Strong password (with real-time validation)
   - Optional: Country and preferred language
3. Form validates input client-side and server-side
4. User account is created and can immediately access all features

### 2. Login Process
1. User visits `/login` page
2. Enters email and password
3. JWT token is generated and stored
4. User is redirected to dashboard/home

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user profile

### Health Check
- `GET /health` - Server health status

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Hook Form** with Zod validation
- **TanStack Query** for server state
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Nodemailer** for email service
- **Winston** for logging
- **Swagger** for API documentation
- **Helmet** for security headers

## Project Structure

```
wikiwalkthrough/
├── src/                          # Frontend source
│   ├── components/              # React components
│   │   ├── auth/               # Authentication components
│   │   └── ui/                 # Reusable UI components
│   ├── pages/                  # Page components
│   ├── lib/                    # Utilities and API client
│   └── hooks/                  # Custom React hooks
├── server/                      # Backend source
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Express middleware
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic services
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utility functions
│   └── uploads/               # File upload directory
└── docs/                       # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.