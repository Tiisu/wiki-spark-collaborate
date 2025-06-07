import React, { useState } from 'react';
import { BookOpen, Globe, FileText, Plus, Search } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CitationHelperProps {
  onInsertCitation: (citation: string) => void;
}

interface CitationForm {
  type: 'web' | 'book' | 'journal' | 'news';
  title: string;
  author: string;
  url?: string;
  website?: string;
  publisher?: string;
  date?: string;
  accessDate?: string;
  pages?: string;
  isbn?: string;
  doi?: string;
  journal?: string;
  volume?: string;
  issue?: string;
}

const CitationHelper: React.FC<CitationHelperProps> = ({ onInsertCitation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [citationType, setCitationType] = useState<CitationForm['type']>('web');
  const [form, setForm] = useState<CitationForm>({
    type: 'web',
    title: '',
    author: '',
    url: '',
    website: '',
    publisher: '',
    date: '',
    accessDate: new Date().toISOString().split('T')[0], // Today's date
    pages: '',
    isbn: '',
    doi: '',
    journal: '',
    volume: '',
    issue: ''
  });

  const resetForm = () => {
    setForm({
      type: citationType,
      title: '',
      author: '',
      url: '',
      website: '',
      publisher: '',
      date: '',
      accessDate: new Date().toISOString().split('T')[0],
      pages: '',
      isbn: '',
      doi: '',
      journal: '',
      volume: '',
      issue: ''
    });
  };

  const generateCitation = (): string => {
    const { type, title, author, url, website, publisher, date, accessDate, pages, isbn, doi, journal, volume, issue } = form;

    switch (type) {
      case 'web':
        let webCitation = '{{cite web';
        if (title) webCitation += `|title=${title}`;
        if (author) webCitation += `|author=${author}`;
        if (url) webCitation += `|url=${url}`;
        if (website) webCitation += `|website=${website}`;
        if (publisher) webCitation += `|publisher=${publisher}`;
        if (date) webCitation += `|date=${date}`;
        if (accessDate) webCitation += `|access-date=${accessDate}`;
        webCitation += '}}';
        return webCitation;

      case 'book':
        let bookCitation = '{{cite book';
        if (title) bookCitation += `|title=${title}`;
        if (author) bookCitation += `|author=${author}`;
        if (publisher) bookCitation += `|publisher=${publisher}`;
        if (date) bookCitation += `|date=${date}`;
        if (pages) bookCitation += `|pages=${pages}`;
        if (isbn) bookCitation += `|isbn=${isbn}`;
        bookCitation += '}}';
        return bookCitation;

      case 'journal':
        let journalCitation = '{{cite journal';
        if (title) journalCitation += `|title=${title}`;
        if (author) journalCitation += `|author=${author}`;
        if (journal) journalCitation += `|journal=${journal}`;
        if (volume) journalCitation += `|volume=${volume}`;
        if (issue) journalCitation += `|issue=${issue}`;
        if (pages) journalCitation += `|pages=${pages}`;
        if (date) journalCitation += `|date=${date}`;
        if (doi) journalCitation += `|doi=${doi}`;
        journalCitation += '}}';
        return journalCitation;

      case 'news':
        let newsCitation = '{{cite news';
        if (title) newsCitation += `|title=${title}`;
        if (author) newsCitation += `|author=${author}`;
        if (url) newsCitation += `|url=${url}`;
        if (website) newsCitation += `|newspaper=${website}`;
        if (publisher) newsCitation += `|publisher=${publisher}`;
        if (date) newsCitation += `|date=${date}`;
        if (accessDate) newsCitation += `|access-date=${accessDate}`;
        newsCitation += '}}';
        return newsCitation;

      default:
        return '';
    }
  };

  const handleInsert = () => {
    const citation = generateCitation();
    if (citation) {
      onInsertCitation(`<ref>${citation}</ref>`);
      setIsOpen(false);
      resetForm();
    }
  };

  const handleFormChange = (field: keyof CitationForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const citationTypes = [
    { value: 'web', label: 'Website', icon: Globe },
    { value: 'book', label: 'Book', icon: BookOpen },
    { value: 'journal', label: 'Journal', icon: FileText },
    { value: 'news', label: 'News', icon: FileText }
  ];

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Citations
        </CardTitle>
        <CardDescription className="text-sm">
          Add properly formatted citations
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Citation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Citation</DialogTitle>
              <DialogDescription>
                Fill in the details to generate a properly formatted citation.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={citationType} onValueChange={(value) => {
              setCitationType(value as CitationForm['type']);
              setForm(prev => ({ ...prev, type: value as CitationForm['type'] }));
            }}>
              <TabsList className="grid w-full grid-cols-4">
                {citationTypes.map((type) => (
                  <TabsTrigger key={type.value} value={type.value} className="text-xs">
                    <type.icon className="h-3 w-3 mr-1" />
                    {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="web" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="web-title">Title *</Label>
                    <Input
                      id="web-title"
                      value={form.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      placeholder="Article title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="web-author">Author</Label>
                    <Input
                      id="web-author"
                      value={form.author}
                      onChange={(e) => handleFormChange('author', e.target.value)}
                      placeholder="Author name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="web-url">URL *</Label>
                    <Input
                      id="web-url"
                      value={form.url}
                      onChange={(e) => handleFormChange('url', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="web-website">Website</Label>
                    <Input
                      id="web-website"
                      value={form.website}
                      onChange={(e) => handleFormChange('website', e.target.value)}
                      placeholder="Website name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="web-publisher">Publisher</Label>
                    <Input
                      id="web-publisher"
                      value={form.publisher}
                      onChange={(e) => handleFormChange('publisher', e.target.value)}
                      placeholder="Publisher name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="web-date">Publication Date</Label>
                    <Input
                      id="web-date"
                      type="date"
                      value={form.date}
                      onChange={(e) => handleFormChange('date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="web-access-date">Access Date</Label>
                    <Input
                      id="web-access-date"
                      type="date"
                      value={form.accessDate}
                      onChange={(e) => handleFormChange('accessDate', e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="book" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="book-title">Title *</Label>
                    <Input
                      id="book-title"
                      value={form.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      placeholder="Book title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="book-author">Author *</Label>
                    <Input
                      id="book-author"
                      value={form.author}
                      onChange={(e) => handleFormChange('author', e.target.value)}
                      placeholder="Author name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="book-publisher">Publisher</Label>
                    <Input
                      id="book-publisher"
                      value={form.publisher}
                      onChange={(e) => handleFormChange('publisher', e.target.value)}
                      placeholder="Publisher name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="book-date">Publication Date</Label>
                    <Input
                      id="book-date"
                      type="date"
                      value={form.date}
                      onChange={(e) => handleFormChange('date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="book-pages">Pages</Label>
                    <Input
                      id="book-pages"
                      value={form.pages}
                      onChange={(e) => handleFormChange('pages', e.target.value)}
                      placeholder="123-456"
                    />
                  </div>
                  <div>
                    <Label htmlFor="book-isbn">ISBN</Label>
                    <Input
                      id="book-isbn"
                      value={form.isbn}
                      onChange={(e) => handleFormChange('isbn', e.target.value)}
                      placeholder="978-0-123456-78-9"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="journal" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="journal-title">Article Title *</Label>
                    <Input
                      id="journal-title"
                      value={form.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      placeholder="Article title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="journal-author">Author *</Label>
                    <Input
                      id="journal-author"
                      value={form.author}
                      onChange={(e) => handleFormChange('author', e.target.value)}
                      placeholder="Author name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="journal-journal">Journal *</Label>
                    <Input
                      id="journal-journal"
                      value={form.journal}
                      onChange={(e) => handleFormChange('journal', e.target.value)}
                      placeholder="Journal name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="journal-volume">Volume</Label>
                    <Input
                      id="journal-volume"
                      value={form.volume}
                      onChange={(e) => handleFormChange('volume', e.target.value)}
                      placeholder="Volume number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="journal-issue">Issue</Label>
                    <Input
                      id="journal-issue"
                      value={form.issue}
                      onChange={(e) => handleFormChange('issue', e.target.value)}
                      placeholder="Issue number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="journal-pages">Pages</Label>
                    <Input
                      id="journal-pages"
                      value={form.pages}
                      onChange={(e) => handleFormChange('pages', e.target.value)}
                      placeholder="123-456"
                    />
                  </div>
                  <div>
                    <Label htmlFor="journal-date">Publication Date</Label>
                    <Input
                      id="journal-date"
                      type="date"
                      value={form.date}
                      onChange={(e) => handleFormChange('date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="journal-doi">DOI</Label>
                    <Input
                      id="journal-doi"
                      value={form.doi}
                      onChange={(e) => handleFormChange('doi', e.target.value)}
                      placeholder="10.1000/182"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="news" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="news-title">Article Title *</Label>
                    <Input
                      id="news-title"
                      value={form.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      placeholder="News article title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="news-author">Author</Label>
                    <Input
                      id="news-author"
                      value={form.author}
                      onChange={(e) => handleFormChange('author', e.target.value)}
                      placeholder="Author name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="news-url">URL</Label>
                    <Input
                      id="news-url"
                      value={form.url}
                      onChange={(e) => handleFormChange('url', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="news-newspaper">Newspaper</Label>
                    <Input
                      id="news-newspaper"
                      value={form.website}
                      onChange={(e) => handleFormChange('website', e.target.value)}
                      placeholder="Newspaper name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="news-publisher">Publisher</Label>
                    <Input
                      id="news-publisher"
                      value={form.publisher}
                      onChange={(e) => handleFormChange('publisher', e.target.value)}
                      placeholder="Publisher name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="news-date">Publication Date</Label>
                    <Input
                      id="news-date"
                      type="date"
                      value={form.date}
                      onChange={(e) => handleFormChange('date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="news-access-date">Access Date</Label>
                    <Input
                      id="news-access-date"
                      type="date"
                      value={form.accessDate}
                      onChange={(e) => handleFormChange('accessDate', e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInsert} disabled={!form.title.trim()}>
                Insert Citation
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick citation buttons */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600">Quick Citations:</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onInsertCitation('<ref>{{cite web|title=|url=|access-date=' + new Date().toISOString().split('T')[0] + '}}</ref>')}
              className="text-xs"
            >
              Web
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onInsertCitation('<ref>{{cite book|title=|author=|publisher=|date=}}</ref>')}
              className="text-xs"
            >
              Book
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CitationHelper;
