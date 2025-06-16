import StudyGoal, { IStudyGoal, GoalUnit, GoalStatus } from '../models/StudyGoal';
import logger from '../utils/logger';

interface CreateGoalData {
  title: string;
  description?: string;
  target: number;
  unit: GoalUnit;
  deadline: string;
}

interface UpdateGoalData {
  title?: string;
  description?: string;
  target?: number;
  deadline?: string;
  status?: GoalStatus;
}

class StudyGoalService {
  // Get user's study goals
  async getUserGoals(userId: string): Promise<IStudyGoal[]> {
    try {
      const goals = await StudyGoal.find({ user: userId })
        .sort({ createdAt: -1 })
        .lean();

      return goals as IStudyGoal[];
    } catch (error) {
      logger.error('Failed to get user goals:', error);
      throw error;
    }
  }

  // Get goal by ID
  async getGoalById(goalId: string, userId: string): Promise<IStudyGoal | null> {
    try {
      const goal = await StudyGoal.findOne({ _id: goalId, user: userId }).lean();
      return goal as IStudyGoal | null;
    } catch (error) {
      logger.error('Failed to get goal by ID:', error);
      throw error;
    }
  }

  // Create new study goal
  async createGoal(userId: string, goalData: CreateGoalData): Promise<IStudyGoal> {
    try {
      const goal = new StudyGoal({
        user: userId,
        title: goalData.title,
        description: goalData.description,
        target: goalData.target,
        unit: goalData.unit,
        deadline: new Date(goalData.deadline),
        current: 0,
        status: GoalStatus.ACTIVE,
        isCompleted: false
      });

      await goal.save();
      logger.info(`Study goal created: ${goal.title} for user ${userId}`);
      return goal;
    } catch (error) {
      logger.error('Failed to create study goal:', error);
      throw error;
    }
  }

  // Update study goal
  async updateGoal(goalId: string, userId: string, updateData: UpdateGoalData): Promise<IStudyGoal | null> {
    try {
      const updateFields: any = {};
      
      if (updateData.title) updateFields.title = updateData.title;
      if (updateData.description !== undefined) updateFields.description = updateData.description;
      if (updateData.target) updateFields.target = updateData.target;
      if (updateData.deadline) updateFields.deadline = new Date(updateData.deadline);
      if (updateData.status) updateFields.status = updateData.status;

      const goal = await StudyGoal.findOneAndUpdate(
        { _id: goalId, user: userId },
        updateFields,
        { new: true, runValidators: true }
      );

      if (goal) {
        logger.info(`Study goal updated: ${goalId} for user ${userId}`);
      }

      return goal;
    } catch (error) {
      logger.error('Failed to update study goal:', error);
      throw error;
    }
  }

  // Delete study goal
  async deleteGoal(goalId: string, userId: string): Promise<boolean> {
    try {
      const result = await StudyGoal.deleteOne({ _id: goalId, user: userId });
      
      if (result.deletedCount > 0) {
        logger.info(`Study goal deleted: ${goalId} for user ${userId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to delete study goal:', error);
      throw error;
    }
  }

  // Update goal progress
  async updateGoalProgress(userId: string, unit: GoalUnit, increment: number = 1): Promise<void> {
    try {
      // Find active goals for this unit
      const activeGoals = await StudyGoal.find({
        user: userId,
        unit: unit,
        status: GoalStatus.ACTIVE,
        deadline: { $gte: new Date() }
      });

      // Update progress for each active goal
      for (const goal of activeGoals) {
        goal.current = Math.min(goal.current + increment, goal.target);
        await goal.save(); // This will trigger the pre-save middleware to check completion
      }

      logger.info(`Updated goal progress for user ${userId}: ${unit} +${increment}`);
    } catch (error) {
      logger.error('Failed to update goal progress:', error);
      throw error;
    }
  }

  // Get goal statistics
  async getGoalStats(userId: string): Promise<{
    total: number;
    active: number;
    completed: number;
    expired: number;
    completionRate: number;
  }> {
    try {
      const stats = await StudyGoal.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $eq: ['$status', GoalStatus.ACTIVE] }, 1, 0]
              }
            },
            completed: {
              $sum: {
                $cond: [{ $eq: ['$status', GoalStatus.COMPLETED] }, 1, 0]
              }
            },
            expired: {
              $sum: {
                $cond: [{ $eq: ['$status', GoalStatus.EXPIRED] }, 1, 0]
              }
            }
          }
        }
      ]);

      const result = stats[0] || { total: 0, active: 0, completed: 0, expired: 0 };
      result.completionRate = result.total > 0 ? (result.completed / result.total) * 100 : 0;

      return result;
    } catch (error) {
      logger.error('Failed to get goal stats:', error);
      throw error;
    }
  }

  // Check and update expired goals
  async updateExpiredGoals(): Promise<void> {
    try {
      const result = await StudyGoal.updateMany(
        {
          deadline: { $lt: new Date() },
          status: GoalStatus.ACTIVE
        },
        {
          $set: { status: GoalStatus.EXPIRED }
        }
      );

      if (result.modifiedCount > 0) {
        logger.info(`Updated ${result.modifiedCount} expired goals`);
      }
    } catch (error) {
      logger.error('Failed to update expired goals:', error);
      throw error;
    }
  }
}

export default new StudyGoalService();
