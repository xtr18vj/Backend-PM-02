const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 Running API Tests...\n');
  console.log('='.repeat(50));

  console.log('\n1️⃣  Health Check');
  const health = await makeRequest('GET', '/health');
  console.log('   Status:', health.status);
  console.log('   Response:', JSON.stringify(health.data, null, 2));

  console.log('\n2️⃣  Register User');
  const register = await makeRequest('POST', '/api/auth/register', {
    email: 'testuser@example.com',
    password: 'SecurePass123',
  });
  console.log('   Status:', register.status);
  console.log('   Response:', JSON.stringify(register.data, null, 2));

  console.log('\n3️⃣  Login');
  const login = await makeRequest('POST', '/api/auth/login', {
    email: 'testuser@example.com',
    password: 'SecurePass123',
  });
  console.log('   Status:', login.status);
  console.log('   Response:', JSON.stringify(login.data, null, 2));

  let accessToken = null;
  let refreshToken = null;

  if (login.data.success && login.data.data) {
    accessToken = login.data.data.tokens.accessToken;
    refreshToken = login.data.data.tokens.refreshToken;
  }

  if (accessToken) {
    console.log('\n4️⃣  Get Current User (Protected)');
    const me = await new Promise((resolve, reject) => {
      const url = new URL('/api/auth/me', BASE_URL);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      };
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
      });
      req.on('error', reject);
      req.end();
    });
    console.log('   Status:', me.status);
    console.log('   Response:', JSON.stringify(me.data, null, 2));

    console.log('\n5️⃣  Refresh Token');
    const refresh = await makeRequest('POST', '/api/auth/refresh', {
      refreshToken: refreshToken,
    });
    console.log('   Status:', refresh.status);
    console.log('   Response:', JSON.stringify(refresh.data, null, 2));
  }

  console.log('\n6️⃣  Invalid Login (Wrong Password)');
  const invalidLogin = await makeRequest('POST', '/api/auth/login', {
    email: 'testuser@example.com',
    password: 'wrongpassword',
  });
  console.log('   Status:', invalidLogin.status);
  console.log('   Response:', JSON.stringify(invalidLogin.data, null, 2));

  console.log('\n7️⃣  Validation Error (Weak Password)');
  const weakPassword = await makeRequest('POST', '/api/auth/register', {
    email: 'test2@example.com',
    password: '123', 
  });
  console.log('   Status:', weakPassword.status);
  console.log('   Response:', JSON.stringify(weakPassword.data, null, 2));

  console.log('\n' + '='.repeat(50));
  console.log('✅ Tests completed!\n');
}

runTests().catch(console.error);
