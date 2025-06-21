import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  Target, 
  Shuffle,
  MessageSquare,
  BarChart3,
  Award,
  Users,
  BookOpen,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedQuizSummaryProps {
  className?: string;
}

export function EnhancedQuizSummary({ className }: EnhancedQuizSummaryProps) {
  const features = [
    {
      category: "Question Types",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      items: [
        "Multiple Choice with single/multiple answers",
        "True/False questions",
        "Fill-in-the-blank with multiple blanks",
        "Short Answer with keyword matching",
        "Essay questions with rubrics",
        "Matching questions for concept pairing",
        "Ordering questions for sequence learning"
      ]
    },
    {
      category: "Randomization & Security",
      icon: Shuffle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      items: [
        "Question order randomization",
        "Answer option shuffling",
        "Question bank with random selection",
        "Configurable questions per attempt",
        "Prevents cheating through variation"
      ]
    },
    {
      category: "Immediate Feedback",
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      items: [
        "Instant answer validation",
        "Detailed explanations for each question",
        "Correct answer display",
        "Keyword highlighting for short answers",
        "Rubric display for essay questions",
        "Time spent per question tracking"
      ]
    },
    {
      category: "Advanced Scoring",
      icon: Award,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      items: [
        "Weighted question scoring",
        "Partial credit for short answers",
        "Difficulty-based point allocation",
        "Raw and weighted score calculation",
        "Automatic grading for objective questions",
        "Manual grading support for essays"
      ]
    },
    {
      category: "Time Management",
      icon: Clock,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      items: [
        "Configurable time limits",
        "Real-time countdown timer",
        "Time warnings at intervals",
        "Automatic submission on timeout",
        "Grace period for network delays",
        "Time tracking per question"
      ]
    },
    {
      category: "Attempt Control",
      icon: Target,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
      items: [
        "Maximum attempt restrictions",
        "Attempt validation and tracking",
        "Progress saving for incomplete attempts",
        "Retry policies and cooldowns",
        "Attempt history and comparison",
        "Best score tracking"
      ]
    },
    {
      category: "Analytics & Progress",
      icon: BarChart3,
      color: "text-teal-600",
      bgColor: "bg-teal-100 dark:bg-teal-900/20",
      items: [
        "Comprehensive quiz analytics",
        "Student progress tracking",
        "Question-level performance analysis",
        "Score distribution charts",
        "Time analytics and trends",
        "Weakness identification and recommendations"
      ]
    },
    {
      category: "Instructor Tools",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      items: [
        "Detailed grading analytics dashboard",
        "Student performance insights",
        "Question difficulty analysis",
        "Bulk operations and management",
        "Exportable reports (PDF/CSV)",
        "Real-time monitoring and alerts"
      ]
    }
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Enhanced Quiz System</CardTitle>
          <CardDescription className="text-lg">
            Comprehensive quiz functionality with advanced features for the WikiWalkthrough platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">7</div>
              <div className="text-sm text-muted-foreground">Question Types</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">5</div>
              <div className="text-sm text-muted-foreground">Randomization Features</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">6</div>
              <div className="text-sm text-muted-foreground">Feedback Features</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">6</div>
              <div className="text-sm text-muted-foreground">Analytics Tools</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Card key={index} className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", feature.bgColor)}>
                    <IconComponent className={cn("h-5 w-5", feature.color)} />
                  </div>
                  <span>{feature.category}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Implementation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Implementation Status</span>
          </CardTitle>
          <CardDescription>
            All enhanced quiz features have been successfully implemented
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                Backend Models
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                API Endpoints
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                Frontend Components
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                Analytics Dashboard
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Recommended actions to complete the enhanced quiz system integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <p className="font-medium text-sm">Test the Enhanced Features</p>
                <p className="text-sm text-muted-foreground">
                  Create test quizzes with different question types and validate all functionality
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <p className="font-medium text-sm">Update Database Migrations</p>
                <p className="text-sm text-muted-foreground">
                  Run database migrations to add new fields for enhanced quiz features
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <p className="font-medium text-sm">Integrate with Existing Lessons</p>
                <p className="text-sm text-muted-foreground">
                  Update lesson components to use the enhanced quiz system
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">4</div>
              <div>
                <p className="font-medium text-sm">Add Unit Tests</p>
                <p className="text-sm text-muted-foreground">
                  Write comprehensive tests for all new quiz functionality
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
