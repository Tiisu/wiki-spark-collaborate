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
  RefreshCw, 
  TrendingUp, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Settings
} from 'lucide-react';
import { certificateApi } from '@/lib/api';

interface CertificateAnalyticsProps {
  className?: string;
}

interface AnalyticsData {
  totalCertificates: number;
  certificatesThisMonth: number;
  certificatesThisWeek: number;
  topCourses: Array<{ courseName: string; count: number }>;
  statusBreakdown: Record<string, number>;
  templateUsage: Record<string, number>;
  averageGenerationTime: number;
  downloadStats: {
    totalDownloads: number;
    averageDownloadsPerCertificate: number;
    mostDownloadedCertificate: string;
  };
}

export const CertificateAnalytics: React.FC<CertificateAnalyticsProps> = ({
  className = ''
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      let startDate, endDate;
      const now = new Date();
      
      switch (dateRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = undefined;
      }
      
      endDate = now;

      const response = await certificateApi.getCertificateAnalytics(
        startDate?.toISOString(),
        endDate?.toISOString()
      );
      
      setAnalytics(response.analytics);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load certificate analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
    toast({
      title: "Success",
      description: "Analytics refreshed successfully",
    });
  };

  const retryFailedCertificates = async () => {
    try {
      const response = await certificateApi.retryFailedCertificates(3);
      toast({
        title: "Retry Completed",
        description: `${response.successful} certificates processed successfully, ${response.failed} failed`,
      });
      await loadAnalytics(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to retry failed certificates",
        variant: "destructive",
      });
    }
  };

  const bulkRegeneratePDFs = async () => {
    try {
      const response = await certificateApi.bulkRegeneratePDFs();
      toast({
        title: "Bulk Regeneration Completed",
        description: `${response.success} certificates regenerated successfully, ${response.failed} failed`,
      });
      await loadAnalytics(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to bulk regenerate certificates",
        variant: "destructive",
      });
    }
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
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className={className}>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unable to Load Analytics</h3>
          <p className="text-muted-foreground mb-4">
            There was an error loading the certificate analytics data.
          </p>
          <Button onClick={loadAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Certificate Analytics</h2>
          <p className="text-muted-foreground">
            Monitor certificate generation, downloads, and verification statistics
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Certificates</p>
                <p className="text-2xl font-bold">{analytics.totalCertificates.toLocaleString()}</p>
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
                <p className="text-2xl font-bold">{analytics.certificatesThisMonth.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{analytics.certificatesThisWeek.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
                <p className="text-2xl font-bold">{analytics.downloadStats.totalDownloads.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Top Courses</TabsTrigger>
          <TabsTrigger value="status">Status Breakdown</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Template Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.templateUsage).map(([template, count]) => (
                    <div key={template} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{template}</Badge>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Download Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Downloads:</span>
                    <span className="font-medium">{analytics.downloadStats.totalDownloads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg per Certificate:</span>
                    <span className="font-medium">{analytics.downloadStats.averageDownloadsPerCertificate.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Generation Time:</span>
                    <span className="font-medium">{analytics.averageGenerationTime}s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Courses by Certificates Issued</CardTitle>
              <CardDescription>
                Courses with the highest number of certificates issued
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topCourses.slice(0, 10).map((course, index) => (
                  <div key={course.courseName} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <span className="font-medium">{course.courseName}</span>
                    </div>
                    <Badge variant="outline">{course.count} certificates</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Status Breakdown</CardTitle>
              <CardDescription>
                Distribution of certificates by their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      {status === 'GENERATED' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      {status === 'PENDING' && <Clock className="h-4 w-4 text-yellow-600" />}
                      {status === 'DOWNLOADED' && <Download className="h-4 w-4 text-blue-600" />}
                      {status === 'REVOKED' && <AlertCircle className="h-4 w-4 text-red-600" />}
                      <span className="font-medium">{status}</span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Bulk Operations</span>
                </CardTitle>
                <CardDescription>
                  Perform bulk operations on certificates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={retryFailedCertificates} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Failed Certificates
                </Button>
                
                <Button onClick={bulkRegeneratePDFs} variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Bulk Regenerate PDFs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>
                  Certificate system status and health metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Failed Certificates:</span>
                    <Badge variant={analytics.statusBreakdown.PENDING > 0 ? "destructive" : "secondary"}>
                      {analytics.statusBreakdown.PENDING || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Success Rate:</span>
                    <Badge variant="secondary">
                      {analytics.totalCertificates > 0 
                        ? Math.round(((analytics.statusBreakdown.GENERATED || 0) / analytics.totalCertificates) * 100)
                        : 100
                      }%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Generation Time:</span>
                    <Badge variant="outline">{analytics.averageGenerationTime}s</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
