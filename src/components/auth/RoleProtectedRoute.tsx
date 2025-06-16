import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackRoute?: string;
  showAccessDenied?: boolean;
}

/**
 * Enhanced protected route component that handles role-based access control
 */
export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallbackRoute,
  showAccessDenied = true
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles.some(role => 
    user.role.toUpperCase() === role.toUpperCase()
  );

  if (!hasRequiredRole) {
    if (fallbackRoute) {
      return <Navigate to={fallbackRoute} replace />;
    }

    if (showAccessDenied) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold">Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to access this page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This page requires {allowedRoles.join(' or ')} privileges. 
                  Your current role is: <strong>{user.role}</strong>
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="w-full"
                >
                  Go Back
                </Button>
                <Button 
                  onClick={() => window.location.href = getDashboardRoute(user.role)}
                  className="w-full"
                >
                  Go to My Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Default fallback - redirect to appropriate dashboard
    return <Navigate to={getDashboardRoute(user.role)} replace />;
  }

  return <>{children}</>;
};

/**
 * Helper function to get the appropriate dashboard route for a user role
 */
const getDashboardRoute = (userRole: string): string => {
  switch (userRole.toUpperCase()) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return '/admin';
    case 'INSTRUCTOR':
    case 'MENTOR':
      return '/instructor';
    case 'LEARNER':
    default:
      return '/student';
  }
};

/**
 * Convenience components for specific role protection
 */
export const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
    {children}
  </RoleProtectedRoute>
);

export const InstructorProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleProtectedRoute allowedRoles={['INSTRUCTOR', 'MENTOR', 'ADMIN', 'SUPER_ADMIN']}>
    {children}
  </RoleProtectedRoute>
);

export const StudentProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleProtectedRoute allowedRoles={['LEARNER', 'INSTRUCTOR', 'MENTOR', 'ADMIN', 'SUPER_ADMIN']}>
    {children}
  </RoleProtectedRoute>
);
