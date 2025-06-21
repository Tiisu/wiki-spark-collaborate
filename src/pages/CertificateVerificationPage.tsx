import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Home, ExternalLink } from 'lucide-react';
import { CertificateVerification } from '@/components/certificates/CertificateVerification';

interface CertificateVerificationPageProps {
  embedded?: boolean;
}

export const CertificateVerificationPage: React.FC<CertificateVerificationPageProps> = ({
  embedded = false
}) => {
  const { verificationCode } = useParams<{ verificationCode?: string }>();
  const navigate = useNavigate();

  if (embedded) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <CertificateVerification
            initialCode={verificationCode}
            showActions={true}
            embedded={false}
            className="bg-white"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to WikiWalkthrough</span>
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                Certificate Verification
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            WikiWalkthrough Certificate Verification
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Verify the authenticity of WikiWalkthrough certificates using the verification code. 
            Our certificates represent successful completion of Wikipedia education courses.
          </p>
        </div>

        {/* Verification Component */}
        <CertificateVerification
          initialCode={verificationCode}
          showActions={true}
          embedded={false}
        />

        {/* Additional Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Secure Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Each certificate is issued with a unique verification code that cannot be duplicated or forged.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wikipedia Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our certificates validate skills in Wikipedia editing, research, and contribution to the world's knowledge.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Globally Recognized</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                WikiWalkthrough certificates are recognized by educational institutions and employers worldwide.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Start Your Wikipedia Journey</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Join thousands of learners who have enhanced their Wikipedia editing skills through our comprehensive courses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/courses')}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="border-white text-white hover:bg-white/10"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">WikiWalkthrough</h3>
              <p className="text-gray-400 mb-4">
                Empowering learners to contribute to Wikipedia and share knowledge with the world.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  About
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  Contact
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  Privacy
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Learn</h4>
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-0 h-auto justify-start">
                  Courses
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-0 h-auto justify-start">
                  Certificates
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-0 h-auto justify-start">
                  Community
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-0 h-auto justify-start">
                  Help Center
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-0 h-auto justify-start">
                  Verification
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-0 h-auto justify-start">
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 WikiWalkthrough. All rights reserved. | 
              <span className="ml-2">
                Powered by the Wikipedia community
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
