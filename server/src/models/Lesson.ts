import mongoose, { Document, Schema } from 'mongoose';

export enum LessonType {
  TEXT = 'TEXT',
  VIDEO = 'VIDEO',
  INTERACTIVE = 'INTERACTIVE',
  QUIZ = 'QUIZ',
  ASSIGNMENT = 'ASSIGNMENT'
}

export interface ILesson extends Document {
  _id: string;
  title: string;
  content: string; // Rich text content
  type: LessonType;
  videoUrl?: string;
  duration?: number; // in minutes
  order: number;
  isPublished: boolean;
  moduleId: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(LessonType),
    required: true
  },
  videoUrl: {
    type: String,
    default: null
  },
  duration: {
    type: Number,
    default: null,
    min: 0
  },
  order: {
    type: Number,
    required: true,
    min: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  moduleId: {
    type: String,
    required: true
  },
  creatorId: {
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
lessonSchema.index({ moduleId: 1 });
lessonSchema.index({ moduleId: 1, order: 1 });
lessonSchema.index({ creatorId: 1 });
lessonSchema.index({ type: 1 });

export const Lesson = mongoose.model<ILesson>('Lesson', lessonSchema);
