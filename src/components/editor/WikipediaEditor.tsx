import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  Save, 
  Eye, 
  EyeOff, 
  Undo, 
  Redo, 
  Bold, 
  Italic, 
  Link, 
  List, 
  Quote,
  Code,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Settings,
  HelpCircle
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import WikitextPreview from './WikitextPreview';
import EditingToolbar from './EditingToolbar';
import CitationHelper from './CitationHelper';
import TemplateHelper from './TemplateHelper';

interface WikipediaEditorProps {
  articleTitle?: string;
  initialContent?: string;
  mode: 'sandbox' | 'live' | 'lesson';
  onSave?: (content: string) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  lessonId?: string;
}

interface EditSession {
  id: string;
  content: string;
  timestamp: string;
  wordCount: number;
  changesSaved: boolean;
}

const WikipediaEditor: React.FC<WikipediaEditorProps> = ({
  articleTitle = 'Sandbox',
  initialContent = '',
  mode = 'sandbox',
  onSave,
  onCancel,
  readOnly = false,
  lessonId
}) => {
  const { toast } = useToast();
  const [content, setContent] = useState(initialContent);
  const [showPreview, setShowPreview] = useState(false);
  const [editSummary, setEditSummary] = useState('');
  const [isMinorEdit, setIsMinorEdit] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (content !== initialContent) {
      setHasUnsavedChanges(true);
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveToLocalStorage();
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    // Update word count
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [content, initialContent]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem(`editor_${articleTitle}_${mode}`);
    if (savedContent && savedContent !== initialContent) {
      const shouldRestore = window.confirm(
        'Found unsaved changes from a previous session. Would you like to restore them?'
      );
      if (shouldRestore) {
        setContent(savedContent);
      }
    }
  }, [articleTitle, mode, initialContent]);

  const saveToLocalStorage = () => {
    localStorage.setItem(`editor_${articleTitle}_${mode}`, content);
    toast({
      title: 'Draft saved',
      description: 'Your changes have been automatically saved locally.',
    });
  };

  const clearLocalStorage = () => {
    localStorage.removeItem(`editor_${articleTitle}_${mode}`);
  };

  // Wikipedia API integration
  const { data: articleData, isLoading: isLoadingArticle } = useQuery({
    queryKey: ['wikipedia-article', articleTitle],
    queryFn: async () => {
      if (mode === 'sandbox' || !articleTitle) return null;
      
      // Fetch article content from Wikipedia API
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/wikitext/${encodeURIComponent(articleTitle)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      
      return response.text();
    },
    enabled: mode === 'live' && !!articleTitle
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { content: string; summary: string; minor: boolean }) => {
      if (mode === 'sandbox') {
        // Save to our backend for sandbox mode
        const response = await fetch('/api/editor/sandbox/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            title: articleTitle,
            content: data.content,
            summary: data.summary,
            lessonId
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to save to sandbox');
        }
        
        return response.json();
      } else if (mode === 'live') {
        // This would require Wikipedia OAuth integration
        // For now, we'll show a message about the process
        throw new Error('Live editing requires Wikipedia account authentication');
      }
    },
    onSuccess: () => {
      setHasUnsavedChanges(false);
      clearLocalStorage();
      toast({
        title: 'Saved successfully',
        description: mode === 'sandbox' 
          ? 'Your sandbox edit has been saved.' 
          : 'Your Wikipedia edit has been published.',
      });
      onSave?.(content);
    },
    onError: (error: Error) => {
      toast({
        title: 'Save failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleSave = () => {
    if (!editSummary.trim() && mode === 'live') {
      toast({
        title: 'Edit summary required',
        description: 'Please provide a summary of your changes.',
        variant: 'destructive',
      });
      return;
    }

    saveMutation.mutate({
      content,
      summary: editSummary,
      minor: isMinorEdit
    });
  };

  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newContent = 
      content.substring(0, start) + 
      before + textToInsert + after + 
      content.substring(end);
    
    setContent(newContent);
    
    // Set cursor position after insertion
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const getModeInfo = () => {
    switch (mode) {
      case 'sandbox':
        return {
          title: 'Sandbox Editor',
          description: 'Practice editing in a safe environment',
          color: 'bg-blue-100 text-blue-800',
          icon: <Settings className="h-4 w-4" />
        };
      case 'live':
        return {
          title: 'Live Wikipedia Editor',
          description: 'Editing live Wikipedia article',
          color: 'bg-red-100 text-red-800',
          icon: <AlertTriangle className="h-4 w-4" />
        };
      case 'lesson':
        return {
          title: 'Lesson Exercise',
          description: 'Complete the editing exercise',
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-4 w-4" />
        };
      default:
        return {
          title: 'Editor',
          description: 'Wikipedia editor',
          color: 'bg-gray-100 text-gray-800',
          icon: <Code className="h-4 w-4" />
        };
    }
  };

  const modeInfo = getModeInfo();

  if (isLoadingArticle) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mr-3" />
          <span>Loading article...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                {modeInfo.icon}
                Editing: {articleTitle}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge className={modeInfo.color}>
                  {modeInfo.title}
                </Badge>
                <span className="text-sm">{modeInfo.description}</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{wordCount} words</span>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  Unsaved changes
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Safety Warning for Live Mode */}
      {mode === 'live' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Live editing mode:</strong> Your changes will be published directly to Wikipedia. 
            Make sure you follow Wikipedia's policies and guidelines.
          </AlertDescription>
        </Alert>
      )}

      {/* Editor Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="p-3 sm:p-4">
              <EditingToolbar
                onInsertText={insertText}
                disabled={readOnly}
                mode={mode}
              />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <Tabs value={showPreview ? 'preview' : 'edit'} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger 
                    value="edit" 
                    onClick={() => setShowPreview(false)}
                    className="flex items-center gap-2"
                  >
                    <Code className="h-4 w-4" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preview" 
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="space-y-4">
                  <Textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart)}
                    placeholder="Start editing... Use wikitext markup for formatting."
                    className="min-h-[400px] font-mono text-sm"
                    disabled={readOnly}
                  />
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                  <WikitextPreview content={content} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Edit Summary and Save */}
          {!readOnly && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Edit Summary {mode === 'live' && <span className="text-red-500">*</span>}
                  </label>
                  <Textarea
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    placeholder="Briefly describe your changes..."
                    className="h-20"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {mode === 'live' && (
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={isMinorEdit}
                          onChange={(e) => setIsMinorEdit(e.target.checked)}
                          className="rounded"
                        />
                        Minor edit
                      </label>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {onCancel && (
                      <Button variant="outline" onClick={onCancel}>
                        Cancel
                      </Button>
                    )}
                    <Button 
                      onClick={handleSave}
                      disabled={saveMutation.isPending || (!hasUnsavedChanges && mode !== 'lesson')}
                      className="flex items-center gap-2"
                    >
                      {saveMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {mode === 'sandbox' ? 'Save to Sandbox' : 
                       mode === 'lesson' ? 'Submit Exercise' : 'Publish Changes'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Tools */}
        <div className="space-y-4">
          <CitationHelper onInsertCitation={(citation) => insertText(citation)} />
          <TemplateHelper onInsertTemplate={(template) => insertText(template)} />
          
          {/* Help Panel */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Quick Help
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 text-sm">
              <div><strong>Bold:</strong> '''text'''</div>
              <div><strong>Italic:</strong> ''text''</div>
              <div><strong>Link:</strong> [[Article]]</div>
              <div><strong>External:</strong> [URL text]</div>
              <div><strong>Heading:</strong> == Title ==</div>
              <div><strong>List:</strong> * item</div>
              <div><strong>Reference:</strong> &lt;ref&gt;source&lt;/ref&gt;</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WikipediaEditor;
