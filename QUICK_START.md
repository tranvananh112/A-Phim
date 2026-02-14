# 🚀 Quick Start Guide - CineStream

## ✅ Hệ thống đã sẵn sàng!

### 🌐 Servers đang chạy:

1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:5000

## 📱 Truy cập ngay:

### 1. Trang chủ
```
http://localhost:3000
```
- Xem danh sách phim từ API
- Tìm kiếm phim
- Xem phim nổi bật

### 2. Đăng ký/Đăng nhập
```
http://localhost:3000/login.html
```
- Đăng ký tài khoản mới
- Đăng nhập
- Quên mật khẩu

### 3. Xem phim
```
http://localhost:3000/movie-detail.html?slug=ngay-xua-co-mot-chuyen-tinh
```
- Xem chi tiết phim
- Đánh giá, bình luận
- Xem trailer

### 4. Admin Panel
```
http://localhost:3000/admin/login.html
```
**Thông tin đăng nhập:**
- Username: `admin`
- Password: `admin123`

## 🎯 Test các tính năng:

### Test 1: Xem danh sách phim
1. Mở: http://localhost:3000
2. Scroll xuống phần "Phim nổi bật"
3. Phim sẽ tự động load từ Backend API

### Test 2: Đăng ký tài khoản
1. Mở: http://localhost:3000/login.html
2. Click "Đăng ký ngay"
3. Nhập thông tin:
   - Họ tên: Test User
   - Email: test@example.com
   - Mật khẩu: 123456
4. Click "ĐĂNG KÝ"
5. Hệ thống sẽ tự động đăng nhập

### Test 3: Xem chi tiết phim
1. Click vào bất kỳ phim nào
2. Xem thông tin chi tiết
3. Xem danh sách tập phim
4. Click "XEM NGAY"

### Test 4: Xem phim
1. Từ trang chi tiết, click "XEM NGAY"
2. Video player sẽ hiển thị
3. Click play để xem phim
4. Tiến trình xem được tự động lưu

### Test 5: Tìm kiếm phim
1. Mở: http://localhost:3000/search.html
2. Nhập từ khóa: "tình"
3. Kết quả sẽ hiển thị ngay

### Test 6: Admin Dashboard
1. Mở: http://localhost:3000/admin/login.html
2. Đăng nhập với admin/admin123
3. Xem thống kê dashboard
4. Quản lý phim, users

## 🔧 API Endpoints có sẵn:

### Authentication
```bash
# Đăng ký
POST http://localhost:5000/api/auth/register
Body: {
  "name": "Test User",
  "email": "test@example.com",
  "password": "123456"
}

# Đăng nhập
POST http://localhost:5000/api/auth/login
Body: {
  "email": "test@example.com",
  "password": "123456"
}
```

### Movies
```bash
# Lấy danh sách phim
GET http://localhost:5000/api/movies?page=1

# Lấy chi tiết phim
GET http://localhost:5000/api/movies/ngay-xua-co-mot-chuyen-tinh

# Tìm kiếm
GET http://localhost:5000/api/movies/search?q=tình

# Lấy link stream
GET http://localhost:5000/api/movies/ngay-xua-co-mot-chuyen-tinh/stream/full
```

## 📊 Kiến trúc hệ thống:

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Port 3000)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  HTML    │  │   CSS    │  │    JS    │             │
│  │  Pages   │  │ Tailwind │  │  Vanilla │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                        ↓ HTTP Requests
┌─────────────────────────────────────────────────────────┐
│                 BACKEND API (Port 5000)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Express │  │   JWT    │  │  Axios   │             │
│  │  Routes  │  │   Auth   │  │  Ophim   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                        ↓ Fetch Data
┌─────────────────────────────────────────────────────────┐
│                  OPHIM API (External)                   │
│  • Movie List                                           │
│  • Movie Detail                                         │
│  • Search                                               │
│  • Stream URLs (m3u8)                                   │
└─────────────────────────────────────────────────────────┘
```

## 🎬 Luồng xem phim:

```
1. User mở trang chủ
   ↓
2. Frontend gọi: GET /api/movies
   ↓
