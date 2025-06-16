import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  BookOpen,
  Upload,
  BarChart3,
  Users,
  Settings
} from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

import Header from '@/components/Header';
import CreateCourseForm from '@/components/admin/CreateCourseForm';
import VideoUpload from '@/components/admin/VideoUpload';
import InstructorCourseManagement from '@/components/instructor/InstructorCourseManagement';
import CourseTemplateBrowser from '@/components/instructor/CourseTemplateBrowser';
import { courseApi } from '@/lib/api';
import { RoleDebugger } from '@/components/debug/RoleDebugger';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showTemplateBrowser, setShowTemplateBrowser] = useState(false);

  if (!user) {
    return null; // This should be handled by RoleProtectedRoute
  }

  // Fetch instructor analytics
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['instructor-analytics'],
    queryFn: courseApi.getInstructorAnalytics,
    enabled: true,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      
      <main className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                Instructor Dashboard 👨‍🏫
              </h1>
              <p className="text-sm sm:text-base text-slate-600">
                Create and manage your Wikipedia education courses.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">
                Welcome, {user.firstName}!
              </span>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Mobile Tab Navigation */}
          <div className="block sm:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">📊 Overview</SelectItem>
                <SelectItem value="courses">📚 My Courses</SelectItem>
                <SelectItem value="create-course">➕ Create Course</SelectItem>
                <SelectItem value="templates">📋 Templates</SelectItem>
                <SelectItem value="upload">📤 Upload Media</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Tab Navigation */}
          <TabsList className="hidden sm:grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">
              <span className="hidden lg:inline">📊 </span>Overview
            </TabsTrigger>
            <TabsTrigger value="courses" className="text-xs sm:text-sm py-2">
              <span className="hidden lg:inline">📚 </span>My Courses
            </TabsTrigger>
            <TabsTrigger value="create-course" className="text-xs sm:text-sm py-2">
              <span className="hidden lg:inline">➕ </span>Create Course
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs sm:text-sm py-2">
              <span className="hidden lg:inline">📋 </span>Templates
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs sm:text-sm py-2">
              <span className="hidden lg:inline">📤 </span>Upload Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
                <CardDescription>
                  Common instructor tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Button
                    onClick={() => setActiveTab('create-course')}
                    className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 sm:h-6 sm:w-6" />
                    <span className="text-center leading-tight">Create Course</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('templates')}
                    className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm"
                    size="sm"
                  >
                    <BookOpen className="h-4 w-4 sm:h-6 sm:w-6" />
                    <span className="text-center leading-tight">Use Template</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('courses')}
                    className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm"
                    size="sm"
                  >
                    <Settings className="h-4 w-4 sm:h-6 sm:w-6" />
                    <span className="text-center leading-tight">Manage Courses</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('upload')}
                    className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm"
                    size="sm"
                  >
                    <Upload className="h-4 w-4 sm:h-6 sm:w-6" />
                    <span className="text-center leading-tight">Upload Media</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Course Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                    ) : analyticsError ? (
                      '-'
                    ) : (
                      analytics?.totalCourses || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Courses you've created
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Published</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                    ) : analyticsError ? (
                      '-'
                    ) : (
                      analytics?.publishedCourses || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Live courses
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                    ) : analyticsError ? (
                      '-'
                    ) : (
                      analytics?.totalStudents || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enrolled students
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                    ) : analyticsError ? (
                      '-%'
                    ) : (
                      `${analytics?.averageCompletionRate || 0}%`
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average completion
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses">
            <InstructorCourseManagement />
          </TabsContent>

          <TabsContent value="create-course">
            <CreateCourseForm />
          </TabsContent>

          <TabsContent value="templates">
            <CourseTemplateBrowser
              onClose={() => setActiveTab('overview')}
              onCourseCreated={() => {
                setActiveTab('courses');
              }}
            />
          </TabsContent>

          <TabsContent value="upload">
            <VideoUpload />
          </TabsContent>
        </Tabs>
      </main>

      {/* Debug component for development */}
      <RoleDebugger />
    </div>
  );
};

export default InstructorDashboard;
