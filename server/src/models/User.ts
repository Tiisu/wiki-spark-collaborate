import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  LEARNER = 'LEARNER',
  INSTRUCTOR = 'INSTRUCTOR',
  MENTOR = 'MENTOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface IUser extends Document {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  avatar?: string;
  bio?: string;
  country?: string;
  timezone?: string;
  preferredLanguage: string;
  role: UserRole;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null
  },
  country: {
    type: String,
    default: null
  },
  timezone: {
    type: String,
    default: null
  },
  preferredLanguage: {
    type: String,
    default: 'en'
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.LEARNER
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  lastLoginAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      return ret;
    }
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
