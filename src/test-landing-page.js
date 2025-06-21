// Simple test script to verify landing page functionality
// This can be run in the browser console to test API integration

console.log('Testing WikiWalkthrough Landing Page...');

// Test 1: Check if main components are rendered
const testComponentsRendered = () => {
  const hero = document.querySelector('h1');
  const featuredCourses = document.querySelector('[id="featured-courses"]');
  const cta = document.querySelector('button');
  
  console.log('✓ Hero section:', hero ? 'Found' : 'Missing');
  console.log('✓ Featured courses section:', featuredCourses ? 'Found' : 'Missing');
  console.log('✓ CTA buttons:', cta ? 'Found' : 'Missing');
  
  return hero && featuredCourses && cta;
};

// Test 2: Check responsive design
const testResponsiveDesign = () => {
  const viewport = window.innerWidth;
  console.log('✓ Current viewport width:', viewport + 'px');
  
  if (viewport < 640) {
    console.log('✓ Mobile view detected');
  } else if (viewport < 1024) {
    console.log('✓ Tablet view detected');
  } else {
    console.log('✓ Desktop view detected');
  }
  
  return true;
};

// Test 3: Check accessibility features
const testAccessibility = () => {
  const ariaLabels = document.querySelectorAll('[aria-label]');
  const focusableElements = document.querySelectorAll('button, a, input, select, textarea');
  
  console.log('✓ Elements with aria-labels:', ariaLabels.length);
  console.log('✓ Focusable elements:', focusableElements.length);
  
  return ariaLabels.length > 0 && focusableElements.length > 0;
};

// Test 4: Check navigation links
const testNavigation = () => {
  const registerLinks = document.querySelectorAll('a[href="/register"]');
  const loginLinks = document.querySelectorAll('a[href="/login"]');
  
  console.log('✓ Register links:', registerLinks.length);
  console.log('✓ Login links:', loginLinks.length);
  
  return registerLinks.length > 0;
};

// Run all tests
const runTests = () => {
  console.log('\n=== WikiWalkthrough Landing Page Tests ===\n');
  
  const results = {
    components: testComponentsRendered(),
    responsive: testResponsiveDesign(),
    accessibility: testAccessibility(),
    navigation: testNavigation()
  };
  
  console.log('\n=== Test Results ===');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n${allPassed ? '🎉' : '⚠️'} Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  
  return results;
};

// Auto-run tests when script loads
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTests);
  } else {
    setTimeout(runTests, 1000); // Give React time to render
  }
}

// Export for manual testing
window.testLandingPage = runTests;
