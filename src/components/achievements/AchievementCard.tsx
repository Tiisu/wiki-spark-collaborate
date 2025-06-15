import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Star, 
  Award, 
  BookOpen, 
  Edit, 
  Link, 
  Users, 
  Globe,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Achievement } from '@/lib/api';

interface AchievementCardProps {
  achievement: Achievement;
  isEarned?: boolean;
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

const getBadgeIcon = (badgeType: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    // Wikipedia Basics
    'FIRST_EDIT': <Edit className="h-6 w-6" />,
    'ACCOUNT_CREATOR': <Users className="h-6 w-6" />,
    'SANDBOX_EXPLORER': <BookOpen className="h-6 w-6" />,
    
    // Content Creation
    'ARTICLE_CREATOR': <Edit className="h-6 w-6" />,
    'CONTENT_CONTRIBUTOR': <BookOpen className="h-6 w-6" />,
    'FORMATTING_MASTER': <Star className="h-6 w-6" />,
    'TEMPLATE_EXPERT': <Star className="h-6 w-6" />,
    
    // Sourcing & Citations
    'CITATION_MASTER': <Link className="h-6 w-6" />,
    'SOURCE_HUNTER': <Target className="h-6 w-6" />,
    'REFERENCE_EXPERT': <Link className="h-6 w-6" />,
    'FACT_CHECKER': <CheckCircle className="h-6 w-6" />,
    
    // Community & Policy
    'POLICY_EXPERT': <Award className="h-6 w-6" />,
    'TALK_PAGE_NAVIGATOR': <Users className="h-6 w-6" />,
    'CONSENSUS_BUILDER': <Users className="h-6 w-6" />,
    'DISPUTE_RESOLVER': <Users className="h-6 w-6" />,
    
    // Sister Projects
    'COMMONS_CONTRIBUTOR': <Globe className="h-6 w-6" />,
    'WIKTIONARY_EDITOR': <BookOpen className="h-6 w-6" />,
    'WIKIBOOKS_AUTHOR': <BookOpen className="h-6 w-6" />,
    'WIKINEWS_REPORTER': <Globe className="h-6 w-6" />,
    
    // Learning Milestones
    'COURSE_COMPLETER': <Trophy className="h-6 w-6" />,
    'QUIZ_MASTER': <Star className="h-6 w-6" />,
    'PERFECT_SCORE': <Trophy className="h-6 w-6" />,
    'SPEED_LEARNER': <Clock className="h-6 w-6" />,
    'DEDICATED_LEARNER': <Clock className="h-6 w-6" />,
    
    // Default
    'default': <Award className="h-6 w-6" />
  };

  return iconMap[badgeType] || iconMap['default'];
};

const getBadgeColor = (badgeType: string) => {
  const colorMap: Record<string, string> = {
    // Wikipedia Basics - Blue
    'FIRST_EDIT': 'bg-blue-100 text-blue-600 border-blue-200',
    'ACCOUNT_CREATOR': 'bg-blue-100 text-blue-600 border-blue-200',
    'SANDBOX_EXPLORER': 'bg-blue-100 text-blue-600 border-blue-200',
    
    // Content Creation - Green
    'ARTICLE_CREATOR': 'bg-green-100 text-green-600 border-green-200',
    'CONTENT_CONTRIBUTOR': 'bg-green-100 text-green-600 border-green-200',
    'FORMATTING_MASTER': 'bg-green-100 text-green-600 border-green-200',
    'TEMPLATE_EXPERT': 'bg-green-100 text-green-600 border-green-200',
    
    // Sourcing & Citations - Purple
    'CITATION_MASTER': 'bg-purple-100 text-purple-600 border-purple-200',
    'SOURCE_HUNTER': 'bg-purple-100 text-purple-600 border-purple-200',
    'REFERENCE_EXPERT': 'bg-purple-100 text-purple-600 border-purple-200',
    'FACT_CHECKER': 'bg-purple-100 text-purple-600 border-purple-200',
    
    // Community & Policy - Orange
    'POLICY_EXPERT': 'bg-orange-100 text-orange-600 border-orange-200',
    'TALK_PAGE_NAVIGATOR': 'bg-orange-100 text-orange-600 border-orange-200',
    'CONSENSUS_BUILDER': 'bg-orange-100 text-orange-600 border-orange-200',
    'DISPUTE_RESOLVER': 'bg-orange-100 text-orange-600 border-orange-200',
    
    // Sister Projects - Teal
    'COMMONS_CONTRIBUTOR': 'bg-teal-100 text-teal-600 border-teal-200',
    'WIKTIONARY_EDITOR': 'bg-teal-100 text-teal-600 border-teal-200',
    'WIKIBOOKS_AUTHOR': 'bg-teal-100 text-teal-600 border-teal-200',
    'WIKINEWS_REPORTER': 'bg-teal-100 text-teal-600 border-teal-200',
    
    // Learning Milestones - Gold
    'COURSE_COMPLETER': 'bg-yellow-100 text-yellow-600 border-yellow-200',
    'QUIZ_MASTER': 'bg-yellow-100 text-yellow-600 border-yellow-200',
    'PERFECT_SCORE': 'bg-yellow-100 text-yellow-600 border-yellow-200',
    'SPEED_LEARNER': 'bg-yellow-100 text-yellow-600 border-yellow-200',
    'DEDICATED_LEARNER': 'bg-yellow-100 text-yellow-600 border-yellow-200',
    
    // Default
    'default': 'bg-gray-100 text-gray-600 border-gray-200'
  };

  return colorMap[badgeType] || colorMap['default'];
};

