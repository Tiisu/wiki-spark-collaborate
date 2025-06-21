import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sun, Moon, CheckCircle, AlertCircle } from 'lucide-react';

interface ThemeTestCardProps {
  onToggleTheme?: () => void;
  isDark?: boolean;
}

const ThemeTestCard: React.FC<ThemeTestCardProps> = ({ onToggleTheme, isDark = false }) => {
  const testItems = [
    {
      label: 'Primary Text',
      className: 'text-primary',
      expected: 'Blue color, readable in both themes'
    },
    {
      label: 'Card Background',
      className: 'bg-card text-card-foreground',
      expected: 'Adapts to theme, proper contrast'
    },
    {
      label: 'Muted Text',
      className: 'text-muted-foreground',
      expected: 'Lower contrast, but still readable'
    },
    {
      label: 'Border',
      className: 'border border-border',
      expected: 'Subtle border that adapts to theme'
    }
  ];

  return (
    <Card className="max-w-md mx-auto mt-8 border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Theme Test Card</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleTheme}
            className="flex items-center gap-2"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {isDark ? 'Light' : 'Dark'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Testing theme compatibility and text visibility
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Theme Status */}
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`} />
          <span className="text-sm font-medium">
            Current Theme: {isDark ? 'Dark' : 'Light'}
          </span>
        </div>

        {/* Test Items */}
        <div className="space-y-3">
          {testItems.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {item.label}
                </span>
                <CheckCircle className="h-3 w-3 text-green-500" />
              </div>
              <div className={`p-2 rounded text-sm ${item.className}`}>
                Sample text with {item.label.toLowerCase()}
              </div>
              <p className="text-xs text-muted-foreground/70">
                {item.expected}
              </p>
            </div>
          ))}
        </div>

        {/* Color Swatches */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="space-y-1">
            <div className="w-full h-8 bg-primary rounded"></div>
            <span className="text-xs text-center block">Primary</span>
          </div>
          <div className="space-y-1">
            <div className="w-full h-8 bg-secondary rounded"></div>
            <span className="text-xs text-center block">Secondary</span>
          </div>
          <div className="space-y-1">
            <div className="w-full h-8 bg-muted rounded"></div>
            <span className="text-xs text-center block">Muted</span>
          </div>
          <div className="space-y-1">
            <div className="w-full h-8 bg-accent rounded"></div>
            <span className="text-xs text-center block">Accent</span>
          </div>
        </div>

        {/* Badges Test */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Default Badge</Badge>
          <Badge variant="secondary">Secondary Badge</Badge>
          <Badge variant="outline">Outline Badge</Badge>
          <Badge className="bg-green-500 text-white">Custom Badge</Badge>
        </div>

        {/* Buttons Test */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm">Primary Button</Button>
          <Button variant="secondary" size="sm">Secondary</Button>
          <Button variant="outline" size="sm">Outline</Button>
          <Button variant="ghost" size="sm">Ghost</Button>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-700 dark:text-green-300">
            All theme elements are working correctly
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeTestCard;
