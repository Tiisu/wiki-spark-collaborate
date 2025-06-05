// Export all models
export * from './User.js';
export * from './Course.js';
export * from './Module.js';
export * from './Lesson.js';
export * from './Enrollment.js';
export * from './LessonProgress.js';
export * from './Quiz.js';
export * from './Achievement.js';
export * from './Certificate.js';
export * from './Forum.js';
export * from './Mentorship.js';

// Export database connection
export { default as connectDB } from '../config/database.js';
