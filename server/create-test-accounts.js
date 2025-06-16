const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const MONGODB_URI = 'mongodb+srv://tiisusharif:Z3kUUljfht7Oqf5B@cluster0.n5dee9v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// User schema (simplified)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  bio: String,
  isEmailVerified: { type: Boolean, default: true }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

async function createTestAccounts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin account
    const adminExists = await User.findOne({ email: 'admin@wikiwalkthrough.org' });
    if (!adminExists) {
      const admin = new User({
        email: 'admin@wikiwalkthrough.org',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        password: 'AdminPassword123!',
        role: 'super_admin',
        bio: 'Platform administrator with full system access.',
        isEmailVerified: true
      });
      await admin.save();
      console.log('✅ Admin account created');
      console.log('Email: admin@wikiwalkthrough.org');
      console.log('Password: AdminPassword123!');
    } else {
      console.log('ℹ️  Admin account already exists');
    }

    // Create instructor account
    const instructorExists = await User.findOne({ email: 'instructor@wikiwalkthrough.org' });
    if (!instructorExists) {
      const instructor = new User({
        email: 'instructor@wikiwalkthrough.org',
        username: 'wikiwalkthrough_instructor',
        firstName: 'WikiWalkthrough',
        lastName: 'Instructor',
        password: 'TempPassword123!',
        role: 'instructor',
        bio: 'Official WikiWalkthrough course instructor and content creator.',
        isEmailVerified: true
      });
      await instructor.save();
      console.log('✅ Instructor account created');
      console.log('Email: instructor@wikiwalkthrough.org');
      console.log('Password: TempPassword123!');
    } else {
      console.log('ℹ️  Instructor account already exists');
    }

    // Create a test learner account
    const learnerExists = await User.findOne({ email: 'learner@wikiwalkthrough.org' });
    if (!learnerExists) {
      const learner = new User({
        email: 'learner@wikiwalkthrough.org',
        username: 'test_learner',
        firstName: 'Test',
        lastName: 'Learner',
        password: 'LearnerPassword123!',
        role: 'learner',
        bio: 'Test learner account for testing the platform.',
        isEmailVerified: true
      });
      await learner.save();
      console.log('✅ Learner account created');
      console.log('Email: learner@wikiwalkthrough.org');
      console.log('Password: LearnerPassword123!');
    } else {
      console.log('ℹ️  Learner account already exists');
    }

    console.log('\n🎉 Test accounts setup complete!');
    console.log('\n📋 Login Credentials:');
    console.log('👨‍💼 Admin: admin@wikiwalkthrough.org / AdminPassword123!');
    console.log('👨‍🏫 Instructor: instructor@wikiwalkthrough.org / TempPassword123!');
    console.log('👨‍🎓 Learner: learner@wikiwalkthrough.org / LearnerPassword123!');

  } catch (error) {
    console.error('❌ Error creating test accounts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
}

createTestAccounts();
