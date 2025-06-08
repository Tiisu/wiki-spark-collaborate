import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  BookOpen,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  UserPlus
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    publishedCourses: number;
    userGrowth: number;
    courseGrowth: number;
    publishedPercentage: number;
  };
  growth: {
    newUsersThisMonth: number;
    newUsersLastMonth: number;
    newCoursesThisMonth: number;
    newCoursesLastMonth: number;
  };
  recentActivity: {
    users: Array<{
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      createdAt: string;
    }>;
    courses: Array<{
      _id: string;
      title: string;
      createdAt: string;
    }>;
  };
}

const Analytics = () => {
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-3 sm:p-6">
                <div className="animate-pulse">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Failed to load analytics data</div>
        <div className="text-sm text-gray-500">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </div>
      </div>
    );
  }

  const analytics: AnalyticsData = analyticsData;

  if (!analytics) {
    return (
      <div className="text-center py-8 text-gray-500">
        No analytics data available
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Users</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{analytics.overview.totalUsers}</div>
            <div className={`text-xs flex items-center gap-1 ${getGrowthColor(analytics.overview.userGrowth)}`}>
              {getGrowthIcon(analytics.overview.userGrowth)}
              <span className="hidden sm:inline">
                {analytics.overview.userGrowth > 0 ? '+' : ''}{analytics.overview.userGrowth}% from last month
              </span>
              <span className="sm:hidden">
                {analytics.overview.userGrowth > 0 ? '+' : ''}{analytics.overview.userGrowth}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{analytics.overview.totalCourses}</div>
            <div className={`text-xs flex items-center gap-1 ${getGrowthColor(analytics.overview.courseGrowth)}`}>
              {getGrowthIcon(analytics.overview.courseGrowth)}
              <span className="hidden sm:inline">
                {analytics.overview.courseGrowth > 0 ? '+' : ''}{analytics.overview.courseGrowth}% from last month
              </span>
              <span className="sm:hidden">
                {analytics.overview.courseGrowth > 0 ? '+' : ''}{analytics.overview.courseGrowth}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Published</CardTitle>
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{analytics.overview.publishedCourses}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.publishedPercentage}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Enrollments</CardTitle>
            <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{analytics.overview.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              Active learners
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Growth Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">User Growth</CardTitle>
            <CardDescription className="text-sm">Monthly user registration trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Month</span>
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <UserPlus className="h-3 w-3" />
                <span className="hidden sm:inline">{analytics.growth.newUsersThisMonth} new users</span>
                <span className="sm:hidden">{analytics.growth.newUsersThisMonth}</span>
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Month</span>
              <Badge variant="secondary" className="text-xs">
                <span className="hidden sm:inline">{analytics.growth.newUsersLastMonth} users</span>
                <span className="sm:hidden">{analytics.growth.newUsersLastMonth}</span>
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Course Growth</CardTitle>
            <CardDescription className="text-sm">Monthly course creation trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Month</span>
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <BookOpen className="h-3 w-3" />
                <span className="hidden sm:inline">{analytics.growth.newCoursesThisMonth} new courses</span>
                <span className="sm:hidden">{analytics.growth.newCoursesThisMonth}</span>
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Month</span>
              <Badge variant="secondary" className="text-xs">
                <span className="hidden sm:inline">{analytics.growth.newCoursesLastMonth} courses</span>
                <span className="sm:hidden">{analytics.growth.newCoursesLastMonth}</span>
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Recent Users</CardTitle>
            <CardDescription className="text-sm">Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {analytics.recentActivity.users.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                No recent user activity
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.recentActivity.users.map((user) => (
                  <div key={user._id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 ml-2 flex-shrink-0">
                      <Calendar className="h-3 w-3" />
                      <span className="hidden sm:inline">{formatDate(user.createdAt)}</span>
                      <span className="sm:hidden">{formatDate(user.createdAt).split(' ')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Recent Courses</CardTitle>
            <CardDescription className="text-sm">Latest course creations</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {analytics.recentActivity.courses.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                No recent course activity
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.recentActivity.courses.map((course) => (
                  <div key={course._id} className="flex items-center justify-between">
                    <div className="font-medium text-sm truncate flex-1 mr-2">
                      {course.title}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                      <Calendar className="h-3 w-3" />
                      <span className="hidden sm:inline">{formatDate(course.createdAt)}</span>
                      <span className="sm:hidden">{formatDate(course.createdAt).split(' ')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
