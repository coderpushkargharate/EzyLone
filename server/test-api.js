import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('\n' + '='.repeat(50));
  console.log('🔍 EzyLone API Test Suite');
  console.log('='.repeat(50) + '\n');
  
  const tests = [
    {
      name: '1️⃣ Health Check',
      url: `${BASE_URL}/health`,
      method: 'GET'
    },
    {
      name: '2️⃣ Fetch All Blogs',
      url: `${BASE_URL}/blogs`,
      method: 'GET'
    },
    {
      name: '3️⃣ Get Stats',
      url: `${BASE_URL}/stats`,
      method: 'GET'
    },
    {
      name: '4️⃣ Trigger Blog Generation',
      url: `${BASE_URL}/generate`,
      method: 'GET'
    }
  ];

  for (const test of tests) {
    console.log(`\n${test.name}`);
    console.log('-'.repeat(40));
    
    try {
      const res = await fetch(test.url, { method: test.method });
      const data = await res.json();
      
      if (res.ok) {
        console.log('✅ Status:', res.status);
        if (test.name.includes('Blogs')) {
          console.log('📊 Total Blogs:', data.length);
          if (data.length > 0) {
            console.log('📝 Latest:', data[0].title);
          }
        } else if (test.name.includes('Stats')) {
          console.log('📊 Total:', data.totalBlogs);
        } else if (test.name.includes('Generation')) {
          console.log('💬 Message:', data.message);
        } else {
          console.log('💬 Response:', JSON.stringify(data).substring(0, 100));
        }
      } else {
        console.log('❌ Status:', res.status);
        console.log('💬 Error:', data.error);
      }
    } catch (err) {
      console.log('❌ Error:', err.message);
      console.log('💡 Tip: Make sure server is running on port 5000');
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Testing Complete!');
  console.log('='.repeat(50) + '\n');
}

testAPI().catch(console.error);