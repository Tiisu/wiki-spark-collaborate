const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface RegisterData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  country?: string;
  timezone?: string;
  preferredLanguage?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
  country?: string;
  timezone?: string;
  preferredLanguage: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle 401 Unauthorized - token might be expired or invalid
      if (response.status === 401 && token) {
        console.warn('Authentication failed, clearing token');
        localStorage.removeItem('auth_token');
      }

      throw new ApiError(
        data.message || 'An error occurred',
        response.status,
        data.errors
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError('Network error occurred', 0);
  }
}

export const authApi = {
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data!;
  },

  login: async (credentials: LoginData): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data!;
  },

  logout: async (): Promise<void> => {
    await apiRequest('/api/auth/logout', {
      method: 'POST',
    });
    
    localStorage.removeItem('auth_token');
  },



  forgotPassword: async (email: string): Promise<void> => {
    await apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await apiRequest<{ user: User }>('/api/auth/me', {
      method: 'GET',
    });

    return response.data!;
  },
};

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string | {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  thumbnail?: string;
  totalLessons: number;
  completedLessons: number;
  estimatedHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  rating: number;
  progress: number;
  level?: string;
  tags?: string[];
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
  modules?: Module[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  type: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  isCompleted: boolean;
  progress: number;
  moduleId: string;
  quiz?: any;
  quizAttempt?: any;
  resources?: any[];
}

export interface CreateCourseData {
  title: string;
  description: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: 'EDITING_BASICS' | 'WIKITEXT_MARKUP' | 'ARTICLE_CREATION' | 'CITATION_SOURCING' | 'RELIABLE_SOURCES' | 'FACT_CHECKING' | 'CONTENT_POLICIES' | 'BEHAVIORAL_GUIDELINES' | 'COPYRIGHT_LICENSING' | 'CONFLICT_RESOLUTION' | 'COMMUNITY_ENGAGEMENT' | 'PEER_REVIEW' | 'ADVANCED_EDITING' | 'TEMPLATE_CREATION' | 'BOT_AUTOMATION' | 'COMMONS_MEDIA' | 'WIKTIONARY_EDITING' | 'WIKIBOOKS_AUTHORING' | 'WIKIDATA_EDITING' | 'ACADEMIC_WRITING' | 'TRANSLATION' | 'ACCESSIBILITY';
  tags: string[];
  duration?: number;
}

// Course API functions
export const courseApi = {
  // Get all courses (public)
  getCourses: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    level?: string;
    search?: string;
  }): Promise<{ courses: Course[]; pagination: any }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.level) queryParams.append('level', params.level);
    if (params?.search) queryParams.append('search', params.search);

    const response = await apiRequest<{ courses: Course[]; pagination: any }>(
      `/api/courses?${queryParams.toString()}`
    );
    return response.data!;
  },

  // Get single course by ID
  getCourse: async (id: string): Promise<Course> => {
    const response = await apiRequest<Course>(`/api/courses/${id}`);
    return response.data!;
  },

  // Create new course (admin/instructor)
  createCourse: async (courseData: CreateCourseData): Promise<Course> => {
    const response = await apiRequest<Course>('/api/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
    return response.data!;
  },

  // Update course (admin/instructor)
  updateCourse: async (id: string, courseData: Partial<CreateCourseData>): Promise<Course> => {
    const response = await apiRequest<Course>(`/api/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
    return response.data!;
  },

  // Delete course (admin/instructor)
  deleteCourse: async (id: string): Promise<void> => {
    await apiRequest(`/api/courses/${id}`, {
      method: 'DELETE',
    });
  },

  // Toggle course publish status
  togglePublish: async (id: string): Promise<Course> => {
    const response = await apiRequest<Course>(`/api/courses/${id}/publish`, {
      method: 'PATCH',
    });
    return response.data!;
  },

  // Enroll in course
  enrollInCourse: async (courseId: string): Promise<any> => {
    const response = await apiRequest(`/api/courses/${courseId}/enroll`, {
      method: 'POST',
    });
    return response.data!;
  },

  // Get user's enrolled courses
  getEnrolledCourses: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ courses: Course[]; pagination: any }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const response = await apiRequest<{ courses: Course[]; pagination: any }>(
      `/api/courses/enrolled?${queryParams.toString()}`
    );
    return response.data!;
  },

  // Get instructor's courses
  getInstructorCourses: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ courses: Course[]; pagination: any }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const response = await apiRequest<{ courses: Course[]; pagination: any }>(
      `/api/courses/my-courses?${queryParams.toString()}`
    );
    return response.data!;
  },

  // Get instructor analytics
  getInstructorAnalytics: async (): Promise<{
    totalCourses: number;
    publishedCourses: number;
    totalStudents: number;
    averageCompletionRate: number;
    totalEnrollments: number;
    recentEnrollments: number;
  }> => {
    const response = await apiRequest<{
      analytics: {
        totalCourses: number;
        publishedCourses: number;
        totalStudents: number;
        averageCompletionRate: number;
        totalEnrollments: number;
        recentEnrollments: number;
      };
    }>('/api/courses/instructor/analytics');
    return response.data!.analytics;
  },
};

// Course Template types
export interface CourseTemplate {
  _id: string;
  name: string;
  description: string;
  category: string;
  level: string;
  tags: string[];
  thumbnail?: string;
  isPublic: boolean;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  modules: TemplateModule[];
  estimatedDuration: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateModule {
  title: string;
  description?: string;
  order: number;
  lessons: TemplateLesson[];
}

export interface TemplateLesson {
  title: string;
  description?: string;
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' | 'RESOURCE';
  order: number;
  content?: string;
  duration?: number;
}

export interface CreateTemplateData {
  name: string;
  description: string;
  category: string;
  level: string;
  tags?: string[];
  thumbnail?: string;
  isPublic?: boolean;
  modules: TemplateModule[];
}

// Course Template API functions
export const courseTemplateApi = {
  // Get all templates
  getTemplates: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    level?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ templates: CourseTemplate[]; pagination: any }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.level) queryParams.append('level', params.level);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await apiRequest<{ templates: CourseTemplate[]; pagination: any }>(
      `/api/course-templates?${queryParams.toString()}`
    );
    return response.data!;
  },

  // Get template by ID
  getTemplate: async (id: string): Promise<CourseTemplate> => {
    const response = await apiRequest<CourseTemplate>(`/api/course-templates/${id}`);
    return response.data!;
  },

  // Get user's templates
  getUserTemplates: async (): Promise<{ templates: CourseTemplate[] }> => {
    const response = await apiRequest<{ templates: CourseTemplate[] }>(
      '/api/course-templates/my'
    );
    return response.data!;
  },

  // Create new template
  createTemplate: async (templateData: CreateTemplateData): Promise<CourseTemplate> => {
    const response = await apiRequest<CourseTemplate>('/api/course-templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
    return response.data!;
  },

  // Create course from template
  createCourseFromTemplate: async (data: {
    title: string;
    description?: string;
    templateId: string;
  }): Promise<Course> => {
    const response = await apiRequest<Course>('/api/course-templates/create-course', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  },

  // Save course as template
  saveAsTemplate: async (courseId: string, data: {
    name: string;
    description: string;
    isPublic?: boolean;
  }): Promise<CourseTemplate> => {
    const response = await apiRequest<CourseTemplate>(`/api/course-templates/save/${courseId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  },

  // Delete template
  deleteTemplate: async (id: string): Promise<void> => {
    await apiRequest(`/api/course-templates/${id}`, {
      method: 'DELETE',
    });
  },
};

// Module and Lesson types
export interface ModuleData {
  id: string;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;
  courseId: string;
  lessonCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleData {
  title: string;
  description?: string;
  order: number;
}

// Enhanced lesson types to match backend
export type LessonType =
  | 'TEXT'
  | 'VIDEO'
  | 'QUIZ'
  | 'ASSIGNMENT'
  | 'RESOURCE'
  | 'INTERACTIVE_EDITOR'
  | 'WIKIPEDIA_EXERCISE'
  | 'PEER_REVIEW';

// Quiz question types
export interface QuizQuestion {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_IN_BLANK';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  order: number;
}

// Interactive elements for lessons
export interface InteractiveElement {
  type: 'tooltip' | 'highlight' | 'popup' | 'guide';
  trigger: string;
  content: string;
  position?: string;
}

// Assessment criteria for assignments
export interface AssessmentCriterion {
  criterion: string;
  weight: number;
  description: string;
}

// Wikipedia exercise configuration
export interface WikipediaExercise {
  articleTitle?: string;
  initialContent?: string;
  targetContent?: string;
  instructions: string;
  editingMode: 'sandbox' | 'guided' | 'live';
  allowedActions: string[];
  successCriteria: Array<{
    type: 'contains' | 'format' | 'structure' | 'links' | 'citations';
    description: string;
    required: boolean;
  }>;
}

// Resource item
export interface ResourceItem {
  title: string;
  url: string;
  type: string;
}

export interface LessonData {
  id: string;
  title: string;
  description?: string;
  content: string;
  type: LessonType;
  videoUrl?: string;
  duration?: number;
  order: number;
  isPublished: boolean;
  moduleId: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;

  // Type-specific fields
  resources?: ResourceItem[];
  wikipediaExercise?: WikipediaExercise;
  interactiveElements?: InteractiveElement[];
  assessmentCriteria?: AssessmentCriterion[];
}

export interface CreateLessonData {
  title: string;
  description?: string;
  content: string;
  type: LessonType;
  videoUrl?: string;
  duration?: number;
  order: number;

  // Type-specific fields
  resources?: ResourceItem[];
  wikipediaExercise?: WikipediaExercise;
  interactiveElements?: InteractiveElement[];
  assessmentCriteria?: AssessmentCriterion[];
}

// Quiz interfaces
export interface QuizQuestion {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_IN_BLANK' | 'MATCHING' | 'ORDERING';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  order: number;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  lesson: string;
  course: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
  maxAttempts?: number;
  showCorrectAnswers: boolean;
  showScoreImmediately: boolean;
  isRequired: boolean;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  _id: string;
  user: string;
  quiz: string;
  course: string;
  lesson: string;
  answers: Array<{
    questionId: string;
    userAnswer: string | string[];
    isCorrect: boolean;
    pointsEarned: number;
    timeSpent?: number;
  }>;
  score: number;
  totalPoints: number;
  earnedPoints: number;
  passed: boolean;
  timeSpent: number;
  startedAt: string;
  completedAt?: string;
  attemptNumber: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Achievement interfaces
export interface Achievement {
  _id: string;
  user: string;
  badgeType: string;
  title: string;
  description: string;
  iconUrl?: string;
  course?: string;
  quiz?: string;
  earnedAt: string;
  metadata?: {
    score?: number;
    timeSpent?: number;
    courseTitle?: string;
    quizTitle?: string;
    additionalInfo?: Record<string, any>;
  };
  createdAt: string;
  updatedAt: string;
}

// Certificate interfaces
export interface Certificate {
  _id: string;
  user: string;
  course: string;
  verificationCode: string;
  issuedAt: string;
  completionDate: string;
  finalScore?: number;
  timeSpent: number;
  instructorName: string;
  courseName: string;
  courseLevel: string;
  certificateUrl?: string;
  isValid: boolean;
  revokedAt?: string;
  revokedReason?: string;
  metadata: {
    totalLessons: number;
    completedLessons: number;
    totalQuizzes: number;
    passedQuizzes: number;
    averageQuizScore?: number;
    achievements: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// Module API functions
export const moduleApi = {
  // Get modules for a course
  getModules: async (courseId: string): Promise<{ modules: ModuleData[] }> => {
    const response = await apiRequest<{ modules: ModuleData[] }>(
      `/api/courses/${courseId}/modules`
    );
    return response.data!;
  },

  // Create module
  createModule: async (courseId: string, moduleData: CreateModuleData): Promise<ModuleData> => {
    const response = await apiRequest<ModuleData>(`/api/courses/${courseId}/modules`, {
      method: 'POST',
      body: JSON.stringify(moduleData),
    });
    return response.data!;
  },

  // Update module
  updateModule: async (courseId: string, moduleId: string, moduleData: Partial<CreateModuleData>): Promise<ModuleData> => {
    const response = await apiRequest<ModuleData>(`/api/courses/${courseId}/modules/${moduleId}`, {
      method: 'PUT',
      body: JSON.stringify(moduleData),
    });
    return response.data!;
  },

  // Delete module
  deleteModule: async (courseId: string, moduleId: string): Promise<void> => {
    await apiRequest(`/api/courses/${courseId}/modules/${moduleId}`, {
      method: 'DELETE',
    });
  },

  // Toggle module publish status
  togglePublish: async (courseId: string, moduleId: string): Promise<{ id: string; isPublished: boolean }> => {
    const response = await apiRequest<{ id: string; isPublished: boolean }>(
      `/api/courses/${courseId}/modules/${moduleId}/publish`,
      { method: 'PATCH' }
    );
    return response.data!;
  },
};

// Lesson API functions
export const lessonApi = {
  // Get lessons for a module
  getLessons: async (courseId: string, moduleId: string): Promise<{ lessons: LessonData[] }> => {
    const response = await apiRequest<{ lessons: LessonData[] }>(
      `/api/courses/${courseId}/modules/${moduleId}/lessons`
    );
    return response.data!;
  },

  // Create lesson
  createLesson: async (courseId: string, moduleId: string, lessonData: CreateLessonData): Promise<LessonData> => {
    const response = await apiRequest<LessonData>(
      `/api/courses/${courseId}/modules/${moduleId}/lessons`,
      {
        method: 'POST',
        body: JSON.stringify(lessonData),
      }
    );
    return response.data!;
  },

  // Update lesson
  updateLesson: async (courseId: string, moduleId: string, lessonId: string, lessonData: Partial<CreateLessonData>): Promise<LessonData> => {
    const response = await apiRequest<LessonData>(
      `/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
      {
        method: 'PUT',
        body: JSON.stringify(lessonData),
      }
    );
    return response.data!;
  },

  // Delete lesson
  deleteLesson: async (courseId: string, moduleId: string, lessonId: string): Promise<void> => {
    await apiRequest(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
      method: 'DELETE',
    });
  },

  // Toggle lesson publish status
  togglePublish: async (courseId: string, moduleId: string, lessonId: string): Promise<{ id: string; isPublished: boolean }> => {
    const response = await apiRequest<{ id: string; isPublished: boolean }>(
      `/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/publish`,
      { method: 'PATCH' }
    );
    return response.data!;
  },
};

// Learning API functions
export const learningApi = {
  // Get user's learning progress
  getUserProgress: async (): Promise<any> => {
    const response = await apiRequest<any>('/api/learning/progress');
    return response.data!;
  },

  // Mark lesson as completed
  markLessonComplete: async (lessonId: string): Promise<void> => {
    await apiRequest(`/api/learning/lessons/${lessonId}/complete`, {
      method: 'POST',
    });
  },

  // Update lesson progress
  updateLessonProgress: async (lessonId: string, data: { timeSpent?: number; progress?: number }): Promise<void> => {
    await apiRequest(`/api/learning/lessons/${lessonId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Study Goals API functions
export const studyGoalApi = {
  // Get user's study goals
  getUserGoals: async (): Promise<any> => {
    const response = await apiRequest<any>('/api/study-goals');
    return response.data!;
  },

  // Create a new study goal
  createGoal: async (goalData: {
    title: string;
    description?: string;
    target: number;
    unit: 'lessons' | 'hours' | 'courses' | 'points';
    deadline: string;
  }): Promise<any> => {
    const response = await apiRequest<any>('/api/study-goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
    return response.data!;
  },

  // Update a study goal
  updateGoal: async (goalId: string, goalData: {
    title?: string;
    description?: string;
    target?: number;
    deadline?: string;
  }): Promise<any> => {
    const response = await apiRequest<any>(`/api/study-goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    });
    return response.data!;
  },

  // Delete a study goal
  deleteGoal: async (goalId: string): Promise<void> => {
    await apiRequest(`/api/study-goals/${goalId}`, {
      method: 'DELETE',
    });
  },
};

// Quiz API functions
export const quizApi = {
  // Get quiz by ID
  getQuiz: async (quizId: string, includeAnswers = false): Promise<Quiz> => {
    const response = await apiRequest<Quiz>(
      `/api/quizzes/${quizId}?includeAnswers=${includeAnswers}`
    );
    return response.data!;
  },

  // Get quizzes for a lesson
  getQuizzesByLesson: async (lessonId: string): Promise<{ quizzes: Quiz[] }> => {
    const response = await apiRequest<{ quizzes: Quiz[] }>(
      `/api/quizzes/lesson/${lessonId}`
    );
    return response.data!;
  },

  // Start quiz attempt
  startQuiz: async (quizId: string): Promise<{ quiz: Quiz; startTime: string; attemptNumber: number }> => {
    const response = await apiRequest<{ quiz: Quiz; startTime: string; attemptNumber: number }>(
      `/api/quizzes/${quizId}/start`,
      { method: 'POST' }
    );
    return response.data!;
  },

  // Submit quiz attempt
  submitQuiz: async (quizId: string, answers: Array<{ questionId: string; userAnswer: string | string[] }>, timeSpent: number): Promise<QuizAttempt> => {
    const response = await apiRequest<QuizAttempt>(`/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers, timeSpent }),
    });
    return response.data!;
  },

  // Get user's quiz attempts
  getMyAttempts: async (quizId?: string): Promise<{ attempts: QuizAttempt[] }> => {
    const queryParams = quizId ? `?quizId=${quizId}` : '';
    const response = await apiRequest<{ attempts: QuizAttempt[] }>(
      `/api/quizzes/attempts/my${queryParams}`
    );
    return response.data!;
  },

  // Create quiz (instructors only)
  createQuiz: async (quizData: {
    title: string;
    description?: string;
    lessonId: string;
    courseId: string;
    questions: QuizQuestion[];
    passingScore: number;
    timeLimit?: number;
    maxAttempts?: number;
    showCorrectAnswers?: boolean;
    showScoreImmediately?: boolean;
    isRequired?: boolean;
    order: number;
  }): Promise<Quiz> => {
    const response = await apiRequest<Quiz>('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
    return response.data!;
  },

  // Update quiz (instructors only)
  updateQuiz: async (quizId: string, updateData: Partial<Quiz>): Promise<Quiz> => {
    const response = await apiRequest<Quiz>(`/api/quizzes/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return response.data!;
  },

  // Delete quiz (instructors only)
  deleteQuiz: async (quizId: string): Promise<void> => {
    await apiRequest(`/api/quizzes/${quizId}`, {
      method: 'DELETE',
    });
  },
};

// Achievement API functions
export const achievementApi = {
  // Get current user's achievements
  getMyAchievements: async (): Promise<{ achievements: Achievement[] }> => {
    const response = await apiRequest<{ achievements: Achievement[] }>(
      '/api/achievements/my'
    );
    return response.data!;
  },

  // Check for new achievements
  checkAchievements: async (): Promise<{ newAchievements: Achievement[]; count: number }> => {
    const response = await apiRequest<{ newAchievements: Achievement[]; count: number }>(
      '/api/achievements/check',
      { method: 'POST' }
    );
    return response.data!;
  },

  // Get achievement statistics
  getMyStats: async (): Promise<{
    stats: {
      totalAchievements: number;
      recentAchievements: Achievement[];
      categoryBreakdown: Record<string, number>;
    }
  }> => {
    const response = await apiRequest<{
      stats: {
        totalAchievements: number;
        recentAchievements: Achievement[];
        categoryBreakdown: Record<string, number>;
      }
    }>('/api/achievements/stats');
    return response.data!;
  },

  // Get all badge definitions
  getBadgeDefinitions: async (): Promise<{ badges: any[] }> => {
    const response = await apiRequest<{ badges: any[] }>('/api/achievements/badges');
    return response.data!;
  },

  // Get achievement leaderboard
  getLeaderboard: async (limit = 10, category?: string): Promise<{ leaderboard: any[] }> => {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    if (category) queryParams.append('category', category);

    const response = await apiRequest<{ leaderboard: any[] }>(
      `/api/achievements/leaderboard?${queryParams.toString()}`
    );
    return response.data!;
  },
};

// Certificate API functions
export const certificateApi = {
  // Get current user's certificates
  getMyCertificates: async (): Promise<{ certificates: Certificate[] }> => {
    const response = await apiRequest<{ certificates: Certificate[] }>(
      '/api/certificates/my'
    );
    return response.data!;
  },

  // Generate certificate for completed course
  generateCertificate: async (courseId: string, data: {
    completionDate: string;
    finalScore?: number;
    timeSpent: number;
  }): Promise<Certificate> => {
    const response = await apiRequest<Certificate>(
      `/api/certificates/generate/${courseId}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  },

  // Check certificate eligibility
  checkEligibility: async (courseId: string): Promise<{
    eligibility: {
      eligible: boolean;
      reason?: string;
      requirements?: {
        courseCompleted: boolean;
        requiredQuizzesPassed: boolean;
        minimumScore?: number;
      };
    }
  }> => {
    const response = await apiRequest<{
      eligibility: {
        eligible: boolean;
        reason?: string;
        requirements?: {
          courseCompleted: boolean;
          requiredQuizzesPassed: boolean;
          minimumScore?: number;
        };
      }
    }>(`/api/certificates/eligibility/${courseId}`);
    return response.data!;
  },

  // Verify certificate by verification code (public)
  verifyCertificate: async (verificationCode: string): Promise<{
    isValid: boolean;
    certificate?: Certificate;
    message: string;
  }> => {
    const response = await apiRequest<{
      isValid: boolean;
      certificate?: Certificate;
      message: string;
    }>(`/api/certificates/verify/${verificationCode}`);
    return response.data!;
  },

  // Get certificate by verification code (public)
  getCertificateByCode: async (verificationCode: string): Promise<Certificate> => {
    const response = await apiRequest<Certificate>(
      `/api/certificates/public/${verificationCode}`
    );
    return response.data!;
  },

  // Download certificate
  downloadCertificate: async (certificateId: string): Promise<{ downloadUrl: string }> => {
    const response = await apiRequest<{ downloadUrl: string }>(
      `/api/certificates/${certificateId}/download`
    );
    return response.data!;
  },
};

// Learning Paths API functions
export const learningPathApi = {
  // Get all learning paths with user progress
  getLearningPaths: async (): Promise<any> => {
    const response = await apiRequest<any>('/api/learning-paths');
    return response.data!;
  },

  // Start a learning path
  startLearningPath: async (pathId: string): Promise<any> => {
    const response = await apiRequest<any>(`/api/learning-paths/${pathId}/start`, {
      method: 'POST',
    });
    return response.data!;
  },

  // Complete a learning path step
  completeStep: async (pathId: string, stepId: string): Promise<any> => {
    const response = await apiRequest<any>(`/api/learning-paths/${pathId}/steps/${stepId}/complete`, {
      method: 'POST',
    });
    return response.data!;
  },

  // Get user's progress for a specific learning path
  getUserPathProgress: async (pathId: string): Promise<any> => {
    const response = await apiRequest<any>(`/api/learning-paths/${pathId}/progress`);
    return response.data!;
  },
};

// Admin API functions
export const adminApi = {
  // Get courses for admin dashboard
  getCourses: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    instructor?: string;
  }): Promise<{ courses: Course[]; pagination: any }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.instructor) queryParams.append('instructor', params.instructor);

    const response = await apiRequest<{ courses: Course[]; pagination: any }>(
      `/api/admin/courses?${queryParams.toString()}`
    );
    return response.data!;
  },

  // Get analytics
  getAnalytics: async (): Promise<any> => {
    const response = await apiRequest('/api/admin/analytics');
    return response.data!;
  },

  // Get users
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }): Promise<{ users: any[]; pagination: any }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.search) queryParams.append('search', params.search);

    const response = await apiRequest<{ users: any[]; pagination: any }>(
      `/api/admin/users?${queryParams.toString()}`
    );
    return response.data!;
  },

  // Update user role
  updateUserRole: async (userId: string, role: string): Promise<any> => {
    const response = await apiRequest(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
    return response.data!;
  },

  // Upload video
  uploadVideo: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch(`${API_BASE_URL}/api/admin/upload/video`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.message || 'Upload failed', response.status);
    }

    const data = await response.json();
    return data.data;
  },

  // Upload thumbnail
  uploadThumbnail: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('thumbnail', file);

    const response = await fetch(`${API_BASE_URL}/api/admin/upload/thumbnail`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.message || 'Upload failed', response.status);
    }

    const data = await response.json();
    return data.data;
  },
};

export { ApiError };
