import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Award, 
  Download, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Share2
} from 'lucide-react';
import { Certificate, certificateApi } from '@/lib/api';

interface CertificateManagementProps {
  className?: string;
}

export const CertificateManagement: React.FC<CertificateManagementProps> = ({
  className = ''
}) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCertificates();
  }, []);

  useEffect(() => {
    filterCertificates();
  }, [certificates, searchTerm, statusFilter, templateFilter]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      // This would need to be implemented in the API
      // For now, we'll use a placeholder
      const response = await certificateApi.getMyCertificates(); // This should be getAllCertificates for admin
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

  const filterCertificates = () => {
    let filtered = [...certificates];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.verificationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(cert => cert.status === statusFilter);
    }

    // Apply template filter
    if (templateFilter !== 'all') {
      filtered = filtered.filter(cert => cert.template === templateFilter);
    }

    setFilteredCertificates(filtered);
  };

  const handleRegeneratePDF = async (certificateId: string) => {
    try {
      await certificateApi.regenerateCertificatePDF(certificateId);
      toast({
        title: "Success",
        description: "Certificate PDF regenerated successfully",
      });
      await loadCertificates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate certificate PDF",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setShowDetails(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'GENERATED':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'DOWNLOADED':
        return <Download className="h-4 w-4 text-blue-600" />;
      case 'REVOKED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GENERATED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DOWNLOADED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REVOKED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Certificate Management</span>
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
            Manage and monitor all certificates issued on the platform
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Filters */}
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
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="GENERATED">Generated</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="DOWNLOADED">Downloaded</SelectItem>
                <SelectItem value="REVOKED">Revoked</SelectItem>
              </SelectContent>
            </Select>

            <Select value={templateFilter} onValueChange={setTemplateFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                <SelectItem value="STANDARD">Standard</SelectItem>
                <SelectItem value="PREMIUM">Premium</SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{filteredCertificates.length}</div>
              <div className="text-sm text-muted-foreground">Total Shown</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {filteredCertificates.filter(c => c.status === 'GENERATED').length}
              </div>
              <div className="text-sm text-muted-foreground">Generated</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-600">
                {filteredCertificates.filter(c => c.status === 'PENDING').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {filteredCertificates.reduce((sum, c) => sum + (c.downloadCount || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.map((certificate) => (
                <TableRow key={certificate._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{certificate.studentName}</div>
                      <div className="text-sm text-muted-foreground">{certificate.studentEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{certificate.courseName}</div>
                      <div className="text-sm text-muted-foreground">{certificate.courseLevel}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(certificate.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(certificate.status)}
                        <span>{certificate.status}</span>
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{certificate.template}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(certificate.issuedAt)}</TableCell>
                  <TableCell>{certificate.downloadCount || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(certificate)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRegeneratePDF(certificate._id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredCertificates.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No certificates found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || templateFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No certificates have been issued yet.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificate Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Certificate Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected certificate
            </DialogDescription>
          </DialogHeader>
          
          {selectedCertificate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Student Name</label>
                  <p className="text-sm text-muted-foreground">{selectedCertificate.studentName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Course Name</label>
                  <p className="text-sm text-muted-foreground">{selectedCertificate.courseName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Verification Code</label>
                  <p className="text-sm font-mono">{selectedCertificate.verificationCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Certificate ID</label>
                  <p className="text-sm font-mono">{selectedCertificate.certificateId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className={getStatusColor(selectedCertificate.status)}>
                    {selectedCertificate.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Template</label>
                  <Badge variant="outline">{selectedCertificate.template}</Badge>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(`/verify/${selectedCertificate.verificationCode}`, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Certificate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRegeneratePDF(selectedCertificate._id)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
