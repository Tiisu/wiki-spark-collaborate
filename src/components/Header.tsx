
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen,
  Users,
  Calendar,
  Library,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Trophy,
  Award
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigationItems = [
    { href: '/courses', icon: BookOpen, label: 'Courses' },
    { href: '/achievements', icon: Trophy, label: 'Achievements' },
    { href: '/certificates', icon: Award, label: 'Certificates' },
    { href: '/tutorials', icon: Library, label: 'Tutorials' },
    { href: '#community', icon: Users, label: 'Community' },
  ];

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span className="text-lg sm:text-2xl font-bold text-foreground hidden xs:block">
              WikiWalkthrough
            </span>
            <span className="text-lg font-bold text-foreground xs:hidden">
              WWT
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 text-muted-foreground hover:text-blue-600 transition-colors duration-200 group"
              >
                <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>

          {/* User Menu & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            {isAuthenticated && user ? (
              <>
                {/* Desktop User Menu */}
                <div className="hidden lg:flex items-center space-x-4">
                  <Link to="/dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/editor/sandbox">
                    <Button variant="outline" size="sm">
                      Editor
                    </Button>
                  </Link>
                  {user && ['INSTRUCTOR', 'MENTOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role) && (
                    <Link to="/instructor">
                      <Button variant="outline" size="sm">
                        Instructor Panel
                      </Button>
                    </Link>
                  )}
                  {user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role) && (
                    <Link to="/admin">
                      <Button variant="outline" size="sm">
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                </div>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 px-2 sm:px-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="hidden sm:block text-foreground font-medium">
                        {user.firstName}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="lg:hidden">
                      <Link to="/dashboard" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="lg:hidden">
                      <Link to="/editor/sandbox" className="flex items-center">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Editor
                      </Link>
                    </DropdownMenuItem>
                    {user && ['INSTRUCTOR', 'MENTOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role) && (
                      <DropdownMenuItem asChild className="lg:hidden">
                        <Link to="/instructor" className="flex items-center">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Instructor Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role) && (
                      <DropdownMenuItem asChild className="lg:hidden">
                        <Link to="/admin" className="flex items-center">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="lg:hidden" />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="sm:hidden">Join</span>
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Mobile Theme Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Theme</span>
                    <ThemeToggle />
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="space-y-4">
                    {navigationItems.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 text-muted-foreground hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-muted"
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </a>
                    ))}
                  </nav>

                  {/* Mobile Auth Actions */}
                  {!isAuthenticated && (
                    <div className="space-y-3 pt-4 border-t">
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
