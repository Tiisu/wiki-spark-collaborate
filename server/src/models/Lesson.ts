import mongoose, { Schema } from 'mongoose';

export enum LessonType {
  VIDEO = 'VIDEO',
  TEXT = 'TEXT',
  QUIZ = 'QUIZ',
  ASSIGNMENT = 'ASSIGNMENT',
  RESOURCE = 'RESOURCE'
}

export interface ILesson extends mongoose.Document {
  _id: string;
  title: string;
  description?: string;
  content: string;
  type: LessonType;
  order: number;
  module: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  duration: number; // in minutes
  videoUrl?: string;
  resources?: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  isPublished: boolean;
  isFree: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
    maxlength: [200, 'Lesson title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Lesson description cannot exceed 1000 characters']
  },
  content: {
    type: String,
    required: [true, 'Lesson content is required']
  },
  type: {
    type: String,
    enum: Object.values(LessonType),
    required: [true, 'Lesson type is required']
  },
  order: {
    type: Number,
    required: [true, 'Lesson order is required'],
    min: [1, 'Lesson order must be at least 1']
  },
  module: {
    type: Schema.Types.ObjectId,
    ref: 'Module',
    required: [true, 'Module reference is required']
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  duration: {
    type: Number,
    default: 0,
    min: [0, 'Duration cannot be negative']
  },
  videoUrl: {
    type: String,
    trim: true
  },
  resources: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Resource title cannot exceed 200 characters']
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    }
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  isFree: {
    type: Boolean,
    default: false
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
lessonSchema.index({ module: 1, order: 1 });
lessonSchema.index({ course: 1, order: 1 });
lessonSchema.index({ course: 1, isPublished: 1 });
lessonSchema.index({ module: 1, isPublished: 1 });
lessonSchema.index({ type: 1 });
lessonSchema.index({ isFree: 1 });

// Ensure unique order within a module
lessonSchema.index({ module: 1, order: 1 }, { unique: true });

const Lesson = mongoose.model<ILesson>('Lesson', lessonSchema);

export default Lesson;
