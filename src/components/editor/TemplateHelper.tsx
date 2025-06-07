import React, { useState } from 'react';
import { LayoutTemplate, Info, AlertTriangle, CheckCircle, Search } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface TemplateHelperProps {
  onInsertTemplate: (template: string) => void;
}

interface WikiTemplate {
  name: string;
  description: string;
  category: 'maintenance' | 'infobox' | 'navigation' | 'formatting' | 'citation';
  parameters?: string[];
  example: string;
  usage: string;
}

const TemplateHelper: React.FC<TemplateHelperProps> = ({ onInsertTemplate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const templates: WikiTemplate[] = [
    // Maintenance templates
    {
      name: 'stub',
      description: 'Marks an article as a stub (too short)',
      category: 'maintenance',
      example: '{{stub}}',
      usage: 'Add at the end of short articles that need expansion'
    },
    {
      name: 'cleanup',
      description: 'Indicates article needs cleanup',
      category: 'maintenance',
      example: '{{cleanup|date=January 2024}}',
      usage: 'Use when article has formatting or style issues'
    },
    {
      name: 'unreferenced',
      description: 'Article lacks proper citations',
      category: 'maintenance',
      example: '{{unreferenced|date=January 2024}}',
      usage: 'Add when article needs more reliable sources'
    },
    {
      name: 'POV',
      description: 'Neutral point of view issues',
      category: 'maintenance',
      example: '{{POV|date=January 2024}}',
      usage: 'Use when article lacks neutral perspective'
    },

    // Infobox templates
    {
      name: 'Infobox person',
      description: 'Information box for biographical articles',
      category: 'infobox',
      parameters: ['name', 'birth_date', 'birth_place', 'occupation'],
      example: '{{Infobox person|name=|birth_date=|birth_place=|occupation=}}',
      usage: 'Add at the top of biographical articles'
    },
    {
      name: 'Infobox company',
      description: 'Information box for company articles',
      category: 'infobox',
      parameters: ['name', 'founded', 'founder', 'headquarters', 'industry'],
      example: '{{Infobox company|name=|founded=|founder=|headquarters=|industry=}}',
      usage: 'Add at the top of company articles'
    },
    {
      name: 'Infobox book',
      description: 'Information box for book articles',
      category: 'infobox',
      parameters: ['name', 'author', 'publisher', 'pub_date', 'isbn'],
      example: '{{Infobox book|name=|author=|publisher=|pub_date=|isbn=}}',
      usage: 'Add at the top of book articles'
    },

    // Formatting templates
    {
      name: 'quote',
      description: 'Format a quotation',
      category: 'formatting',
      parameters: ['text', 'author', 'source'],
      example: '{{quote|text=Quote text here|author=Author Name|source=Source}}',
      usage: 'Use for notable quotations'
    },
    {
      name: 'main',
      description: 'Link to main article',
      category: 'formatting',
      parameters: ['article'],
      example: '{{main|Article Name}}',
      usage: 'Use in section headers to link to detailed articles'
    },
    {
      name: 'see also',
      description: 'Link to related articles',
      category: 'formatting',
      parameters: ['article'],
      example: '{{see also|Related Article}}',
      usage: 'Use to reference related topics'
    },

    // Navigation templates
    {
      name: 'navbox',
      description: 'Navigation box template',
      category: 'navigation',
      parameters: ['name', 'title', 'group1', 'list1'],
      example: '{{navbox|name=|title=|group1=|list1=}}',
      usage: 'Add navigation boxes at the bottom of articles'
    },

    // Citation templates (common ones)
    {
      name: 'cite web',
      description: 'Citation for web sources',
      category: 'citation',
      parameters: ['title', 'url', 'author', 'date', 'access-date'],
      example: '{{cite web|title=|url=|author=|date=|access-date=}}',
      usage: 'Use within <ref> tags for web citations'
    },
    {
      name: 'cite book',
      description: 'Citation for books',
      category: 'citation',
      parameters: ['title', 'author', 'publisher', 'date', 'isbn'],
      example: '{{cite book|title=|author=|publisher=|date=|isbn=}}',
      usage: 'Use within <ref> tags for book citations'
    }
  ];

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'infobox':
        return <Info className="h-4 w-4 text-blue-600" />;
      case 'navigation':
        return <LayoutTemplate className="h-4 w-4 text-purple-600" />;
      case 'formatting':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'citation':
        return <Search className="h-4 w-4 text-red-600" />;
      default:
        return <LayoutTemplate className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'infobox':
        return 'bg-blue-100 text-blue-800';
      case 'navigation':
        return 'bg-purple-100 text-purple-800';
      case 'formatting':
        return 'bg-green-100 text-green-800';
      case 'citation':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, WikiTemplate[]>);

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4" />
          Templates
        </CardTitle>
        <CardDescription className="text-sm">
          Insert Wikipedia templates
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-8 text-sm"
          />
        </div>

        {/* Templates by category */}
        <Accordion type="single" collapsible className="space-y-2">
          {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
            <AccordionItem key={category} value={category} className="border rounded-lg">
              <AccordionTrigger className="px-3 py-2 hover:no-underline">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  <span className="text-sm font-medium capitalize">{category}</span>
                  <Badge variant="outline" className="text-xs">
                    {categoryTemplates.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <div className="space-y-2">
                  {categoryTemplates.map((template) => (
                    <div key={template.name} className="border rounded p-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{template.name}</span>
                          <Badge className={getCategoryColor(template.category)} variant="outline">
                            {template.category}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onInsertTemplate(template.example)}
                          className="h-6 px-2 text-xs"
                        >
                          Insert
                        </Button>
                      </div>
                      
                      <p className="text-xs text-gray-600">{template.description}</p>
                      
                      <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                        {template.example}
                      </div>
                      
                      <p className="text-xs text-gray-500 italic">{template.usage}</p>
                      
                      {template.parameters && (
                        <div className="text-xs">
                          <span className="font-medium">Parameters: </span>
                          <span className="text-gray-600">
                            {template.parameters.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No templates found matching "{searchTerm}"
          </div>
        )}

        {/* Quick insert buttons */}
        <div className="space-y-2 pt-2 border-t">
          <div className="text-xs font-medium text-gray-600">Quick Insert:</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onInsertTemplate('{{stub}}')}
              className="text-xs"
            >
              Stub
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onInsertTemplate('{{cleanup|date=' + new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) + '}}')}
              className="text-xs"
            >
              Cleanup
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onInsertTemplate('{{main|}}')}
              className="text-xs"
            >
              Main
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onInsertTemplate('{{see also|}}')}
              className="text-xs"
            >
              See Also
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateHelper;
