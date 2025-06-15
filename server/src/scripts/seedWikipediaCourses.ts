import mongoose from 'mongoose';
import Course, { CourseLevel, CourseStatus } from '../models/Course';
import Module from '../models/Module';
import Lesson, { LessonType } from '../models/Lesson';
import User, { UserRole } from '../models/User';
import Quiz, { QuestionType } from '../models/Quiz';
import logger from '../utils/logger';

// Sample Wikipedia-focused courses
const wikipediaCourses = [
  {
    title: 'Wikipedia Basics: Getting Started',
    description: 'Learn the fundamentals of Wikipedia editing, from creating an account to making your first edit. Perfect for complete beginners.',
    level: CourseLevel.BEGINNER,
    category: 'Wikipedia Basics',
    tags: ['beginner', 'editing', 'account', 'sandbox'],
    duration: 120, // 2 hours
    modules: [
      {
        title: 'Introduction to Wikipedia',
        description: 'Understanding what Wikipedia is and how it works',
        order: 1,
        lessons: [
          {
            title: 'What is Wikipedia?',
            description: 'Learn about Wikipedia\'s mission and principles',
            content: 'Wikipedia is a free, collaborative encyclopedia that anyone can edit...',
            type: LessonType.TEXT,
            order: 1,
            duration: 15
          },
          {
            title: 'The Five Pillars',
            description: 'Understanding Wikipedia\'s core principles',
            content: 'The Five Pillars are the fundamental principles that guide Wikipedia...',
            type: LessonType.VIDEO,
            order: 2,
            duration: 20,
            videoUrl: 'https://example.com/five-pillars-video'
          }
        ]
      },
      {
        title: 'Creating Your Account',
        description: 'Step-by-step guide to creating a Wikipedia account',
        order: 2,
        lessons: [
          {
            title: 'Why Create an Account?',
            description: 'Benefits of having a Wikipedia account',
            content: 'While you can edit Wikipedia without an account, creating one provides many benefits...',
            type: LessonType.TEXT,
            order: 1,
            duration: 10
          },
          {
            title: 'Account Creation Process',
            description: 'How to create your Wikipedia account',
            content: 'Follow these steps to create your Wikipedia account...',
            type: LessonType.TEXT,
            order: 2,
            duration: 15
          }
        ]
      }
    ]
  },
  {
    title: 'Content Creation Mastery',
    description: 'Master the art of creating high-quality Wikipedia articles from scratch. Learn about notability, structure, and best practices.',
    level: CourseLevel.INTERMEDIATE,
    category: 'Content Creation',
    tags: ['article creation', 'notability', 'structure', 'writing'],
    duration: 240, // 4 hours
    modules: [
      {
        title: 'Understanding Notability',
        description: 'Learn what makes a topic suitable for Wikipedia',
        order: 1,
        lessons: [
          {
            title: 'Notability Guidelines',
            description: 'Understanding Wikipedia\'s notability requirements',
            content: 'Notability is the test used by editors to decide whether a topic can have its own article...',
            type: LessonType.TEXT,
            order: 1,
            duration: 25
          },
          {
            title: 'Finding Reliable Sources',
            description: 'How to identify and use reliable sources',
            content: 'Reliable sources are crucial for establishing notability...',
            type: LessonType.TEXT,
            order: 2,
            duration: 30
          }
        ]
      }
    ]
  },
  {
    title: 'Citation and Sourcing Excellence',
    description: 'Become an expert in Wikipedia\'s citation system. Learn to find, evaluate, and properly cite reliable sources.',
    level: CourseLevel.INTERMEDIATE,
    category: 'Sourcing & Citations',
    tags: ['citations', 'sources', 'references', 'reliability'],
    duration: 180, // 3 hours
    modules: [
      {
        title: 'Understanding Reliable Sources',
        description: 'Learn to identify and evaluate source reliability',
        order: 1,
        lessons: [
          {
            title: 'What Makes a Source Reliable?',
            description: 'Criteria for evaluating source reliability',
            content: 'Reliable sources are credible published materials with a reliable publication process...',
            type: LessonType.TEXT,
            order: 1,
            duration: 20
          }
        ]
      }
    ]
  }
];

