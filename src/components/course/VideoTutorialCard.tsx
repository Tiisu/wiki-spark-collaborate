import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  Video,
  BookOpen,
  Users,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: number; // in minutes
  instructor: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  rating: number;
  totalViews: number;
  isCompleted?: boolean;
  progress?: number;
  tags: string[];
}

interface VideoTutorialCardProps {
  tutorial: VideoTutorial;
  onPlay: (tutorial: VideoTutorial) => void;
  className?: string;
  showProgress?: boolean;
}

export function VideoTutorialCard({ 
  tutorial, 
  onPlay, 
  className,
  showProgress = false 
}: VideoTutorialCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatViews = (views: number) => {
    if (views < 1000) return views.toString();
    if (views < 1000000) return `${(views / 1000).toFixed(1)}K`;
    return `${(views / 1000000).toFixed(1)}M`;
  };

  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300 cursor-pointer", className)}>
      {/* Video Thumbnail */}
      <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
        <img
          src={tutorial.thumbnail}
          alt={tutorial.title}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Loading placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Video className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <Button
            size="lg"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full h-16 w-16"
            onClick={() => onPlay(tutorial)}
          >
            <Play className="h-8 w-8 ml-1" />
          </Button>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
          {formatDuration(tutorial.duration)}
        </div>

        {/* Completion badge */}
        {tutorial.isCompleted && (
          <div className="absolute top-2 right-2 bg-green-600 text-white p-1 rounded-full">
            <CheckCircle className="h-4 w-4" />
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
              {tutorial.title}
            </CardTitle>
            <Badge className={getDifficultyColor(tutorial.difficulty)}>
              {tutorial.difficulty}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {tutorial.description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Progress bar (if applicable) */}
        {showProgress && tutorial.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(tutorial.progress)}%</span>
            </div>
            <Progress value={tutorial.progress} className="h-2" />
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {tutorial.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tutorial.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tutorial.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Instructor and stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{tutorial.instructor}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{tutorial.rating}</span>
            </div>
            <span>{formatViews(tutorial.totalViews)} views</span>
          </div>
        </div>

        {/* Action button */}
        <Button 
          className="w-full" 
          onClick={() => onPlay(tutorial)}
          variant={tutorial.isCompleted ? "outline" : "default"}
        >
          <Play className="h-4 w-4 mr-2" />
          {tutorial.isCompleted ? 'Watch Again' : 'Watch Now'}
        </Button>
      </CardContent>
    </Card>
  );
}
