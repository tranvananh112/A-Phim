# Deploy Backend lên Railway

## Bước 1: Chuẩn bị Backend

### 1.1. Tạo file start script cho Railway

Thêm vào `backend/package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 1.2. Tạo file railway.json (optional)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Bước 2: Deploy lên Railway

### 2.1. Đăng ký Railway
1. Truy cập: https://railway.app
2. Đăng nhập bằng GitHub

### 2.2. Tạo Project mới
1. Click "New Project"
2. Chọn "Deploy from GitHub repo"
3. Chọn repository: `tranvananh112/A-Phim`
4. Railway sẽ tự động detect và build

### 2.3. Cấu hình Environment Variables
Trong Railway dashboard, thêm các biến môi trường:

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cinestream
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

### 2.4. Cấu hình Root Directory
Vì backend nằm trong folder `backend/`:
1. Vào Settings
2. Tìm "Root Directory"
3. Đặt: `backend`
4. Save

## Bước 3: Setup MongoDB Atlas (Free)

### 3.1. Tạo tài khoản MongoDB Atlas
1. Truy cập: https://www.mongodb.com/cloud/atlas
2. Đăng ký miễn phí
3. Tạo cluster mới (chọn Free tier - M0)

### 3.2. Tạo Database User
1. Vào "Database Access"
2. Add New Database User
3. Lưu username và password

### 3.3. Whitelist IP
1. Vào "Network Access"
2. Add IP Address
3. Chọn "Allow Access from Anywhere" (0.0.0.0/0)

### 3.4. Lấy Connection String
1. Vào "Database" → "Connect"
2. Chọn "Connect your application"
3. Copy connection string
4. Thay `<password>` bằng password thật
5. Paste vào Railway environment variable `MONGO_URI`

## Bước 4: Cập nhật Frontend Config

Sau khi deploy xong, Railway sẽ cho bạn URL (ví dụ: `https://a-phim-backend.up.railway.app`)

Cập nhật `js/config.js`:

```javascript
BACKEND_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://a-phim-backend.up.railway.app/api', // Thay bằng URL Railway của bạn
```

Và bật lại backend auth:

```javascript
USE_BACKEND_FOR_AUTH: true, // Bật lại để dùng backend
```

## Bước 5: Import Seed Data vào MongoDB Atlas

Từ máy local:

```bash
cd backend
# Cập nhật MONGO_URI trong .env trỏ đến MongoDB Atlas
node scripts/importSeedData.js
```

## Bước 6: Test

1. Commit và push code lên Git
2. Đợi GitHub Pages deploy
3. Truy cập https://aphim.ddns.net/login.html
4. Đăng ký tài khoản mới
5. Vào admin dashboard xem có user mới không

## Lưu ý

- Railway free tier: 500 giờ/tháng, $5 credit
- MongoDB Atlas free tier: 512MB storage
- Nếu hết free tier, có thể dùng Render.com hoặc Vercel
