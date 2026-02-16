// Test Backend Users API
const API_URL = 'http://localhost:5000/api';

async function testBackend() {
    console.log('🧪 Testing Backend API...\n');

    try {
        // Step 1: Login
        console.log('Step 1: Login as admin...');
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@cinestream.vn',
                password: 'admin123'
            })
        });

        const loginData = await loginResponse.json();
        console.log('Login response:', loginData);

        if (!loginData.success) {
            console.error('❌ Login failed:', loginData.message);
            return;
        }

        const token = loginData.token;
        console.log('✅ Login successful! Token:', token.substring(0, 50) + '...\n');

        // Step 2: Get all users
        console.log('Step 2: Get all users...');
        const usersResponse = await fetch(`${API_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const usersData = await usersResponse.json();
        console.log('Users response:', usersData);

        if (usersData.success) {
            console.log(`✅ Found ${usersData.count} users:`);
            usersData.data.forEach((user, index) => {
                console.log(`  ${index + 1}. ${user.name} (${user.email}) - ${user.subscription.plan}`);
            });
        } else {
            console.error('❌ Failed to get users:', usersData.message);
        }

        console.log('\n✅ Test completed!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run test
testBackend();
