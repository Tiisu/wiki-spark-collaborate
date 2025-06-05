import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.DATABASE_URL;
    
    if (!mongoURI) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI);
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
