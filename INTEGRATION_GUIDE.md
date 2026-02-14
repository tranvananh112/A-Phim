# Hướng dẫn Tích hợp Backend & Frontend - CineStream

## ✅ Đã hoàn thành

### 1. Backend API đã chạy
- URL: `http://localhost:5000`
- Database: MongoDB (Connected)
- Status: ✅ Running

### 2. Frontend đã tích hợp
- URL: `http://localhost:3000`
- API Mode: Backend (có thể chuyển sang Ophim trực tiếp)
- Status: ✅ Ready

## 🚀 Cách sử dụng

### Chế độ 1: Sử dụng Backend API (Khuyến nghị)

File `js/config.js`:
```javascript
const API_CONFIG = {
    BACKEND_URL: 'http://localhost:5000/api',
    USE_BACKEND: true  // ✅ Đang bật
};
```

**Ưu điểm:**
- ✅ Có authentication (JWT)
- ✅ Lưu phim vào database
- ✅ Quản lý user, subscription
- ✅ Rate limiting, security
- ✅ Có thể mở rộng thêm tính năng

**Cách hoạt động:**
1. Frontend gọi API Backend
2. Backend kiểm tra database
3. Nếu không có, fetch từ Ophim và lưu vào DB
4. Trả về cho Frontend

### Chế độ 2: Gọi trực tiếp Ophim API

File `js/config.js`:
```javascript
const API_CONFIG = {
    USE_BACKEND: false  // ❌ Tắt backend
};
```

**Ưu điểm:**
- ✅ Không cần backend
- ✅ Không cần database
- ✅ Đơn giản, nhanh

**Nhược điểm:**
- ❌ Không có authentication
- ❌ Không lưu dữ liệu
- ❌ Không quản lý được user

## 📝 Test API

### 1. Test Backend Health
```bash
curl http://localhost:5000/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-..."
}
```

### 2. Test Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "user",
    "subscription": {
      "plan": "FREE"
    }
  }
}
```

### 3. Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type": "application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

### 4. Test Get Movies
```bash
curl http://localhost:5000/api/movies?page=1&limit=10
```

### 5. Test Get Movie Detail
```bash
curl http://localhost:5000/api/movies/ngay-xua-co-mot-chuyen-tinh
```

### 6. Test Search
```bash
curl "http://localhost:5000/api/movies/search?q=tình"
```

### 7. Test Stream (Cần token)
```bash
TOKEN="your-jwt-token-here"

curl http://localhost:5000/api/movies/ngay-xua-co-mot-chuyen-tinh/stream/full \
  -H "Authorization: Bearer $TOKEN"
```

## 🔄 Sync phim từ Ophim vào Database

### Cách 1: Tự động khi user xem
- User truy cập movie detail
- Backend kiểm tra DB
- Nếu không có → fetch từ Ophim → lưu vào DB
- Trả về cho user

### Cách 2: Admin sync thủ công

**Sync 1 phim:**
```bash
curl -X POST http://localhost:5000/api/movies/sync/ngay-xua-co-mot-chuyen-tinh \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Sync cả trang (20 phim):**
```bash
curl -X POST http://localhost:5000/api/movies/sync-page \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"page": 1}'
```

## 🎯 Workflow hoàn chỉnh

### 1. User đăng ký
```
Frontend (login.html) 
  → POST /api/auth/register
  → Backend tạo user + JWT token
  → Frontend lưu token vào localStorage
  → Redirect to index.html
```

### 2. User xem phim
```
Frontend (index.html)
  → GET /api/movies
  → Backend check DB
  → Nếu không có: fetch Ophim → save DB
  → Return movies to Frontend
  → Frontend render danh sách
```

### 3. User click vào phim
```
Frontend (movie-detail.html?slug=xxx)
  → GET /api/movies/:slug
  → Backend check DB
  → Nếu không có: fetch Ophim → save DB
  → Return movie detail
  → Frontend render chi tiết + episodes
```

### 4. User click xem phim
```
Frontend (watch.html?slug=xxx&episode=full)
  → GET /api/movies/:slug/stream/:episode
  → Backend check authentication (JWT)
  → Backend check subscription
  → Return stream URL (m3u8)
  → Frontend play video với HLS.js
```

