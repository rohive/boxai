const fetch = require('node-fetch');

const API_BASE = 'http://localhost:8000';

async function testEndpoints() {
  try {
    // Test health check
    console.log('Testing health check...');
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = await healthRes.json();
    console.log('Health check:', healthData);

    // Test models endpoint
    console.log('\nTesting models endpoint...');
    const modelsRes = await fetch(`${API_BASE}/models`);
    const modelsData = await modelsRes.json();
    console.log('Available models:', JSON.stringify(modelsData, null, 2));

    // Test ask endpoint with a simple prompt
    if (modelsData.models && modelsData.models.length > 0) {
      const testModel = modelsData.models[0].id;
      console.log(`\nTesting ask endpoint with model: ${testModel}`);
      
      const askRes = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Hello, how are you?',
          model: testModel
        }),
      });
      
      const askData = await askRes.json();
      console.log('Ask response:', JSON.stringify(askData, null, 2));
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testEndpoints();
