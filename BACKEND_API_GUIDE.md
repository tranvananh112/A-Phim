# Backend API Documentation - CineStream

## 🚀 Cài đặt Backend

### 1. Cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật các biến môi trường:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cinestream
JWT_SECRET=your-secret-key
OPHIM_API_URL=https://ophim17.cc
```

### 3. Chạy server

```bash
# Development
npm run dev

# Production
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## 📡 API Endpoints

### Authentication

#### 1. Đăng ký
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "123456",
  "phone": "0123456789"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "role": "user",
    "subscription": {
      "plan": "FREE"
    }
  }
}
```

#### 2. Đăng nhập
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456"
}
```

#### 3. Lấy thông tin user hiện tại
```http
GET /api/auth/me
Authorization: Bearer {token}
```

#### 4. Cập nhật thông tin
```http
PUT /api/auth/updatedetails
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nguyễn Văn B",
  "phone": "0987654321"
}
```

#### 5. Đổi mật khẩu
```http
PUT /api/auth/updatepassword
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "123456",
  "newPassword": "newpassword123"
}
```

#### 6. Quên mật khẩu
```http
POST /api/auth/forgotpassword
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### 7. Đặt lại mật khẩu
```http
PUT /api/auth/resetpassword/{resetToken}
Content-Type: application/json

{
  "password": "newpassword123"
}
```

### Movies

#### 1. Lấy danh sách phim
```http
GET /api/movies?page=1&limit=20&sort=latest
```

**Query Parameters:**
- `page` (number): Trang hiện tại (default: 1)
- `limit` (number): Số phim mỗi trang (default: 20)
- `sort` (string): Sắp xếp (latest, view, rating, year)
- `type` (string): Loại phim (single, series, hoathinh, tvshows)
- `status` (string): Trạng thái (completed, ongoing, trailer)
- `year` (number): Năm phát hành
- `quality` (string): Chất lượng (HD, FullHD, 4K)
- `category` (string): Slug thể loại
- `country` (string): Slug quốc gia

**Response:**
```json
{
  "success": true,
  "data": {
    "movies": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "slug": "ngay-xua-co-mot-chuyen-tinh",
        "name": "Ngày Xưa Có Một Chuyện Tình",
        "originName": "Once Upon A Love Story",
        "thumbUrl": "ngay-xua-co-mot-chuyen-tinh-thumb.jpg",
        "year": 2024,
        "quality": "HD",
        "episodeCurrent": "Full",
        "ratings": {
          "average": 8.5,
          "count": 120
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1000,
      "pages": 50
    }
  }
}
```

#### 2. Lấy chi tiết phim
```http
GET /api/movies/{slug}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "slug": "ngay-xua-co-mot-chuyen-tinh",
    "name": "Ngày Xưa Có Một Chuyện Tình",
    "originName": "Once Upon A Love Story",
    "content": "<p>Nội dung phim...</p>",
    "type": "single",
    "status": "completed",
    "thumbUrl": "ngay-xua-co-mot-chuyen-tinh-thumb.jpg",
    "posterUrl": "ngay-xua-co-mot-chuyen-tinh-poster.jpg",
    "trailerUrl": "",
    "time": "135 Phút",
    "episodeCurrent": "Full",
    "episodeTotal": "1",
    "quality": "HD",
    "lang": "Lồng Tiếng",
    "year": 2024,
    "view": 1523,
    "category": [
      {
        "id": "620a220de0fc277084dfd16d",
        "name": "Tình Cảm",
        "slug": "tinh-cam"
      }
    ],
    "country": [
      {
        "id": "63e0fd3ecaf0f6e22aeb0616",
        "name": "Việt Nam",
        "slug": "viet-nam"
      }
    ],
    "actor": ["Ngọc Xuân", "Lương Anh Vũ"],
    "director": ["Trinh Dinh Le Minh"],
    "episodes": [
      {
        "serverName": "Lồng Tiếng #1",
        "serverData": [
          {
            "name": "Full",
            "slug": "full",
            "filename": "Once.Upon.A.Love.Story.2024.1080p.WEB-DL.DDP.5.1.H.264-ZIN",
            "linkEmbed": "https://vip.opstream13.com/share/1facae6326242d7a0a2139b08546ec58",
            "linkM3u8": "https://vip.opstream13.com/20251205/21005_1facae63/index.m3u8"
          }
        ]
      }
    ],
    "ratings": {
      "average": 8.5,
      "count": 120,
      "tmdb": {
        "voteAverage": 5,
        "voteCount": 2
      }
    }
  }
}
```

#### 3. Tìm kiếm phim
```http
GET /api/movies/search?q=keyword&page=1&limit=20
```

#### 4. Lấy phim nổi bật
```http
GET /api/movies/featured?limit=10
```

#### 5. Lấy link stream (Yêu cầu đăng nhập)
```http
GET /api/movies/{slug}/stream/{episode}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "streamURL": "https://vip.opstream13.com/20251205/21005_1facae63/index.m3u8",
    "quality": "HD",
    "subtitles": []
  }
}
```

#### 6. Đồng bộ phim từ Ophim (Admin only)
```http
POST /api/movies/sync/{slug}
Authorization: Bearer {admin-token}
```

#### 7. Đồng bộ nhiều phim từ trang (Admin only)
```http
POST /api/movies/sync-page
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "page": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đồng bộ thành công 20/20 phim",
  "data": {
    "total": 20,
    "synced": 20,
    "movies": [...]
  }
}
```

## 🔐 Authentication Flow

### 1. Đăng ký/Đăng nhập
```javascript
// Frontend code
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: '123456'
  })
});

