import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  AlertTriangle, 
  Pause, 
  Play,
  StopCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizTimerProps {
  timeLimit?: number; // in minutes
  onTimeUp: () => void;
  onTimeWarning?: (minutesLeft: number) => void;
  isPaused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  className?: string;
  showControls?: boolean;
  warningThresholds?: number[]; // minutes when to show warnings
}

export function QuizTimer({
  timeLimit,
  onTimeUp,
  onTimeWarning,
  isPaused = false,
  onPause,
  onResume,
  className,
  showControls = false,
  warningThresholds = [10, 5, 2, 1]
}: QuizTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    timeLimit ? timeLimit * 60 : null
  );
  const [warningsShown, setWarningsShown] = useState<Set<number>>(new Set());
  const [isActive, setIsActive] = useState(true);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const getTimeStatus = useCallback((seconds: number) => {
    if (seconds <= 60) return 'critical'; // Last minute
    if (seconds <= 300) return 'warning'; // Last 5 minutes
    if (seconds <= 600) return 'caution'; // Last 10 minutes
    return 'normal';
  }, []);

  const handlePause = useCallback(() => {
    setIsActive(false);
    onPause?.();
  }, [onPause]);

  const handleResume = useCallback(() => {
    setIsActive(true);
    onResume?.();
  }, [onResume]);

  // Timer effect
  useEffect(() => {
    if (!timeLimit || timeRemaining === null || timeRemaining <= 0 || isPaused || !isActive) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit, timeRemaining, isPaused, isActive, onTimeUp]);

  // Warning effect
  useEffect(() => {
    if (!timeRemaining || !onTimeWarning) return;

    const minutesLeft = Math.ceil(timeRemaining / 60);
    
    for (const threshold of warningThresholds) {
      if (minutesLeft === threshold && !warningsShown.has(threshold)) {
        setWarningsShown(prev => new Set([...prev, threshold]));
        onTimeWarning(threshold);
        break;
      }
    }
  }, [timeRemaining, onTimeWarning, warningThresholds, warningsShown]);

  // No time limit
  if (!timeLimit || timeRemaining === null) {
    return null;
  }

  const timeStatus = getTimeStatus(timeRemaining);
  const minutesLeft = Math.ceil(timeRemaining / 60);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Timer Display */}
      <div className="flex items-center justify-between">
        <Badge 
          variant={timeStatus === 'critical' ? "destructive" : "outline"}
          className={cn(
            "flex items-center space-x-1 text-sm font-mono",
            timeStatus === 'warning' && "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400",
            timeStatus === 'caution' && "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400"
          )}
        >
          <Clock className="h-3 w-3" />
          <span>{formatTime(timeRemaining)}</span>
        </Badge>

        {/* Timer Controls */}
        {showControls && (
          <div className="flex items-center space-x-1">
            {isActive ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePause}
                className="h-6 w-6 p-0"
              >
                <Pause className="h-3 w-3" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResume}
                className="h-6 w-6 p-0"
              >
                <Play className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Time Warnings */}
      {timeStatus === 'critical' && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Time almost up!</strong> You have less than 1 minute remaining.
          </AlertDescription>
        </Alert>
      )}

      {timeStatus === 'warning' && minutesLeft <= 5 && (
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <strong>Time running low!</strong> You have {minutesLeft} minute{minutesLeft !== 1 ? 's' : ''} remaining.
          </AlertDescription>
        </Alert>
      )}

      {timeStatus === 'caution' && minutesLeft <= 10 && minutesLeft > 5 && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            You have {minutesLeft} minutes remaining.
          </AlertDescription>
        </Alert>
      )}

      {/* Paused State */}
      {isPaused && (
        <Alert>
          <Pause className="h-4 w-4" />
          <AlertDescription>
            Timer is paused. Click resume to continue.
          </AlertDescription>
        </Alert>
      )}

      {/* Inactive State */}
      {!isActive && !isPaused && (
        <Alert>
          <StopCircle className="h-4 w-4" />
          <AlertDescription>
            Timer is stopped. Click play to resume.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Hook for managing quiz timer state
export function useQuizTimer(
  timeLimit?: number,
  onTimeUp?: () => void,
  onTimeWarning?: (minutesLeft: number) => void
) {
  const [isPaused, setIsPaused] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleTimeUp = useCallback(() => {
    onTimeUp?.();
  }, [onTimeUp]);

  const handleTimeWarning = useCallback((minutesLeft: number) => {
    onTimeWarning?.(minutesLeft);
  }, [onTimeWarning]);

  // Update time spent
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, startTime]);

  return {
    isPaused,
    timeSpent,
    handlePause,
    handleResume,
    handleTimeUp,
    handleTimeWarning
  };
}
