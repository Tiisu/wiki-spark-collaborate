import mongoose, { Schema } from 'mongoose';
import { CourseLevel } from './Course';

export interface ITemplateModule {
  title: string;
  description?: string;
  order: number;
  lessons: ITemplateLesson[];
}

export interface ITemplateLesson {
  title: string;
  description?: string;
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' | 'RESOURCE';
  order: number;
  content?: string;
  duration?: number; // in minutes
}

export interface ICourseTemplate extends mongoose.Document {
  _id: string;
  name: string;
  description: string;
  category: string;
  level: CourseLevel;
  tags: string[];
  thumbnail?: string;
  isPublic: boolean; // Whether other instructors can use this template
  createdBy: mongoose.Types.ObjectId;
  modules: ITemplateModule[];
  estimatedDuration: number; // in minutes
  usageCount: number; // How many times this template has been used
  createdAt: Date;
  updatedAt: Date;
}

const templateLessonSchema = new Schema<ITemplateLesson>({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
    maxlength: [200, 'Lesson title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Lesson description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT', 'RESOURCE'],
    required: [true, 'Lesson type is required']
  },
  order: {
    type: Number,
    required: [true, 'Lesson order is required'],
    min: [1, 'Lesson order must be at least 1']
  },
  content: {
    type: String,
    trim: true
  },
  duration: {
    type: Number,
    min: [0, 'Duration cannot be negative']
  }
});

const templateModuleSchema = new Schema<ITemplateModule>({
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
  lessons: [templateLessonSchema]
});

const courseTemplateSchema = new Schema<ICourseTemplate>({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    maxlength: [200, 'Template name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Template description is required'],
    trim: true,
    maxlength: [2000, 'Template description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Template category is required'],
    trim: true
  },
  level: {
    type: String,
    enum: Object.values(CourseLevel),
    required: [true, 'Template level is required']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  thumbnail: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Template creator is required']
  },
  modules: [templateModuleSchema],
  estimatedDuration: {
    type: Number,
    default: 0,
    min: [0, 'Estimated duration cannot be negative']
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
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
courseTemplateSchema.index({ name: 'text', description: 'text' });
courseTemplateSchema.index({ category: 1 });
courseTemplateSchema.index({ level: 1 });
courseTemplateSchema.index({ createdBy: 1 });
courseTemplateSchema.index({ isPublic: 1 });
courseTemplateSchema.index({ usageCount: -1 });
courseTemplateSchema.index({ createdAt: -1 });

const CourseTemplate = mongoose.model<ICourseTemplate>('CourseTemplate', courseTemplateSchema);

export default CourseTemplate;
