import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Award, 
  Download, 
  Share2, 
  Search, 
  Filter,
  Calendar,
  Trophy,
  FileText,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { CertificateCard } from './CertificateCard';
import { certificateApi, Certificate } from '@/lib/api';

interface CertificateDashboardProps {
  className?: string;
}

interface CertificateStats {
  total: number;
  thisMonth: number;
  thisYear: number;
  averageScore: number;
}

export const CertificateDashboard: React.FC<CertificateDashboardProps> = ({
  className = ''
}) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'course' | 'score'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'high-score'>('all');
  const [stats, setStats] = useState<CertificateStats>({
    total: 0,
    thisMonth: 0,
    thisYear: 0,
    averageScore: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCertificates();
  }, []);

  useEffect(() => {
    filterAndSortCertificates();
  }, [certificates, searchTerm, sortBy, filterBy]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const response = await certificateApi.getMyCertificates();
      setCertificates(response.certificates);
      calculateStats(response.certificates);
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

  const calculateStats = (certs: Certificate[]) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    const thisMonthCount = certs.filter(cert => 
      new Date(cert.issuedAt) >= thisMonth
    ).length;

    const thisYearCount = certs.filter(cert => 
      new Date(cert.issuedAt) >= thisYear
    ).length;

    const scoresWithValues = certs.filter(cert => cert.finalScore !== undefined);
    const averageScore = scoresWithValues.length > 0
      ? scoresWithValues.reduce((sum, cert) => sum + (cert.finalScore || 0), 0) / scoresWithValues.length
      : 0;

    setStats({
      total: certs.length,
      thisMonth: thisMonthCount,
      thisYear: thisYearCount,
      averageScore: Math.round(averageScore)
    });
  };

  const filterAndSortCertificates = () => {
    let filtered = [...certificates];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.instructorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.verificationCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'recent':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter(cert => new Date(cert.issuedAt) >= thirtyDaysAgo);
        break;
      case 'high-score':
        filtered = filtered.filter(cert => cert.finalScore && cert.finalScore >= 90);
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime();
        case 'course':
          return a.courseName.localeCompare(b.courseName);
        case 'score':
          return (b.finalScore || 0) - (a.finalScore || 0);
        default:
          return 0;
      }
    });

    setFilteredCertificates(filtered);
  };

  const handleDownload = async (certificate: Certificate) => {
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
        description: "Failed to download certificate",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (certificate: Certificate) => {
    const shareUrl = `${window.location.origin}/verify/${certificate.verificationCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate: ${certificate.courseName}`,
          text: `Check out my certificate for completing ${certificate.courseName} on WikiWalkthrough!`,
          url: shareUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Certificate verification link copied to clipboard",
        });
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "Certificate verification link copied to clipboard",
      });
    }
  };

  const handleView = (certificate: Certificate) => {
    window.open(`/verify/${certificate.verificationCode}`, '_blank');
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Certificates</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Year</p>
                <p className="text-2xl font-bold">{stats.thisYear}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Score</p>
                <p className="text-2xl font-bold">{stats.averageScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>My Certificates</span>
            <Button
              variant="outline"
              size="sm"
              onClick={loadCertificates}
              className="ml-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>
            View and manage your earned certificates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date (Newest)</SelectItem>
                <SelectItem value="course">Course Name</SelectItem>
                <SelectItem value="score">Score (Highest)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Certificates</SelectItem>
                <SelectItem value="recent">Recent (30 days)</SelectItem>
                <SelectItem value="high-score">High Score (90%+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Grid */}
      {filteredCertificates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No certificates found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterBy !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Complete courses to earn your first certificate!'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate) => (
            <CertificateCard
              key={certificate._id}
              certificate={certificate}
              onDownload={() => handleDownload(certificate)}
              onShare={() => handleShare(certificate)}
              onView={() => handleView(certificate)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
