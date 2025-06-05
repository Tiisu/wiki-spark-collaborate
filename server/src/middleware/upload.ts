import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { AppError } from './errorHandler.js';

// Ensure upload directories exist
const uploadDir = 'uploads';
const videoDir = path.join(uploadDir, 'videos');
const thumbnailDir = path.join(uploadDir, 'thumbnails');

[uploadDir, videoDir, thumbnailDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration for videos
const videoStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, videoDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${ext}`);
  }
});

// Storage configuration for thumbnails
const thumbnailStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, thumbnailDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `thumbnail-${uniqueSuffix}${ext}`);
  }
});

// File filter for videos
const videoFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo', // .avi
    'video/x-ms-wmv',  // .wmv
    'video/webm'
  ];

  const allowedExtensions = ['.mp4', '.mpeg', '.mpg', '.mov', '.avi', '.wmv', '.webm'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new AppError('Only video files are allowed (mp4, mpeg, mov, avi, wmv, webm)', 400));
  }
};

// File filter for images (thumbnails)
const imageFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed (jpg, jpeg, png, gif, webp)', 400));
  }
};

// Video upload configuration
export const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
    files: 1
  }
}).single('video');

// Thumbnail upload configuration
export const uploadThumbnail = multer({
  storage: thumbnailStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  }
}).single('thumbnail');

// Multiple file upload for course creation (thumbnail + video)
export const uploadCourseFiles = multer({
  storage: multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
      if (file.fieldname === 'video') {
        cb(null, videoDir);
      } else if (file.fieldname === 'thumbnail') {
        cb(null, thumbnailDir);
      } else {
        cb(new AppError('Invalid field name', 400));
      }
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const prefix = file.fieldname === 'video' ? 'video' : 'thumbnail';
      cb(null, `${prefix}-${uniqueSuffix}${ext}`);
    }
  }),
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.fieldname === 'video') {
      videoFileFilter(req, file, cb);
    } else if (file.fieldname === 'thumbnail') {
      imageFileFilter(req, file, cb);
    } else {
      cb(new AppError('Invalid field name', 400));
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit (will apply to largest file)
    files: 2
  }
}).fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

// Error handling middleware for multer
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File too large', 400));
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return next(new AppError('Too many files', 400));
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new AppError('Unexpected file field', 400));
    }
  }
  next(error);
};

// Utility function to delete uploaded file
export const deleteUploadedFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

// Utility function to get file URL
export const getFileUrl = (filename: string, type: 'video' | 'thumbnail'): string => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  return `${baseUrl}/uploads/${type}s/${filename}`;
};
