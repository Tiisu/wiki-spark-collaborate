import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WikitextPreviewProps {
  content: string;
  className?: string;
}

const WikitextPreview: React.FC<WikitextPreviewProps> = ({ content, className = '' }) => {
  const [debouncedContent, setDebouncedContent] = useState(content);

  // Debounce content changes to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedContent(content);
    }, 500);

    return () => clearTimeout(timer);
  }, [content]);

  const { data: previewHtml, isLoading, error } = useQuery({
    queryKey: ['wikitext-preview', debouncedContent],
    queryFn: async () => {
      if (!debouncedContent.trim()) {
        return '<p><em>No content to preview</em></p>';
      }

      try {
        // Use Wikipedia's parse API to convert wikitext to HTML
        const response = await fetch('/api/editor/preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({ wikitext: debouncedContent })
        });

        if (!response.ok) {
          throw new Error('Failed to generate preview');
        }

        const data = await response.json();
        return data.html || parseWikitextLocally(debouncedContent);
      } catch (error) {
        // Fallback to local parsing if API fails
        return parseWikitextLocally(debouncedContent);
      }
    },
    enabled: !!debouncedContent,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Basic local wikitext parser for fallback
  const parseWikitextLocally = (wikitext: string): string => {
    let html = wikitext;

    // Convert basic wikitext to HTML
    // Bold text
    html = html.replace(/'''(.*?)'''/g, '<strong>$1</strong>');
    
    // Italic text
    html = html.replace(/''(.*?)''/g, '<em>$1</em>');
    
    // Headings
    html = html.replace(/^======\s*(.*?)\s*======$/gm, '<h6>$1</h6>');
    html = html.replace(/^=====\s*(.*?)\s*=====$/gm, '<h5>$1</h5>');
    html = html.replace(/^====\s*(.*?)\s*====$/gm, '<h4>$1</h4>');
    html = html.replace(/^===\s*(.*?)\s*===$/gm, '<h3>$1</h3>');
    html = html.replace(/^==\s*(.*?)\s*==$/gm, '<h2>$1</h2>');
    html = html.replace(/^=\s*(.*?)\s*=$/gm, '<h1>$1</h1>');
    
    // Internal links
    html = html.replace(/\[\[(.*?)\]\]/g, (match, link) => {
      const parts = link.split('|');
      const target = parts[0].trim();
      const display = parts[1] ? parts[1].trim() : target;
      return `<a href="https://en.wikipedia.org/wiki/${encodeURIComponent(target)}" target="_blank" class="text-blue-600 hover:underline">${display}</a>`;
    });
    
    // External links
    html = html.replace(/\[(https?:\/\/[^\s\]]+)\s+([^\]]+)\]/g, '<a href="$1" target="_blank" class="text-blue-600 hover:underline">$2</a>');
    html = html.replace(/\[(https?:\/\/[^\s\]]+)\]/g, '<a href="$1" target="_blank" class="text-blue-600 hover:underline">$1</a>');
    
    // Unordered lists
    html = html.replace(/^\*\s*(.*?)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Ordered lists
    html = html.replace(/^#\s*(.*?)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    // Wrap in paragraphs
    if (html && !html.startsWith('<')) {
      html = '<p>' + html + '</p>';
    }
    
    // References (basic)
    html = html.replace(/<ref>(.*?)<\/ref>/g, '<sup><a href="#" class="text-blue-600">[ref]</a></sup>');
    html = html.replace(/<ref\s+name="([^"]*)">(.*?)<\/ref>/g, '<sup><a href="#" class="text-blue-600">[$1]</a></sup>');
    html = html.replace(/<ref\s+name="([^"]*)"\/>/g, '<sup><a href="#" class="text-blue-600">[$1]</a></sup>');
    
    // Templates (basic)
    html = html.replace(/\{\{([^}]+)\}\}/g, '<span class="bg-gray-100 px-2 py-1 rounded text-sm border">Template: $1</span>');
    
    // Nowiki tags
    html = html.replace(/<nowiki>(.*?)<\/nowiki>/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');
    
    // Code blocks
    html = html.replace(/<pre>(.*?)<\/pre>/gs, '<pre class="bg-gray-100 p-3 rounded overflow-x-auto"><code>$1</code></pre>');
    
    return html;
  };

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to generate preview. The content will be displayed as plain text.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`min-h-[400px] border rounded-lg p-4 bg-white ${className}`}>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin mr-3" />
          <span className="text-gray-600">Generating preview...</span>
        </div>
      ) : (
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: previewHtml || '<p><em>No content to preview</em></p>' 
          }}
          style={{
            // Custom styles for Wikipedia-like appearance
            lineHeight: '1.6',
            fontSize: '14px'
          }}
        />
      )}
      
      {/* Preview disclaimer */}
      <div className="mt-4 pt-4 border-t text-xs text-gray-500">
        <p>
          <strong>Note:</strong> This is a simplified preview. The actual appearance on Wikipedia may differ slightly.
          {isLoading && ' Preview is being generated...'}
        </p>
      </div>
    </div>
  );
};

export default WikitextPreview;
