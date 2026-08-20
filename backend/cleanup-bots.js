const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupBots() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const nameRegex = /^User_[A-Z0-9]{5,}$/i;
        const emailRegex = /^user_\d{10,}_.+@/i;

        // Tìm các bot
        const User = mongoose.model('User', new mongoose.Schema({
            name: String,
            email: String,
        }, { strict: false }));

        const bots = await User.find({
            $or: [
                { name: { $regex: nameRegex } },
                { email: { $regex: emailRegex } }
            ]
        });

        console.log(`Tìm thấy ${bots.length} tài khoản bot rác.`);

        if (bots.length > 0) {
            const result = await mongoose.connection.collection('users').deleteMany({
                $or: [
                    { name: { $regex: nameRegex } },
                    { email: { $regex: emailRegex } }
                ]
            });
            console.log(`Đã xóa thành công ${result.deletedCount} tài khoản rác.`);
        } else {
            console.log('Không có gì để xóa.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Lỗi:', err);
        process.exit(1);
    }
}

cleanupBots();
