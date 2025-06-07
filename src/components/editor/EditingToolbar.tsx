import React, { useState } from 'react';
import { 
  Bold, 
  Italic, 
  Link, 
  List, 
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Image,
  Table,
  MoreHorizontal,
  Undo,
  Redo,
  Search,
  Replace
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditingToolbarProps {
  onInsertText: (before: string, after?: string, placeholder?: string) => void;
  disabled?: boolean;
  mode: 'sandbox' | 'live' | 'lesson';
}

const EditingToolbar: React.FC<EditingToolbarProps> = ({ 
  onInsertText, 
  disabled = false,
  mode 
}) => {
  const [linkDialog, setLinkDialog] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkTarget, setLinkTarget] = useState('');
  const [isExternalLink, setIsExternalLink] = useState(false);

  const toolbarButtons = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => onInsertText("'''", "'''", 'bold text'),
      shortcut: 'Ctrl+B'
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => onInsertText("''", "''", 'italic text'),
      shortcut: 'Ctrl+I'
    },
    {
      icon: Link,
      label: 'Link',
      action: () => setLinkDialog(true),
      shortcut: 'Ctrl+K'
    },
    {
      icon: Heading2,
      label: 'Heading',
      action: () => onInsertText('\n== ', ' ==\n', 'Heading'),
      shortcut: 'Ctrl+H'
    },
    {
      icon: List,
      label: 'Bullet List',
      action: () => onInsertText('\n* ', '', 'List item'),
      shortcut: 'Ctrl+L'
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => onInsertText('\n# ', '', 'List item'),
      shortcut: 'Ctrl+Shift+L'
    },
    {
      icon: Quote,
      label: 'Blockquote',
      action: () => onInsertText('\n{{quote|', '}}', 'quoted text'),
      shortcut: 'Ctrl+Q'
    },
    {
      icon: Code,
      label: 'Code',
      action: () => onInsertText('<code>', '</code>', 'code'),
      shortcut: 'Ctrl+`'
    }
  ];

  const handleInsertLink = () => {
    if (!linkTarget.trim()) return;

    if (isExternalLink) {
      if (linkText.trim()) {
        onInsertText(`[${linkTarget} `, ']', linkText);
      } else {
        onInsertText(`[${linkTarget}]`, '', '');
      }
    } else {
      if (linkText.trim()) {
        onInsertText(`[[${linkTarget}|`, ']]', linkText);
      } else {
        onInsertText(`[[`, ']]', linkTarget);
      }
    }

    // Reset dialog
    setLinkDialog(false);
    setLinkText('');
    setLinkTarget('');
    setIsExternalLink(false);
  };

  const insertTemplate = (templateName: string) => {
    onInsertText(`{{${templateName}|`, '}}', 'parameter');
  };

  const insertReference = () => {
    onInsertText('<ref>', '</ref>', 'reference content');
  };

  const insertTable = () => {
    const tableMarkup = `
{| class="wikitable"
|-
! Header 1 !! Header 2 !! Header 3
|-
| Cell 1 || Cell 2 || Cell 3
|-
| Cell 4 || Cell 5 || Cell 6
|}
`;
    onInsertText(tableMarkup, '', '');
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b">
      {/* Basic formatting */}
      <div className="flex items-center gap-1">
        {toolbarButtons.slice(0, 4).map((button, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={button.action}
            disabled={disabled}
            title={`${button.label} (${button.shortcut})`}
            className="h-8 w-8 p-0"
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Lists and structure */}
      <div className="flex items-center gap-1">
        {toolbarButtons.slice(4, 6).map((button, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={button.action}
            disabled={disabled}
            title={`${button.label} (${button.shortcut})`}
            className="h-8 w-8 p-0"
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Advanced formatting */}
      <div className="flex items-center gap-1">
        {toolbarButtons.slice(6).map((button, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={button.action}
            disabled={disabled}
            title={`${button.label} (${button.shortcut})`}
            className="h-8 w-8 p-0"
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Wikipedia-specific tools */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={insertReference}
          disabled={disabled}
          title="Insert Reference"
          className="h-8 px-2 text-xs"
        >
          Ref
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={insertTable}
          disabled={disabled}
          title="Insert Table"
          className="h-8 w-8 p-0"
        >
          <Table className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              title="Insert Template"
              className="h-8 px-2 text-xs"
            >
              Template
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => insertTemplate('cite web')}>
              Cite Web
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertTemplate('cite book')}>
              Cite Book
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertTemplate('cite journal')}>
              Cite Journal
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => insertTemplate('infobox')}>
              Infobox
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertTemplate('navbox')}>
              Navbox
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => insertTemplate('stub')}>
              Stub
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertTemplate('cleanup')}>
              Cleanup
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              title="More Tools"
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onInsertText('\n----\n', '', '')}>
              Horizontal Rule
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertText('<nowiki>', '</nowiki>', 'raw text')}>
              No Wiki
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertText('<pre>', '</pre>', 'preformatted text')}>
              Preformatted
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onInsertText('{{DEFAULTSORT:', '}}', 'Sort Key')}>
              Default Sort
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInsertText('[[Category:', ']]', 'Category Name')}>
              Category
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Link Dialog */}
      <Dialog open={linkDialog} onOpenChange={setLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>
              Create a link to another Wikipedia article or external website.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="internal"
                name="linkType"
                checked={!isExternalLink}
                onChange={() => setIsExternalLink(false)}
              />
              <Label htmlFor="internal">Wikipedia Article</Label>
              <input
                type="radio"
                id="external"
                name="linkType"
                checked={isExternalLink}
                onChange={() => setIsExternalLink(true)}
              />
              <Label htmlFor="external">External Website</Label>
            </div>
            
            <div>
              <Label htmlFor="linkTarget">
                {isExternalLink ? 'URL' : 'Article Title'}
              </Label>
              <Input
                id="linkTarget"
                value={linkTarget}
                onChange={(e) => setLinkTarget(e.target.value)}
                placeholder={isExternalLink ? 'https://example.com' : 'Article name'}
              />
            </div>
            
            <div>
              <Label htmlFor="linkText">Display Text (optional)</Label>
              <Input
                id="linkText"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Text to display"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setLinkDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleInsertLink} disabled={!linkTarget.trim()}>
                Insert Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditingToolbar;
