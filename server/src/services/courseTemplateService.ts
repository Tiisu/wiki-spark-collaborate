import CourseTemplate, { ICourseTemplate, ITemplateModule } from '../models/CourseTemplate';
import Course, { ICourse, CourseStatus } from '../models/Course';
import Module from '../models/Module';
import Lesson from '../models/Lesson';
import logger from '../utils/logger';
import { CourseLevel } from '../models/Course';

interface CreateTemplateData {
  name: string;
  description: string;
  category: string;
  level: CourseLevel;
  tags?: string[];
  thumbnail?: string;
  isPublic?: boolean;
  modules: ITemplateModule[];
}

interface CreateCourseFromTemplateData {
  title: string;
  description?: string;
  templateId: string;
}

class CourseTemplateService {
  // Get all public templates and user's private templates
  async getTemplates(userId: string, options: {
    page?: number;
    limit?: number;
    category?: string;
    level?: CourseLevel;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{ templates: ICourseTemplate[]; total: number; page: number; totalPages: number }> {
    try {
      const {
        page = 1,
        limit = 12,
        category,
        level,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;
      const query: any = {
        $or: [
          { isPublic: true },
          { createdBy: userId }
        ]
      };

      // Add filters
      if (category) {
        query.category = category;
      }
      if (level) {
        query.level = level;
      }
      if (search) {
        query.$text = { $search: search };
      }

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [templates, total] = await Promise.all([
        CourseTemplate.find(query)
          .populate('createdBy', 'firstName lastName username')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        CourseTemplate.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      return { templates: templates as ICourseTemplate[], total, page, totalPages };
    } catch (error) {
      logger.error('Failed to get templates:', error);
      throw error;
    }
  }

  // Get template by ID
  async getTemplateById(templateId: string, userId?: string): Promise<ICourseTemplate | null> {
    try {
      const query: any = { _id: templateId };
      
      // If userId is provided, ensure user can access this template
      if (userId) {
        query.$or = [
          { isPublic: true },
          { createdBy: userId }
        ];
      } else {
        query.isPublic = true;
      }

      const template = await CourseTemplate.findOne(query)
        .populate('createdBy', 'firstName lastName username')
        .lean();

      return template as ICourseTemplate;
    } catch (error) {
      logger.error('Failed to get template by ID:', error);
      throw error;
    }
  }

  // Create new template
  async createTemplate(userId: string, templateData: CreateTemplateData): Promise<ICourseTemplate> {
    try {
      // Calculate estimated duration from modules
      const estimatedDuration = templateData.modules.reduce((total, module) => {
        const moduleDuration = module.lessons.reduce((moduleTotal, lesson) => {
          return moduleTotal + (lesson.duration || 0);
        }, 0);
        return total + moduleDuration;
      }, 0);

      const template = new CourseTemplate({
        ...templateData,
        createdBy: userId,
        estimatedDuration
      });

      await template.save();
      logger.info(`Course template created: ${template.name} by user ${userId}`);
      return template;
    } catch (error) {
      logger.error('Failed to create template:', error);
      throw error;
    }
  }

  // Create course from template
  async createCourseFromTemplate(
    userId: string, 
    data: CreateCourseFromTemplateData
  ): Promise<ICourse> {
    try {
      // Get template
      const template = await this.getTemplateById(data.templateId, userId);
      if (!template) {
        throw new Error('Template not found or access denied');
      }

      // Create course
      const course = new Course({
        title: data.title,
        description: data.description || template.description,
        level: template.level,
        category: template.category,
        tags: template.tags,
        instructor: userId,
        status: CourseStatus.DRAFT,
        isPublished: false,
        duration: template.estimatedDuration,
        totalModules: template.modules.length,
        totalLessons: template.modules.reduce((total, module) => total + module.lessons.length, 0)
      });

      await course.save();

      // Create modules and lessons from template
      for (const templateModule of template.modules) {
        const module = new Module({
          title: templateModule.title,
          description: templateModule.description,
          order: templateModule.order,
          course: course._id,
          isPublished: false,
          lessonCount: templateModule.lessons.length,
          duration: templateModule.lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0)
        });

        await module.save();

        // Create lessons
        for (const templateLesson of templateModule.lessons) {
          const lesson = new Lesson({
            title: templateLesson.title,
            description: templateLesson.description,
            content: templateLesson.content || `# ${templateLesson.title}\n\nAdd your lesson content here.`,
            type: templateLesson.type,
            order: templateLesson.order,
            module: module._id,
            course: course._id,
            duration: templateLesson.duration || 0,
            isPublished: false,
            isFree: false
          });

          await lesson.save();
        }
      }

      // Increment template usage count
      await CourseTemplate.findByIdAndUpdate(
        data.templateId,
        { $inc: { usageCount: 1 } }
      );

      logger.info(`Course created from template: ${course.title} from template ${template.name}`);
      return course;
    } catch (error) {
      logger.error('Failed to create course from template:', error);
      throw error;
    }
  }

  // Save existing course as template
  async saveAsTemplate(
    userId: string,
    courseId: string,
    templateData: {
      name: string;
      description: string;
      isPublic?: boolean;
    }
  ): Promise<ICourseTemplate> {
    try {
      // Get course with modules and lessons
      const course = await Course.findOne({ _id: courseId, instructor: userId });
      if (!course) {
        throw new Error('Course not found or access denied');
      }

      // Get modules with lessons
      const modules = await Module.find({ course: courseId }).sort({ order: 1 });
      const templateModules: ITemplateModule[] = [];

      for (const module of modules) {
        const lessons = await Lesson.find({ module: module._id }).sort({ order: 1 });
        
        const templateLessons = lessons.map(lesson => ({
          title: lesson.title,
          description: lesson.description,
          type: lesson.type,
          order: lesson.order,
          content: lesson.content,
          duration: lesson.duration
        }));

        templateModules.push({
          title: module.title,
          description: module.description,
          order: module.order,
          lessons: templateLessons
        });
      }

      // Create template
      const template = await this.createTemplate(userId, {
        name: templateData.name,
        description: templateData.description,
        category: course.category,
        level: course.level,
        tags: course.tags,
        thumbnail: course.thumbnail,
        isPublic: templateData.isPublic || false,
        modules: templateModules
      });

      return template;
    } catch (error) {
      logger.error('Failed to save course as template:', error);
      throw error;
    }
  }

  // Delete template
  async deleteTemplate(templateId: string, userId: string): Promise<boolean> {
    try {
      const template = await CourseTemplate.findOneAndDelete({
        _id: templateId,
        createdBy: userId
      });

      if (template) {
        logger.info(`Template deleted: ${template.name}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to delete template:', error);
      throw error;
    }
  }

  // Get user's templates
  async getUserTemplates(userId: string): Promise<ICourseTemplate[]> {
    try {
      const templates = await CourseTemplate.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .lean();

      return templates as ICourseTemplate[];
    } catch (error) {
      logger.error('Failed to get user templates:', error);
      throw error;
    }
  }
}

export default new CourseTemplateService();
