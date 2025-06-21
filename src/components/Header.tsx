
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import {
  BookOpen,
  Home,
  GraduationCap,
  TrendingUp,
  Plus,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

const Header = () => {
  const { user, isAuthenticated, logout, getRoleBasedDashboard } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Role-based navigation items
  const getNavigationItems = () => {
    if (!isAuthenticated || !user) {
      return [
        { href: '/courses', icon: BookOpen, label: 'Browse Courses', roles: ['all'] },
      ];
    }

    const baseItems = [
      { href: getRoleBasedDashboard(), icon: Home, label: 'Dashboard', roles: ['all'] },
      { href: '/courses', icon: BookOpen, label: 'Courses', roles: ['all'] },
    ];

    // Role-specific items
    if (user.role === 'LEARNER') {
      baseItems.push(
        { href: '/student/progress', icon: TrendingUp, label: 'My Progress', roles: ['LEARNER'] }
      );
    }

    if (['INSTRUCTOR', 'MENTOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      baseItems.push(
        { href: '/instructor/courses/new', icon: Plus, label: 'Create Course', roles: ['INSTRUCTOR', 'MENTOR', 'ADMIN', 'SUPER_ADMIN'] }
      );
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const isActiveLink = (href: string) => {
    if (href === getRoleBasedDashboard() && (location.pathname === getRoleBasedDashboard() || location.pathname === '/dashboard')) {
      return true;
    }
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <header
      className="bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/30 dark:from-background dark:via-blue-950/10 dark:to-indigo-950/10 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-sm"
      role="banner"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          {/* Enhanced Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0 group">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="hidden xs:block">
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                WikiWalkthrough
              </span>
              <div className="text-xs text-muted-foreground font-medium">
                Wikipedia Education Platform
              </div>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent xs:hidden">
              WWT
            </span>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center space-x-2 xl:space-x-4"
            role="navigation"
            aria-label="Primary navigation"
          >
            {navigationItems.map((item) => {
              const isActive = isActiveLink(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`
                    relative flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-gray-800/60 hover:shadow-md'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Navigate to ${item.label}`}
                >
                  <item.icon
                    className={`h-4 w-4 transition-all duration-300 ${
                      isActive ? 'text-white' : 'group-hover:scale-110'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="text-sm">{item.label}</span>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl opacity-20 animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Enhanced User Menu & Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {isAuthenticated && user ? (
              <>
                {/* Notification Bell */}
                <NotificationBell />

                {/* Enhanced User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300">
                      <Avatar className="h-8 w-8 ring-2 ring-blue-500/20 hover:ring-blue-500/40 transition-all duration-300">
                        <AvatarImage src={user.avatar} alt={user.firstName} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                    {/* Enhanced User Info */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg mb-2">
                      <Avatar className="h-10 w-10 ring-2 ring-blue-500/20">
                        <AvatarImage src={user.avatar} alt={user.firstName} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-semibold text-sm">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {user.email}
                        </p>
                        <Badge variant="outline" className="w-fit text-xs px-2 py-0.5">
                          {user.role}
                        </Badge>
                      </div>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Profile & Settings */}
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center py-2.5">
                        <User className="mr-3 h-4 w-4" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center py-2.5">
                        <Settings className="mr-3 h-4 w-4" />
                        <span>Account Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Sign Out */}
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 py-2.5">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Sign Out</span>
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

            {/* Enhanced Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden p-2 hover:bg-white/60 dark:hover:bg-gray-800/60 rounded-xl transition-all duration-300">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-gradient-to-b from-white via-blue-50/30 to-indigo-50/30 dark:from-background dark:via-blue-950/10 dark:to-indigo-950/10">
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Mobile Header */}
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        WikiWalkthrough
                      </h3>
                      <p className="text-xs text-muted-foreground">Wikipedia Education</p>
                    </div>
                  </div>

                  {/* Enhanced Mobile Navigation */}
                  <nav className="space-y-2">
                    {navigationItems.map((item) => {
                      const isActive = isActiveLink(item.href);
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`
                            flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 font-medium
                            ${isActive
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                              : 'text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-gray-800/60'
                            }
                          `}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Mobile Theme Toggle */}
                  <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                    <span className="text-sm font-medium">Theme</span>
                    <ThemeToggle />
                  </div>

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
