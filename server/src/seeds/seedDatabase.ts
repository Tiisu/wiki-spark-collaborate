import mongoose from 'mongoose';
import Course from '../models/Course';
import Module from '../models/Module';
import Lesson, { LessonType } from '../models/Lesson';
import User, { UserRole } from '../models/User';
import { wikipediaCoursesData } from './wikipediaCourses';
import logger from '../utils/logger';

export async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');

    // Find or create a default instructor
    let instructor = await User.findOne({ 
      role: UserRole.INSTRUCTOR,
      email: 'instructor@wikiwalkthrough.org' 
    });

    if (!instructor) {
      instructor = await User.create({
        email: 'instructor@wikiwalkthrough.org',
        username: 'wikiwalkthrough_instructor',
        firstName: 'WikiWalkthrough',
        lastName: 'Instructor',
        password: 'TempPassword123!',
        role: UserRole.INSTRUCTOR,
        bio: 'Official WikiWalkthrough course instructor and content creator.',
        isEmailVerified: true
      });
      logger.info('Created default instructor account');
    }

    const createdCourses: any[] = [];

    // Create courses
    for (const courseData of wikipediaCoursesData) {
      const existingCourse = await Course.findOne({ 
        title: courseData.title 
      });

      if (existingCourse) {
        logger.info(`Course "${courseData.title}" already exists, skipping...`);
        createdCourses.push(existingCourse);
        continue;
      }

      const course = await Course.create({
        ...courseData,
        instructor: instructor._id,
        price: 0, // All courses are free
        totalLessons: 0, // Will be updated when lessons are added
        totalModules: 0, // Will be updated when modules are added
        rating: 0,
        ratingCount: 0,
        enrollmentCount: 0
      });

      createdCourses.push(course);
      logger.info(`Created course: ${course.title}`);
    }

    // Set up prerequisites
    const courseMap = new Map();
    createdCourses.forEach(course => {
      courseMap.set(course.title, course._id);
    });

    const prerequisites = [
      {
        course: 'Wikitext Markup Mastery',
        requires: ['Wikipedia Editing Fundamentals']
      },
      {
        course: 'Reliable Sources and Citations',
        requires: ['Wikipedia Editing Fundamentals']
      },
      {
        course: 'Wikipedia Content Policies Deep Dive',
        requires: ['Wikipedia Editing Fundamentals', 'Reliable Sources and Citations']
      },
      {
        course: 'Article Creation Workshop',
        requires: ['Wikitext Markup Mastery', 'Reliable Sources and Citations', 'Wikipedia Content Policies Deep Dive']
      },
      {
        course: 'Community Collaboration and Conflict Resolution',
        requires: ['Wikipedia Content Policies Deep Dive']
      },
      {
        course: 'Advanced Wikipedia Editing Techniques',
        requires: ['Article Creation Workshop', 'Community Collaboration and Conflict Resolution']
      },
      {
        course: 'Wikimedia Commons: Media and Licensing',
        requires: ['Wikipedia Editing Fundamentals']
      },
      {
        course: 'Wikidata Editing and Structured Data',
        requires: ['Advanced Wikipedia Editing Techniques']
      }
    ];

    // Update courses with prerequisites
    for (const prereq of prerequisites) {
      const courseId = courseMap.get(prereq.course);
      const prerequisiteIds = prereq.requires.map(title => courseMap.get(title)).filter(Boolean);

      if (courseId && prerequisiteIds.length > 0) {
        await Course.findByIdAndUpdate(courseId, {
          prerequisites: prerequisiteIds
        });
        logger.info(`Updated prerequisites for: ${prereq.course}`);
      }
    }

    // Create modules and lessons for the fundamental course
    await createFundamentalsCourseContent(courseMap.get('Wikipedia Editing Fundamentals'));

    logger.info(`Successfully seeded ${createdCourses.length} courses`);
    return createdCourses;

  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
}

