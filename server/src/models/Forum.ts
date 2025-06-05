import mongoose, { Document, Schema, Types } from 'mongoose';

// Forum Category Model
export interface IForumCategory extends Document {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  order: number;
  createdAt: Date;
}

const forumCategorySchema = new Schema<IForumCategory>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: null
  },
  order: {
    type: Number,
    default: 0
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
forumCategorySchema.index({ name: 1 });
forumCategorySchema.index({ order: 1 });

export const ForumCategory = mongoose.model<IForumCategory>('ForumCategory', forumCategorySchema);

// Forum Post Model
export interface IForumPost extends Document {
  _id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  views: number;
  authorId: Types.ObjectId;
  categoryId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const forumPostSchema = new Schema<IForumPost>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumCategory',
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
forumPostSchema.index({ authorId: 1 });
forumPostSchema.index({ categoryId: 1 });
forumPostSchema.index({ isPinned: 1 });
forumPostSchema.index({ createdAt: -1 });

export const ForumPost = mongoose.model<IForumPost>('ForumPost', forumPostSchema);

// Forum Comment Model
export interface IForumComment extends Document {
  _id: string;
  content: string;
  authorId: Types.ObjectId;
  postId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const forumCommentSchema = new Schema<IForumComment>({
  content: {
    type: String,
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost',
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
forumCommentSchema.index({ authorId: 1 });
forumCommentSchema.index({ postId: 1 });
forumCommentSchema.index({ createdAt: -1 });

export const ForumComment = mongoose.model<IForumComment>('ForumComment', forumCommentSchema);
