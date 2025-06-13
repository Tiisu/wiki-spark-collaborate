import { z } from 'zod';
import { UserRole } from '../types';

// Password validation schema
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
  .regex(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
  .regex(/^(?=.*\d)/, 'Password must contain at least one number')
  .regex(/^(?=.*[@$!%*?&])/, 'Password must contain at least one special character (@$!%*?&)');

// Email validation schema
const emailSchema = z.string()
  .email('Please enter a valid email address')
  .max(255, 'Email cannot exceed 255 characters')
  .toLowerCase()
  .trim();

// Username validation schema
const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters long')
  .max(30, 'Username cannot exceed 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .trim();

// Name validation schema
const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(50, 'Name cannot exceed 50 characters')
  .trim();

// Registration validation schema
export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  password: passwordSchema,
  country: z.string().max(100, 'Country name cannot exceed 100 characters').trim().optional(),
  preferredLanguage: z.string().max(10, 'Language code cannot exceed 10 characters').trim().optional()
});

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: emailSchema
});

// Reset password validation schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema
});

// Update profile validation schema
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').trim().optional(),
  country: z.string().max(100, 'Country name cannot exceed 100 characters').trim().optional(),
  timezone: z.string().trim().optional(),
  preferredLanguage: z.string().max(10, 'Language code cannot exceed 10 characters').trim().optional()
});

// Change password validation schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema
});

// Admin user creation schema
export const adminCreateUserSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  password: passwordSchema,
  role: z.nativeEnum(UserRole).optional(),
  country: z.string().max(100, 'Country name cannot exceed 100 characters').trim().optional(),
  preferredLanguage: z.string().max(10, 'Language code cannot exceed 10 characters').trim().optional()
});

// Validation helper function
export const validateRequest = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: string[] } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};

// Email validation helper
export const isValidEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

// Password strength checker
export const checkPasswordStrength = (password: string): { isStrong: boolean; score: number; feedback: string[] } => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Password should be at least 8 characters long');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Password should contain lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Password should contain uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Password should contain numbers');

  if (/[@$!%*?&]/.test(password)) score += 1;
  else feedback.push('Password should contain special characters (@$!%*?&)');

  if (password.length >= 12) score += 1;

  return {
    isStrong: score >= 5,
    score,
    feedback
  };
};
