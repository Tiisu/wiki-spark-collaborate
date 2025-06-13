import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import emailService from './emailService';
import logger from '../utils/logger';
import { IUser, JwtPayload, RegisterRequestBody, LoginRequestBody } from '../types';

class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private frontendUrl: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  }

  // Generate JWT token
  generateToken(payload: JwtPayload): string {
    return jwt.sign(payload as object, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as any);
  }

  // Verify JWT token
  verifyToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret) as JwtPayload;
    } catch (error) {
      logger.error('JWT verification failed:', error);
      return null;
    }
  }

  // Register new user
  async register(userData: RegisterRequestBody): Promise<{ user: IUser; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });

      if (existingUser) {
        if (existingUser.email === userData.email) {
          throw new Error('User with this email already exists');
        }
        if (existingUser.username === userData.username) {
          throw new Error('Username is already taken');
        }
      }

      // Create new user
      const user = new User({
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
        country: userData.country,
        preferredLanguage: userData.preferredLanguage || 'en',
        isEmailVerified: true
      });

      await user.save();

      // Generate JWT token
      const tokenPayload: JwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
      };

      const token = this.generateToken(tokenPayload);

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(user.email, {
          firstName: user.firstName,
          loginUrl: `${this.frontendUrl}/login`,
        });
      } catch (emailError) {
        logger.error('Failed to send welcome email:', emailError);
        // Don't fail registration if email fails
      }

      logger.info(`New user registered: ${user.email}`);
      return { user, token };
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  }

  // Login user
  async login(loginData: LoginRequestBody): Promise<{ user: IUser; token: string }> {
    try {
      // Find user by email and include password for comparison
      const user = await User.findOne({ email: loginData.email }).select('+password');

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(loginData.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const tokenPayload: JwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
      };

      const token = this.generateToken(tokenPayload);

      // Remove password from user object
      user.password = undefined as any;

      logger.info(`User logged in: ${user.email}`);
      return { user, token };
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<IUser | null> {
    try {
      return await User.findById(userId);
    } catch (error) {
      logger.error('Failed to get user by ID:', error);
      return null;
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<boolean> {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        // Don't reveal if email exists or not
        logger.info(`Password reset requested for non-existent email: ${email}`);
        return true;
      }

      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // Send password reset email
      const resetUrl = `${this.frontendUrl}/reset-password?token=${resetToken}`;
      
      const emailSent = await emailService.sendPasswordResetEmail(user.email, {
        firstName: user.firstName,
        resetUrl,
      });

      if (emailSent) {
        logger.info(`Password reset email sent to: ${email}`);
      } else {
        logger.error(`Failed to send password reset email to: ${email}`);
      }

      return true;
    } catch (error) {
      logger.error('Forgot password failed:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Hash the token to compare with stored hash
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with valid reset token
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
      }).select('+passwordResetToken +passwordResetExpires');

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Update password and clear reset token
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      logger.info(`Password reset successful for user: ${user.email}`);
      return true;
    } catch (error) {
      logger.error('Password reset failed:', error);
      throw error;
    }
  }

  // Change password (for authenticated users)
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = await User.findById(userId).select('+password');

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);
      return true;
    } catch (error) {
      logger.error('Password change failed:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (user) {
        logger.info(`Profile updated for user: ${user.email}`);
      }

      return user;
    } catch (error) {
      logger.error('Profile update failed:', error);
      throw error;
    }
  }
}

export default new AuthService();
