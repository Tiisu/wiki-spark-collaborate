import mongoose, { Document, Schema } from 'mongoose';

export interface ILessonProgress extends Document {
  _id: string;
  isCompleted: boolean;
  timeSpent: number; // in seconds
  completedAt?: Date;
  userId: string;
  lessonId: string;
  createdAt: Date;
  updatedAt: Date;
}

const lessonProgressSchema = new Schema<ILessonProgress>({
  isCompleted: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  completedAt: {
    type: Date,
    default: null
  },
  userId: {
    type: String,
    required: true
  },
  lessonId: {
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

// Compound unique index
lessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
lessonProgressSchema.index({ userId: 1 });
lessonProgressSchema.index({ lessonId: 1 });

export const LessonProgress = mongoose.model<ILessonProgress>('LessonProgress', lessonProgressSchema);
