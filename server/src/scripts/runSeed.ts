import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedWikipediaCourses from './seedWikipediaCourses';
import logger from '../utils/logger';

// Load environment variables
dotenv.config();

async function runSeed() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');

    // Run seeding
    await seedWikipediaCourses();

    logger.info('Seeding completed successfully!');
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    logger.info('Database connection closed');
    process.exit(0);
  }
}

// Run the seeding script
runSeed();
