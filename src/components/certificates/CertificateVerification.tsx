import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  CheckCircle,
  XCircle,
  Search,
  Award,
  Calendar,
  User,
  BookOpen,
  AlertTriangle,
  Download,
  Share2,
  ExternalLink,
  Clock,
  Trophy,
  Star,
  QrCode,
  Copy,
  RefreshCw
} from 'lucide-react';
import { Certificate, certificateApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CertificateVerificationProps {
  className?: string;
  initialCode?: string; // For direct verification via URL
  showActions?: boolean; // Show download/share actions
  embedded?: boolean; // For embedded verification widget
}

export const CertificateVerification: React.FC<CertificateVerificationProps> = ({
  className = '',
  initialCode = '',
  showActions = true,
  embedded = false
}) => {
  const [verificationCode, setVerificationCode] = useState(initialCode);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationCount, setVerificationCount] = useState(0);
  const { toast } = useToast();

  // Auto-verify if initial code is provided
  useEffect(() => {
    if (initialCode) {
      handleVerify();
    }
  }, [initialCode]);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      if (!initialCode) { // Don't show error for auto-verification
        toast({
          title: "Error",
          description: "Please enter a verification code",
          variant: "destructive",
        });
      }
      return;
    }

    setLoading(true);
    try {
      const response = await certificateApi.verifyCertificate(verificationCode.trim());
      setIsValid(response.isValid);
      setCertificate(response.certificate || null);
      setMessage(response.message);

      // Update verification count if certificate is valid
      if (response.isValid && response.certificate) {
        setVerificationCount(response.certificate.verification?.verificationCount || 0);
      }

      if (response.isValid && !embedded) {
        toast({
          title: "Certificate Verified",
          description: "This certificate is valid and authentic",
        });
      } else if (!response.isValid && !embedded) {
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
      if (!embedded) {
        toast({
          title: "Verification Error",
          description: "Failed to verify certificate. Please try again.",
          variant: "destructive",
        });
      }
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

  const copyVerificationLink = async () => {
    if (!certificate) return;

    const verificationUrl = `${window.location.origin}/verify/${certificate.verificationCode}`;
    try {
      await navigator.clipboard.writeText(verificationUrl);
      toast({
        title: "Link Copied",
        description: "Verification link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const shareOnSocialMedia = (platform: 'linkedin' | 'twitter' | 'facebook') => {
    if (!certificate) return;

    const verificationUrl = `${window.location.origin}/verify/${certificate.verificationCode}`;
    const text = `Check out this verified certificate for "${certificate.courseName}" from WikiWalkthrough!`;

    let shareUrl = '';
    switch (platform) {
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(verificationUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(verificationUrl)}`;
        break;
    }

    window.open(shareUrl, '_blank');
  };

  const downloadCertificate = async () => {
    if (!certificate) return;

    try {
      const response = await fetch(`/api/certificates/${certificate._id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${certificate.courseName}_Certificate.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Certificate downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download certificate. You may need to be logged in.",
        variant: "destructive",
      });
    }
  };

  const getCompletionRate = (): number => {
    if (!certificate || certificate.metadata.totalLessons === 0) return 100;
    return Math.round((certificate.metadata.completedLessons / certificate.metadata.totalLessons) * 100);
  };

  const getQuizPassRate = (): number => {
    if (!certificate || certificate.metadata.totalQuizzes === 0) return 100;
    return Math.round((certificate.metadata.passedQuizzes / certificate.metadata.totalQuizzes) * 100);
  };

  return (
    <div className={`${embedded ? 'space-y-4' : 'max-w-2xl mx-auto space-y-6'} ${className}`}>
      {/* Verification Form */}
      {!embedded && (
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
                  onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                />
                <Button
                  onClick={handleVerify}
                  disabled={loading || !verificationCode.trim()}
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
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
      )}

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
        <Card className="overflow-hidden">
          {/* Certificate Header with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Verified Certificate</h3>
                  <p className="text-blue-100">WikiWalkthrough Platform</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 bg-green-500/20 px-3 py-1 rounded-full">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Authentic</span>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Course Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-xl text-gray-900">{certificate.courseName}</h4>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getLevelColor(certificate.courseLevel)}>
                  {certificate.courseLevel}
                </Badge>
                <Badge variant="outline">
                  {certificate.courseCategory || 'Wikipedia Education'}
                </Badge>
                {certificate.metadata.wikipediaProject && (
                  <Badge variant="secondary">
                    {certificate.metadata.wikipediaProject}
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Recipient and Instructor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Certificate Holder</span>
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    {certificate.studentName || `${(certificate as any).user?.firstName} ${(certificate as any).user?.lastName}`}
                  </div>
                  {(certificate as any).user?.username && (
                    <div className="text-sm text-muted-foreground">
                      @{(certificate as any).user?.username}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm font-medium">Course Instructor</span>
                </div>
                <div className="font-semibold text-lg">
                  {certificate.instructorName}
                </div>
              </div>
            </div>

            <Separator />

            {/* Achievement Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{getCompletionRate()}%</div>
                <div className="text-sm text-muted-foreground">Course Progress</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {certificate.metadata.passedQuizzes}/{certificate.metadata.totalQuizzes}
                </div>
                <div className="text-sm text-muted-foreground">Quizzes Passed</div>
              </div>

              {certificate.finalScore && (
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{certificate.finalScore}%</div>
                  <div className="text-sm text-muted-foreground">Final Score</div>
                </div>
              )}

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(certificate.timeSpent / 60)}h
                </div>
                <div className="text-sm text-muted-foreground">Study Time</div>
              </div>
            </div>

            {/* Dates and Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Important Dates</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Completed:</span>
                    <span className="text-sm font-medium">{formatDate(certificate.completionDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Issued:</span>
                    <span className="text-sm font-medium">{formatDate(certificate.issuedAt)}</span>
                  </div>
                  {certificate.metadata.enrollmentDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Enrolled:</span>
                      <span className="text-sm font-medium">{formatDate(certificate.metadata.enrollmentDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm font-medium">Verification Stats</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Verified:</span>
                    <span className="text-sm font-medium">{verificationCount} times</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Downloads:</span>
                    <span className="text-sm font-medium">{certificate.downloadCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant="outline" className="text-xs">
                      {certificate.status || 'GENERATED'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Course Progress Details */}
            <div className="space-y-4">
              <h5 className="font-semibold text-gray-900">Course Progress Details</h5>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Lessons Completed</span>
                    <span className="font-medium">
                      {certificate.metadata.completedLessons}/{certificate.metadata.totalLessons}
                    </span>
                  </div>
                  <Progress value={getCompletionRate()} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Quizzes Passed</span>
                    <span className="font-medium">
                      {certificate.metadata.passedQuizzes}/{certificate.metadata.totalQuizzes}
                    </span>
                  </div>
                  <Progress value={getQuizPassRate()} className="h-2" />
                </div>
              </div>

              {certificate.metadata.averageQuizScore && (
                <div className="flex items-center space-x-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-muted-foreground">Average Quiz Score:</span>
                  <span className="font-semibold text-yellow-600">{certificate.metadata.averageQuizScore}%</span>
                </div>
              )}
            </div>

            {/* Skills Acquired */}
            {certificate.metadata.skillsAcquired && certificate.metadata.skillsAcquired.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-900">Skills Acquired</h5>
                  <div className="flex flex-wrap gap-2">
                    {certificate.metadata.skillsAcquired.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Achievements */}
            {certificate.metadata.achievements.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-900">Achievements Earned</h5>
                  <div className="flex flex-wrap gap-2">
                    {certificate.metadata.achievements.map((achievement, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Trophy className="h-3 w-3 mr-1" />
                        {achievement.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            {showActions && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-900">Actions</h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Button variant="outline" onClick={downloadCertificate} className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>

                    <Button variant="outline" onClick={copyVerificationLink} className="flex-1">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>

                    <Button variant="outline" onClick={() => shareOnSocialMedia('linkedin')} className="flex-1">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>

                    <Button variant="outline" onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certificate.verification.verificationUrl)}`, '_blank')} className="flex-1">
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Code
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Verification Code */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900 mb-1">Verification Code</div>
                  <div className="font-mono text-lg font-bold text-blue-600">
                    {certificate.verificationCode}
                  </div>
                  {certificate.certificateId && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Certificate ID: {certificate.certificateId}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyVerificationLink()}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Verification URL */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Verify this certificate at:
                <br />
                <a
                  href={certificate.verification.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline break-all"
                >
                  {certificate.verification.verificationUrl}
                </a>
              </p>
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
