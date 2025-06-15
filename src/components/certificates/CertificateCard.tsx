import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Award, 
  Download, 
  Share2, 
  ExternalLink, 
  Calendar, 
  Clock, 
  Trophy,
  CheckCircle,
  Star
} from 'lucide-react';
import { Certificate } from '@/lib/api';

interface CertificateCardProps {
  certificate: Certificate;
  onDownload?: () => void;
  onShare?: () => void;
  onView?: () => void;
  className?: string;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  onDownload,
  onShare,
  onView,
  className = ''
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const getLevelColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCompletionRate = (): number => {
    if (certificate.metadata.totalLessons === 0) return 100;
    return Math.round((certificate.metadata.completedLessons / certificate.metadata.totalLessons) * 100);
  };

  const getQuizPassRate = (): number => {
    if (certificate.metadata.totalQuizzes === 0) return 100;
    return Math.round((certificate.metadata.passedQuizzes / certificate.metadata.totalQuizzes) * 100);
  };

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {/* Certificate Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Certificate of Completion</h3>
              <p className="text-blue-100">WikiWalkthrough Platform</p>
            </div>
          </div>
          {certificate.isValid ? (
            <div className="flex items-center space-x-1 bg-green-500/20 px-2 py-1 rounded-full">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Valid</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 bg-red-500/20 px-2 py-1 rounded-full">
              <span className="text-sm">Revoked</span>
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Course Information */}
        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-gray-900">
            {certificate.courseName}
          </h4>
          <div className="flex items-center space-x-2">
            <Badge className={getLevelColor(certificate.courseLevel)}>
              {certificate.courseLevel}
            </Badge>
            <Badge variant="outline">
              Wikipedia Education
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Certificate Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Completed</span>
            </div>
            <div className="font-medium">
              {formatDate(certificate.completionDate)}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Time Spent</span>
            </div>
            <div className="font-medium">
              {formatTime(certificate.timeSpent)}
            </div>
          </div>

          {certificate.finalScore && (
            <>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Star className="h-4 w-4" />
                  <span>Final Score</span>
                </div>
                <div className="font-medium text-green-600">
                  {certificate.finalScore}%
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>Instructor</span>
            </div>
            <div className="font-medium">
              {certificate.instructorName}
            </div>
          </div>
        </div>

        <Separator />

        {/* Course Statistics */}
        <div className="space-y-3">
          <h5 className="font-medium text-gray-900">Course Statistics</h5>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex justify-between mb-1">
                <span>Lessons Completed</span>
                <span>{certificate.metadata.completedLessons}/{certificate.metadata.totalLessons}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${getCompletionRate()}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Quizzes Passed</span>
                <span>{certificate.metadata.passedQuizzes}/{certificate.metadata.totalQuizzes}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${getQuizPassRate()}%` }}
                />
              </div>
            </div>
          </div>

          {certificate.metadata.averageQuizScore && (
            <div className="text-sm">
              <span className="text-muted-foreground">Average Quiz Score: </span>
              <span className="font-medium">{certificate.metadata.averageQuizScore}%</span>
            </div>
          )}
        </div>

        {/* Achievements */}
        {certificate.metadata.achievements.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h5 className="font-medium text-gray-900">Achievements Earned</h5>
              <div className="flex flex-wrap gap-1">
                {certificate.metadata.achievements.slice(0, 3).map((achievement, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {achievement.replace('_', ' ')}
                  </Badge>
                ))}
                {certificate.metadata.achievements.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{certificate.metadata.achievements.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Verification Code */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Verification Code</div>
          <div className="font-mono text-sm font-medium">
            {certificate.verificationCode}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          {onView && (
            <Button variant="outline" onClick={onView} className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Certificate
            </Button>
          )}
          
          {onDownload && (
            <Button variant="outline" onClick={onDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          )}
          
          {onShare && (
            <Button variant="outline" onClick={onShare} className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </div>

        {/* Issue Date */}
        <div className="text-xs text-muted-foreground text-center pt-2">
          Issued on {formatDate(certificate.issuedAt)}
        </div>
      </CardContent>
    </Card>
  );
};