async function createFundamentalsCourseContent(courseId: string) {
  if (!courseId) return;

  try {
    // Module 1: Getting Started
    const module1 = await Module.create({
      title: "Getting Started with Wikipedia",
      description: "Introduction to Wikipedia and setting up your editing environment",
      order: 1,
      course: courseId,
      isPublished: true,
      lessonCount: 3,
      duration: 60
    });

    // Lessons for Module 1
    const lessons1 = [
      {
        title: "What is Wikipedia?",
        description: "Understanding Wikipedia's mission, principles, and community",
        content: `# What is Wikipedia?

Wikipedia is a free, collaborative encyclopedia that anyone can edit. It's one of the most visited websites in the world and serves as a primary source of information for millions of people daily.

## Core Principles

Wikipedia operates on several fundamental principles:

### 1. **Free Content**
- All content is freely available under Creative Commons licenses
- Anyone can read, edit, and redistribute Wikipedia content
- No subscription fees or paywalls

### 2. **Collaborative Editing**
- Multiple editors work together to improve articles
- Changes are tracked and can be reviewed by the community
- Consensus-building is key to resolving disputes

### 3. **Neutral Point of View (NPOV)**
- Articles should present information fairly and without bias
- All significant viewpoints should be represented proportionally
- Personal opinions and original research are not allowed

### 4. **Verifiability**
- All information must be backed by reliable sources
- Readers should be able to verify claims through citations
- Unsourced content may be removed

## Wikipedia's Impact

- Over 60 million articles in more than 300 languages
- Billions of page views monthly
- Used by students, researchers, and the general public worldwide
- Serves as a starting point for research and learning

## Your Role as an Editor

As a Wikipedia editor, you become part of a global community working to share knowledge freely. Your contributions help make information accessible to everyone, regardless of their economic situation or geographic location.`,
        type: LessonType.TEXT,
        order: 1,
        module: module1._id,
        course: courseId,
        duration: 15,
        isPublished: true,
        isFree: true
      },
      {
        title: "Creating Your Wikipedia Account",
        description: "Step-by-step guide to setting up your Wikipedia account",
        content: `# Creating Your Wikipedia Account

While you can edit Wikipedia without an account, having one provides many benefits and is essential for serious contributors.

## Benefits of Having an Account

### **Enhanced Features**
- Personalized watchlist to track articles you're interested in
- User talk page for communication with other editors
- Contribution history and statistics
- Ability to create new articles (after gaining experience)

### **Community Recognition**
- Your username appears in edit histories
- Build reputation within the Wikipedia community
- Access to additional tools and privileges over time

## Step-by-Step Account Creation

### 1. **Visit Wikipedia**
Go to [wikipedia.org](https://wikipedia.org) and click "Create account" in the top right corner.

### 2. **Choose a Username**
- Select a username that represents you professionally
- Avoid promotional or offensive names
- Consider using your real name or a variation
- Username cannot be changed later, so choose carefully

### 3. **Set a Strong Password**
- Use at least 8 characters
- Include uppercase, lowercase, numbers, and symbols
- Don't reuse passwords from other sites
- Consider using a password manager

### 4. **Provide an Email Address**
- Email is optional but highly recommended
- Enables password recovery
- Allows important notifications
- Helps with account security

## Best Practices

### **Username Guidelines**
- ✅ Use your real name: "John Smith"
- ✅ Use initials: "JS Editor"
- ✅ Use a neutral handle: "HistoryBuff2024"
- ❌ Avoid promotional names: "BestCompanyEver"
- ❌ Avoid offensive content: inappropriate language
- ❌ Avoid impersonation: pretending to be someone else`,
        type: LessonType.TEXT,
        order: 2,
        module: module1._id,
        course: courseId,
        duration: 20,
        isPublished: true,
        isFree: true
      },
      {
        title: "Interactive Sandbox Practice",
        description: "Hands-on practice with Wikipedia editing in a safe environment",
        content: `# Interactive Sandbox Practice

Now it's time to put your knowledge into practice! This interactive exercise will guide you through making real edits in a safe environment.

## Your Mission

Complete the following editing tasks in the practice sandbox:

1. **Format text** using bold and italic markup
2. **Create headings** to structure content
3. **Add internal links** to other Wikipedia articles
4. **Create lists** to organize information
5. **Write edit summaries** explaining your changes

## Success Criteria

Your work will be evaluated on:
- Correct use of wikitext markup
- Proper article structure
- Clear edit summaries
- Following Wikipedia guidelines`,
        type: LessonType.WIKIPEDIA_EXERCISE,
        order: 3,
        module: module1._id,
        course: courseId,
        duration: 30,
        isPublished: true,
        isFree: false,
        wikipediaExercise: {
          articleTitle: "User:Practice/Sandbox",
          initialContent: "Welcome to your practice sandbox!\n\nThis is where you can practice editing Wikipedia safely.",
          instructions: "Complete the editing tasks listed in the lesson content. Practice formatting, linking, and structuring content.",
          editingMode: 'sandbox',
          allowedActions: ['format', 'link', 'structure'],
          successCriteria: [
            {
              type: 'format',
              description: 'Use bold and italic formatting correctly',
              required: true
            },
            {
              type: 'structure',
              description: 'Create proper headings and sections',
              required: true
            },
            {
              type: 'links',
              description: 'Add at least one internal link',
              required: true
            }
          ]
        },
        assessmentCriteria: [
          {
            criterion: 'Correct markup usage',
            weight: 40,
            description: 'Proper use of wikitext formatting'
          },
          {
            criterion: 'Content structure',
            weight: 30,
            description: 'Well-organized headings and sections'
          },
          {
            criterion: 'Edit summaries',
            weight: 30,
            description: 'Clear, descriptive edit summaries'
          }
        ]
      }
    ];

    for (const lessonData of lessons1) {
      await Lesson.create(lessonData);
    }

    // Update course totals
    await Course.findByIdAndUpdate(courseId, {
      totalModules: 1,
      totalLessons: 3,
      duration: 65
    });

    logger.info('Created content for Wikipedia Editing Fundamentals course');

  } catch (error) {
    logger.error('Error creating course content:', error);
    throw error;
  }
}

// Function to run seeding independently
export async function runDatabaseSeed() {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wikiwalkthrough');
      logger.info('Connected to MongoDB for seeding');
    }

    await seedDatabase();
    logger.info('Database seeding completed successfully');

  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  runDatabaseSeed()
    .then(() => {
      logger.info('Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding process failed:', error);
      process.exit(1);
    });
}
