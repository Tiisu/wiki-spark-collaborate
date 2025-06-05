import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAchievement extends Document {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  criteria: any; // Criteria for earning this achievement
  createdAt: Date;
}

const achievementSchema = new Schema<IAchievement>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  criteria: {
    type: Object,
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
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
achievementSchema.index({ name: 1 });
achievementSchema.index({ category: 1 });

export const Achievement = mongoose.model<IAchievement>('Achievement', achievementSchema);

// User Achievement Model
export interface IUserAchievement extends Document {
  _id: string;
  earnedAt: Date;
  userId: Types.ObjectId;
  achievementId: Types.ObjectId;
}

const userAchievementSchema = new Schema<IUserAchievement>({
  earnedAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
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

// Compound unique index
userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
userAchievementSchema.index({ userId: 1 });
userAchievementSchema.index({ achievementId: 1 });

export const UserAchievement = mongoose.model<IUserAchievement>('UserAchievement', userAchievementSchema);
