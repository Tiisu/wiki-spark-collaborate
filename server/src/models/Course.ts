import mongoose, { Schema } from 'mongoose';

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum WikipediaProject {
  WIKIPEDIA = 'WIKIPEDIA',
  COMMONS = 'COMMONS',
  WIKTIONARY = 'WIKTIONARY',
  WIKIBOOKS = 'WIKIBOOKS',
  WIKISOURCE = 'WIKISOURCE',
  WIKIDATA = 'WIKIDATA',
  WIKINEWS = 'WIKINEWS',
  WIKIQUOTE = 'WIKIQUOTE',
  WIKIVERSITY = 'WIKIVERSITY',
  WIKIVOYAGE = 'WIKIVOYAGE'
}

export enum CourseCategory {
  // Wikipedia Editing Fundamentals
  EDITING_BASICS = 'EDITING_BASICS',
  WIKITEXT_MARKUP = 'WIKITEXT_MARKUP',
  ARTICLE_CREATION = 'ARTICLE_CREATION',

  // Content & Sourcing
  CITATION_SOURCING = 'CITATION_SOURCING',
  RELIABLE_SOURCES = 'RELIABLE_SOURCES',
  FACT_CHECKING = 'FACT_CHECKING',

  // Policies & Guidelines
  CONTENT_POLICIES = 'CONTENT_POLICIES',
  BEHAVIORAL_GUIDELINES = 'BEHAVIORAL_GUIDELINES',
  COPYRIGHT_LICENSING = 'COPYRIGHT_LICENSING',

  // Community & Collaboration
  CONFLICT_RESOLUTION = 'CONFLICT_RESOLUTION',
  COMMUNITY_ENGAGEMENT = 'COMMUNITY_ENGAGEMENT',
  PEER_REVIEW = 'PEER_REVIEW',

  // Advanced Techniques
  ADVANCED_EDITING = 'ADVANCED_EDITING',
  TEMPLATE_CREATION = 'TEMPLATE_CREATION',
  BOT_AUTOMATION = 'BOT_AUTOMATION',

  // Sister Projects
  COMMONS_MEDIA = 'COMMONS_MEDIA',
  WIKTIONARY_EDITING = 'WIKTIONARY_EDITING',
  WIKIBOOKS_AUTHORING = 'WIKIBOOKS_AUTHORING',
  WIKIDATA_EDITING = 'WIKIDATA_EDITING',

  // Specialized Topics
  ACADEMIC_WRITING = 'ACADEMIC_WRITING',
  TRANSLATION = 'TRANSLATION',
  ACCESSIBILITY = 'ACCESSIBILITY'
}

export interface ICourse extends mongoose.Document {
  _id: string;
  title: string;
  description: string;
  level: CourseLevel;
  category: CourseCategory;
  tags: string[];
  price: number;
  duration: number; // in minutes
  thumbnail?: string;
  instructor: mongoose.Types.ObjectId;
  status: CourseStatus;
  isPublished: boolean;
  totalLessons: number;
  totalModules: number;
  rating: number;
  ratingCount: number;
  enrollmentCount: number;

  // Wikipedia-specific fields
  wikipediaProject: WikipediaProject;
  prerequisites: mongoose.Types.ObjectId[]; // Other courses that should be completed first
  learningObjectives: string[];
  skillsAcquired: string[];
  difficultyRating: number; // 1-10 scale for more granular difficulty
  estimatedCompletionTime: number; // in hours
  practiceArticles: string[]; // Wikipedia articles for practice

  // Assessment and certification
  hasAssessment: boolean;
  passingScore: number;
  certificateTemplate?: string;

  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Course title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    maxlength: [2000, 'Course description cannot exceed 2000 characters']
  },
  level: {
    type: String,
    enum: Object.values(CourseLevel),
    required: [true, 'Course level is required']
  },
  category: {
    type: String,
    enum: Object.values(CourseCategory),
    required: [true, 'Course category is required']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative'],
    max: [0, 'All WikiWalkthrough courses are free']
  },
  duration: {
    type: Number,
    default: 0,
    min: [0, 'Duration cannot be negative']
  },
  thumbnail: {
    type: String,
    trim: true
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Course instructor is required']
  },
  status: {
    type: String,
    enum: Object.values(CourseStatus),
    default: CourseStatus.DRAFT
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  totalLessons: {
    type: Number,
    default: 0,
    min: [0, 'Total lessons cannot be negative']
  },
  totalModules: {
    type: Number,
    default: 0,
    min: [0, 'Total modules cannot be negative']
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: [0, 'Rating count cannot be negative']
  },
  enrollmentCount: {
    type: Number,
    default: 0,
    min: [0, 'Enrollment count cannot be negative']
  },

  // Wikipedia-specific fields
  wikipediaProject: {
    type: String,
    enum: Object.values(WikipediaProject),
    default: WikipediaProject.WIKIPEDIA
  },
  prerequisites: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }],
  learningObjectives: [{
    type: String,
    trim: true,
    maxlength: [200, 'Learning objective cannot exceed 200 characters']
  }],
  skillsAcquired: [{
    type: String,
    trim: true,
    maxlength: [100, 'Skill cannot exceed 100 characters']
  }],
  difficultyRating: {
    type: Number,
    min: [1, 'Difficulty rating must be at least 1'],
    max: [10, 'Difficulty rating cannot exceed 10'],
    default: 5
  },
  estimatedCompletionTime: {
    type: Number,
    min: [0, 'Estimated completion time cannot be negative'],
    default: 0
  },
  practiceArticles: [{
    type: String,
    trim: true
  }],

  // Assessment and certification
  hasAssessment: {
    type: Boolean,
    default: false
  },
  passingScore: {
    type: Number,
    min: [0, 'Passing score cannot be negative'],
    max: [100, 'Passing score cannot exceed 100'],
    default: 70
  },
  certificateTemplate: {
    type: String,
    trim: true
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
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ rating: -1 });
courseSchema.index({ enrollmentCount: -1 });

const Course = mongoose.model<ICourse>('Course', courseSchema);

export default Course;
