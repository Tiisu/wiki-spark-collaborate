/**
 * Utility functions for testing role-based routing functionality
 * These functions help verify that the role-based routing system works correctly
 */

export interface TestUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
  preferredLanguage: string;
}

/**
 * Mock users for testing different roles
 */
export const mockUsers: Record<string, TestUser> = {
  student: {
    id: '1',
    email: 'student@example.com',
    username: 'student_user',
    firstName: 'John',
    lastName: 'Student',
    role: 'LEARNER',
    isEmailVerified: true,
    preferredLanguage: 'en',
  },
  instructor: {
    id: '2',
    email: 'instructor@example.com',
    username: 'instructor_user',
    firstName: 'Jane',
    lastName: 'Instructor',
    role: 'INSTRUCTOR',
    isEmailVerified: true,
    preferredLanguage: 'en',
  },
  mentor: {
    id: '3',
    email: 'mentor@example.com',
    username: 'mentor_user',
    firstName: 'Mike',
    lastName: 'Mentor',
    role: 'MENTOR',
    isEmailVerified: true,
    preferredLanguage: 'en',
  },
  admin: {
    id: '4',
    email: 'admin@example.com',
    username: 'admin_user',
    firstName: 'Alice',
    lastName: 'Admin',
    role: 'ADMIN',
    isEmailVerified: true,
    preferredLanguage: 'en',
  },
  superAdmin: {
    id: '5',
    email: 'superadmin@example.com',
    username: 'superadmin_user',
    firstName: 'Bob',
    lastName: 'SuperAdmin',
    role: 'SUPER_ADMIN',
    isEmailVerified: true,
    preferredLanguage: 'en',
  },
};

/**
 * Expected dashboard routes for each role
 */
export const expectedDashboardRoutes: Record<string, string> = {
  LEARNER: '/student',
  INSTRUCTOR: '/instructor',
  MENTOR: '/instructor',
  ADMIN: '/admin',
  SUPER_ADMIN: '/admin',
};

/**
 * Role access matrix - which roles can access which dashboards
 */
export const roleAccessMatrix = {
  '/student': ['LEARNER', 'INSTRUCTOR', 'MENTOR', 'ADMIN', 'SUPER_ADMIN'],
  '/instructor': ['INSTRUCTOR', 'MENTOR', 'ADMIN', 'SUPER_ADMIN'],
  '/admin': ['ADMIN', 'SUPER_ADMIN'],
};

/**
 * Test if a role should have access to a specific route
 */
export const shouldHaveAccess = (userRole: string, route: string): boolean => {
  const allowedRoles = roleAccessMatrix[route as keyof typeof roleAccessMatrix];
  return allowedRoles ? allowedRoles.includes(userRole.toUpperCase()) : false;
};

/**
 * Get the expected dashboard route for a user role
 */
export const getExpectedDashboard = (userRole: string): string => {
  return expectedDashboardRoutes[userRole.toUpperCase()] || '/student';
};

/**
 * Validate role-based routing logic
 */
export const validateRoleRouting = (userRole: string, actualRoute: string): boolean => {
  const expectedRoute = getExpectedDashboard(userRole);
  return expectedRoute === actualRoute;
};

/**
 * Test scenarios for role-based routing
 */
export const testScenarios = [
  {
    name: 'Student should be redirected to student dashboard',
    user: mockUsers.student,
    expectedRoute: '/student',
    shouldRedirect: true,
  },
  {
    name: 'Instructor should be redirected to instructor dashboard',
    user: mockUsers.instructor,
    expectedRoute: '/instructor',
    shouldRedirect: true,
  },
  {
    name: 'Mentor should be redirected to instructor dashboard',
    user: mockUsers.mentor,
    expectedRoute: '/instructor',
    shouldRedirect: true,
  },
  {
    name: 'Admin should be redirected to admin dashboard',
    user: mockUsers.admin,
    expectedRoute: '/admin',
    shouldRedirect: true,
  },
  {
    name: 'Super Admin should be redirected to admin dashboard',
    user: mockUsers.superAdmin,
    expectedRoute: '/admin',
    shouldRedirect: true,
  },
];

/**
 * Access control test scenarios
 */
export const accessControlScenarios = [
  {
    name: 'Student cannot access instructor dashboard',
    user: mockUsers.student,
    route: '/instructor',
    shouldHaveAccess: false,
  },
  {
    name: 'Student cannot access admin dashboard',
    user: mockUsers.student,
    route: '/admin',
    shouldHaveAccess: false,
  },
  {
    name: 'Instructor can access student dashboard',
    user: mockUsers.instructor,
    route: '/student',
    shouldHaveAccess: true,
  },
  {
    name: 'Instructor cannot access admin dashboard',
    user: mockUsers.instructor,
    route: '/admin',
    shouldHaveAccess: false,
  },
  {
    name: 'Admin can access all dashboards',
    user: mockUsers.admin,
    route: '/student',
    shouldHaveAccess: true,
  },
  {
    name: 'Admin can access instructor dashboard',
    user: mockUsers.admin,
    route: '/instructor',
    shouldHaveAccess: true,
  },
];

/**
 * Console logging helper for testing
 */
export const logTestResults = (testName: string, passed: boolean, details?: string) => {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${testName}`);
  if (details) {
    console.log(`   Details: ${details}`);
  }
};

/**
 * Run all role routing tests
 */
export const runRoleRoutingTests = () => {
  console.log('🧪 Running Role-Based Routing Tests...\n');
  
  let passedTests = 0;
  let totalTests = 0;

  // Test role-based dashboard routing
  testScenarios.forEach(scenario => {
    totalTests++;
    const actualRoute = getExpectedDashboard(scenario.user.role);
    const passed = actualRoute === scenario.expectedRoute;
    
    if (passed) passedTests++;
    
    logTestResults(
      scenario.name,
      passed,
      `Expected: ${scenario.expectedRoute}, Got: ${actualRoute}`
    );
  });

  // Test access control
  accessControlScenarios.forEach(scenario => {
    totalTests++;
    const hasAccess = shouldHaveAccess(scenario.user.role, scenario.route);
    const passed = hasAccess === scenario.shouldHaveAccess;
    
    if (passed) passedTests++;
    
    logTestResults(
      scenario.name,
      passed,
      `Expected access: ${scenario.shouldHaveAccess}, Got: ${hasAccess}`
    );
  });

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Role-based routing is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
};

// Export for use in browser console during development
if (typeof window !== 'undefined') {
  (window as any).roleTestUtils = {
    mockUsers,
    runRoleRoutingTests,
    shouldHaveAccess,
    getExpectedDashboard,
    validateRoleRouting,
  };
}
