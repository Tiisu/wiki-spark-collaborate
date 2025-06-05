import { Response } from 'express';
import { User } from '../models/index.js';
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateRandomToken,
  validatePassword
} from '../utils/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest, ApiResponse, CreateUserData, LoginData } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { emailService } from '../services/emailService.js';

class AuthController {
  /**
   * Register a new user
   */
  async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userData: CreateUserData = req.body;

    // Validate password strength
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      throw new AppError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: userData.email },
        { username: userData.username }
      ]
    });

    if (existingUser) {
      if (existingUser.email === userData.email) {
        throw new AppError('User with this email already exists', 409);
      }
      if (existingUser.username === userData.username) {
        throw new AppError('Username already taken', 409);
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Generate email verification token
    const emailVerifyToken = generateRandomToken();

    // Create user
    const user = await User.create({
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      password: hashedPassword,
      country: userData.country,
      timezone: userData.timezone,
      preferredLanguage: userData.preferredLanguage || 'en',
      emailVerifyToken,
    });

    // Generate JWT token
    const token = generateToken({ id: user._id, email: user.email, role: user.role });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, emailVerifyToken, user.firstName);
      logger.info(`Verification email sent to: ${user.email}`);
    } catch (error) {
      logger.error('Failed to send verification email', { error, email: user.email });
      // Don't fail registration if email fails, just log it
    }

    logger.info(`User registered: ${user.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        user,
        token,
      }
    };

    res.status(201).json(response);
  }

  /**
   * Login user
   */
  async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { email, password }: LoginData = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    // Generate JWT token
    const token = generateToken({ id: user._id, email: user.email, role: user.role });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    logger.info(`User logged in: ${user.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token,
      }
    };

    res.status(200).json(response);
  }

  /**
   * Logout user (client-side token removal)
   */
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    logger.info(`User logged out: ${req.user?.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Logout successful',
    };

    res.status(200).json(response);
  }

  /**
   * Get current user profile
   */
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const response: ApiResponse = {
      success: true,
      message: 'Profile retrieved successfully',
      data: req.user,
    };

    res.status(200).json(response);
  }

  /**
   * Request password reset
   */
  async forgotPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists or not
      const response: ApiResponse = {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
      res.status(200).json(response);
      return;
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token
    await User.findByIdAndUpdate(user._id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken, user.firstName);
      logger.info(`Password reset email sent to: ${email}`);
    } catch (error) {
      logger.error('Failed to send password reset email', { error, email });
    }

    logger.info(`Password reset requested for: ${email}`);

    const response: ApiResponse = {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    };

    res.status(200).json(response);
  }

  /**
   * Reset password with token
   */
  async resetPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { token, password } = req.body;

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new AppError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400);
    }

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update password and clear reset token
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    logger.info(`Password reset completed for: ${user.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Password reset successful',
    };

    res.status(200).json(response);
  }

  /**
   * Verify email address
   */
  async verifyEmail(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { token } = req.params;

    const user = await User.findOne({ emailVerifyToken: token });

    if (!user) {
      throw new AppError('Invalid verification token', 400);
    }

    if (user.isEmailVerified) {
      throw new AppError('Email already verified', 400);
    }

    // Verify email
    await User.findByIdAndUpdate(user._id, {
      isEmailVerified: true,
      emailVerifyToken: null,
    });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.firstName);
      logger.info(`Welcome email sent to: ${user.email}`);
    } catch (error) {
      logger.error('Failed to send welcome email', { error, email: user.email });
    }

    logger.info(`Email verified for: ${user.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Email verified successfully',
    };

    res.status(200).json(response);
  }

  /**
   * Resend email verification
   */
  async resendVerification(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user!;

    if (user.isEmailVerified) {
      throw new AppError('Email already verified', 400);
    }

    // Generate new verification token
    const emailVerifyToken = generateRandomToken();

    await User.findByIdAndUpdate(user.id, { emailVerifyToken });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, emailVerifyToken, user.firstName);
      logger.info(`Verification email resent to: ${user.email}`);
    } catch (error) {
      logger.error('Failed to resend verification email', { error, email: user.email });
    }

    logger.info(`Verification email resent for: ${user.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Verification email sent',
    };

    res.status(200).json(response);
  }
}

export const authController = new AuthController();