const getCategoryName = (badgeType: string): string => {
  if (['FIRST_EDIT', 'ACCOUNT_CREATOR', 'SANDBOX_EXPLORER'].includes(badgeType)) {
    return 'Wikipedia Basics';
  }
  if (['ARTICLE_CREATOR', 'CONTENT_CONTRIBUTOR', 'FORMATTING_MASTER', 'TEMPLATE_EXPERT'].includes(badgeType)) {
    return 'Content Creation';
  }
  if (['CITATION_MASTER', 'SOURCE_HUNTER', 'REFERENCE_EXPERT', 'FACT_CHECKER'].includes(badgeType)) {
    return 'Sourcing & Citations';
  }
  if (['POLICY_EXPERT', 'TALK_PAGE_NAVIGATOR', 'CONSENSUS_BUILDER', 'DISPUTE_RESOLVER'].includes(badgeType)) {
    return 'Community & Policy';
  }
  if (['COMMONS_CONTRIBUTOR', 'WIKTIONARY_EDITOR', 'WIKIBOOKS_AUTHOR', 'WIKINEWS_REPORTER'].includes(badgeType)) {
    return 'Sister Projects';
  }
  if (['COURSE_COMPLETER', 'QUIZ_MASTER', 'PERFECT_SCORE', 'SPEED_LEARNER', 'DEDICATED_LEARNER'].includes(badgeType)) {
    return 'Learning Milestones';
  }
  return 'Other';
};

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  isEarned = true,
  showProgress = false,
  progress = 0,
  className = ''
}) => {
  const badgeColor = getBadgeColor(achievement.badgeType);
  const categoryName = getCategoryName(achievement.badgeType);
  
  return (
    <Card className={`relative transition-all duration-200 hover:shadow-md ${
      isEarned ? '' : 'opacity-60 grayscale'
    } ${className}`}>
      {isEarned && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${badgeColor}`}>
            {getBadgeIcon(achievement.badgeType)}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight">
              {achievement.title}
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              {achievement.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Category Badge */}
        <Badge variant="outline" className="text-xs">
          {categoryName}
        </Badge>

        {/* Achievement Metadata */}
        {achievement.metadata && (
          <div className="space-y-2 text-xs text-muted-foreground">
            {achievement.metadata.score && (
              <div className="flex justify-between">
                <span>Score:</span>
                <span className="font-medium">{achievement.metadata.score}%</span>
              </div>
            )}
            {achievement.metadata.courseTitle && (
              <div className="flex justify-between">
                <span>Course:</span>
                <span className="font-medium truncate ml-2">
                  {achievement.metadata.courseTitle}
                </span>
              </div>
            )}
            {achievement.metadata.quizTitle && (
              <div className="flex justify-between">
                <span>Quiz:</span>
                <span className="font-medium truncate ml-2">
                  {achievement.metadata.quizTitle}
                </span>
              </div>
            )}
            {achievement.metadata.timeSpent && (
              <div className="flex justify-between">
                <span>Time:</span>
                <span className="font-medium">
                  {Math.round(achievement.metadata.timeSpent / 60)}m
                </span>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar (for unearned achievements) */}
        {showProgress && !isEarned && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Earned Date */}
        {isEarned && (
          <div className="text-xs text-muted-foreground">
            Earned {new Date(achievement.earnedAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
