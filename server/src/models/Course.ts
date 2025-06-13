import mongoose, { Schema } from 'mongoose';

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export interface ICourse extends mongoose.Document {
  _id: string;
  title: string;
  description: string;
  level: CourseLevel;
  category: string;
  tags: string[];
  price: number;
  duration: number; // in minutes
  thumbnail?: string;
  instructor: mongoose.Types.ObjectId;
  status: CourseStatus;
  isPublished: boolean;
  totalLessons: number;
  totalModules: number;
  rating: number;
  ratingCount: number;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Course title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    maxlength: [2000, 'Course description cannot exceed 2000 characters']
  },
  level: {
    type: String,
    enum: Object.values(CourseLevel),
    required: [true, 'Course level is required']
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  duration: {
    type: Number,
    default: 0,
    min: [0, 'Duration cannot be negative']
  },
  thumbnail: {
    type: String,
    trim: true
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Course instructor is required']
  },
  status: {
    type: String,
    enum: Object.values(CourseStatus),
    default: CourseStatus.DRAFT
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  totalLessons: {
    type: Number,
    default: 0,
    min: [0, 'Total lessons cannot be negative']
  },
  totalModules: {
    type: Number,
    default: 0,
    min: [0, 'Total modules cannot be negative']
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: [0, 'Rating count cannot be negative']
  },
  enrollmentCount: {
    type: Number,
    default: 0,
    min: [0, 'Enrollment count cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ rating: -1 });
courseSchema.index({ enrollmentCount: -1 });

const Course = mongoose.model<ICourse>('Course', courseSchema);

export default Course;
