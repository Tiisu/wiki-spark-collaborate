import mongoose, { Schema } from 'mongoose';

export interface IModule extends mongoose.Document {
  _id: string;
  title: string;
  description?: string;
  order: number;
  course: mongoose.Types.ObjectId;
  isPublished: boolean;
  lessonCount: number;
  duration: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

const moduleSchema = new Schema<IModule>({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
    maxlength: [200, 'Module title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Module description cannot exceed 1000 characters']
  },
  order: {
    type: Number,
    required: [true, 'Module order is required'],
    min: [1, 'Module order must be at least 1']
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  lessonCount: {
    type: Number,
    default: 0,
    min: [0, 'Lesson count cannot be negative']
  },
  duration: {
    type: Number,
    default: 0,
    min: [0, 'Duration cannot be negative']
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
moduleSchema.index({ course: 1, order: 1 });
moduleSchema.index({ course: 1, isPublished: 1 });
moduleSchema.index({ isPublished: 1 });

// Ensure unique order within a course
moduleSchema.index({ course: 1, order: 1 }, { unique: true });

const Module = mongoose.model<IModule>('Module', moduleSchema);

export default Module;
