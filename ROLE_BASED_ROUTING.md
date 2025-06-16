# Role-Based Dashboard Routing Implementation

## Overview

This document describes the implementation of role-based dashboard routing for the WikiWalkthrough platform. The system automatically redirects users to their appropriate dashboard based on their role upon login and provides proper access controls for each dashboard type.

## User Roles

The platform supports the following user roles with hierarchical permissions:

- **LEARNER** (Student): Basic user role for course enrollment and learning
- **INSTRUCTOR**: Can create and manage courses, view student progress
- **MENTOR**: Enhanced instructor privileges with additional mentoring capabilities
- **ADMIN**: Platform administration with user management and content moderation
- **SUPER_ADMIN**: Full system access with all administrative privileges

## Dashboard Types

### 1. Student Dashboard (`/student`)
- **Access**: All authenticated users (LEARNER, INSTRUCTOR, MENTOR, ADMIN, SUPER_ADMIN)
- **Features**: Course enrollment, progress tracking, learning activities, achievements
- **Component**: `StudentDashboard` (formerly `Dashboard`)

### 2. Instructor Dashboard (`/instructor`)
- **Access**: INSTRUCTOR, MENTOR, ADMIN, SUPER_ADMIN
- **Features**: Course creation/management, student tracking, analytics, content upload, templates
- **Component**: `InstructorDashboard`

### 3. Admin Dashboard (`/admin`)
- **Access**: ADMIN, SUPER_ADMIN
- **Features**: User management, platform analytics, course moderation, system settings
- **Component**: `AdminDashboard`

## Routing Structure

### Smart Routing
- `/dashboard` - Automatically redirects to role-appropriate dashboard
- `/student` - Student dashboard (protected by StudentProtectedRoute)
- `/instructor` - Instructor dashboard (protected by InstructorProtectedRoute)
- `/admin` - Admin dashboard (protected by AdminProtectedRoute)

### Route Protection
Each dashboard is protected by role-specific route guards that:
1. Verify user authentication
2. Check role permissions
3. Redirect unauthorized users to appropriate dashboard
4. Show access denied message when configured

## Key Components

### 1. RoleBasedRouter (`src/components/auth/RoleBasedRouter.tsx`)
- Handles automatic redirection from `/dashboard` to role-specific dashboard
- Provides `useRoleBasedRoute` hook for getting dashboard routes

### 2. RoleProtectedRoute (`src/components/auth/RoleProtectedRoute.tsx`)
- Enhanced protected route with role-based access control
- Provides convenience components: `AdminProtectedRoute`, `InstructorProtectedRoute`, `StudentProtectedRoute`
- Shows access denied page for unauthorized access

### 3. Enhanced AuthContext (`src/contexts/AuthContext.tsx`)
- Added `getRoleBasedDashboard()` method
- Added `hasRole(roles)` method for permission checking
- Maintains backward compatibility

### 4. Updated LoginForm (`src/components/auth/LoginForm.tsx`)
- Uses role-based redirection after successful login
- Maintains support for redirect to originally requested page

### 5. Updated Header (`src/components/Header.tsx`)
- Dashboard button links to role-appropriate dashboard
- Maintains existing role-based navigation for admin/instructor panels

## Implementation Details

### Login Flow
1. User submits login credentials
2. Authentication succeeds and user data is loaded
3. `getRoleBasedDashboard()` determines appropriate dashboard
4. User is redirected to role-specific dashboard or originally requested page

### Access Control Flow
1. User attempts to access a protected route
2. `RoleProtectedRoute` checks authentication status
3. If authenticated, checks if user role is in allowed roles list
4. If authorized, renders the component
5. If unauthorized, redirects to appropriate dashboard or shows access denied

### Role Hierarchy
The system implements a hierarchical role system where higher-level roles inherit permissions from lower levels:
- SUPER_ADMIN can access all dashboards
- ADMIN can access admin and instructor dashboards
- INSTRUCTOR/MENTOR can access instructor and student dashboards
- LEARNER can only access student dashboard

## Development Features

### Role Debugger
In development mode, a `RoleDebugger` component is displayed on all dashboards showing:
- Current user role
- Available dashboard access permissions
- Quick navigation to role-appropriate dashboard

## Configuration

### Environment Variables
No additional environment variables are required. The system uses existing authentication configuration.

### Role Mapping
Role mapping is centralized in the `getRoleBasedDashboard()` function and can be easily modified:

```typescript
const getDashboardRoute = (userRole: string): string => {
  switch (userRole.toUpperCase()) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return '/admin';
    case 'INSTRUCTOR':
    case 'MENTOR':
      return '/instructor';
    case 'LEARNER':
    default:
      return '/student';
  }
};
```

## Testing

### Manual Testing
1. Create users with different roles
2. Login with each role and verify correct dashboard redirection
3. Attempt to access unauthorized dashboards and verify access control
4. Check navigation links in header for role-appropriate options

### Automated Testing
The role-based routing can be tested using React Testing Library by:
1. Mocking the AuthContext with different user roles
2. Testing route navigation and access control
3. Verifying proper redirection behavior

## Migration Notes

### Breaking Changes
- `/dashboard` now redirects instead of showing student dashboard directly
- Student dashboard moved to `/student` route
- Enhanced protected routes replace basic authentication checks

### Backward Compatibility
- Existing bookmarks to `/dashboard` will automatically redirect
- All existing API endpoints remain unchanged
- User roles and permissions are preserved

## Security Considerations

1. **Client-side routing** is supplemented by server-side authorization
2. **Role checks** are performed on both frontend and backend
3. **JWT tokens** include role information for server-side validation
4. **Access denied pages** prevent information disclosure about unauthorized routes

## Future Enhancements

1. **Dynamic role assignment** through admin interface
2. **Custom dashboard layouts** per role
3. **Role-based feature flags** for granular permission control
4. **Audit logging** for role-based access attempts
5. **Multi-tenancy support** with organization-specific roles
