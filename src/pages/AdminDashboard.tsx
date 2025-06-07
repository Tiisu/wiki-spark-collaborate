import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Plus,
  Settings,
  Video,
  Upload
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import Header from '@/components/Header';
import CreateCourseForm from '@/components/admin/CreateCourseForm';
import CourseManagement from '@/components/admin/CourseManagement';
import VideoUpload from '@/components/admin/VideoUpload';
import UserManagement from '@/components/admin/UserManagement';
import Analytics from '@/components/admin/Analytics';
import SystemHealth from '@/components/admin/SystemHealth';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not authenticated or not admin
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />

      <main className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage courses, users, and platform content
          </p>
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
                <SelectItem value="courses">📚 Courses</SelectItem>
                <SelectItem value="create-course">➕ Create Course</SelectItem>
                <SelectItem value="upload">📤 Upload Media</SelectItem>
                <SelectItem value="users">👥 Users</SelectItem>
                <SelectItem value="system">⚙️ System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Tab Navigation */}
          <TabsList className="hidden sm:grid w-full grid-cols-3 lg:grid-cols-6 h-auto p-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">
              <span className="hidden lg:inline">📊 </span>Overview
            </TabsTrigger>
            <TabsTrigger value="courses" className="text-xs sm:text-sm py-2">
              <span className="hidden lg:inline">📚 </span>Courses
            </TabsTrigger>
            <TabsTrigger value="create-course" className="text-xs sm:text-sm py-2">
              <span className="hidden lg:inline">➕ </span>Create
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs sm:text-sm py-2">
              <span className="hidden lg:inline">📤 </span>Upload
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm py-2">
              <span className="hidden lg:inline">👥 </span>Users
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs sm:text-sm py-2">
              <span className="hidden lg:inline">⚙️ </span>System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Analytics />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
                <CardDescription>
                  Common administrative tasks
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
                    onClick={() => setActiveTab('upload')}
                    className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm"
                    size="sm"
                  >
                    <Upload className="h-4 w-4 sm:h-6 sm:w-6" />
                    <span className="text-center leading-tight">Upload Media</span>
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
                    onClick={() => setActiveTab('users')}
                    className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm"
                    size="sm"
                  >
                    <Users className="h-4 w-4 sm:h-6 sm:w-6" />
                    <span className="text-center leading-tight">Manage Users</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <CourseManagement />
          </TabsContent>

          <TabsContent value="create-course">
            <CreateCourseForm />
          </TabsContent>

          <TabsContent value="upload">
            <VideoUpload />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="system">
            <SystemHealth />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
