import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Target,
  Calendar,
  CheckCircle,
  Play,
  BarChart3,
  Users
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LoadingSkeleton from '@/components/ui/loading-skeleton';

interface StudentProgressProps {
  detailed?: boolean;
}

interface ProgressData {
  overview: {
    coursesEnrolled: number;
    coursesCompleted: number;
    lessonsCompleted: number;
    totalLessons: number;
    studyTimeHours: number;
    communityPoints: number;
    currentStreak: number;
    weeklyGoalProgress: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'lesson_completed' | 'course_started' | 'achievement_earned';
    title: string;
    courseName?: string;
    timestamp: string;
  }>;
  weeklyStats: {
    lessonsThisWeek: number;
    hoursThisWeek: number;
    goalLessons: number;
    goalHours: number;
  };
}

const StudentProgress: React.FC<StudentProgressProps> = ({ detailed = false }) => {
  const { data: progressData, isLoading } = useQuery({
    queryKey: ['student-progress'],
    queryFn: async () => {
      // Mock data for now - replace with actual API call
      return {
        overview: {
          coursesEnrolled: 3,
          coursesCompleted: 1,
          lessonsCompleted: 24,
          totalLessons: 45,
          studyTimeHours: 18.5,
          communityPoints: 1250,
          currentStreak: 7,
          weeklyGoalProgress: 75,
        },
        recentActivity: [
          {
            id: '1',
            type: 'lesson_completed' as const,
            title: 'Wikipedia Editing Basics',
            courseName: 'Introduction to Wikipedia',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            type: 'achievement_earned' as const,
            title: 'First Edit Achievement',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            type: 'course_started' as const,
            title: 'Advanced Wikipedia Techniques',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        weeklyStats: {
          lessonsThisWeek: 6,
          hoursThisWeek: 4.5,
          goalLessons: 8,
          goalHours: 6,
        },
      };
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <LoadingSkeleton variant="stats" count={4} />
        </div>
        {detailed && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <LoadingSkeleton variant="card" count={2} />
          </div>
        )}
      </div>
    );
  }

  const progress: ProgressData = progressData;
  const completionRate = progress.overview.totalLessons > 0 
    ? Math.round((progress.overview.lessonsCompleted / progress.overview.totalLessons) * 100)
    : 0;

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson_completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'course_started':
        return <Play className="h-4 w-4 text-blue-600" />;
      case 'achievement_earned':
        return <Award className="h-4 w-4 text-yellow-600" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{progress.overview.coursesEnrolled}</div>
            <p className="text-xs text-muted-foreground">
              {progress.overview.coursesCompleted} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Lessons</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{progress.overview.lessonsCompleted}</div>
            <p className="text-xs text-muted-foreground">
              {completionRate}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{progress.overview.studyTimeHours}h</div>
            <p className="text-xs text-muted-foreground">
              Total learning time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Points</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{progress.overview.communityPoints}</div>
            <p className="text-xs text-muted-foreground">
              Community points
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {!detailed && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-sm">
              Continue your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Button className="h-16 flex flex-col gap-1 text-xs sm:text-sm" size="sm">
                <Play className="h-4 w-4" />
                Continue Learning
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1 text-xs sm:text-sm" size="sm">
                <BookOpen className="h-4 w-4" />
                Browse Courses
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1 text-xs sm:text-sm" size="sm">
                <Users className="h-4 w-4" />
                Join Community
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Progress */}
      {detailed && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Weekly Progress */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                Weekly Goals
              </CardTitle>
              <CardDescription className="text-sm">
                Your progress this week
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Lessons</span>
                  <span className="text-sm text-gray-600">
                    {progress.weeklyStats.lessonsThisWeek} / {progress.weeklyStats.goalLessons}
                  </span>
                </div>
                <Progress 
                  value={(progress.weeklyStats.lessonsThisWeek / progress.weeklyStats.goalLessons) * 100} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Study Hours</span>
                  <span className="text-sm text-gray-600">
                    {progress.weeklyStats.hoursThisWeek} / {progress.weeklyStats.goalHours}h
                  </span>
                </div>
                <Progress 
                  value={(progress.weeklyStats.hoursThisWeek / progress.weeklyStats.goalHours) * 100} 
                  className="h-2"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {progress.overview.currentStreak} day streak
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-sm">
                Your latest learning activities
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {progress.recentActivity.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-3">
                  {progress.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {activity.title}
                        </div>
                        {activity.courseName && (
                          <div className="text-xs text-gray-500 truncate">
                            {activity.courseName}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 flex-shrink-0">
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentProgress;
