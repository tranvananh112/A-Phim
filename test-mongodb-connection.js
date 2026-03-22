// Test MongoDB Connection - Kiểm tra database nào đang được dùng
require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

async function testConnection() {
    try {
        const mongoUri = process.env.MONGO_URI;
        console.log('🔍 Connection String:', mongoUri);

        await mongoose.connect(mongoUri);

        console.log('✅ Connected to MongoDB');
        console.log('📊 Database Name:', mongoose.connection.name);
        console.log('🌐 Host:', mongoose.connection.host);

        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📁 Collections trong database này:');
        collections.forEach(col => {
            console.log(`   - ${col.name}`);
        });

        await mongoose.connection.close();
        console.log('\n✅ Test hoàn tất!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testConnection();
