import express from 'express';
import {
  submitAssignment,
  getAssignmentSubmission,
  updateAssignmentSubmission,
  saveDraft,
  getAssignmentsForGrading,
  gradeAssignment,
  getAssignmentStatistics,
  deleteAssignmentSubmission
} from '../controllers/assignmentController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All assignment routes require authentication
router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     Assignment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         user:
 *           type: string
 *         lesson:
 *           type: string
 *         course:
 *           type: string
 *         text:
 *           type: string
 *         files:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *               originalName:
 *                 type: string
 *               mimetype:
 *                 type: string
 *               size:
 *                 type: number
 *               path:
 *                 type: string
 *         status:
 *           type: string
 *           enum: [draft, submitted, graded]
 *         grade:
 *           type: number
 *         feedback:
 *           type: string
 *         submittedAt:
 *           type: string
 *           format: date-time
 *         gradedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/assignments/lesson/{lessonId}/submit:
 *   post:
 *     summary: Submit assignment for a lesson
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Assignment submitted successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Lesson not found
 */
router.post('/lesson/:lessonId/submit', submitAssignment);

/**
 * @swagger
 * /api/assignments/lesson/{lessonId}/draft:
 *   post:
 *     summary: Save assignment draft for a lesson
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Assignment draft saved successfully
 */
router.post('/lesson/:lessonId/draft', saveDraft);

/**
 * @swagger
 * /api/assignments/lesson/{lessonId}:
 *   get:
 *     summary: Get assignment submission for a lesson
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment submission retrieved successfully
 *       404:
 *         description: Assignment not found
 */
router.get('/lesson/:lessonId', getAssignmentSubmission);

/**
 * @swagger
 * /api/assignments/{assignmentId}:
 *   put:
 *     summary: Update assignment submission
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, submitted]
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 */
router.put('/:assignmentId', updateAssignmentSubmission);

/**
 * @swagger
 * /api/assignments/course/{courseId}/grading:
 *   get:
 *     summary: Get assignments for grading (instructors only)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignments retrieved successfully
 *       403:
 *         description: Access denied
 */
router.get('/course/:courseId/grading', getAssignmentsForGrading);

/**
 * @swagger
 * /api/assignments/{assignmentId}/grade:
 *   post:
 *     summary: Grade assignment (instructors only)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - grade
 *             properties:
 *               grade:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Assignment graded successfully
 *       403:
 *         description: Access denied
 */
router.post('/:assignmentId/grade', gradeAssignment);

/**
 * @swagger
 * /api/assignments/course/{courseId}/statistics:
 *   get:
 *     summary: Get assignment statistics for course (instructors only)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment statistics retrieved successfully
 */
router.get('/course/:courseId/statistics', getAssignmentStatistics);

/**
 * @swagger
 * /api/assignments/{assignmentId}:
 *   delete:
 *     summary: Delete assignment submission (drafts only)
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment deleted successfully
 */
router.delete('/:assignmentId', deleteAssignmentSubmission);

export default router;
