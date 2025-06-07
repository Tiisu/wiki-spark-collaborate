# WikiWalkthrough

A Wikimedia education platform that helps users learn to contribute effectively to Wikipedia through structured learning paths, community collaboration, and expert mentorship.

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

### 🚧 In Development
- Course management system
- Learning progress tracking
- Community features (forums, mentorship)
- Achievement and certification system

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

6. **Access the Application**
   - Frontend: http://localhost:5173 (or the port shown in terminal)
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api-docs

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