## 📊 Database Structure

### Users Collection
```javascript
{
  _id: ObjectId,
  name: "Nguyễn Văn A",
  email: "user@example.com",
  password: "$2a$10$...", // bcrypt hashed
  phone: "0123456789",
  role: "user", // or "admin"
  subscription: {
    plan: "FREE", // or "PREMIUM", "FAMILY"
    startDate: ISODate,
    expiresAt: ISODate
  },
  isActive: true,
  isBlocked: false,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Movies Collection
```javascript
{
  _id: ObjectId,
  ophimId: "693270ef80c7819beb9cfe3f",
  slug: "ngay-xua-co-mot-chuyen-tinh",
  name: "Ngày Xưa Có Một Chuyện Tình",
  originName: "Once Upon A Love Story",
  content: "<p>Nội dung...</p>",
  type: "single",
  status: "completed",
  thumbUrl: "ngay-xua-co-mot-chuyen-tinh-thumb.jpg",
  posterUrl: "ngay-xua-co-mot-chuyen-tinh-poster.jpg",
  year: 2024,
  quality: "HD",
  lang: "Lồng Tiếng",
  view: 1523,
  category: [{
    id: "...",
    name: "Tình Cảm",
    slug: "tinh-cam"
  }],
  country: [{
    id: "...",
    name: "Việt Nam",
    slug: "viet-nam"
  }],
  actor: ["Ngọc Xuân", "Lương Anh Vũ"],
  director: ["Trinh Dinh Le Minh"],
  episodes: [{
    serverName: "Lồng Tiếng #1",
    serverData: [{
      name: "Full",
      slug: "full",
      linkM3u8: "https://vip.opstream13.com/.../index.m3u8"
    }]
  }],
  ratings: {
    average: 8.5,
    count: 120
  },
  lastSyncedAt: ISODate,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## 🔧 Troubleshooting

### Lỗi: Cannot connect to MongoDB
```bash
# Kiểm tra MongoDB đang chạy
mongod --version

# Nếu chưa cài MongoDB, có thể dùng MongoDB Atlas (cloud)
# Hoặc tạm thời comment code database trong backend/server.js
```

### Lỗi: CORS
```javascript
// backend/server.js đã cấu hình CORS
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
```

### Lỗi: Port 5000 đã được sử dụng
```bash
# Đổi port trong backend/.env
PORT=5001

# Và cập nhật frontend js/config.js
BACKEND_URL: 'http://localhost:5001/api'
```

## 📱 Chuyển đổi giữa Backend và Ophim trực tiếp

### Dùng Backend (Khuyến nghị cho production)
```javascript
// js/config.js
const API_CONFIG = {
    USE_BACKEND: true
};
```

### Dùng Ophim trực tiếp (Demo nhanh)
```javascript
// js/config.js
const API_CONFIG = {
    USE_BACKEND: false
};
```

## 🚀 Deploy Production

### 1. Deploy Backend
```bash
# Heroku
heroku create cinestream-api
git subtree push --prefix backend heroku main

# VPS
pm2 start backend/server.js --name cinestream-api
```

### 2. Deploy Frontend
```bash
# Netlify / Vercel
# Upload toàn bộ folder (trừ backend/)

# Cập nhật API URL
// js/config.js
BACKEND_URL: 'https://your-api.herokuapp.com/api'
```

### 3. MongoDB Production
```bash
# Sử dụng MongoDB Atlas
# https://www.mongodb.com/cloud/atlas

# Cập nhật .env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cinestream
```

## 📞 Support

- Backend API: http://localhost:5000
- Frontend: http://localhost:3000
- Admin Panel: http://localhost:3000/admin/login.html
- API Docs: http://localhost:5000/api/docs (coming soon)

## ✅ Checklist

- [x] Backend API running
- [x] Frontend integrated
- [x] Authentication working
- [x] Movie API working
- [x] Stream URL working
- [ ] MongoDB setup (optional)
- [ ] Payment gateway (optional)
- [ ] Email service (optional)

Hệ thống đã sẵn sàng để sử dụng! 🎉
