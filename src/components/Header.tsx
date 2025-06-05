
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Users, Calendar, Library, User, LogOut } from 'lucide-react';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-800">WikiWalkthrough</span>
          </Link>

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
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-slate-600" />
                  <span className="text-slate-700 hidden sm:inline">
                    {user.firstName} {user.lastName}
                  </span>

                </div>
                <Link to="/dashboard">
                  <Button variant="outline" className="hidden sm:inline-flex">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="hidden sm:inline-flex">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
