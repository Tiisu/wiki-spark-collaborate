import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Video, Upload, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateLessonData } from '@/lib/api';

interface VideoLessonFormProps {
  register: UseFormRegister<CreateLessonData>;
  setValue: UseFormSetValue<CreateLessonData>;
  watch: UseFormWatch<CreateLessonData>;
  errors: FieldErrors<CreateLessonData>;
}

const VideoLessonForm: React.FC<VideoLessonFormProps> = ({
  register,
  setValue,
  watch,
  errors
}) => {
  const videoUrl = watch('videoUrl');
  const content = watch('content');

  const getVideoEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    
    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo URL patterns
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return null;
  };

  const embedUrl = getVideoEmbedUrl(videoUrl || '');

  return (
    <div className="space-y-6">
      {/* Video Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Configuration
          </CardTitle>
          <CardDescription>
            Add your video content and configure playback settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL *</Label>
            <Input
              id="videoUrl"
              {...register('videoUrl')}
              placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              type="url"
            />
            {errors.videoUrl && (
              <p className="text-sm text-red-600">{errors.videoUrl.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Supports YouTube, Vimeo, or direct video file URLs
            </p>
          </div>

          {/* Video Preview */}
          {embedUrl && (
            <div className="space-y-2">
              <Label>Video Preview</Label>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video preview"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Video Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                {...register('duration', { valueAsNumber: true })}
                placeholder="e.g., 15"
              />
              {errors.duration && (
                <p className="text-sm text-red-600">{errors.duration.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <span className="text-sm font-medium">✓ Free & Open Access</span>
              </div>
              <p className="text-xs text-muted-foreground">
                All video lessons are freely available to everyone
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Description & Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Video Description & Notes
          </CardTitle>
          <CardDescription>
            Provide context and additional information about the video
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Video Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe what students will learn from this video..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Additional Notes & Resources</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="Add any additional notes, key points, or resources that complement the video content..."
              rows={6}
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              These notes will be displayed alongside the video to help students follow along
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Video Upload Alternative */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Alternative: Upload Video File
          </CardTitle>
          <CardDescription>
            If you prefer to upload a video file directly (coming soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">Video file upload coming soon</p>
            <p className="text-sm text-gray-500">
              For now, please use video URLs from YouTube or Vimeo
            </p>
            <Button variant="outline" disabled className="mt-4">
              <Upload className="h-4 w-4 mr-2" />
              Choose Video File
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoLessonForm;
