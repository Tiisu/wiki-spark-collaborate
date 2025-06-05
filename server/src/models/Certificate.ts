import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICertificate extends Document {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  issuedAt: Date;
  expiresAt?: Date;
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
}

const certificateSchema = new Schema<ICertificate>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: null
  },
  imageUrl: {
    type: String,
    default: null
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  }
}, {
  timestamps: false,
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
certificateSchema.index({ userId: 1 });
certificateSchema.index({ courseId: 1 });
certificateSchema.index({ userId: 1, courseId: 1 });

export const Certificate = mongoose.model<ICertificate>('Certificate', certificateSchema);
