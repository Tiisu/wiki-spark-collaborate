import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Search, 
  Award, 
  Calendar, 
  User,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import { Certificate, certificateApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CertificateVerificationProps {
  className?: string;
}

export const CertificateVerification: React.FC<CertificateVerificationProps> = ({ 
  className = '' 
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a verification code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await certificateApi.verifyCertificate(verificationCode.trim());
      setIsValid(response.isValid);
      setCertificate(response.certificate || null);
      setMessage(response.message);
      
      if (response.isValid) {
        toast({
          title: "Certificate Verified",
          description: "This certificate is valid and authentic",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsValid(false);
      setCertificate(null);
      setMessage('Error verifying certificate');
      toast({
        title: "Verification Error",
        description: "Failed to verify certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setVerificationCode('');
    setCertificate(null);
    setIsValid(null);
    setMessage('');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  return (
    <div className={`max-w-2xl mx-auto space-y-6 ${className}`}>
      {/* Verification Form */}
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Certificate Verification</CardTitle>
          <CardDescription>
            Enter a verification code to check if a WikiWalkthrough certificate is authentic
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="verification-code" className="text-sm font-medium">
              Verification Code
            </label>
            <div className="flex space-x-2">
              <Input
                id="verification-code"
                placeholder="e.g., WWT-2024-A1B2C3D4"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                className="font-mono"
                disabled={loading}
              />
              <Button 
                onClick={handleVerify} 
                disabled={loading || !verificationCode.trim()}
              >
                {loading ? (
                  <>Verifying...</>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Verify
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Verification codes are in the format: WWT-YYYY-XXXXXXXX
            </p>
          </div>

          {/* Reset Button */}
          {(certificate || isValid !== null) && (
            <Button variant="outline" onClick={handleReset} className="w-full">
              Verify Another Certificate
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Verification Result */}
      {isValid !== null && (
        <Card className={`border-2 ${
          isValid 
            ? 'border-green-200 bg-green-50' 
            : 'border-red-200 bg-red-50'
        }`}>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                isValid 
                  ? 'bg-green-100' 
                  : 'bg-red-100'
              }`}>
                {isValid ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
              </div>
              
              <div>
                <h3 className={`text-xl font-bold ${
                  isValid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {isValid ? 'Certificate Verified' : 'Verification Failed'}
                </h3>
                <p className={`text-sm ${
                  isValid ? 'text-green-700' : 'text-red-700'
                }`}>
                  {message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificate Details */}
      {isValid && certificate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-blue-600" />
              <span>Certificate Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Course Information */}
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">{certificate.courseName}</h4>
              <div className="flex items-center space-x-2">
                <Badge className={getLevelColor(certificate.courseLevel)}>
                  {certificate.courseLevel}
                </Badge>
                <Badge variant="outline">
                  WikiWalkthrough Platform
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Recipient and Instructor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Recipient</span>
                </div>
                <div className="font-medium">
                  {(certificate as any).user?.firstName} {(certificate as any).user?.lastName}
                </div>
                <div className="text-sm text-muted-foreground">
                  @{(certificate as any).user?.username}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">Instructor</span>
                </div>
                <div className="font-medium">
                  {certificate.instructorName}
                </div>
              </div>
            </div>

            <Separator />

            {/* Dates and Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Completion Date</span>
                </div>
                <div className="font-medium">
                  {formatDate(certificate.completionDate)}
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Issue Date</span>
                </div>
                <div className="font-medium">
                  {formatDate(certificate.issuedAt)}
                </div>
              </div>

              {certificate.finalScore && (
                <div>
                  <div className="text-muted-foreground mb-1">Final Score</div>
                  <div className="font-medium text-green-600">
                    {certificate.finalScore}%
                  </div>
                </div>
              )}

              <div>
                <div className="text-muted-foreground mb-1">Time Spent</div>
                <div className="font-medium">
                  {Math.round(certificate.timeSpent / 60)} hours
                </div>
              </div>
            </div>

            <Separator />

            {/* Course Statistics */}
            <div className="space-y-2">
              <h5 className="font-medium">Course Statistics</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Lessons: </span>
                  <span className="font-medium">
                    {certificate.metadata.completedLessons}/{certificate.metadata.totalLessons}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Quizzes: </span>
                  <span className="font-medium">
                    {certificate.metadata.passedQuizzes}/{certificate.metadata.totalQuizzes}
                  </span>
                </div>
              </div>
              {certificate.metadata.averageQuizScore && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Average Quiz Score: </span>
                  <span className="font-medium">{certificate.metadata.averageQuizScore}%</span>
                </div>
              )}
            </div>

            {/* Verification Code */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Verification Code</div>
              <div className="font-mono text-sm font-medium">
                {certificate.verificationCode}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium text-blue-900">About Certificate Verification</h4>
              <p className="text-sm text-blue-800">
                WikiWalkthrough certificates are issued with unique verification codes that can be 
                used to confirm their authenticity. Each certificate represents successful completion 
                of a Wikipedia education course on our platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
