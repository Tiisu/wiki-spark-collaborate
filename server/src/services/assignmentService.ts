import Assignment, { IAssignment } from '../models/Assignment';
import Lesson from '../models/Lesson';
import Course from '../models/Course';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

interface CreateAssignmentSubmissionData {
  text: string;
  files?: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
  }>;
}

interface UpdateAssignmentSubmissionData {
  text?: string;
  status?: 'draft' | 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
}

class AssignmentService {
  // Submit assignment
  async submitAssignment(
    userId: string,
    lessonId: string,
    submissionData: CreateAssignmentSubmissionData
  ): Promise<IAssignment> {
    try {
      // Verify lesson exists and is an assignment type
      const lesson = await Lesson.findById(lessonId).populate('course');
      if (!lesson) {
        throw new AppError('Lesson not found', 404);
      }

      if (lesson.type !== 'ASSIGNMENT') {
        throw new AppError('This lesson is not an assignment', 400);
      }

      // Check if user already has a submission for this assignment
      let assignment = await Assignment.findOne({
        user: userId,
        lesson: lessonId
      });

      if (assignment) {
        // Update existing submission
        assignment.text = submissionData.text;
        assignment.files = submissionData.files || [];
        assignment.status = 'submitted';
        assignment.submittedAt = new Date();
      } else {
        // Create new submission
        assignment = new Assignment({
          user: userId,
          lesson: lessonId,
          course: lesson.course,
          text: submissionData.text,
          files: submissionData.files || [],
          status: 'submitted',
          submittedAt: new Date()
        });
      }

      await assignment.save();

      logger.info(`Assignment submitted: User ${userId}, Lesson ${lessonId}`);
      return assignment;
    } catch (error) {
      logger.error('Failed to submit assignment:', error);
      throw error;
    }
  }

  // Get assignment submission
  async getAssignmentSubmission(userId: string, lessonId: string): Promise<IAssignment | null> {
    try {
      const assignment = await Assignment.findOne({
        user: userId,
        lesson: lessonId
      }).populate('lesson', 'title type');

      return assignment;
    } catch (error) {
      logger.error('Failed to get assignment submission:', error);
      throw error;
    }
  }

  // Update assignment submission (for drafts)
  async updateAssignmentSubmission(
    userId: string,
    assignmentId: string,
    updateData: UpdateAssignmentSubmissionData
  ): Promise<IAssignment> {
    try {
      const assignment = await Assignment.findOne({
        _id: assignmentId,
        user: userId
      });

      if (!assignment) {
        throw new AppError('Assignment submission not found', 404);
      }

      // Only allow updates if assignment is in draft status or being graded by instructor
      if (assignment.status === 'submitted' && updateData.status !== 'graded') {
        throw new AppError('Cannot modify submitted assignment', 400);
      }

      // Update fields
      if (updateData.text !== undefined) assignment.text = updateData.text;
      if (updateData.status !== undefined) assignment.status = updateData.status;
      if (updateData.grade !== undefined) assignment.grade = updateData.grade;
      if (updateData.feedback !== undefined) assignment.feedback = updateData.feedback;

      if (updateData.status === 'submitted') {
        assignment.submittedAt = new Date();
      }

      await assignment.save();

      logger.info(`Assignment updated: ${assignmentId}`);
      return assignment;
    } catch (error) {
      logger.error('Failed to update assignment:', error);
      throw error;
    }
  }

  // Get assignments for grading (instructors only)
  async getAssignmentsForGrading(instructorId: string, courseId: string): Promise<IAssignment[]> {
    try {
      // Verify instructor owns the course
      const course = await Course.findOne({ _id: courseId, instructor: instructorId });
      if (!course) {
        throw new AppError('Course not found or access denied', 404);
      }

      const assignments = await Assignment.find({
        course: courseId,
        status: { $in: ['submitted', 'graded'] }
      })
        .populate('user', 'firstName lastName email')
        .populate('lesson', 'title type order')
        .sort({ submittedAt: -1 });

      return assignments;
    } catch (error) {
      logger.error('Failed to get assignments for grading:', error);
      throw error;
    }
  }

  // Grade assignment (instructors only)
  async gradeAssignment(
    instructorId: string,
    assignmentId: string,
    grade: number,
    feedback?: string
  ): Promise<IAssignment> {
    try {
      const assignment = await Assignment.findById(assignmentId).populate({
        path: 'lesson',
        populate: {
          path: 'course',
          select: 'instructor'
        }
      });

      if (!assignment) {
        throw new AppError('Assignment not found', 404);
      }

      // Verify instructor owns the course
      const course = assignment.lesson.course as any;
      if (course.instructor.toString() !== instructorId) {
        throw new AppError('Access denied', 403);
      }

      assignment.grade = grade;
      assignment.feedback = feedback;
      assignment.status = 'graded';
      assignment.gradedAt = new Date();

      await assignment.save();

      logger.info(`Assignment graded: ${assignmentId}, Grade: ${grade}`);
      return assignment;
    } catch (error) {
      logger.error('Failed to grade assignment:', error);
      throw error;
    }
  }

  // Save draft assignment
  async saveDraft(
    userId: string,
    lessonId: string,
    submissionData: CreateAssignmentSubmissionData
  ): Promise<IAssignment> {
    try {
      // Verify lesson exists and is an assignment type
      const lesson = await Lesson.findById(lessonId).populate('course');
      if (!lesson) {
        throw new AppError('Lesson not found', 404);
      }

      if (lesson.type !== 'ASSIGNMENT') {
        throw new AppError('This lesson is not an assignment', 400);
      }

      // Check if user already has a submission for this assignment
      let assignment = await Assignment.findOne({
        user: userId,
        lesson: lessonId
      });

      if (assignment) {
        // Update existing draft
        assignment.text = submissionData.text;
        assignment.files = submissionData.files || [];
        assignment.status = 'draft';
      } else {
        // Create new draft
        assignment = new Assignment({
          user: userId,
          lesson: lessonId,
          course: lesson.course,
          text: submissionData.text,
          files: submissionData.files || [],
          status: 'draft'
        });
      }

      await assignment.save();

      logger.info(`Assignment draft saved: User ${userId}, Lesson ${lessonId}`);
      return assignment;
    } catch (error) {
      logger.error('Failed to save assignment draft:', error);
      throw error;
    }
  }
}

export default new AssignmentService();
