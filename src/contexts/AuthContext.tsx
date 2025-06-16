import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, User, ApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  refetchUser: () => void;
  getRoleBasedDashboard: () => string;
  hasRole: (roles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasToken, setHasToken] = useState(!!localStorage.getItem('auth_token'));
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch current user if token exists
  const {
    data: user,
    isLoading,
    error,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No token available');
      }

      try {
        const response = await authApi.getCurrentUser();
        return response.user;
      } catch (error) {
        console.error('Failed to fetch current user:', error);
        // Clear invalid token
        localStorage.removeItem('auth_token');
        setHasToken(false);
        setIsAuthenticated(false);
        throw error;
      }
    },
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Handle query errors
  useEffect(() => {
    if (error && hasToken) {
      // If we have a token but the query failed, the token might be invalid
      setHasToken(false);
      setIsAuthenticated(false);
      localStorage.removeItem('auth_token');
      queryClient.removeQueries({ queryKey: ['currentUser'] });
    }
  }, [error, hasToken, queryClient]);

  // Update authentication state when user data changes
  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  // Listen for storage changes (token changes in other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        const newToken = e.newValue;
        setHasToken(!!newToken);
        if (!newToken) {
          setIsAuthenticated(false);
          queryClient.clear();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [queryClient]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return authApi.login({ email, password });
    },
    onSuccess: (data) => {
      // Set user data first, then update states
      queryClient.setQueryData(['currentUser'], data.user);
      setHasToken(true);
      setIsAuthenticated(true);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    },
    onError: (error: ApiError) => {
      setHasToken(false);
      setIsAuthenticated(false);
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Set user data first, then update states
      queryClient.setQueryData(['currentUser'], data.user);
      setHasToken(true);
      setIsAuthenticated(true);
      toast({
        title: "Registration Successful!",
        description: "Welcome to WikiWalkthrough!",
      });
    },
    onError: (error: ApiError) => {
      setHasToken(false);
      setIsAuthenticated(false);
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setIsAuthenticated(false);
      setHasToken(false);
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: ApiError) => {
      // Even if logout fails on server, clear local state
      setIsAuthenticated(false);
      setHasToken(false);
      queryClient.clear();
      localStorage.removeItem('auth_token');
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (userData: any) => {
    await registerMutation.mutateAsync(userData);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Get role-based dashboard route
  const getRoleBasedDashboard = (): string => {
    if (!user?.role) return '/student';

    switch (user.role.toUpperCase()) {
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

  // Check if user has specific role(s)
  const hasRole = (roles: string | string[]): boolean => {
    if (!user?.role) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.some(role => user.role.toUpperCase() === role.toUpperCase());
  };

  const value: AuthContextType = {
    user: user || null,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    login,
    logout,
    register,
    refetchUser,
    getRoleBasedDashboard,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
