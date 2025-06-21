import { Request, Response } from 'express';
import assignmentService from '../services/assignmentService';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

// Submit assignment
export const submitAssignment = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { lessonId } = req.params;
  const submissionData = req.body;

  const assignment = await assignmentService.submitAssignment(
    req.user._id,
    lessonId,
    submissionData
  );

  res.status(201).json({
    success: true,
    message: 'Assignment submitted successfully',
    data: { assignment }
  });
});

// Get assignment submission
export const getAssignmentSubmission = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { lessonId } = req.params;

  const assignment = await assignmentService.getAssignmentSubmission(
    req.user._id,
    lessonId
  );

  res.status(200).json({
    success: true,
    data: { assignment }
  });
});

// Update assignment submission
export const updateAssignmentSubmission = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { assignmentId } = req.params;
  const updateData = req.body;

  const assignment = await assignmentService.updateAssignmentSubmission(
    req.user._id,
    assignmentId,
    updateData
  );

  res.status(200).json({
    success: true,
    message: 'Assignment updated successfully',
    data: { assignment }
  });
});

// Save assignment draft
export const saveDraft = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { lessonId } = req.params;
  const submissionData = req.body;

  const assignment = await assignmentService.saveDraft(
    req.user._id,
    lessonId,
    submissionData
  );

  res.status(200).json({
    success: true,
    message: 'Assignment draft saved successfully',
    data: { assignment }
  });
});

// Get assignments for grading (instructors only)
export const getAssignmentsForGrading = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Check if user is instructor
  if (!['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    throw new AppError('Access denied. Instructor privileges required.', 403);
  }

  const { courseId } = req.params;

  const assignments = await assignmentService.getAssignmentsForGrading(
    req.user._id,
    courseId
  );

  res.status(200).json({
    success: true,
    data: { assignments }
  });
});

// Grade assignment (instructors only)
export const gradeAssignment = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Check if user is instructor
  if (!['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    throw new AppError('Access denied. Instructor privileges required.', 403);
  }

  const { assignmentId } = req.params;
  const { grade, feedback } = req.body;

  if (grade === undefined || grade === null) {
    throw new AppError('Grade is required', 400);
  }

  if (grade < 0 || grade > 100) {
    throw new AppError('Grade must be between 0 and 100', 400);
  }

  const assignment = await assignmentService.gradeAssignment(
    req.user._id,
    assignmentId,
    grade,
    feedback
  );

  res.status(200).json({
    success: true,
    message: 'Assignment graded successfully',
    data: { assignment }
  });
});

// Get assignment statistics for course (instructors only)
export const getAssignmentStatistics = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Check if user is instructor
  if (!['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    throw new AppError('Access denied. Instructor privileges required.', 403);
  }

  const { courseId } = req.params;

  // This would be implemented in the service layer
  // For now, return a placeholder response
  res.status(200).json({
    success: true,
    data: {
      totalAssignments: 0,
      submittedAssignments: 0,
      gradedAssignments: 0,
      averageGrade: 0,
      pendingGrading: 0
    }
  });
});

// Delete assignment submission (students can delete drafts only)
export const deleteAssignmentSubmission = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { assignmentId } = req.params;

  // This would be implemented in the service layer
  // For now, return a placeholder response
  res.status(200).json({
    success: true,
    message: 'Assignment submission deleted successfully'
  });
});

export default {
  submitAssignment,
  getAssignmentSubmission,
  updateAssignmentSubmission,
  saveDraft,
  getAssignmentsForGrading,
  gradeAssignment,
  getAssignmentStatistics,
  deleteAssignmentSubmission
};
