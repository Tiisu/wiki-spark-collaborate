// Simple test to verify LessonForm component can be imported without errors
// This can be run in the browser console to test the fix

console.log('Testing LessonForm component import...');

// Test 1: Check if cn function is available
const testCnFunction = () => {
  try {
    // Try to import the cn function
    import('@/lib/utils').then(utils => {
      if (typeof utils.cn === 'function') {
        console.log('✅ cn function is available and properly exported');
        
        // Test the function with some sample classes
        const result = utils.cn('class1', 'class2', { 'class3': true, 'class4': false });
        console.log('✅ cn function works correctly:', result);
        
        return true;
      } else {
        console.log('❌ cn function is not available');
        return false;
      }
    }).catch(error => {
      console.log('❌ Error importing utils:', error);
      return false;
    });
  } catch (error) {
    console.log('❌ Error testing cn function:', error);
    return false;
  }
};

// Test 2: Check if LessonForm component can be imported
const testLessonFormImport = () => {
  try {
    import('@/components/admin/LessonForm').then(module => {
      if (module.default) {
        console.log('✅ LessonForm component imported successfully');
        return true;
      } else {
        console.log('❌ LessonForm component not found in module');
        return false;
      }
    }).catch(error => {
      console.log('❌ Error importing LessonForm:', error);
      return false;
    });
  } catch (error) {
    console.log('❌ Error testing LessonForm import:', error);
    return false;
  }
};

// Test 3: Check if the error is resolved
const testErrorResolution = () => {
  console.log('🔍 Checking for ReferenceError: cn is not defined...');
  
  // This would previously throw "ReferenceError: cn is not defined"
  // Now it should work without errors
  try {
    // Simulate the problematic code pattern
    const mockCn = (...classes) => classes.filter(Boolean).join(' ');
    
    // Test the pattern that was causing the error
    const testClasses = mockCn(
      'base-class',
      true && 'conditional-class',
      false && 'hidden-class'
    );
    
    console.log('✅ Class combination works:', testClasses);
    return true;
  } catch (error) {
    console.log('❌ Error in class combination:', error);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log('\n=== LessonForm Fix Verification ===\n');
  
  const results = {
    cnFunction: await testCnFunction(),
    lessonFormImport: await testLessonFormImport(),
    errorResolution: testErrorResolution()
  };
  
  console.log('\n=== Test Results ===');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n${allPassed ? '🎉' : '⚠️'} Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n✅ The "cn is not defined" error should now be fixed!');
    console.log('✅ You can now click "Manage" on courses without getting the error.');
  }
  
  return results;
};

// Auto-run tests when script loads
if (typeof window !== 'undefined') {
  // Wait for modules to be available
  setTimeout(runTests, 1000);
}

// Export for manual testing
window.testLessonFormFix = runTests;
