import { hashPassword } from '../utils/auth.js';
import { logger } from '../utils/logger.js';
import { connectDB } from '../models/index.js';
import {
  User,
  Course,
  Module,
  Lesson,
  ForumCategory,
  ForumPost,
  Achievement,
  UserRole,
  CourseLevel,
  LessonType
} from '../models/index.js';

async function main() {
  logger.info('🌱 Starting database seeding...');

  try {
    // Connect to database
    await connectDB();

    // Create admin user
    const adminPassword = await hashPassword(process.env.ADMIN_PASSWORD || 'WikiSpark2025!');

    let admin = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@wikisparkcollab.org' });
    if (!admin) {
      admin = await User.create({
        email: process.env.ADMIN_EMAIL || 'admin@wikisparkcollab.org',
        username: 'admin',
        firstName: 'Wiki',
        lastName: 'Admin',
        password: adminPassword,
        role: UserRole.SUPER_ADMIN,
        isEmailVerified: true,
        bio: 'Platform administrator for Wiki Spark Collaborate',
        country: 'Global',
        preferredLanguage: 'en',
      });
    }

    logger.info(`✅ Admin user created: ${admin.email}`);

    // Create sample instructor
    const instructorPassword = await hashPassword('Instructor123!');

    let instructor = await User.findOne({ email: 'instructor@wikisparkcollab.org' });
    if (!instructor) {
      instructor = await User.create({
        email: 'instructor@wikisparkcollab.org',
        username: 'instructor_demo',
        firstName: 'Jane',
        lastName: 'Instructor',
        password: instructorPassword,
        role: UserRole.INSTRUCTOR,
        isEmailVerified: true,
        bio: 'Experienced Wikipedia editor and trainer with 5+ years of experience',
        country: 'Kenya',
        preferredLanguage: 'en',
      });
    }

    logger.info(`✅ Instructor user created: ${instructor.email}`);

    // Create sample learner
    const learnerPassword = await hashPassword('Learner123!');

    let learner = await User.findOne({ email: 'learner@wikisparkcollab.org' });
    if (!learner) {
      learner = await User.create({
        email: 'learner@wikisparkcollab.org',
        username: 'learner_demo',
        firstName: 'John',
        lastName: 'Learner',
        password: learnerPassword,
        role: UserRole.LEARNER,
        isEmailVerified: true,
        bio: 'Enthusiastic about contributing to Wikipedia and learning about open knowledge',
        country: 'Nigeria',
        preferredLanguage: 'en',
      });
    }

    logger.info(`✅ Learner user created: ${learner.email}`);

    // Create sample course
    let course = await Course.findOne({ slug: 'wikipedia-fundamentals' });
    if (!course) {
      course = await Course.create({
        title: 'Wikipedia Fundamentals',
        slug: 'wikipedia-fundamentals',
        description: 'Master the basics of editing, sourcing, and following Wikipedia policies. This comprehensive course will take you from complete beginner to confident Wikipedia contributor.',
        level: CourseLevel.BEGINNER,
        category: 'Wikipedia Editing',
        tags: ['wikipedia', 'editing', 'basics', 'policies', 'citations'],
        isPublished: true,
        price: 0,
        duration: 1200, // 20 hours in minutes
        instructorId: instructor._id,
      });
    }

    logger.info(`✅ Sample course created: ${course.title}`);

    // Create sample modules for the course
    let module1 = await Module.findOne({ courseId: course._id, order: 1 });
    if (!module1) {
      module1 = await Module.create({
        title: 'Introduction to Wikipedia',
        description: 'Learn about Wikipedia\'s mission, principles, and community',
        order: 1,
        isPublished: true,
        courseId: course._id,
      });
    }

    let module2 = await Module.findOne({ courseId: course._id, order: 2 });
    if (!module2) {
      module2 = await Module.create({
        title: 'Basic Editing Skills',
        description: 'Learn how to edit Wikipedia articles using the visual editor',
        order: 2,
        isPublished: true,
        courseId: course._id,
      });
    }

    let module3 = await Module.findOne({ courseId: course._id, order: 3 });
    if (!module3) {
      module3 = await Module.create({
        title: 'Citations and References',
        description: 'Master the art of adding reliable sources to Wikipedia articles',
        order: 3,
        isPublished: true,
        courseId: course._id,
      });
    }

    logger.info(`✅ Sample modules created for course: ${course.title}`);

    // Create sample lessons
    const lesson1 = await Lesson.findOne({ moduleId: module1._id, order: 1 });
    if (!lesson1) {
      await Lesson.create({
        title: 'What is Wikipedia?',
        content: `
          <h2>Welcome to Wikipedia!</h2>
          <p>Wikipedia is a free, open-content encyclopedia that anyone can edit. It's one of the most visited websites in the world and serves as a primary source of information for millions of people daily.</p>

          <h3>Key Principles</h3>
          <ul>
            <li><strong>Neutral Point of View (NPOV):</strong> Articles should be written from a neutral perspective</li>
            <li><strong>Verifiability:</strong> All information should be backed by reliable sources</li>
            <li><strong>No Original Research:</strong> Wikipedia is not a place for original research or personal opinions</li>
          </ul>

          <h3>Why Contribute?</h3>
          <p>By contributing to Wikipedia, you're helping to democratize access to knowledge and ensuring that information about your community, culture, and interests is accurately represented.</p>
        `,
        type: LessonType.TEXT,
        duration: 15,
        order: 1,
        moduleId: module1._id,
        creatorId: instructor._id,
        isPublished: true,
      });
    }

    const lesson2 = await Lesson.findOne({ moduleId: module2._id, order: 1 });
    if (!lesson2) {
      await Lesson.create({
        title: 'Your First Edit',
        content: `
          <h2>Making Your First Edit</h2>
          <p>Let's walk through the process of making your first Wikipedia edit using the Visual Editor.</p>

          <h3>Step-by-Step Guide</h3>
          <ol>
            <li>Find an article you'd like to improve</li>
            <li>Click the "Edit" button at the top of the page</li>
            <li>Make your changes using the visual editor</li>
            <li>Add an edit summary explaining your changes</li>
            <li>Preview your changes</li>
            <li>Publish your edit</li>
          </ol>

          <h3>Best Practices</h3>
          <ul>
            <li>Start with small, simple edits</li>
            <li>Always explain your changes in the edit summary</li>
            <li>Be bold but not reckless</li>
            <li>When in doubt, discuss on the talk page</li>
          </ul>
        `,
        type: LessonType.TEXT,
        duration: 25,
        order: 1,
        moduleId: module2._id,
        creatorId: instructor._id,
        isPublished: true,
      });
    }

    logger.info(`✅ Sample lessons created`);

    // Create forum categories
    let generalCategory = await ForumCategory.findOne({ name: 'General Discussion' });
    if (!generalCategory) {
      generalCategory = await ForumCategory.create({
        name: 'General Discussion',
        description: 'General discussions about Wikipedia editing and the platform',
        color: '#3B82F6',
        order: 1,
      });
    }

    let helpCategory = await ForumCategory.findOne({ name: 'Help & Support' });
    if (!helpCategory) {
      helpCategory = await ForumCategory.create({
        name: 'Help & Support',
        description: 'Get help with Wikipedia editing or platform issues',
        color: '#10B981',
        order: 2,
      });
    }

    logger.info(`✅ Forum categories created`);

    // Create sample forum post
    const existingPost = await ForumPost.findOne({ title: 'Welcome to Wiki Spark Collaborate!' });
    if (!existingPost) {
      await ForumPost.create({
        title: 'Welcome to Wiki Spark Collaborate!',
        content: `
          Welcome to our community platform for Wikipedia education!

          This is a place where learners, instructors, and mentors can come together to share knowledge, ask questions, and collaborate on improving Wikipedia.

          Feel free to introduce yourself and let us know what brings you to Wikipedia editing!
        `,
        authorId: admin._id,
        categoryId: generalCategory._id,
        isPinned: true,
      });
    }

    logger.info(`✅ Sample forum post created`);

    // Create sample achievements
    const achievements = [
      {
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        category: 'Learning',
        points: 10,
        criteria: { type: 'lesson_completed', count: 1 },
      },
      {
        name: 'Course Starter',
        description: 'Enroll in your first course',
        icon: '📚',
        category: 'Learning',
        points: 5,
        criteria: { type: 'course_enrolled', count: 1 },
      },
      {
        name: 'Community Member',
        description: 'Make your first forum post',
        icon: '💬',
        category: 'Community',
        points: 15,
        criteria: { type: 'forum_post_created', count: 1 },
      },
      {
        name: 'Wikipedia Editor',
        description: 'Complete the Wikipedia Fundamentals course',
        icon: '✏️',
        category: 'Wikipedia',
        points: 100,
        criteria: { type: 'course_completed', courseId: course._id },
      },
    ];

    for (const achievement of achievements) {
      const existing = await Achievement.findOne({ name: achievement.name });
      if (!existing) {
        await Achievement.create(achievement);
      }
    }

    logger.info(`✅ Sample achievements created`);

    logger.info('🎉 Database seeding completed successfully!');
    logger.info('\n📋 Sample Users Created:');
    logger.info(`   Admin: ${admin.email} / ${process.env.ADMIN_PASSWORD || 'WikiSpark2025!'}`);
    logger.info(`   Instructor: ${instructor.email} / Instructor123!`);
    logger.info(`   Learner: ${learner.email} / Learner123!`);

  } catch (error) {
    logger.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
