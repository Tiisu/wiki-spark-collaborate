import LearningPath, { ILearningPath, ILearningPathStep, DifficultyLevel, StepType, StepStatus } from '../models/LearningPath';
import logger from '../utils/logger';

interface CreateLearningPathData {
  title: string;
  description: string;
  category: string;
  estimatedHours: number;
  difficulty: DifficultyLevel;
  steps: Omit<ILearningPathStep, 'id' | 'status' | 'progress'>[];
  tags?: string[];
  prerequisites?: string[];
  learningObjectives?: string[];
  skillsAcquired?: string[];
  targetAudience?: string;
}

interface UpdateLearningPathData {
  title?: string;
  description?: string;
  category?: string;
  estimatedHours?: number;
  difficulty?: DifficultyLevel;
  steps?: Omit<ILearningPathStep, 'id' | 'status' | 'progress'>[];
  tags?: string[];
  prerequisites?: string[];
  learningObjectives?: string[];
  skillsAcquired?: string[];
  targetAudience?: string;
  isPublished?: boolean;
}

interface UserProgress {
  userId: string;
  pathId: string;
  completedSteps: string[];
  currentStep?: string;
  startedAt: Date;
  lastAccessedAt: Date;
}

class LearningPathService {
  // Get all published learning paths
  async getPublishedPaths(): Promise<ILearningPath[]> {
    try {
      const paths = await LearningPath.find({ isPublished: true })
        .populate('createdBy', 'username firstName lastName')
        .sort({ createdAt: -1 })
        .lean();

      return paths as ILearningPath[];
    } catch (error) {
      logger.error('Failed to get published learning paths:', error);
      throw error;
    }
  }

  // Get learning paths with user progress
  async getPathsWithProgress(userId: string): Promise<any[]> {
    try {
      const paths = await this.getPublishedPaths();
      
      // For now, return paths with mock progress data
      // In a real implementation, you'd fetch user progress from a UserProgress collection
      const pathsWithProgress = paths.map(path => {
        const stepsWithProgress = path.steps.map((step, index) => ({
          ...step,
          status: index === 0 ? StepStatus.CURRENT : 
                 index < 2 ? StepStatus.AVAILABLE : StepStatus.LOCKED,
          progress: index === 0 ? 25 : index < 2 ? 0 : 0
        }));

        return {
          ...path,
          steps: stepsWithProgress,
          completedSteps: 0 // This would be calculated from user progress
        };
      });

      return pathsWithProgress;
    } catch (error) {
      logger.error('Failed to get learning paths with progress:', error);
      throw error;
    }
  }

  // Get learning path by ID
  async getPathById(pathId: string): Promise<ILearningPath | null> {
    try {
      const path = await LearningPath.findById(pathId)
        .populate('createdBy', 'username firstName lastName')
        .lean();

      return path as ILearningPath | null;
    } catch (error) {
      logger.error('Failed to get learning path by ID:', error);
      throw error;
    }
  }

  // Create new learning path
  async createPath(userId: string, pathData: CreateLearningPathData): Promise<ILearningPath> {
    try {
      // Process steps to add IDs and default values
      const processedSteps = pathData.steps.map((step, index) => ({
        ...step,
        status: StepStatus.AVAILABLE,
        progress: 0,
        order: index + 1
      }));

      const path = new LearningPath({
        ...pathData,
        steps: processedSteps,
        createdBy: userId,
        totalSteps: processedSteps.length,
        completedSteps: 0
      });

      await path.save();
      logger.info(`Learning path created: ${path.title} by user ${userId}`);
      return path;
    } catch (error) {
      logger.error('Failed to create learning path:', error);
      throw error;
    }
  }

  // Update learning path
  async updatePath(pathId: string, userId: string, updateData: UpdateLearningPathData): Promise<ILearningPath | null> {
    try {
      const updateFields: any = { ...updateData };

      // Process steps if provided
      if (updateData.steps) {
        updateFields.steps = updateData.steps.map((step, index) => ({
          ...step,
          status: StepStatus.AVAILABLE,
          progress: 0,
          order: index + 1
        }));
        updateFields.totalSteps = updateFields.steps.length;
      }

      const path = await LearningPath.findOneAndUpdate(
        { _id: pathId, createdBy: userId },
        updateFields,
        { new: true, runValidators: true }
      );

      if (path) {
        logger.info(`Learning path updated: ${pathId} by user ${userId}`);
      }

      return path;
    } catch (error) {
      logger.error('Failed to update learning path:', error);
      throw error;
    }
  }

  // Delete learning path
  async deletePath(pathId: string, userId: string): Promise<boolean> {
    try {
      const result = await LearningPath.deleteOne({ _id: pathId, createdBy: userId });
      
      if (result.deletedCount > 0) {
        logger.info(`Learning path deleted: ${pathId} by user ${userId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to delete learning path:', error);
      throw error;
    }
  }

  // Start learning path (mock implementation)
  async startPath(userId: string, pathId: string): Promise<any> {
    try {
      // In a real implementation, this would create a UserProgress record
      logger.info(`User ${userId} started learning path ${pathId}`);
      
      return {
        userId,
        pathId,
        startedAt: new Date(),
        currentStep: null,
        completedSteps: []
      };
    } catch (error) {
      logger.error('Failed to start learning path:', error);
      throw error;
    }
  }

  // Complete step (mock implementation)
  async completeStep(userId: string, pathId: string, stepId: string): Promise<any> {
    try {
      // In a real implementation, this would update the UserProgress record
      logger.info(`User ${userId} completed step ${stepId} in path ${pathId}`);
      
      return {
        userId,
        pathId,
        stepId,
        completedAt: new Date()
      };
    } catch (error) {
      logger.error('Failed to complete step:', error);
      throw error;
    }
  }

  // Get user progress for a specific path (mock implementation)
  async getUserPathProgress(userId: string, pathId: string): Promise<any> {
    try {
      // In a real implementation, this would fetch from UserProgress collection
      return {
        userId,
        pathId,
        completedSteps: [],
        currentStep: null,
        progress: 0,
        startedAt: null,
        lastAccessedAt: new Date()
      };
    } catch (error) {
      logger.error('Failed to get user path progress:', error);
      throw error;
    }
  }

  // Get learning paths by category
  async getPathsByCategory(category: string): Promise<ILearningPath[]> {
    try {
      const paths = await LearningPath.find({ 
        category: new RegExp(category, 'i'), 
        isPublished: true 
      })
        .populate('createdBy', 'username firstName lastName')
        .sort({ createdAt: -1 })
        .lean();

      return paths as ILearningPath[];
    } catch (error) {
      logger.error('Failed to get learning paths by category:', error);
      throw error;
    }
  }

  // Search learning paths
  async searchPaths(query: string): Promise<ILearningPath[]> {
    try {
      const searchRegex = new RegExp(query, 'i');
      
      const paths = await LearningPath.find({
        isPublished: true,
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { tags: { $in: [searchRegex] } },
          { skillsAcquired: { $in: [searchRegex] } }
        ]
      })
        .populate('createdBy', 'username firstName lastName')
        .sort({ createdAt: -1 })
        .lean();

      return paths as ILearningPath[];
    } catch (error) {
      logger.error('Failed to search learning paths:', error);
      throw error;
    }
  }
}

export default new LearningPathService();
