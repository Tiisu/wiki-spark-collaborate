import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  text: string;
  files: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
  }>;
  status: 'draft' | 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
  submittedAt?: Date;
  gradedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  lesson: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: [true, 'Lesson reference is required']
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  text: {
    type: String,
    required: [true, 'Assignment text is required'],
    maxlength: [10000, 'Assignment text cannot exceed 10000 characters']
  },
  files: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    path: {
      type: String,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'graded'],
    default: 'draft',
    required: true
  },
  grade: {
    type: Number,
    min: [0, 'Grade cannot be negative'],
    max: [100, 'Grade cannot exceed 100']
  },
  feedback: {
    type: String,
    maxlength: [2000, 'Feedback cannot exceed 2000 characters']
  },
  submittedAt: {
    type: Date
  },
  gradedAt: {
    type: Date
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
assignmentSchema.index({ user: 1, lesson: 1 }, { unique: true });
assignmentSchema.index({ course: 1, status: 1 });
assignmentSchema.index({ lesson: 1 });

// Pre-save middleware to validate grade when status is graded
assignmentSchema.pre('save', function(next) {
  if (this.status === 'graded' && (this.grade === undefined || this.grade === null)) {
    return next(new Error('Grade is required when assignment is marked as graded'));
  }
  next();
});

const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);

export default Assignment;
