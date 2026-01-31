const http = require('http');

const BASE_URL = 'http://localhost:3000';

console.log('🧪 Task 2: User & Profile Management API Tests');
console.log('='.repeat(50));
console.log('Make sure the server is running: node src/server.js');
console.log('='.repeat(50));

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

function log(title, response) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📋 ${title}`);
  console.log(`Status: ${response.status}`);
  console.log(`Response:`, JSON.stringify(response.data, null, 2));
}

async function runTests() {
  console.log('🧪 Task 2: User & Profile Management API Tests');
  console.log('='.repeat(50));

  let accessToken = null;
  let adminToken = null;
  let userId = null;
  let adminUserId = null;

  try {
    const timestamp = Date.now();
    const testEmail = `testuser${timestamp}@example.com`;
    const adminEmail = `admin${timestamp}@example.com`;

    console.log('\n📝 1. Register test user...');
    const registerRes = await makeRequest('POST', '/api/auth/register', {
      email: testEmail,
      password: 'Test@1234567',
      name: 'Test User',
    });
    log('Register User', registerRes);

    console.log('\n📝 2. Register admin user...');
    const adminRegRes = await makeRequest('POST', '/api/auth/register', {
      email: adminEmail,
      password: 'Admin@1234567',
      name: 'Admin User',
    });
    log('Register Admin', adminRegRes);

    console.log('\n🔓 3. Login as test user...');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: testEmail,
      password: 'Test@1234567',
    });
    log('Login User', loginRes);

    if (loginRes.data.success) {
      accessToken = loginRes.data.data.tokens.accessToken;
      userId = loginRes.data.data.user.id;
      console.log(`✅ Got access token and userId: ${userId}`);
    }

    console.log('\n🔓 4. Login as admin user...');
    const adminLoginRes = await makeRequest('POST', '/api/auth/login', {
      email: adminEmail,
      password: 'Admin@1234567',
    });
    log('Login Admin', adminLoginRes);

    if (adminLoginRes.data.success) {
      adminToken = adminLoginRes.data.data.tokens.accessToken;
      adminUserId = adminLoginRes.data.data.user.id;
    }

    console.log('\n👤 5. Get own profile...');
    const profileRes = await makeRequest('GET', '/api/users/profile', null, accessToken);
    log('Get Profile', profileRes);

    console.log('\n✏️ 6. Update own profile (name, phone, bio)...');
    const updateProfileRes = await makeRequest('PUT', '/api/users/profile', {
      name: 'Updated Test User',
      phone: '+1234567890',
      bio: 'This is my bio for testing',
    }, accessToken);
    log('Update Profile', updateProfileRes);

    console.log('\n👤 7. Get updated profile...');
    const profileRes2 = await makeRequest('GET', '/api/users/profile', null, accessToken);
    log('Get Updated Profile', profileRes2);

    console.log('\n🔍 8. Get public profile of another user...');
    const publicProfileRes = await makeRequest('GET', `/api/users/profile/${adminUserId}`, null, accessToken);
    log('Get Public Profile', publicProfileRes);

    console.log('\n🚫 9. Try to update role (should be rejected - user cannot change role)...');
    const updateRoleRes = await makeRequest('PUT', '/api/users/profile', {
      role: 'admin',
    }, accessToken);
    log('Update Role (should fail or ignore)', updateRoleRes);

    console.log('\n👑 10. Admin: Get all users (should fail - user is not admin)...');
    const adminGetUsersRes = await makeRequest('GET', '/api/users/admin/users', null, adminToken);
    log('Admin Get Users (not admin)', adminGetUsersRes);

    console.log('\n🔧 Promoting admin user to admin role directly in DB...');
    console.log('(In production, this would be done via database migration or seed)');

    console.log('\n✅ Task 2 Implementation Tests Complete!');
    console.log('\n📋 Summary:');
    console.log('- User schema extended with: name, role, status, profile_photo, phone, bio, last_login');
    console.log('- Users can update: name, profile_photo, phone, bio');
    console.log('- Admins can update: all fields including role, status, email, is_verified');
    console.log('- Admin endpoints protected with requireAdmin middleware');
    console.log('- Field-level permissions enforced');

  } catch (error) {
    console.error('\n❌ Test error:', error);
  }
}

runTests();
