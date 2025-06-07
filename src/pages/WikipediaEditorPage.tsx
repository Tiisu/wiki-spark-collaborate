import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Settings, 
  HelpCircle, 
  BookOpen,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

import Header from '@/components/Header';
import WikipediaEditor from '@/components/editor/WikipediaEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EditorPageParams {
  mode?: 'sandbox' | 'live' | 'lesson';
  articleTitle?: string;
  lessonId?: string;
}

const WikipediaEditorPage = () => {
  const { mode = 'sandbox', articleTitle = 'Sandbox', lessonId } = useParams<EditorPageParams>();
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(true);

  // Fetch lesson data if in lesson mode
  const { data: lessonData } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      if (!lessonId) return null;
      
      const response = await fetch(`/api/lessons/${lessonId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch lesson');
      }
      
      return response.json();
    },
    enabled: !!lessonId && mode === 'lesson'
  });

  const handleSave = (content: string) => {
    if (mode === 'lesson' && lessonId) {
      // Navigate back to lesson or show completion
      navigate(`/lessons/${lessonId}/complete`);
    } else {
      // Show success message or navigate to appropriate page
      navigate('/dashboard');
    }
  };

  const handleCancel = () => {
    if (mode === 'lesson' && lessonId) {
      navigate(`/lessons/${lessonId}`);
    } else {
      navigate('/dashboard');
    }
  };

  const getModeInfo = () => {
    switch (mode) {
      case 'sandbox':
        return {
          title: 'Sandbox Editor',
          description: 'Practice editing in a safe environment where your changes won\'t affect live Wikipedia',
          color: 'bg-blue-100 text-blue-800',
          icon: <Settings className="h-5 w-5" />,
          warning: null
        };
      case 'live':
        return {
          title: 'Live Wikipedia Editor',
          description: 'Edit live Wikipedia articles - your changes will be published immediately',
          color: 'bg-red-100 text-red-800',
          icon: <AlertTriangle className="h-5 w-5" />,
          warning: 'Your edits will be published directly to Wikipedia. Make sure you follow all Wikipedia policies and guidelines.'
        };
      case 'lesson':
        return {
          title: 'Lesson Exercise',
          description: 'Complete the editing exercise as part of your learning path',
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-5 w-5" />,
          warning: null
        };
      default:
        return {
          title: 'Wikipedia Editor',
          description: 'Edit Wikipedia content',
          color: 'bg-gray-100 text-gray-800',
          icon: <BookOpen className="h-5 w-5" />,
          warning: null
        };
    }
  };

  const modeInfo = getModeInfo();

  const editorInstructions = {
    sandbox: [
      'This is a safe practice environment - your changes won\'t affect live Wikipedia',
      'Experiment with wikitext markup and formatting',
      'Use the toolbar buttons for common formatting tasks',
      'Preview your changes before saving',
      'Your work is automatically saved as drafts'
    ],
    live: [
      'You are editing a live Wikipedia article',
      'Follow Wikipedia\'s neutral point of view policy',
      'Cite reliable sources for all claims',
      'Write clear edit summaries explaining your changes',
      'Be respectful and collaborative with other editors'
    ],
    lesson: [
      'Complete the editing task as described in the lesson',
      'Follow the specific instructions provided',
      'Use the tools and techniques you\'ve learned',
      'Ask for help if you get stuck',
      'Submit your work when you\'re satisfied with it'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      
      <main className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleCancel} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
                {modeInfo.icon}
                {modeInfo.title}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {modeInfo.description}
              </p>
            </div>
          </div>
          <Badge className={modeInfo.color}>
            {mode.toUpperCase()}
          </Badge>
        </div>

        {/* Mode-specific warning */}
        {modeInfo.warning && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> {modeInfo.warning}
            </AlertDescription>
          </Alert>
        )}

        {/* Lesson instructions */}
        {mode === 'lesson' && lessonData && (
          <Card className="mb-6">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg">Lesson Instructions</CardTitle>
              <CardDescription>
                {lessonData.data?.title || 'Complete the editing exercise'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="prose prose-sm max-w-none">
                {lessonData.data?.instructions ? (
                  <div dangerouslySetInnerHTML={{ __html: lessonData.data.instructions }} />
                ) : (
                  <p>Follow the editing instructions provided in this lesson.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions panel */}
        {showInstructions && (
          <Card className="mb-6">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  <CardTitle className="text-lg">Getting Started</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowInstructions(false)}
                >
                  Hide
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <ul className="space-y-2 text-sm">
                {editorInstructions[mode as keyof typeof editorInstructions].map((instruction, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Editor */}
        <WikipediaEditor
          articleTitle={articleTitle}
          mode={mode as 'sandbox' | 'live' | 'lesson'}
          onSave={handleSave}
          onCancel={handleCancel}
          lessonId={lessonId}
          initialContent={lessonData?.data?.initialContent || ''}
        />

        {/* Help section */}
        <Card className="mt-6">
          <CardContent className="p-4 sm:p-6">
            <Tabs defaultValue="markup" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="markup">Markup Guide</TabsTrigger>
                <TabsTrigger value="policies">Policies</TabsTrigger>
                <TabsTrigger value="help">Get Help</TabsTrigger>
              </TabsList>
              
              <TabsContent value="markup" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Text Formatting</h4>
                    <div className="space-y-1 font-mono text-xs">
                      <div><strong>Bold:</strong> '''text'''</div>
                      <div><strong>Italic:</strong> ''text''</div>
                      <div><strong>Bold + Italic:</strong> '''''text'''''</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Links</h4>
                    <div className="space-y-1 font-mono text-xs">
                      <div><strong>Internal:</strong> [[Article]]</div>
                      <div><strong>Piped:</strong> [[Article|Display text]]</div>
                      <div><strong>External:</strong> [URL Display text]</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Headings</h4>
                    <div className="space-y-1 font-mono text-xs">
                      <div><strong>Level 2:</strong> == Heading ==</div>
                      <div><strong>Level 3:</strong> === Heading ===</div>
                      <div><strong>Level 4:</strong> ==== Heading ====</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Lists</h4>
                    <div className="space-y-1 font-mono text-xs">
                      <div><strong>Bullet:</strong> * Item</div>
                      <div><strong>Numbered:</strong> # Item</div>
                      <div><strong>Nested:</strong> ** Sub-item</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="policies" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Core Policies</h4>
                    <ul className="space-y-1">
                      <li>• Neutral Point of View (NPOV)</li>
                      <li>• Verifiability</li>
                      <li>• No Original Research</li>
                      <li>• Assume Good Faith</li>
                      <li>• Be Bold</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Content Guidelines</h4>
                    <ul className="space-y-1">
                      <li>• Cite reliable sources</li>
                      <li>• Write in an encyclopedic tone</li>
                      <li>• Avoid promotional language</li>
                      <li>• Respect copyright</li>
                      <li>• Be concise and clear</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="help" className="space-y-4">
                <div className="text-sm space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Need Help?</h4>
                    <p>If you're stuck or have questions about editing Wikipedia:</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-1">Learning Resources</h5>
                      <ul className="space-y-1">
                        <li>• Complete our editing courses</li>
                        <li>• Practice in the sandbox</li>
                        <li>• Read Wikipedia's help pages</li>
                        <li>• Join our community discussions</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">Get Support</h5>
                      <ul className="space-y-1">
                        <li>• Ask questions in our forums</li>
                        <li>• Contact our mentors</li>
                        <li>• Join live editing sessions</li>
                        <li>• Visit Wikipedia's help desk</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default WikipediaEditorPage;
