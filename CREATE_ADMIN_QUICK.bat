@echo off
echo ========================================
echo    TAO TAI KHOAN ADMIN NHANH
echo ========================================
echo.

cd backend

echo Dang tao admin...
node -e "const mongoose = require('mongoose'); const bcrypt = require('bcryptjs'); const User = require('./models/User'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI).then(async () => { const hashedPassword = await bcrypt.hash('admin123', 10); const admin = await User.findOneAndUpdate({ email: 'admin@aphim.io.vn' }, { username: 'admin', email: 'admin@aphim.io.vn', password: hashedPassword, role: 'admin', isEmailVerified: true }, { upsert: true, new: true }); console.log(''); console.log('========================================'); console.log('TAO ADMIN THANH CONG!'); console.log('========================================'); console.log('Email:', admin.email); console.log('Password: admin123'); console.log('Role:', admin.role); console.log('========================================'); console.log(''); console.log('Hay dang nhap tai:'); console.log('http://localhost:3000/admin/login.html'); console.log(''); process.exit(0); }).catch(err => { console.error('Loi:', err.message); process.exit(1); });"

echo.
echo Nhan phim bat ky de dong...
pause > nul
