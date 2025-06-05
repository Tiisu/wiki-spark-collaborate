
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Calendar, Library } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-800">WikiWalkthrough</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#learning" className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors">
              <BookOpen className="h-4 w-4" />
              <span>Learning Paths</span>
            </a>
            <a href="#community" className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors">
              <Users className="h-4 w-4" />
              <span>Community</span>
            </a>
            <a href="#events" className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors">
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </a>
            <a href="#resources" className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors">
              <Library className="h-4 w-4" />
              <span>Resources</span>
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="hidden sm:inline-flex">
              Sign In
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
