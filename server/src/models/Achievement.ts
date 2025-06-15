import mongoose, { Schema } from 'mongoose';

export enum BadgeType {
  // Wikipedia Basics
  FIRST_EDIT = 'FIRST_EDIT',
  ACCOUNT_CREATOR = 'ACCOUNT_CREATOR',
  SANDBOX_EXPLORER = 'SANDBOX_EXPLORER',
  
  // Content Creation
  ARTICLE_CREATOR = 'ARTICLE_CREATOR',
  CONTENT_CONTRIBUTOR = 'CONTENT_CONTRIBUTOR',
  FORMATTING_MASTER = 'FORMATTING_MASTER',
  TEMPLATE_EXPERT = 'TEMPLATE_EXPERT',
  
  // Sourcing & Citations
  CITATION_MASTER = 'CITATION_MASTER',
  SOURCE_HUNTER = 'SOURCE_HUNTER',
  REFERENCE_EXPERT = 'REFERENCE_EXPERT',
  FACT_CHECKER = 'FACT_CHECKER',
  
  // Community & Policy
  POLICY_EXPERT = 'POLICY_EXPERT',
  TALK_PAGE_NAVIGATOR = 'TALK_PAGE_NAVIGATOR',
  CONSENSUS_BUILDER = 'CONSENSUS_BUILDER',
  DISPUTE_RESOLVER = 'DISPUTE_RESOLVER',
  
  // Sister Projects
  COMMONS_CONTRIBUTOR = 'COMMONS_CONTRIBUTOR',
  WIKTIONARY_EDITOR = 'WIKTIONARY_EDITOR',
  WIKIBOOKS_AUTHOR = 'WIKIBOOKS_AUTHOR',
  WIKINEWS_REPORTER = 'WIKINEWS_REPORTER',
  
  // Advanced Topics
  COPYRIGHT_GUARDIAN = 'COPYRIGHT_GUARDIAN',
  COI_EXPERT = 'COI_EXPERT',
  ADMIN_CANDIDATE = 'ADMIN_CANDIDATE',
  
  // Learning Milestones
  COURSE_COMPLETER = 'COURSE_COMPLETER',
  QUIZ_MASTER = 'QUIZ_MASTER',
  PERFECT_SCORE = 'PERFECT_SCORE',
  SPEED_LEARNER = 'SPEED_LEARNER',
  DEDICATED_LEARNER = 'DEDICATED_LEARNER',
  
  // Special Achievements
  MENTOR = 'MENTOR',
  INSTRUCTOR = 'INSTRUCTOR',
  COMMUNITY_LEADER = 'COMMUNITY_LEADER'
}

export interface IAchievement extends mongoose.Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  badgeType: BadgeType;
  title: string;
  description: string;
  iconUrl?: string;
  course?: mongoose.Types.ObjectId; // If related to specific course
  quiz?: mongoose.Types.ObjectId; // If related to specific quiz
  earnedAt: Date;
  metadata?: {
    score?: number;
    timeSpent?: number;
    courseTitle?: string;
    quizTitle?: string;
    additionalInfo?: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const achievementSchema = new Schema<IAchievement>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  badgeType: {
    type: String,
    enum: Object.values(BadgeType),
    required: [true, 'Badge type is required']
  },
  title: {
    type: String,
    required: [true, 'Achievement title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Achievement description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  iconUrl: {
    type: String,
    trim: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  },
  quiz: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  earnedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  metadata: {
    score: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100']
    },
    timeSpent: {
      type: Number,
      min: [0, 'Time spent cannot be negative']
    },
    courseTitle: {
      type: String,
      trim: true
    },
    quizTitle: {
      type: String,
      trim: true
    },
    additionalInfo: {
      type: Schema.Types.Mixed
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
achievementSchema.index({ user: 1 });
achievementSchema.index({ badgeType: 1 });
achievementSchema.index({ earnedAt: -1 });
achievementSchema.index({ user: 1, badgeType: 1 }, { unique: true }); // Prevent duplicate badges
achievementSchema.index({ course: 1 });
achievementSchema.index({ quiz: 1 });

const Achievement = mongoose.model<IAchievement>('Achievement', achievementSchema);

export default Achievement;
