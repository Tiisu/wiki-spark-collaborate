import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { catchAsync } from '../middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     HealthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: [healthy, unhealthy]
 *             timestamp:
 *               type: string
 *               format: date-time
 *             uptime:
 *               type: number
 *               description: Server uptime in seconds
 *             environment:
 *               type: string
 *             version:
 *               type: string
 *             database:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [connected, disconnected, error]
 *                 name:
 *                   type: string
 *             memory:
 *               type: object
 *               properties:
 *                 used:
 *                   type: string
 *                 total:
 *                   type: string
 *                 percentage:
 *                   type: string
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Get server health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       503:
 *         description: Server is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get('/', catchAsync(async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  // Check database connection
  let dbStatus = 'disconnected';
  let dbName = 'unknown';
  
  try {
    if (mongoose.connection.readyState === 1) {
      dbStatus = 'connected';
      dbName = mongoose.connection.name || 'default';
    } else if (mongoose.connection.readyState === 2) {
      dbStatus = 'connecting';
    } else if (mongoose.connection.readyState === 3) {
      dbStatus = 'disconnecting';
    }
  } catch (error) {
    dbStatus = 'error';
  }

  // Get memory usage
  const memoryUsage = process.memoryUsage();
  const totalMemory = memoryUsage.heapTotal;
  const usedMemory = memoryUsage.heapUsed;
  const memoryPercentage = ((usedMemory / totalMemory) * 100).toFixed(2);

  // Determine overall health status
  const isHealthy = dbStatus === 'connected';
  const status = isHealthy ? 'healthy' : 'unhealthy';
  const statusCode = isHealthy ? 200 : 503;

  const healthData = {
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    database: {
      status: dbStatus,
      name: dbName,
    },
    memory: {
      used: `${(usedMemory / 1024 / 1024).toFixed(2)} MB`,
      total: `${(totalMemory / 1024 / 1024).toFixed(2)} MB`,
      percentage: `${memoryPercentage}%`,
    },
    responseTime: `${Date.now() - startTime}ms`,
  };

  res.status(statusCode).json({
    success: isHealthy,
    message: isHealthy ? 'Server is healthy' : 'Server is unhealthy',
    data: healthData,
  });
}));

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Get detailed server health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed server health information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     server:
 *                       type: object
 *                     database:
 *                       type: object
 *                     system:
 *                       type: object
 */
router.get('/detailed', catchAsync(async (req: Request, res: Response) => {
  const startTime = Date.now();

  // Server information
  const serverInfo = {
    status: 'running',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    pid: process.pid,
  };

  // Database information
  const dbInfo = {
    status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    name: mongoose.connection.name || 'unknown',
    host: mongoose.connection.host || 'unknown',
    port: mongoose.connection.port || 'unknown',
    readyState: mongoose.connection.readyState,
    collections: Object.keys(mongoose.connection.collections),
  };

  // System information
  const memoryUsage = process.memoryUsage();
  const systemInfo = {
    memory: {
      rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
      arrayBuffers: `${(memoryUsage.arrayBuffers / 1024 / 1024).toFixed(2)} MB`,
    },
    cpu: {
      usage: process.cpuUsage(),
    },
    responseTime: `${Date.now() - startTime}ms`,
  };

  const isHealthy = dbInfo.status === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    message: isHealthy ? 'Server is healthy' : 'Server is unhealthy',
    data: {
      server: serverInfo,
      database: dbInfo,
      system: systemInfo,
    },
  });
}));

export default router;
