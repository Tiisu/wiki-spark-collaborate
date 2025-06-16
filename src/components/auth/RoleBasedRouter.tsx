import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface RoleBasedRouterProps {
  children?: React.ReactNode;
}

/**
 * Component that automatically redirects users to their appropriate dashboard
 * based on their role when they access the generic /dashboard route
 */
export const RoleBasedRouter: React.FC<RoleBasedRouterProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Determine the appropriate dashboard based on user role
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

  const dashboardRoute = getDashboardRoute(user.role);

  // If we're already on the correct dashboard route, render children
  if (window.location.pathname === dashboardRoute) {
    return <>{children}</>;
  }

  // Otherwise, redirect to the appropriate dashboard
  return <Navigate to={dashboardRoute} replace />;
};

/**
 * Hook to get the appropriate dashboard route for the current user
 */
export const useRoleBasedRoute = () => {
  const { user } = useAuth();

  const getDashboardRoute = (userRole?: string): string => {
    if (!userRole) return '/student';
    
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

  return {
    dashboardRoute: getDashboardRoute(user?.role),
    isAdmin: user?.role && ['ADMIN', 'SUPER_ADMIN'].includes(user.role.toUpperCase()),
    isInstructor: user?.role && ['INSTRUCTOR', 'MENTOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role.toUpperCase()),
    isStudent: user?.role === 'LEARNER' || !user?.role,
  };
};
