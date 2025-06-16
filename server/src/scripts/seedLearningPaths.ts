import dotenv from 'dotenv';
import mongoose from 'mongoose';
import LearningPath, { DifficultyLevel, StepType } from '../models/LearningPath';
import User from '../models/User';
import connectDatabase from '../config/database';
import logger from '../utils/logger';

// Load environment variables
dotenv.config();

const sampleLearningPaths = [
  {
    title: "Wikipedia Fundamentals",
    description: "Master the basics of editing, sourcing, and following Wikipedia policies. Perfect for newcomers to Wikipedia editing.",
    category: "Wikipedia Basics",
    estimatedHours: 15,
    difficulty: DifficultyLevel.BEGINNER,
    tags: ["wikipedia", "editing", "basics", "policies"],
    prerequisites: [],
    learningObjectives: [
      "Understand Wikipedia's core principles",
      "Learn basic editing techniques",
      "Master citation and sourcing",
      "Follow Wikipedia policies and guidelines"
    ],
    skillsAcquired: [
      "Basic Wikipedia editing",
      "Citation formatting",
      "Policy compliance",
      "Content creation"
    ],
    targetAudience: "New Wikipedia editors and contributors",
    isPublished: true,
    steps: [
      {
        title: "Introduction to Wikipedia",
        description: "Learn about Wikipedia's mission, principles, and community guidelines.",
        type: StepType.COURSE,
        estimatedHours: 2,
        difficulty: DifficultyLevel.BEGINNER,
        skills: ["Wikipedia basics", "Community guidelines"],
        order: 1
      },
      {
        title: "Creating Your First Edit",
        description: "Make your first Wikipedia edit with guidance on formatting and style.",
        type: StepType.PROJECT,
        estimatedHours: 3,
        difficulty: DifficultyLevel.BEGINNER,
        skills: ["Basic editing", "Wiki markup"],
        order: 2
      },
      {
        title: "Understanding Citations",
        description: "Learn how to properly cite sources and add references to Wikipedia articles.",
        type: StepType.COURSE,
        estimatedHours: 4,
        difficulty: DifficultyLevel.BEGINNER,
        skills: ["Citation formatting", "Source verification"],
        order: 3
      },
      {
        title: "Wikipedia Policies Deep Dive",
        description: "Comprehensive overview of Wikipedia's key policies and guidelines.",
        type: StepType.COURSE,
        estimatedHours: 4,
        difficulty: DifficultyLevel.INTERMEDIATE,
        skills: ["Policy knowledge", "Guideline compliance"],
        order: 4
      },
      {
        title: "Practice Article Creation",
        description: "Create a complete Wikipedia article following all best practices.",
        type: StepType.PROJECT,
        estimatedHours: 2,
        difficulty: DifficultyLevel.INTERMEDIATE,
        skills: ["Article creation", "Content structuring"],
        order: 5
      }
    ]
  },
  {
    title: "Advanced Wikipedia Editing",
    description: "Take your Wikipedia editing skills to the next level with advanced techniques and specialized knowledge.",
    category: "Advanced Editing",
    estimatedHours: 25,
    difficulty: DifficultyLevel.ADVANCED,
    tags: ["advanced", "editing", "templates", "administration"],
    prerequisites: ["Basic Wikipedia editing experience"],
    learningObjectives: [
      "Master advanced editing techniques",
      "Learn template creation and management",
      "Understand Wikipedia administration",
      "Develop conflict resolution skills"
    ],
    skillsAcquired: [
      "Advanced wiki markup",
      "Template development",
      "Administrative processes",
      "Dispute resolution"
    ],
    targetAudience: "Experienced Wikipedia editors seeking advanced skills",
    isPublished: true,
    steps: [
      {
        title: "Advanced Wiki Markup",
        description: "Master complex formatting, tables, and advanced markup techniques.",
        type: StepType.COURSE,
        estimatedHours: 5,
        difficulty: DifficultyLevel.ADVANCED,
        skills: ["Advanced markup", "Table creation", "Complex formatting"],
        order: 1
      },
      {
        title: "Template Creation and Management",
        description: "Learn to create, modify, and maintain Wikipedia templates.",
        type: StepType.COURSE,
        estimatedHours: 6,
        difficulty: DifficultyLevel.ADVANCED,
        skills: ["Template development", "Template documentation"],
        order: 2
      },
      {
        title: "Wikipedia Administration Basics",
        description: "Understand administrative processes and community governance.",
        type: StepType.COURSE,
        estimatedHours: 4,
        difficulty: DifficultyLevel.ADVANCED,
        skills: ["Administrative knowledge", "Community governance"],
        order: 3
      },
      {
        title: "Conflict Resolution and Mediation",
        description: "Learn techniques for resolving disputes and mediating conflicts.",
        type: StepType.SKILL,
        estimatedHours: 4,
        difficulty: DifficultyLevel.ADVANCED,
        skills: ["Dispute resolution", "Mediation", "Communication"],
        order: 4
      },
      {
        title: "Advanced Project Management",
        description: "Lead a complex Wikipedia improvement project from start to finish.",
        type: StepType.PROJECT,
        estimatedHours: 6,
        difficulty: DifficultyLevel.ADVANCED,
        skills: ["Project management", "Team coordination", "Quality assurance"],
        order: 5
      }
    ]
  },
  {
    title: "Wikipedia Translation Mastery",
    description: "Become proficient in translating Wikipedia articles between languages while maintaining quality and accuracy.",
    category: "Translation",
    estimatedHours: 20,
    difficulty: DifficultyLevel.INTERMEDIATE,
    tags: ["translation", "multilingual", "content-transfer"],
    prerequisites: ["Proficiency in at least two languages", "Basic Wikipedia editing"],
    learningObjectives: [
      "Master Wikipedia translation tools",
      "Understand cultural adaptation techniques",
      "Learn quality assurance for translations",
      "Develop cross-cultural communication skills"
    ],
    skillsAcquired: [
      "Content translation",
      "Cultural adaptation",
      "Quality assurance",
      "Cross-language collaboration"
    ],
    targetAudience: "Multilingual editors interested in translation work",
    isPublished: true,
    steps: [
      {
        title: "Translation Tools Overview",
        description: "Learn to use Wikipedia's Content Translation tool and other translation resources.",
        type: StepType.COURSE,
        estimatedHours: 3,
        difficulty: DifficultyLevel.INTERMEDIATE,
        skills: ["Content Translation tool", "Translation workflow"],
        order: 1
      },
      {
        title: "Cultural Adaptation Techniques",
        description: "Understand how to adapt content for different cultural contexts.",
        type: StepType.COURSE,
        estimatedHours: 4,
        difficulty: DifficultyLevel.INTERMEDIATE,
        skills: ["Cultural sensitivity", "Content adaptation"],
        order: 2
      },
      {
        title: "Quality Assurance in Translation",
        description: "Learn methods for ensuring translation accuracy and quality.",
        type: StepType.SKILL,
        estimatedHours: 3,
        difficulty: DifficultyLevel.INTERMEDIATE,
        skills: ["Quality control", "Accuracy verification"],
        order: 3
      },
      {
        title: "Collaborative Translation Project",
        description: "Work with other translators on a significant article translation.",
        type: StepType.PROJECT,
        estimatedHours: 6,
        difficulty: DifficultyLevel.INTERMEDIATE,
        skills: ["Team collaboration", "Project coordination"],
        order: 4
      },
      {
        title: "Translation Assessment",
        description: "Demonstrate your translation skills through a comprehensive assessment.",
        type: StepType.ASSESSMENT,
        estimatedHours: 4,
        difficulty: DifficultyLevel.INTERMEDIATE,
        skills: ["Translation proficiency", "Quality demonstration"],
        order: 5
      }
    ]
  }
];

async function seedLearningPaths() {
  try {
    await connectDatabase();
    
    // Find an admin user to assign as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      logger.error('No admin user found. Please create an admin user first.');
      return;
    }

    // Clear existing learning paths
    await LearningPath.deleteMany({});
    logger.info('Cleared existing learning paths');

    // Create learning paths
    const learningPaths = sampleLearningPaths.map(path => ({
      ...path,
      createdBy: adminUser._id
    }));

    const createdPaths = await LearningPath.insertMany(learningPaths);
    logger.info(`Created ${createdPaths.length} learning paths`);

    logger.info('Learning paths seeded successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding learning paths:', error);
    process.exit(1);
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedLearningPaths();
}

export default seedLearningPaths;
