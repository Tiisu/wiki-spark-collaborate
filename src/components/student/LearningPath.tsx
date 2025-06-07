import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Target, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  ArrowRight,
  Lock,
  Star,
  TrendingUp,
  Award,
  Play
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSkeleton from '@/components/ui/loading-skeleton';

interface LearningPathStep {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'skill' | 'project' | 'assessment';
  status: 'completed' | 'current' | 'locked' | 'available';
  progress: number;
  estimatedHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites?: string[];
  skills: string[];
  courseId?: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  totalSteps: number;
  completedSteps: number;
  estimatedHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  steps: LearningPathStep[];
}

const LearningPath = () => {
  const [selectedPath, setSelectedPath] = useState('wikipedia-editor');

  const { data: pathsData, isLoading } = useQuery({
    queryKey: ['learning-paths'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      const mockPaths: LearningPath[] = [
        {
          id: 'wikipedia-editor',
          title: 'Wikipedia Editor Mastery',
          description: 'Complete learning path to become a skilled Wikipedia editor',
          category: 'Editing',
          totalSteps: 6,
          completedSteps: 2,
          estimatedHours: 25,
          difficulty: 'Beginner',
          steps: [
            {
              id: '1',
              title: 'Wikipedia Basics',
              description: 'Learn the fundamentals of Wikipedia and its community',
              type: 'course',
              status: 'completed',
              progress: 100,
              estimatedHours: 3,
              difficulty: 'Beginner',
              skills: ['Wikipedia Navigation', 'Community Guidelines'],
              courseId: 'basics-101'
            },
            {
              id: '2',
              title: 'First Edit Workshop',
              description: 'Make your first Wikipedia edit with guidance',
              type: 'project',
              status: 'completed',
              progress: 100,
              estimatedHours: 2,
              difficulty: 'Beginner',
              skills: ['Basic Editing', 'Sandbox Usage'],
              prerequisites: ['1']
            },
            {
              id: '3',
              title: 'Article Structure & Formatting',
              description: 'Master Wikipedia markup and article organization',
              type: 'course',
              status: 'current',
              progress: 60,
              estimatedHours: 5,
              difficulty: 'Beginner',
              skills: ['Wiki Markup', 'Article Structure', 'Citations'],
              prerequisites: ['1', '2'],
              courseId: 'formatting-201'
            },
            {
              id: '4',
              title: 'Research & Verification',
              description: 'Learn to find and verify reliable sources',
              type: 'course',
              status: 'available',
              progress: 0,
              estimatedHours: 6,
              difficulty: 'Intermediate',
              skills: ['Source Verification', 'Research Methods', 'Fact Checking'],
              prerequisites: ['3']
            },
            {
              id: '5',
              title: 'Advanced Editing Techniques',
              description: 'Templates, infoboxes, and complex formatting',
              type: 'course',
              status: 'locked',
              progress: 0,
              estimatedHours: 7,
              difficulty: 'Intermediate',
              skills: ['Templates', 'Infoboxes', 'Advanced Markup'],
              prerequisites: ['4']
            },
            {
              id: '6',
              title: 'Editor Certification Assessment',
              description: 'Demonstrate your Wikipedia editing skills',
              type: 'assessment',
              status: 'locked',
              progress: 0,
              estimatedHours: 2,
              difficulty: 'Intermediate',
              skills: ['Comprehensive Editing'],
              prerequisites: ['5']
            }
          ]
        }
      ];

      return mockPaths;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="list" count={4} />
      </div>
    );
  }

  const paths = pathsData || [];
  const currentPath = paths.find(p => p.id === selectedPath) || paths[0];

  if (!currentPath) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Learning Paths Available</h3>
          <p className="text-gray-500">Check back later for structured learning paths.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'current':
        return <Play className="h-5 w-5 text-blue-600" />;
      case 'available':
        return <Target className="h-5 w-5 text-gray-400" />;
      case 'locked':
        return <Lock className="h-5 w-5 text-gray-300" />;
      default:
        return <Target className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'current':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'available':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'locked':
        return 'bg-gray-50 text-gray-400 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-4 w-4" />;
      case 'project':
        return <Target className="h-4 w-4" />;
      case 'assessment':
        return <Award className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const pathProgress = currentPath.totalSteps > 0 
    ? Math.round((currentPath.completedSteps / currentPath.totalSteps) * 100)
    : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Path Overview */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                {currentPath.title}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base mt-2">
                {currentPath.description}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={getDifficultyColor(currentPath.difficulty)}>
                {currentPath.difficulty}
              </Badge>
              <Badge variant="outline">
                {currentPath.category}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {currentPath.estimatedHours}h
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">{pathProgress}%</span>
              </div>
              <Progress value={pathProgress} className="h-3" />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">
                  {currentPath.completedSteps} of {currentPath.totalSteps} steps completed
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <TrendingUp className="h-3 w-3" />
                  On track
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Steps */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Learning Steps</h3>
        
        <div className="space-y-3">
          {currentPath.steps.map((step, index) => (
            <Card 
              key={step.id} 
              className={`transition-all duration-200 ${
                step.status === 'current' ? 'ring-2 ring-blue-200 shadow-md' : ''
              } ${step.status === 'locked' ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  {/* Step Number & Status */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getStatusColor(step.status)}`}>
                      {getStatusIcon(step.status)}
                    </div>
                    {index < currentPath.steps.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-200"></div>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-base flex items-center gap-2">
                          {getTypeIcon(step.type)}
                          {step.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getDifficultyColor(step.difficulty)} variant="outline">
                          {step.difficulty}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {step.estimatedHours}h
                        </Badge>
                      </div>
                    </div>

                    {/* Progress for current/completed steps */}
                    {(step.status === 'current' || step.status === 'completed') && step.progress > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium">Progress</span>
                          <span className="text-xs text-gray-600">{step.progress}%</span>
                        </div>
                        <Progress value={step.progress} className="h-2" />
                      </div>
                    )}

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {step.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {step.prerequisites && step.prerequisites.length > 0 && (
                          <span>Requires: Step {step.prerequisites.join(', ')}</span>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        disabled={step.status === 'locked'}
                        variant={step.status === 'completed' ? 'outline' : 'default'}
                      >
                        {step.status === 'completed' && (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Review
                          </>
                        )}
                        {step.status === 'current' && (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Continue
                          </>
                        )}
                        {step.status === 'available' && (
                          <>
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Start
                          </>
                        )}
                        {step.status === 'locked' && (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Locked
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
