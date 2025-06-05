import mongoose, { Document, Schema } from 'mongoose';

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export interface ICourse extends Document {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  level: CourseLevel;
  category: string;
  tags: string[];
  isPublished: boolean;
  price: number;
  duration?: number; // in minutes
  instructorId: string;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: null
  },
  level: {
    type: String,
    enum: Object.values(CourseLevel),
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  duration: {
    type: Number,
    default: null,
    min: 0
  },
  instructorId: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
courseSchema.index({ slug: 1 });
courseSchema.index({ instructorId: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ tags: 1 });

export const Course = mongoose.model<ICourse>('Course', courseSchema);
