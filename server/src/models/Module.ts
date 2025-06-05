import mongoose, { Document, Schema } from 'mongoose';

export interface IModule extends Document {
  _id: string;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}

const moduleSchema = new Schema<IModule>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: null
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
  courseId: {
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
moduleSchema.index({ courseId: 1 });
moduleSchema.index({ courseId: 1, order: 1 });

export const Module = mongoose.model<IModule>('Module', moduleSchema);