const data = await response.json();
// Save token to localStorage
localStorage.setItem('token', data.token);
```

### 2. Sử dụng token cho các request
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:5000/api/movies/slug/stream/full', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🎬 Tích hợp API Ophim

### Cách hoạt động:

1. **Lấy danh sách phim từ Ophim:**
   - API tự động fetch từ `https://ophim17.cc/danh-sach/phim-moi-cap-nhat`
   - Lưu vào database MongoDB
   - Trả về cho frontend

2. **Lấy chi tiết phim:**
   - Kiểm tra trong database trước
   - Nếu không có, fetch từ Ophim và lưu vào database
   - Trả về thông tin đầy đủ bao gồm episodes và link stream

3. **Stream video:**
   - Link m3u8 được lấy từ Ophim API
   - Format: `https://vip.opstream13.com/.../index.m3u8`
   - Frontend sử dụng HLS.js để phát video

### Ví dụ sync phim:

```javascript
// Admin sync một phim cụ thể
POST /api/movies/sync/ngay-xua-co-mot-chuyen-tinh

// Admin sync cả trang (20 phim)
POST /api/movies/sync-page
{
  "page": 1
}
```

## 📊 Database Schema

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  avatar: String,
  role: String (user/admin),
  subscription: {
    plan: String (FREE/PREMIUM/FAMILY),
    startDate: Date,
    expiresAt: Date,
    autoRenew: Boolean
  },
  isActive: Boolean,
  isBlocked: Boolean,
  lastLogin: Date,
  devices: Array,
  createdAt: Date,
  updatedAt: Date
}
```

### Movie Schema
```javascript
{
  ophimId: String (unique),
  slug: String (unique),
  name: String,
  originName: String,
  content: String,
  type: String,
  status: String,
  thumbUrl: String,
  posterUrl: String,
  trailerUrl: String,
  time: String,
  episodeCurrent: String,
  episodeTotal: String,
  quality: String,
  lang: String,
  year: Number,
  view: Number,
  category: Array,
  country: Array,
  actor: Array,
  director: Array,
  episodes: Array,
  ratings: Object,
  seo: Object,
  isFeatured: Boolean,
  isPublished: Boolean,
  lastSyncedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

### 1. JWT Authentication
- Token expires sau 7 ngày
- Refresh token mechanism (cần implement)

### 2. Rate Limiting
- General API: 100 requests/15 minutes
- Auth endpoints: 5 requests/15 minutes
- Payment endpoints: 10 requests/hour

### 3. Password Security
- Bcrypt hashing với salt rounds = 10
- Minimum password length: 6 characters

### 4. Role-Based Access Control (RBAC)
- User: Xem phim, đánh giá, bình luận
- Admin: Quản lý phim, users, payments

## 🚀 Deployment

### 1. MongoDB Atlas Setup
```bash
# Update .env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cinestream
```

### 2. Deploy to Heroku
```bash
heroku create cinestream-api
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

### 3. Deploy to VPS
```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start server.js --name cinestream-api

# Setup auto-restart
pm2 startup
pm2 save
```

## 📝 Testing

### Test Authentication
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### Test Movies
```bash
# Get movies
curl http://localhost:5000/api/movies

# Get movie detail
curl http://localhost:5000/api/movies/ngay-xua-co-mot-chuyen-tinh

# Search
curl http://localhost:5000/api/movies/search?q=tình
```

## 🔧 Troubleshooting

### MongoDB Connection Error
```bash
# Check MongoDB is running
mongod --version

# Start MongoDB
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

## 📚 Next Steps

1. ✅ Implement Rating & Comment APIs
2. ✅ Implement Payment Gateway Integration
3. ✅ Add Email Service (NodeMailer)
4. ✅ Add Video Upload & Processing
5. ✅ Add Cron Jobs for Auto-Sync
6. ✅ Add API Documentation (Swagger)
7. ✅ Add Unit Tests (Jest)
8. ✅ Add Logging (Winston)

## 🔗 Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Documentation](https://jwt.io/)
- [Ophim API Documentation](https://ophim17.cc/)
