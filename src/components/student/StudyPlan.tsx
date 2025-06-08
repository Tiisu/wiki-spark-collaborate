import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  Target,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Play
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import LoadingSkeleton from '@/components/ui/loading-skeleton';
import { studyGoalApi, learningApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface StudySession {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  scheduledDate: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'missed' | 'in-progress';
  type: 'lesson' | 'practice' | 'review' | 'assessment';
  priority: 'low' | 'medium' | 'high';
  completedAt?: string;
}

interface WeeklyGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: 'lessons' | 'hours' | 'courses' | 'points';
  deadline: string;
  isCompleted: boolean;
  description?: string;
}

interface StudyPlanData {
  weeklyGoals: WeeklyGoal[];
  upcomingSessions: StudySession[];
  todaySessions: StudySession[];
  weeklyStats: {
    plannedHours: number;
    completedHours: number;
    plannedSessions: number;
    completedSessions: number;
    streak: number;
  };
}

const StudyPlan = () => {
  const [activeView, setActiveView] = useState('today');
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: '',
    unit: 'lessons' as 'lessons' | 'hours' | 'courses' | 'points',
    deadline: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get study goals
  const { data: goalsData, isLoading: goalsLoading, error: goalsError } = useQuery({
    queryKey: ['study-goals'],
    queryFn: studyGoalApi.getUserGoals,
    refetchInterval: 60000,
  });

  // Get learning progress for weekly stats
  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['student-progress'],
    queryFn: learningApi.getUserProgress,
    refetchInterval: 60000,
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: studyGoalApi.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-goals'] });
      setShowCreateGoal(false);
      setNewGoal({
        title: '',
        description: '',
        target: '',
        unit: 'lessons',
        deadline: ''
      });
      toast({
        title: 'Goal created',
        description: 'Your new study goal has been added.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create goal',
        variant: 'destructive',
      });
    }
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: studyGoalApi.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-goals'] });
      toast({
        title: 'Goal deleted',
        description: 'Your study goal has been removed.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete goal',
        variant: 'destructive',
      });
    }
  });

  const handleCreateGoal = () => {
    if (!newGoal.title || !newGoal.target || !newGoal.deadline) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Set deadline to end of selected day
    const deadlineDate = new Date(newGoal.deadline);
    deadlineDate.setHours(23, 59, 59, 999);

    createGoalMutation.mutate({
      title: newGoal.title,
      description: newGoal.description || undefined,
      target: parseInt(newGoal.target),
      unit: newGoal.unit,
      deadline: deadlineDate.toISOString()
    });
  };

  const isLoading = goalsLoading || progressLoading;

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <LoadingSkeleton variant="stats" count={4} />
        </div>
        <LoadingSkeleton variant="card" count={2} />
      </div>
    );
  }

  if (goalsError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Failed to load study plan. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform real data to match component interface
  const weeklyGoals: WeeklyGoal[] = goalsData?.goals?.map((goal: any) => ({
    id: goal.id,
    title: goal.title,
    target: goal.target,
    current: goal.current,
    unit: goal.unit,
    deadline: goal.deadline,
    isCompleted: goal.isCompleted,
    description: goal.description
  })) || [];

  // Calculate weekly stats from progress data
  const weeklyStats = {
    plannedHours: 8, // Default planned hours
    completedHours: progressData?.weeklyStats?.hoursThisWeek || 0,
    plannedSessions: 12, // Default planned sessions
    completedSessions: progressData?.weeklyStats?.lessonsThisWeek || 0,
    streak: progressData?.overview?.currentStreak || 0
  };

  const data: StudyPlanData = {
    weeklyGoals,
    // For now, use empty arrays for sessions (can be implemented later)
    upcomingSessions: [],
    todaySessions: [],
    weeklyStats
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'missed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return <BookOpen className="h-4 w-4" />;
      case 'practice':
        return <Target className="h-4 w-4" />;
      case 'review':
        return <TrendingUp className="h-4 w-4" />;
      case 'assessment':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Weekly Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Study Hours</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{data.weeklyStats.completedHours}h</div>
            <p className="text-xs text-muted-foreground">
              of {data.weeklyStats.plannedHours}h planned
            </p>
            <Progress 
              value={(data.weeklyStats.completedHours / data.weeklyStats.plannedHours) * 100} 
              className="h-1 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Sessions</CardTitle>
            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{data.weeklyStats.completedSessions}</div>
            <p className="text-xs text-muted-foreground">
              of {data.weeklyStats.plannedSessions} planned
            </p>
            <Progress 
              value={(data.weeklyStats.completedSessions / data.weeklyStats.plannedSessions) * 100} 
              className="h-1 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Streak</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{data.weeklyStats.streak}</div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Goals</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">
              {data.weeklyGoals.filter(g => g.isCompleted).length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {data.weeklyGoals.length} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Goals */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                Weekly Goals
              </CardTitle>
              <CardDescription className="text-sm">Track your weekly learning objectives</CardDescription>
            </div>
            <Dialog open={showCreateGoal} onOpenChange={setShowCreateGoal}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Study Goal</DialogTitle>
                  <DialogDescription>
                    Set a new learning goal to track your progress.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      placeholder="e.g., Complete 5 lessons this week"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      placeholder="Optional description..."
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="target">Target *</Label>
                      <Input
                        id="target"
                        type="number"
                        min="1"
                        value={newGoal.target}
                        onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                        placeholder="5"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="unit">Unit *</Label>
                      <Select value={newGoal.unit} onValueChange={(value: any) => setNewGoal({ ...newGoal, unit: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lessons">Lessons</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="courses">Courses</SelectItem>
                          <SelectItem value="points">Points</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deadline">Deadline *</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateGoal(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateGoal}
                    disabled={createGoalMutation.isPending}
                  >
                    {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-4">
            {data.weeklyGoals.map((goal) => (
              <div key={goal.id} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-sm">{goal.title}</h4>
                    {goal.isCompleted && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Progress 
                      value={Math.min((goal.current / goal.target) * 100, 100)} 
                      className="h-2 flex-1"
                    />
                    <span className="text-sm text-gray-600 min-w-0">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Due: {new Date(goal.deadline).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteGoalMutation.mutate(goal.id)}
                    disabled={deleteGoalMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Study Sessions */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="today" className="text-xs sm:text-sm py-2">Today</TabsTrigger>
          <TabsTrigger value="upcoming" className="text-xs sm:text-sm py-2">Upcoming</TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs sm:text-sm py-2">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                Today's Sessions
              </CardTitle>
              <CardDescription className="text-sm">Your scheduled study sessions for today</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {data.todaySessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sessions scheduled for today</p>
                  <Button className="mt-4" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Session
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.todaySessions.map((session) => (
                    <div key={session.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(session.type)}
                        <div className="text-sm font-medium">{formatTime(session.scheduledDate)}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{session.title}</div>
                        <div className="text-xs text-gray-600">{session.courseName}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getPriorityColor(session.priority)}>
                          {session.priority}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatDuration(session.duration)}</span>
                      </div>
                      {session.status === 'scheduled' && (
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                Upcoming Sessions
              </CardTitle>
              <CardDescription className="text-sm">Your next scheduled study sessions</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3">
                {data.upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(session.type)}
                      <div className="text-sm">
                        <div className="font-medium">
                          {new Date(session.scheduledDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatTime(session.scheduledDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{session.title}</div>
                      <div className="text-xs text-gray-600">{session.courseName}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getPriorityColor(session.priority)}>
                        {session.priority}
                      </Badge>
                      <span className="text-xs text-gray-500">{formatDuration(session.duration)}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Schedule Management</h3>
              <p className="text-gray-500 mb-4">
                Create and manage your study schedule
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Study Schedule
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudyPlan;
