import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'table' | 'stats' | 'list';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  variant = 'card',
  count = 1
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'stats':
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-24 animate-pulse"></div>
              <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-16 sm:w-20 mb-2 animate-pulse"></div>
              <div className="h-2 sm:h-3 bg-gray-200 rounded w-24 sm:w-32 animate-pulse"></div>
            </CardContent>
          </Card>
        );

      case 'table':
        return (
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 border-b last:border-b-0 flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        );

      case 'list':
        return (
          <div className="space-y-3">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        );

      default: // card
        return (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
            </CardContent>
          </Card>
        );
    }
  };

  if (count > 1 && variant !== 'table') {
    return (
      <div className={cn('space-y-4', className)}>
        {[...Array(count)].map((_, i) => (
          <div key={i}>{renderSkeleton()}</div>
        ))}
      </div>
    );
  }

  return <div className={className}>{renderSkeleton()}</div>;
};

export default LoadingSkeleton;
