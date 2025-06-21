import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

// Import middleware
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';

// Import routes
import authRoutes from './routes/auth';
import healthRoutes from './routes/health';
import courseRoutes from './routes/courses';
import courseTemplateRoutes from './routes/courseTemplates';
import quizRoutes from './routes/quizzes';
import assignmentRoutes from './routes/assignments';
import achievementRoutes from './routes/achievements';
import certificateRoutes from './routes/certificates';
import studyGoalRoutes from './routes/studyGoals';
import learningPathRoutes from './routes/learningPaths';
import adminRoutes from './routes/admin';

// Import utilities
import logger from './utils/logger';
import { setupSwagger } from './swagger';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Trust proxy (important for rate limiting and getting real IP addresses)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173',
      'http://localhost:8080',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(generalLimiter);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    
    logger[logLevel](`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${req.ip}`);
  });
  
  next();
});

// Health check route (before API routes for quick access)
app.use('/health', healthRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/course-templates', courseTemplateRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/study-goals', studyGoalRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files (for uploaded files, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Setup Swagger documentation
if (process.env.NODE_ENV !== 'production') {
  setupSwagger(app);
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WikiWalkthrough API is running!',
    data: {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      documentation: process.env.NODE_ENV !== 'production' ? '/api-docs' : 'Contact support for API documentation',
    },
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'WikiWalkthrough API v1.0.0',
    data: {
      version: '1.0.0',
      description: 'A comprehensive API for the WikiWalkthrough education platform',
      endpoints: {
        authentication: '/api/auth',
        health: '/health',
        documentation: process.env.NODE_ENV !== 'production' ? '/api-docs' : null,
      },
      features: [
        'User registration and authentication',
        'JWT-based authorization',
        'Password reset functionality',
        'Email verification',
        'Rate limiting',
        'Comprehensive error handling',
        'API documentation with Swagger',
      ],
    },
  });
});

// Handle 404 errors
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

export default app;