3. Backend fetch từ Ophim API
   ↓
4. Backend cache kết quả (5 phút)
   ↓
5. Backend trả về cho Frontend
   ↓
6. Frontend render danh sách phim
   ↓
7. User click vào phim
   ↓
8. Frontend gọi: GET /api/movies/:slug
   ↓
9. Backend fetch chi tiết từ Ophim
   ↓
10. Backend trả về (bao gồm episodes)
   ↓
11. Frontend render chi tiết + episodes
   ↓
12. User click "XEM NGAY"
   ↓
13. Frontend gọi: GET /api/movies/:slug/stream/:episode
   ↓
14. Backend trả về link m3u8
   ↓
15. Frontend play video với HLS.js
```

## 🔐 Authentication Flow:

```
1. User đăng ký/đăng nhập
   ↓
2. Backend tạo JWT token
   ↓
3. Frontend lưu token vào localStorage
   ↓
4. Mọi request sau đều gửi kèm token
   ↓
5. Backend verify token
   ↓
6. Cho phép truy cập nếu hợp lệ
```

## 💡 Tips:

### Chuyển đổi chế độ API:

**Dùng Backend (Hiện tại):**
```javascript
// js/config.js
USE_BACKEND: true
```

**Dùng Ophim trực tiếp:**
```javascript
// js/config.js
USE_BACKEND: false
```

### Debug:

**Xem console log:**
- Mở DevTools (F12)
- Tab Console
- Xem các API calls

**Xem Network:**
- Tab Network
- Xem request/response
- Kiểm tra status code

### Dừng servers:

```bash
# Dừng frontend
Ctrl+C trong terminal frontend

# Dừng backend
Ctrl+C trong terminal backend
```

## 📝 Các file quan trọng:

### Frontend:
- `index.html` - Trang chủ
- `movie-detail.html` - Chi tiết phim
- `watch.html` - Xem phim
- `login.html` - Đăng nhập
- `js/api.js` - API service
- `js/auth.js` - Authentication
- `js/config.js` - Cấu hình

### Backend:
- `backend/server.js` - Main server
- `backend/controllers/` - Controllers
- `backend/routes/` - API routes
- `backend/.env` - Environment variables

## 🐛 Troubleshooting:

### Lỗi: Cannot GET /api/movies
**Giải pháp:** Kiểm tra backend đang chạy
```bash
curl http://localhost:5000/health
```

### Lỗi: CORS
**Giải pháp:** Backend đã cấu hình CORS, restart backend

### Lỗi: 401 Unauthorized
**Giải pháp:** Đăng nhập lại để lấy token mới

### Phim không load
**Giải pháp:** 
1. Kiểm tra console log
2. Kiểm tra network tab
3. Thử refresh trang

## 🎉 Tính năng đã hoàn thành:

✅ Frontend:
- [x] Trang chủ với danh sách phim
- [x] Chi tiết phim
- [x] Xem phim với video player
- [x] Đăng ký/Đăng nhập
- [x] Tìm kiếm phim
- [x] Quản lý tài khoản
- [x] Yêu thích & Lịch sử
- [x] Đánh giá & Bình luận
- [x] Admin Dashboard

✅ Backend:
- [x] REST API
- [x] JWT Authentication
- [x] Ophim API Integration
- [x] Rate Limiting
- [x] CORS Configuration
- [x] Error Handling
- [x] In-memory Cache

## 🚀 Next Steps:

1. **Thêm MongoDB** (Optional):
   - Lưu trữ persistent
   - Quản lý users tốt hơn
   - Cache phim lâu dài

2. **Thêm Payment Gateway**:
   - VNPay
   - Momo
   - ZaloPay

3. **Thêm Email Service**:
   - Xác thực email
   - Reset password
   - Thông báo

4. **Deploy Production**:
   - Frontend: Netlify/Vercel
   - Backend: Heroku/Railway
   - Database: MongoDB Atlas

## 📞 Liên hệ:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Admin: http://localhost:3000/admin/login.html

---

**Chúc bạn code vui vẻ! 🎬✨**
