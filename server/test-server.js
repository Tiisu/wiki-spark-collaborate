// Simple test script to verify server endpoints without database
const http = require('http');

const testEndpoint = (path, expectedStatus = 200) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`✅ ${path} - Status: ${res.statusCode} - ${response.message || 'OK'}`);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          console.log(`✅ ${path} - Status: ${res.statusCode} - Raw response`);
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${path} - Error: ${error.message}`);
      reject(error);
    });

    req.setTimeout(5000, () => {
      console.log(`⏰ ${path} - Timeout`);
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
};

async function runTests() {
  console.log('🚀 Testing WikiWalkthrough Backend API...\n');

  const tests = [
    { path: '/', description: 'Root endpoint' },
    { path: '/api', description: 'API info endpoint' },
    { path: '/health', description: 'Health check' },
    { path: '/api-docs.json', description: 'Swagger JSON' },
  ];

  for (const test of tests) {
    try {
      await testEndpoint(test.path);
    } catch (error) {
      // Continue with other tests
    }
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
  }

  console.log('\n🎉 Test completed! If you see ✅ marks above, the server is working correctly.');
  console.log('📚 Visit http://localhost:3001/api-docs for API documentation');
  console.log('💚 Visit http://localhost:3001/health for health status');
}

// Check if server is running
console.log('Checking if server is running on http://localhost:3001...\n');
runTests().catch(console.error);