// Sample quiz questions for Wikipedia courses
const sampleQuizQuestions = [
  {
    id: 'q1',
    type: QuestionType.MULTIPLE_CHOICE,
    question: 'What are the Five Pillars of Wikipedia?',
    options: [
      'Core principles that guide Wikipedia',
      'Five types of articles on Wikipedia',
      'Five ways to edit Wikipedia',
      'Five administrators of Wikipedia'
    ],
    correctAnswer: 'Core principles that guide Wikipedia',
    explanation: 'The Five Pillars are Wikipedia\'s fundamental principles that guide all editing and content decisions.',
    points: 10,
    order: 1
  },
  {
    id: 'q2',
    type: QuestionType.TRUE_FALSE,
    question: 'You need to create an account to edit Wikipedia.',
    options: ['True', 'False'],
    correctAnswer: 'False',
    explanation: 'While creating an account has benefits, you can edit Wikipedia without one.',
    points: 5,
    order: 2
  }
];

async function seedWikipediaCourses() {
  try {
    logger.info('Starting Wikipedia courses seeding...');

    // Find or create an instructor user
    let instructor = await User.findOne({ role: UserRole.INSTRUCTOR });
    if (!instructor) {
      instructor = new User({
        email: 'instructor@wikiwalkthrough.org',
        username: 'wikiwalkthrough_instructor',
        firstName: 'Wikipedia',
        lastName: 'Instructor',
        password: 'TempPassword123!',
        role: UserRole.INSTRUCTOR,
        bio: 'Experienced Wikipedia editor and instructor',
        isEmailVerified: true
      });
      await instructor.save();
      logger.info('Created instructor user');
    }

    // Clear existing courses (optional - remove in production)
    // await Course.deleteMany({});
    // await Module.deleteMany({});
    // await Lesson.deleteMany({});
    // await Quiz.deleteMany({});

    for (const courseData of wikipediaCourses) {
      // Check if course already exists
      const existingCourse = await Course.findOne({ title: courseData.title });
      if (existingCourse) {
        logger.info(`Course "${courseData.title}" already exists, skipping...`);
        continue;
      }

      // Create course
      const course = new Course({
        title: courseData.title,
        description: courseData.description,
        level: courseData.level,
        category: courseData.category,
        tags: courseData.tags,
        duration: courseData.duration,
        instructor: instructor._id,
        status: CourseStatus.PUBLISHED,
        isPublished: true,
        totalModules: courseData.modules.length,
        totalLessons: courseData.modules.reduce((total, module) => total + module.lessons.length, 0)
      });

      await course.save();
      logger.info(`Created course: ${course.title}`);

      // Create modules and lessons
      for (const moduleData of courseData.modules) {
        const module = new Module({
          title: moduleData.title,
          description: moduleData.description,
          order: moduleData.order,
          course: course._id,
          isPublished: true,
          lessonCount: moduleData.lessons.length,
          duration: moduleData.lessons.reduce((total, lesson) => total + lesson.duration, 0)
        });

        await module.save();
        logger.info(`Created module: ${module.title}`);

        // Create lessons
        for (const lessonData of moduleData.lessons) {
          const lesson = new Lesson({
            title: lessonData.title,
            description: lessonData.description,
            content: lessonData.content,
            type: lessonData.type,
            order: lessonData.order,
            module: module._id,
            course: course._id,
            duration: lessonData.duration,
            videoUrl: lessonData.videoUrl,
            isPublished: true,
            isFree: true // All WikiWalkthrough content is free
          });

          await lesson.save();
          logger.info(`Created lesson: ${lesson.title}`);

          // Create a sample quiz for the first lesson of each module
          if (lessonData.order === 1) {
            const quiz = new Quiz({
              title: `${lessonData.title} - Knowledge Check`,
              description: `Test your understanding of ${lessonData.title}`,
              lesson: lesson._id,
              course: course._id,
              questions: sampleQuizQuestions,
              passingScore: 70,
              showCorrectAnswers: true,
              showScoreImmediately: true,
              isRequired: false,
              order: 1,
              isPublished: true
            });

            await quiz.save();
            logger.info(`Created quiz for lesson: ${lesson.title}`);
          }
        }
      }
    }

    logger.info('Wikipedia courses seeding completed successfully!');
  } catch (error) {
    logger.error('Error seeding Wikipedia courses:', error);
    throw error;
  }
}

export default seedWikipediaCourses;
