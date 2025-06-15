import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BookOpen,
  Users,
  Award,
  Clock,
  LogOut,
  User,
  TrendingUp,
  Target,
  Calendar,
  Star,
  Play,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

import Header from '@/components/Header';
import { WikipediaLearningDashboard } from '@/components/dashboard/WikipediaLearningDashboard';
import StudentProgress from '@/components/student/StudentProgress';
import EnrolledCourses from '@/components/student/EnrolledCourses';
import LearningPath from '@/components/student/LearningPath';
import Achievements from '@/components/student/Achievements';
import StudyPlan from '@/components/student/StudyPlan';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    return null; // This should be handled by ProtectedRoute
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />

      <main className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                Welcome back, {user.firstName}! 👋
              </h1>
              <p className="text-sm sm:text-base text-slate-600">
                Continue your Wikipedia education journey and track your progress.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span className="hidden sm:inline">Level 1 Learner</span>
                <span className="sm:hidden">Lvl 1</span>
              </Badge>
            </div>
          </div>
        </div>


        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Mobile Tab Navigation */}
          <div className="block sm:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">📊 Overview</SelectItem>
                <SelectItem value="courses">📚 My Courses</SelectItem>
                <SelectItem value="progress">📈 Progress</SelectItem>
                <SelectItem value="learning-path">🎯 Learning Path</SelectItem>
                <SelectItem value="achievements">🏆 Achievements</SelectItem>
                <SelectItem value="study-plan">📅 Study Plan</SelectItem>
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
            <TabsTrigger value="progress" className="text-xs sm:text-sm py-2">
              <span className="hidden lg:inline">📈 </span>Progress
            </TabsTrigger>
            <TabsTrigger value="learning-path" className="text-xs sm:text-sm py-2">
              <span className="hidden lg:inline">🎯 </span>Path
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs sm:text-sm py-2">
              <span className="hidden lg:inline">🏆 </span>Awards
            </TabsTrigger>
            <TabsTrigger value="study-plan" className="text-xs sm:text-sm py-2">
              <span className="hidden lg:inline">📅 </span>Plan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <WikipediaLearningDashboard />
          </TabsContent>

          <TabsContent value="courses">
            <EnrolledCourses />
          </TabsContent>

          <TabsContent value="progress">
            <StudentProgress detailed={true} />
          </TabsContent>

          <TabsContent value="learning-path">
            <LearningPath />
          </TabsContent>

          <TabsContent value="achievements">
            <Achievements />
          </TabsContent>

          <TabsContent value="study-plan">
            <StudyPlan />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
