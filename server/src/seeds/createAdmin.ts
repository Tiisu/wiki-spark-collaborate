import mongoose from 'mongoose';
import User from '../models/User';
import { UserRole } from '../types';
import logger from '../utils/logger';

export async function createAdminUser() {
  try {
    logger.info('Creating admin user...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      role: { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] }
    });

    if (existingAdmin) {
      logger.info(`Admin user already exists: ${existingAdmin.email}`);
      return existingAdmin;
    }

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@wikiwalkthrough.org',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      password: 'AdminPassword123!',
      role: UserRole.SUPER_ADMIN,
      bio: 'Platform administrator with full system access.',
      isEmailVerified: true
    });

    logger.info(`Created admin user: ${adminUser.email}`);
    logger.info('Login credentials:');
    logger.info('Email: admin@wikiwalkthrough.org');
    logger.info('Password: AdminPassword123!');
    
    return adminUser;

  } catch (error) {
    logger.error('Error creating admin user:', error);
    throw error;
  }
}

// Function to run admin creation independently
export async function runAdminCreation() {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wikiwalkthrough');
      logger.info('Connected to MongoDB for admin creation');
    }

    await createAdminUser();
    logger.info('Admin creation completed successfully');

  } catch (error) {
    logger.error('Admin creation failed:', error);
    process.exit(1);
  }
}

// Run admin creation if this file is executed directly
if (require.main === module) {
  runAdminCreation()
    .then(() => {
      logger.info('Admin creation process completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Admin creation process failed:', error);
      process.exit(1);
    });
}
