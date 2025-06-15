import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Trophy, Award, Shield, Download, Share2 } from 'lucide-react';
import { CertificateCard } from '@/components/certificates/CertificateCard';
import { CertificateVerification } from '@/components/certificates/CertificateVerification';
import { Certificate, certificateApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Certificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      const response = await certificateApi.getMyCertificates();
      setCertificates(response.certificates);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load certificates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificateId: string) => {
    try {
      const response = await certificateApi.downloadCertificate(certificateId);
      toast({
        title: "Download Started",
        description: "Your certificate download will begin shortly",
      });
      // In a real implementation, this would trigger a PDF download
      window.open(response.downloadUrl, '_blank');
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download certificate",
        variant: "destructive",
      });
    }
  };

  const handleShare = (certificate: Certificate) => {
    const shareUrl = `${window.location.origin}/verify/${certificate.verificationCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${certificate.courseName} Certificate`,
        text: `I've completed ${certificate.courseName} on WikiWalkthrough!`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Certificate verification link copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Trophy className="h-8 w-8 animate-pulse text-blue-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading certificates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Certificates
        </h1>
        <p className="text-gray-600">
          View and manage your WikiWalkthrough course completion certificates.
        </p>
      </div>

      <Tabs defaultValue="my-certificates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-certificates">My Certificates</TabsTrigger>
          <TabsTrigger value="verify">Verify Certificate</TabsTrigger>
        </TabsList>

        <TabsContent value="my-certificates" className="space-y-6">
          {certificates.length > 0 ? (
            <>
              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <span>Certificate Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{certificates.length}</div>
                      <div className="text-sm text-muted-foreground">Total Certificates</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {certificates.filter(c => c.isValid).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Valid Certificates</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {new Set(certificates.map(c => c.courseLevel)).size}
                      </div>
                      <div className="text-sm text-muted-foreground">Skill Levels</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Certificates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map(certificate => (
                  <CertificateCard
                    key={certificate._id}
                    certificate={certificate}
                    onDownload={() => handleDownload(certificate._id)}
                    onShare={() => handleShare(certificate)}
                  />
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Certificates Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete courses to earn your first certificate of completion
                </p>
                <Button asChild>
                  <a href="/courses">Browse Courses</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="verify" className="space-y-6">
          <CertificateVerification />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Certificates;
