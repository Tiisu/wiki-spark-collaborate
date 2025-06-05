import React, { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Upload, Video, Image, X, CheckCircle, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    filename: string;
    originalName: string;
    size: number;
    url: string;
  };
}

const VideoUpload = () => {
  const { toast } = useToast();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const videoUploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch('/api/admin/upload/video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload video');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'Video uploaded successfully!',
      });
      setVideoFile(null);
      setUploadProgress(0);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setUploadProgress(0);
    }
  });

  const thumbnailUploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append('thumbnail', file);

      const response = await fetch('/api/admin/upload/thumbnail', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload thumbnail');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'Thumbnail uploaded successfully!',
      });
      setThumbnailFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleVideoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a valid video file (MP4, MPEG, MOV, AVI, WebM)',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (500MB limit)
      if (file.size > 500 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Video file must be less than 500MB',
          variant: 'destructive',
        });
        return;
      }

      setVideoFile(file);
    }
  };

  const handleThumbnailFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a valid image file (JPG, PNG, GIF, WebP)',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Image file must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }

      setThumbnailFile(file);
    }
  };

  const uploadVideo = () => {
    if (videoFile) {
      setUploadProgress(10);
      videoUploadMutation.mutate(videoFile);
    }
  };

  const uploadThumbnail = () => {
    if (thumbnailFile) {
      thumbnailUploadMutation.mutate(thumbnailFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Video Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Upload Video Tutorial
          </CardTitle>
          <CardDescription>
            Upload video files for course content (MP4, MPEG, MOV, AVI, WebM - Max 500MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoFileSelect}
              className="hidden"
            />
            
            {!videoFile ? (
              <div className="space-y-4">
                <Video className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Upload a video file</p>
                  <p className="text-gray-500">Drag and drop or click to browse</p>
                </div>
                <Button onClick={() => videoInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Video File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Video className="h-6 w-6 text-blue-600" />
                  <span className="font-medium">{videoFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVideoFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Size: {formatFileSize(videoFile.size)}
                </p>
                
                {videoUploadMutation.isPending && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-gray-500">Uploading...</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={uploadVideo}
                    disabled={videoUploadMutation.isPending}
                  >
                    {videoUploadMutation.isPending ? 'Uploading...' : 'Upload Video'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    Choose Different File
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Upload Course Thumbnail
          </CardTitle>
          <CardDescription>
            Upload thumbnail images for courses (JPG, PNG, GIF, WebP - Max 5MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailFileSelect}
              className="hidden"
            />
            
            {!thumbnailFile ? (
              <div className="space-y-4">
                <Image className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Upload a thumbnail image</p>
                  <p className="text-gray-500">Drag and drop or click to browse</p>
                </div>
                <Button onClick={() => thumbnailInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Image className="h-6 w-6 text-blue-600" />
                  <span className="font-medium">{thumbnailFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setThumbnailFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Size: {formatFileSize(thumbnailFile.size)}
                </p>
                
                <div className="flex gap-2">
                  <Button
                    onClick={uploadThumbnail}
                    disabled={thumbnailUploadMutation.isPending}
                  >
                    {thumbnailUploadMutation.isPending ? 'Uploading...' : 'Upload Thumbnail'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => thumbnailInputRef.current?.click()}
                  >
                    Choose Different File
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoUpload;
