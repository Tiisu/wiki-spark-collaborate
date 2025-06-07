import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Server, 
  Database, 
  Wifi, 
  HardDrive,
  Cpu,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SystemHealthData {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  services: {
    database: 'online' | 'offline' | 'slow';
    api: 'online' | 'offline' | 'slow';
    storage: 'online' | 'offline' | 'slow';
  };
  metrics: {
    responseTime: number;
    errorRate: number;
    activeConnections: number;
    memoryUsage: number;
    diskUsage: number;
  };
  lastUpdated: string;
}

const SystemHealth = () => {
  const { data: healthData, isLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const response = await fetch('/health', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch system health');
      }

      const basicHealth = await response.json();
      
      // Mock additional health data for demonstration
      // In a real app, this would come from a dedicated health endpoint
      return {
        ...basicHealth,
        status: 'healthy' as const,
        uptime: Date.now() - new Date('2024-01-01').getTime(),
        services: {
          database: 'online' as const,
          api: 'online' as const,
          storage: 'online' as const,
        },
        metrics: {
          responseTime: Math.floor(Math.random() * 100) + 50,
          errorRate: Math.random() * 2,
          activeConnections: Math.floor(Math.random() * 50) + 10,
          memoryUsage: Math.floor(Math.random() * 30) + 40,
          diskUsage: Math.floor(Math.random() * 20) + 30,
        },
        lastUpdated: new Date().toISOString()
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const health: SystemHealthData = healthData;

  if (!health) {
    return (
      <div className="text-center py-8 text-gray-500">
        Failed to load system health data
      </div>
    );
  }

  const formatUptime = (milliseconds: number) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'slow':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'offline':
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'slow':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Server className="h-4 w-4 sm:h-5 sm:w-5" />
            System Status
          </CardTitle>
          <CardDescription className="text-sm">
            Overall system health and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(health.status)}
              <Badge className={getStatusColor(health.status)}>
                {health.status.toUpperCase()}
              </Badge>
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="hidden sm:inline">Uptime: {formatUptime(health.uptime)}</span>
              <span className="sm:hidden">{formatUptime(health.uptime)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Database</CardTitle>
            <Database className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="flex items-center gap-2">
              {getStatusIcon(health.services.database)}
              <Badge className={`${getStatusColor(health.services.database)} text-xs`}>
                <span className="hidden sm:inline">{health.services.database.toUpperCase()}</span>
                <span className="sm:hidden">{health.services.database.charAt(0).toUpperCase()}</span>
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">API Server</CardTitle>
            <Wifi className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="flex items-center gap-2">
              {getStatusIcon(health.services.api)}
              <Badge className={`${getStatusColor(health.services.api)} text-xs`}>
                <span className="hidden sm:inline">{health.services.api.toUpperCase()}</span>
                <span className="sm:hidden">{health.services.api.charAt(0).toUpperCase()}</span>
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="flex items-center gap-2">
              {getStatusIcon(health.services.storage)}
              <Badge className={`${getStatusColor(health.services.storage)} text-xs`}>
                <span className="hidden sm:inline">{health.services.storage.toUpperCase()}</span>
                <span className="sm:hidden">{health.services.storage.charAt(0).toUpperCase()}</span>
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Performance Metrics</CardTitle>
            <CardDescription className="text-sm">Real-time system performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Response Time</span>
              <span className="text-sm text-gray-600">{health.metrics.responseTime}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Error Rate</span>
              <span className="text-sm text-gray-600">{health.metrics.errorRate.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Active Connections</span>
              <span className="text-sm text-gray-600">{health.metrics.activeConnections}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Resource Usage</CardTitle>
            <CardDescription className="text-sm">System resource utilization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  <span className="hidden sm:inline">Memory Usage</span>
                  <span className="sm:hidden">Memory</span>
                </span>
                <span className="text-sm text-gray-600">{health.metrics.memoryUsage}%</span>
              </div>
              <Progress
                value={health.metrics.memoryUsage}
                className="h-2"
                style={{
                  '--progress-background': getUsageColor(health.metrics.memoryUsage)
                } as React.CSSProperties}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  <span className="hidden sm:inline">Disk Usage</span>
                  <span className="sm:hidden">Disk</span>
                </span>
                <span className="text-sm text-gray-600">{health.metrics.diskUsage}%</span>
              </div>
              <Progress
                value={health.metrics.diskUsage}
                className="h-2"
                style={{
                  '--progress-background': getUsageColor(health.metrics.diskUsage)
                } as React.CSSProperties}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date(health.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
};

export default SystemHealth;
