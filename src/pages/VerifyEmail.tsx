import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { BookOpen, CheckCircle, XCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { authApi, ApiError } from '@/lib/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const token = searchParams.get('token');

  const verifyMutation = useMutation({
    mutationFn: async (token: string) => {
      return authApi.verifyEmail(token);
    },
    onSuccess: () => {
      setVerificationStatus('success');
    },
    onError: (error: ApiError) => {
      setVerificationStatus('error');
    },
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    } else {
      setVerificationStatus('error');
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-800">WikiWalkthrough</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
              <CardDescription>
                Verifying your email address...
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {verificationStatus === 'pending' && (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                  <p className="text-slate-600">
                    Please wait while we verify your email address.
                  </p>
                </div>
              )}

              {verificationStatus === 'success' && (
                <div className="space-y-4">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      Email Verified Successfully!
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Your email has been verified. You can now access all features of Wiki Spark Collaborate.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Link to="/login">
                      <Button className="w-full">
                        Sign In to Your Account
                      </Button>
                    </Link>
                    <Link to="/">
                      <Button variant="outline" className="w-full">
                        Back to Home
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {verificationStatus === 'error' && (
                <div className="space-y-4">
                  <XCircle className="h-12 w-12 text-red-600 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      Verification Failed
                    </h3>
                    <p className="text-slate-600 mb-4">
                      {verifyMutation.error?.message || 'The verification link is invalid or has expired.'}
                    </p>
                  </div>
                  
                  <Alert>
                    <AlertDescription>
                      If you're having trouble verifying your email, please try:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Checking if the link in your email is complete</li>
                        <li>Requesting a new verification email</li>
                        <li>Contacting support if the problem persists</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Link to="/register">
                      <Button variant="outline" className="w-full">
                        Create New Account
                      </Button>
                    </Link>
                    <Link to="/">
                      <Button variant="outline" className="w-full">
                        Back to Home
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              Need help? Contact us at{' '}
              <a href="mailto:support@wikisparkcollab.org" className="text-blue-600 hover:underline">
                support@wikisparkcollab.org
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyEmail;
