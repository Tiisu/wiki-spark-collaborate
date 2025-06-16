import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Shield, BookOpen, Settings } from 'lucide-react';

/**
 * Debug component to show current user role and available dashboards
 * Only visible in development mode
 */
export const RoleDebugger: React.FC = () => {
  const { user, getRoleBasedDashboard, hasRole } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !user) {
    return null;
  }

  const roleInfo = {
    LEARNER: { icon: User, color: 'bg-blue-100 text-blue-800', label: 'Student' },
    INSTRUCTOR: { icon: BookOpen, color: 'bg-green-100 text-green-800', label: 'Instructor' },
    MENTOR: { icon: BookOpen, color: 'bg-purple-100 text-purple-800', label: 'Mentor' },
    ADMIN: { icon: Shield, color: 'bg-red-100 text-red-800', label: 'Admin' },
    SUPER_ADMIN: { icon: Settings, color: 'bg-gray-100 text-gray-800', label: 'Super Admin' },
  };

  const currentRole = user.role.toUpperCase() as keyof typeof roleInfo;
  const roleConfig = roleInfo[currentRole] || roleInfo.LEARNER;
  const Icon = roleConfig.icon;

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 border-2 border-dashed border-yellow-400 bg-yellow-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <span className="text-yellow-600">🔧 Role Debugger</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Development mode only - shows current user role and permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Role:</span>
          <Badge className={roleConfig.color}>
            <Icon className="h-3 w-3 mr-1" />
            {roleConfig.label}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <span className="text-sm font-medium">Dashboard Access:</span>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Student Dashboard:</span>
              <Badge variant={hasRole(['LEARNER', 'INSTRUCTOR', 'MENTOR', 'ADMIN', 'SUPER_ADMIN']) ? 'default' : 'secondary'}>
                {hasRole(['LEARNER', 'INSTRUCTOR', 'MENTOR', 'ADMIN', 'SUPER_ADMIN']) ? '✓' : '✗'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Instructor Dashboard:</span>
              <Badge variant={hasRole(['INSTRUCTOR', 'MENTOR', 'ADMIN', 'SUPER_ADMIN']) ? 'default' : 'secondary'}>
                {hasRole(['INSTRUCTOR', 'MENTOR', 'ADMIN', 'SUPER_ADMIN']) ? '✓' : '✗'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Admin Dashboard:</span>
              <Badge variant={hasRole(['ADMIN', 'SUPER_ADMIN']) ? 'default' : 'secondary'}>
                {hasRole(['ADMIN', 'SUPER_ADMIN']) ? '✓' : '✗'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full text-xs"
            onClick={() => window.location.href = getRoleBasedDashboard()}
          >
            Go to My Dashboard ({getRoleBasedDashboard()})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
