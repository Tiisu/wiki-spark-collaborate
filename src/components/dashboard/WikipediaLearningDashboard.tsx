import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Clock, 
  Star, 
  Award,
  TrendingUp,
  Calendar,
  CheckCircle,
  Play,
  Globe,
  Users
} from 'lucide-react';
import { WikipediaCourseCard } from '../courses/WikipediaCourseCard';
import { AchievementCard } from '../achievements/AchievementCard';
import { CertificateCard } from '../certificates/CertificateCard';
import { 
  Course, 
  Enrollment, 
  Achievement, 
  Certificate,
  courseApi, 
  achievementApi, 
  certificateApi 
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface WikipediaLearningDashboardProps {
  className?: string;
}

export const WikipediaLearningDashboard: React.FC<WikipediaLearningDashboardProps> = ({ 
  className = '' 
}) => {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [enrollmentsResponse, achievementsResponse, certificatesResponse] = await Promise.all([
        courseApi.getMyEnrollments(),
        achievementApi.getMyAchievements(),
        certificateApi.getMyCertificates()
      ]);

      setEnrollments(enrollmentsResponse.enrollments);
      setEnrolledCourses(enrollmentsResponse.enrollments.map(e => e.course));
      setAchievements(achievementsResponse.achievements);
      setCertificates(certificatesResponse.certificates);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getOverallStats = () => {
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.status === 'COMPLETED').length;
    const inProgressCourses = enrollments.filter(e => e.status === 'ACTIVE').length;
    const totalAchievements = achievements.length;
    const totalCertificates = certificates.length;
    
    const averageProgress = enrollments.length > 0 
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
      : 0;

    const totalTimeSpent = enrollments.reduce((sum, e) => sum + (e.timeSpent || 0), 0);

    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalAchievements,
      totalCertificates,
      averageProgress,
      totalTimeSpent
    };
  };

  const getRecentActivity = () => {
    const recentAchievements = achievements
      .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
      .slice(0, 3);

    const recentCertificates = certificates
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
      .slice(0, 2);

    return { recentAchievements, recentCertificates };
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Globe className="h-8 w-8 animate-pulse text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your Wikipedia learning journey...</p>
        </div>
      </div>
    );
  }

  const stats = getOverallStats();
  const { recentAchievements, recentCertificates } = getRecentActivity();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome to WikiWalkthrough</h1>
              <p className="text-blue-100">
                Master Wikipedia editing and contribute to the world's largest encyclopedia
              </p>
            </div>
            <div className="hidden md:block">
              <Globe className="h-16 w-16 text-white/20" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalCourses}</div>
                <div className="text-sm text-muted-foreground">Courses Enrolled</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{stats.completedCourses}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalAchievements}</div>
                <div className="text-sm text-muted-foreground">Achievements</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{formatTime(stats.totalTimeSpent)}</div>
                <div className="text-sm text-muted-foreground">Time Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          {/* In Progress Courses */}
          {stats.inProgressCourses > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="h-5 w-5 text-blue-600" />
                  <span>Continue Learning</span>
                </CardTitle>
                <CardDescription>
                  Pick up where you left off in your Wikipedia education journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enrolledCourses
                    .filter((_, index) => enrollments[index]?.status === 'ACTIVE')
                    .slice(0, 3)
                    .map((course, index) => {
                      const enrollment = enrollments.find(e => e.course._id === course._id);
                      return (
                        <WikipediaCourseCard
                          key={course._id}
                          course={course}
                          enrollment={enrollment}
                        />
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed Courses */}
          {stats.completedCourses > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Completed Courses</span>
                </CardTitle>
                <CardDescription>
                  Courses you've successfully completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enrolledCourses
                    .filter((_, index) => enrollments[index]?.status === 'COMPLETED')
                    .slice(0, 3)
                    .map((course, index) => {
                      const enrollment = enrollments.find(e => e.course._id === course._id);
                      return (
                        <WikipediaCourseCard
                          key={course._id}
                          course={course}
                          enrollment={enrollment}
                        />
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Courses Message */}
          {stats.totalCourses === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start Your Wikipedia Journey</h3>
                <p className="text-muted-foreground mb-4">
                  Enroll in your first course to begin learning Wikipedia editing skills
                </p>
                <Button asChild>
                  <a href="/courses">Browse Courses</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          {recentAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentAchievements.map(achievement => (
                <AchievementCard
                  key={achievement._id}
                  achievement={achievement}
                  isEarned={true}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete courses and quizzes to earn your first achievement
                </p>
                <Button asChild>
                  <a href="/achievements">View All Achievements</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          {recentCertificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentCertificates.map(certificate => (
                <CertificateCard
                  key={certificate._id}
                  certificate={certificate}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Certificates Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete courses to earn certificates of completion
                </p>
                <Button asChild>
                  <a href="/courses">Start Learning</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
                <CardDescription>Your learning journey overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Course Progress</span>
                    <span>{stats.averageProgress}%</span>
                  </div>
                  <Progress value={stats.averageProgress} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-green-600">{stats.completedCourses}</div>
                    <div className="text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{stats.inProgressCourses}</div>
                    <div className="text-muted-foreground">In Progress</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Streak */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Activity</CardTitle>
                <CardDescription>Your recent learning activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">7</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Time Spent</span>
                    <span className="font-medium">{formatTime(stats.totalTimeSpent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Achievements Earned</span>
                    <span className="font-medium">{stats.totalAchievements}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Certificates Earned</span>
                    <span className="font-medium">{stats.totalCertificates}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
