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
  instructor: string;
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
  price?: number;
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
  category: string;
  tags: string[];
  price?: number;
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

export interface LessonData {
  id: string;
  title: string;
  content: string;
  type: 'TEXT' | 'VIDEO' | 'INTERACTIVE' | 'QUIZ' | 'ASSIGNMENT';
  videoUrl?: string;
  duration?: number;
  order: number;
  isPublished: boolean;
  moduleId: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonData {
  title: string;
  content: string;
  type: 'TEXT' | 'VIDEO' | 'INTERACTIVE' | 'QUIZ' | 'ASSIGNMENT';
  videoUrl?: string;
  duration?: number;
  order: number;
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

// Achievements API functions
export const achievementApi = {
  // Get user's achievements with progress
  getUserAchievements: async (): Promise<any> => {
    const response = await apiRequest<any>('/api/achievements');
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
