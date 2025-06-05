import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { AppError } from './errorHandler.js';

// General rate limiter
const rateLimiter = new RateLimiterMemory({
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Number of requests
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000, // Per 15 minutes (in seconds)
});

// Strict rate limiter for auth endpoints
const authRateLimiter = new RateLimiterMemory({
  points: 5, // 5 attempts
  duration: 900, // Per 15 minutes
  blockDuration: 900, // Block for 15 minutes
});

// Rate limiter for password reset
const passwordResetLimiter = new RateLimiterMemory({
  points: 3, // 3 attempts
  duration: 3600, // Per hour
  blockDuration: 3600, // Block for 1 hour
});

// Rate limiter for file uploads
const uploadRateLimiter = new RateLimiterMemory({
  points: 10, // 10 uploads
  duration: 3600, // Per hour
});

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    await rateLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    throw new AppError('Too many requests, please try again later', 429);
  }
};

export const authRateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    await authRateLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    throw new AppError('Too many authentication attempts, please try again later', 429);
  }
};

export const passwordResetRateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    await passwordResetLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    throw new AppError('Too many password reset attempts, please try again later', 429);
  }
};

export const uploadRateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    await uploadRateLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    throw new AppError('Too many upload attempts, please try again later', 429);
  }
};

// Export the default rate limiter
export { rateLimiterMiddleware as rateLimiter };
