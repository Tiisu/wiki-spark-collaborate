import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { assignmentApi } from '@/lib/api';
import {
  FileText,
  Upload,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Paperclip,
  Save
} from 'lucide-react';

interface AssignmentSubmissionProps {
  lessonId: string;
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
  lessonId,
  title,
  description,
  dueDate,
  onSubmit,
  existingSubmission
}: AssignmentSubmissionProps) {
  const [submissionText, setSubmissionText] = useState(existingSubmission?.text || '');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [assignment, setAssignment] = useState<any>(existingSubmission);
  const { toast } = useToast();

  // Load existing assignment submission
  useEffect(() => {
    const loadAssignment = async () => {
      try {
        const response = await assignmentApi.getAssignmentSubmission(lessonId);
        if (response.assignment) {
          setAssignment(response.assignment);
          setSubmissionText(response.assignment.text || '');
        }
      } catch (error) {
        // No existing assignment, which is fine
        console.log('No existing assignment found');
      }
    };

    if (lessonId && !existingSubmission) {
      loadAssignment();
    }
  }, [lessonId, existingSubmission]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!submissionText.trim() && selectedFiles.length === 0) {
      toast({
        title: 'Error',
        description: 'Please provide assignment text or upload files before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = {
        text: submissionText,
        files: selectedFiles.map(file => ({
          filename: file.name,
          originalName: file.name,
          mimetype: file.type,
          size: file.size,
          path: '' // This would be handled by file upload service
        }))
      };

      const response = await assignmentApi.submitAssignment(lessonId, submissionData);
      setAssignment(response.assignment);

      const submission: AssignmentSubmission = {
        text: submissionText,
        files: selectedFiles,
        submittedAt: new Date(),
        status: 'submitted'
      };

      await onSubmit(submission);

      toast({
        title: 'Success',
        description: 'Assignment submitted successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit assignment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!submissionText.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide assignment text before saving draft.',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingDraft(true);

    try {
      const submissionData = {
        text: submissionText,
        files: selectedFiles.map(file => ({
          filename: file.name,
          originalName: file.name,
          mimetype: file.type,
          size: file.size,
          path: '' // This would be handled by file upload service
        }))
      };

      const response = await assignmentApi.saveDraft(lessonId, submissionData);
      setAssignment(response.assignment);

      toast({
        title: 'Success',
        description: 'Assignment draft saved successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save draft. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingDraft(false);
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
  const canSubmit = !assignment || assignment.status === 'draft';
  const isSubmitted = assignment && assignment.status === 'submitted';
  const isGraded = assignment && assignment.status === 'graded';

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
              {assignment && (
                <Badge variant={
                  assignment.status === 'graded' ? 'default' :
                  assignment.status === 'submitted' ? 'secondary' : 'outline'
                }>
                  {assignment.status === 'graded' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {assignment.status === 'submitted' && <Clock className="h-3 w-3 mr-1" />}
                  {assignment.status === 'draft' && <FileText className="h-3 w-3 mr-1" />}
                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
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

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSavingDraft || !submissionText.trim()}
              >
                {isSavingDraft ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>

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
      {assignment && assignment.status !== 'draft' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Submission</CardTitle>
            <p className="text-sm text-muted-foreground">
              Submitted on {assignment.submittedAt ? new Date(assignment.submittedAt).toLocaleDateString() : 'Unknown'}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignment.text && (
              <div>
                <Label>Written Response</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{assignment.text}</p>
                </div>
              </div>
            )}

            {assignment.files && assignment.files.length > 0 && (
              <div>
                <Label>Submitted Files</Label>
                <div className="mt-2 space-y-2">
                  {assignment.files.map((file: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-muted rounded">
                      <Paperclip className="h-4 w-4" />
                      <span className="text-sm">{file.originalName || file.filename}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {assignment.status === 'graded' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Grade</Label>
                  <Badge variant="default" className="bg-green-600">
                    {assignment.grade}/100
                  </Badge>
                </div>
                {assignment.feedback && (
                  <div>
                    <Label>Instructor Feedback</Label>
                    <div className="mt-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="whitespace-pre-wrap">{assignment.feedback}</p>
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
