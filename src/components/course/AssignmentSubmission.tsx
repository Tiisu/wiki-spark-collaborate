import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FileText,
  Upload,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Paperclip
} from 'lucide-react';

interface AssignmentSubmissionProps {
  title: string;
  description: string;
  dueDate?: string;
  onSubmit: (submission: AssignmentSubmission) => void;
  existingSubmission?: AssignmentSubmission;
}

interface AssignmentSubmission {
  text: string;
  files: File[];
  submittedAt: Date;
  status: 'draft' | 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
}

export function AssignmentSubmission({ 
  title, 
  description, 
  dueDate, 
  onSubmit, 
  existingSubmission 
}: AssignmentSubmissionProps) {
  const [submissionText, setSubmissionText] = useState(existingSubmission?.text || '');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!submissionText.trim() && selectedFiles.length === 0) {
      return;
    }

    setIsSubmitting(true);
    
    const submission: AssignmentSubmission = {
      text: submissionText,
      files: selectedFiles,
      submittedAt: new Date(),
      status: 'submitted'
    };

    try {
      await onSubmit(submission);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isOverdue = dueDate && new Date() > new Date(dueDate);
  const canSubmit = !existingSubmission || existingSubmission.status === 'draft';

  return (
    <div className="space-y-6">
      {/* Assignment Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>{title}</span>
              </CardTitle>
              <p className="text-muted-foreground mt-2">{description}</p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              {existingSubmission && (
                <Badge variant={
                  existingSubmission.status === 'graded' ? 'default' :
                  existingSubmission.status === 'submitted' ? 'secondary' : 'outline'
                }>
                  {existingSubmission.status === 'graded' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {existingSubmission.status === 'submitted' && <Clock className="h-3 w-3 mr-1" />}
                  {existingSubmission.status === 'draft' && <FileText className="h-3 w-3 mr-1" />}
                  {existingSubmission.status.charAt(0).toUpperCase() + existingSubmission.status.slice(1)}
                </Badge>
              )}
              {dueDate && (
                <Badge variant={isOverdue ? "destructive" : "outline"}>
                  {isOverdue ? <AlertCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                  Due: {new Date(dueDate).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Assignment Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assignment Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Download Assignment Instructions (PDF)
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Download Template Files
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Download Sample Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submission Form */}
      {canSubmit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Text Submission */}
            <div className="space-y-2">
              <Label htmlFor="submission-text">Written Response</Label>
              <Textarea
                id="submission-text"
                placeholder="Enter your assignment response here..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                className="min-h-[200px]"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">Attach Files</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload files or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, DOCX, TXT, ZIP (Max 10MB each)
                  </p>
                </Label>
              </div>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files</Label>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || (!submissionText.trim() && selectedFiles.length === 0)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Assignment
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Submission Display */}
      {existingSubmission && existingSubmission.status !== 'draft' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Submission</CardTitle>
            <p className="text-sm text-muted-foreground">
              Submitted on {existingSubmission.submittedAt.toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {existingSubmission.text && (
              <div>
                <Label>Written Response</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{existingSubmission.text}</p>
                </div>
              </div>
            )}

            {existingSubmission.files.length > 0 && (
              <div>
                <Label>Submitted Files</Label>
                <div className="mt-2 space-y-2">
                  {existingSubmission.files.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-muted rounded">
                      <Paperclip className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {existingSubmission.status === 'graded' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Grade</Label>
                  <Badge variant="default" className="bg-green-600">
                    {existingSubmission.grade}/100
                  </Badge>
                </div>
                {existingSubmission.feedback && (
                  <div>
                    <Label>Instructor Feedback</Label>
                    <div className="mt-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="whitespace-pre-wrap">{existingSubmission.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
