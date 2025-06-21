import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Copy, 
  Mail, 
  MessageCircle, 
  Linkedin, 
  Twitter, 
  Facebook,
  Link,
  QrCode,
  Download,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { Certificate } from '@/lib/api';

interface CertificateShareProps {
  certificate: Certificate;
  className?: string;
}

export const CertificateShare: React.FC<CertificateShareProps> = ({
  certificate,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const { toast } = useToast();

  const verificationUrl = `${window.location.origin}/verify/${certificate.verificationCode}`;
  const shareableUrl = certificate.shareableUrl || verificationUrl;

  const defaultMessage = `🎓 I'm excited to share that I've completed "${certificate.courseName}" on WikiWalkthrough and earned my certificate! 

This course helped me develop skills in Wikipedia editing and contribution. Check out my certificate: ${shareableUrl}

#WikiWalkthrough #Wikipedia #OnlineLearning #Certificate`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Certificate: ${certificate.courseName}`);
    const body = encodeURIComponent(customMessage || defaultMessage);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaLinkedIn = () => {
    const url = encodeURIComponent(shareableUrl);
    const title = encodeURIComponent(`Certificate: ${certificate.courseName}`);
    const summary = encodeURIComponent(`I've completed ${certificate.courseName} on WikiWalkthrough and earned my certificate!`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank');
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent(`🎓 Just earned my certificate for "${certificate.courseName}" on WikiWalkthrough! ${shareableUrl} #WikiWalkthrough #Certificate`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareViaFacebook = () => {
    const url = encodeURIComponent(shareableUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareViaNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate: ${certificate.courseName}`,
          text: customMessage || defaultMessage,
          url: shareableUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    }
  };

  const generateQRCode = () => {
    // This would typically use a QR code library
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareableUrl)}`;
    window.open(qrUrl, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Share2 className="h-4 w-4 mr-2" />
          Share Certificate
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Share Your Certificate</span>
          </DialogTitle>
          <DialogDescription>
            Share your achievement with friends, colleagues, and on social media
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Certificate Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{certificate.courseName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Completed on {new Date(certificate.completionDate).toLocaleDateString()}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary">{certificate.courseLevel}</Badge>
                    {certificate.finalScore && (
                      <Badge variant="outline">Score: {certificate.finalScore}%</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Share URL */}
          <div className="space-y-2">
            <Label htmlFor="share-url">Certificate Verification URL</Label>
            <div className="flex space-x-2">
              <Input
                id="share-url"
                value={shareableUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(shareableUrl)}
                className="flex-shrink-0"
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can verify your certificate
            </p>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="custom-message">Custom Message (Optional)</Label>
            <Textarea
              id="custom-message"
              placeholder={defaultMessage}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Social Media Sharing */}
          <div className="space-y-3">
            <Label>Share on Social Media</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={shareViaLinkedIn}
                className="flex flex-col items-center space-y-1 h-auto py-3"
              >
                <Linkedin className="h-5 w-5 text-blue-600" />
                <span className="text-xs">LinkedIn</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={shareViaTwitter}
                className="flex flex-col items-center space-y-1 h-auto py-3"
              >
                <Twitter className="h-5 w-5 text-blue-400" />
                <span className="text-xs">Twitter</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={shareViaFacebook}
                className="flex flex-col items-center space-y-1 h-auto py-3"
              >
                <Facebook className="h-5 w-5 text-blue-700" />
                <span className="text-xs">Facebook</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={shareViaEmail}
                className="flex flex-col items-center space-y-1 h-auto py-3"
              >
                <Mail className="h-5 w-5 text-gray-600" />
                <span className="text-xs">Email</span>
              </Button>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="space-y-3">
            <Label>Additional Actions</Label>
            <div className="flex flex-wrap gap-2">
              {navigator.share && (
                <Button variant="outline" onClick={shareViaNative}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Native Share
                </Button>
              )}
              
              <Button variant="outline" onClick={generateQRCode}>
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open(shareableUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public
              </Button>
            </div>
          </div>

          {/* Verification Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Certificate Verification</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your certificate can be verified using the verification code: 
                    <span className="font-mono font-medium ml-1">{certificate.verificationCode}</span>
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    This ensures the authenticity and validity of your achievement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Sharing Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Add your certificate to your LinkedIn profile under "Licenses & Certifications"</li>
                <li>• Include it in your resume or CV to showcase your Wikipedia editing skills</li>
                <li>• Share with potential employers to demonstrate your commitment to learning</li>
                <li>• Use the verification link to prove the authenticity of your achievement</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
