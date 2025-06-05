import mongoose, { Document, Schema, Types } from 'mongoose';

export enum MentorshipStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface IMentorship extends Document {
  _id: string;
  status: MentorshipStatus;
  message?: string;
  mentorId: Types.ObjectId;
  menteeId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const mentorshipSchema = new Schema<IMentorship>({
  status: {
    type: String,
    enum: Object.values(MentorshipStatus),
    default: MentorshipStatus.PENDING
  },
  message: {
    type: String,
    default: null
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  menteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
mentorshipSchema.index({ mentorId: 1, menteeId: 1 }, { unique: true });
mentorshipSchema.index({ mentorId: 1 });
mentorshipSchema.index({ menteeId: 1 });
mentorshipSchema.index({ status: 1 });

export const Mentorship = mongoose.model<IMentorship>('Mentorship', mentorshipSchema);
