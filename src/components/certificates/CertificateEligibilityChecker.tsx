import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trophy, 
  BookOpen, 
  Target,
  AlertTriangle,
  Award,
  RefreshCw,
  Download
} from 'lucide-react';
import { certificateApi } from '@/lib/api';

interface CertificateEligibilityProps {
  courseId: string;
  userId?: string;
  onCertificateGenerated?: (certificate: any) => void;
  className?: string;
}

interface EligibilityData {
  eligible: boolean;
  reason?: string;
  requirements: {
    courseCompleted: boolean;
    requiredQuizzesPassed: boolean;
    minimumTimeSpent: boolean;
    minimumScore?: number;
    hasValidEnrollment: boolean;
    noDuplicateCertificate: boolean;
  };
  details: {
    progress: number;
    timeSpent: number;
    averageScore?: number;
    requiredQuizzes: number;
    passedQuizzes: number;
    missingRequirements: string[];
  };
}

export const CertificateEligibilityChecker: React.FC<CertificateEligibilityProps> = ({
  courseId,
  userId,
  onCertificateGenerated,
  className = ''
}) => {
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkEligibility();
  }, [courseId, userId]);

  const checkEligibility = async () => {
    try {
      setLoading(true);
      const response = await certificateApi.getDetailedEligibility(courseId, userId);
      setEligibility(response.eligibility);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check certificate eligibility",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async () => {
    try {
      setGenerating(true);
      const response = await certificateApi.triggerAutomaticGeneration(courseId, userId);
      
      if (response.generated) {
        toast({
          title: "Success",
          description: "Certificate generated successfully!",
        });
        onCertificateGenerated?.(response.certificate);
        await checkEligibility(); // Refresh eligibility status
      } else {
        toast({
          title: "Generation Failed",
          description: response.reason || "Failed to generate certificate",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate certificate",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const RequirementItem: React.FC<{
    met: boolean;
    title: string;
    description: string;
    icon: React.ReactNode;
  }> = ({ met, title, description, icon }) => (
    <div className="flex items-start space-x-3 p-3 rounded-lg border">
      <div className={`flex-shrink-0 ${met ? 'text-green-600' : 'text-red-600'}`}>
        {met ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          {icon}
          <h4 className="font-medium">{title}</h4>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!eligibility) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unable to Check Eligibility</h3>
          <p className="text-muted-foreground mb-4">
            There was an error checking your certificate eligibility.
          </p>
          <Button onClick={checkEligibility} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Award className="h-5 w-5" />
          <span>Certificate Eligibility</span>
          <Button
            variant="outline"
            size="sm"
            onClick={checkEligibility}
            className="ml-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Check your progress towards earning a certificate for this course
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Eligibility Status */}
        <Alert className={eligibility.eligible ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
          <div className="flex items-center space-x-2">
            {eligibility.eligible ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            <div className="flex-1">
              <h4 className="font-medium">
                {eligibility.eligible ? 'Eligible for Certificate!' : 'Not Yet Eligible'}
              </h4>
              <AlertDescription className="mt-1">
                {eligibility.eligible 
                  ? 'Congratulations! You meet all requirements for a certificate.'
                  : eligibility.reason || 'Complete the missing requirements to earn your certificate.'
                }
              </AlertDescription>
            </div>
          </div>
        </Alert>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{eligibility.details.progress}%</div>
            <div className="text-sm text-muted-foreground">Course Progress</div>
            <Progress value={eligibility.details.progress} className="mt-2" />
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {eligibility.details.passedQuizzes}/{eligibility.details.requiredQuizzes}
            </div>
            <div className="text-sm text-muted-foreground">Quizzes Passed</div>
            <Progress 
              value={eligibility.details.requiredQuizzes > 0 
                ? (eligibility.details.passedQuizzes / eligibility.details.requiredQuizzes) * 100 
                : 100
              } 
              className="mt-2" 
            />
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(eligibility.details.timeSpent / 60)}h
            </div>
            <div className="text-sm text-muted-foreground">Time Spent</div>
            {eligibility.details.averageScore && (
              <div className="text-sm font-medium mt-1">
                Avg Score: {Math.round(eligibility.details.averageScore)}%
              </div>
            )}
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className="space-y-3">
          <h4 className="font-medium">Requirements Checklist</h4>
          
          <RequirementItem
            met={eligibility.requirements.hasValidEnrollment}
            title="Valid Enrollment"
            description="You must be enrolled in the course"
            icon={<BookOpen className="h-4 w-4" />}
          />
          
          <RequirementItem
            met={eligibility.requirements.courseCompleted}
            title="Course Completion"
            description={`Complete 100% of course content (${eligibility.details.progress}% completed)`}
            icon={<Target className="h-4 w-4" />}
          />
          
          <RequirementItem
            met={eligibility.requirements.requiredQuizzesPassed}
            title="Required Quizzes"
            description={`Pass all required quizzes (${eligibility.details.passedQuizzes}/${eligibility.details.requiredQuizzes} passed)`}
            icon={<Trophy className="h-4 w-4" />}
          />
          
          <RequirementItem
            met={eligibility.requirements.minimumTimeSpent}
            title="Minimum Study Time"
            description={`Spend adequate time studying the course material`}
            icon={<Clock className="h-4 w-4" />}
          />
          
          <RequirementItem
            met={eligibility.requirements.noDuplicateCertificate}
            title="No Existing Certificate"
            description="You haven't already received a certificate for this course"
            icon={<Award className="h-4 w-4" />}
          />
        </div>

        {/* Missing Requirements */}
        {eligibility.details.missingRequirements.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-600">Missing Requirements</h4>
            <div className="space-y-1">
              {eligibility.details.missingRequirements.map((requirement, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-red-600">
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{requirement}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4">
          {eligibility.eligible ? (
            <Button 
              onClick={generateCertificate} 
              disabled={generating}
              className="w-full"
              size="lg"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Certificate...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Certificate
                </>
              )}
            </Button>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Complete the missing requirements above to earn your certificate
              </p>
              <Button variant="outline" onClick={checkEligibility}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Progress
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
