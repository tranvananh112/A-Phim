# 🎬 CineStream - Website Xem Phim Online

## 📋 Tổng Quan

Website xem phim trực tuyến với giao diện hiện đại, tích hợp API Ophim để lấy dữ liệu phim real-time.

### ✨ Tính Năng Chính

- 🎥 Xem phim HD/Full HD với HLS player
- 🔍 Tìm kiếm phim theo tên, thể loại, quốc gia
- 📱 Responsive - Hoạt động trên mọi thiết bị
- ⭐ Đánh giá và bình luận phim
- 💾 Lưu lịch sử xem và phim yêu thích
- 👤 Quản lý tài khoản người dùng
- 🎯 Admin panel quản lý hệ thống

---

## 🚀 Khởi Động Nhanh

### Yêu Cầu
- Node.js (v14 trở lên)
- npm hoặc yarn

### Cài Đặt

```bash
# Clone repository
git clone <repo-url>
cd cinestream

# Cài đặt dependencies
npm install
cd backend
npm install
cd ..
```

### Khởi Động

**Cách 1: Tự động (Windows)**
```bash
start-all.bat
```

**Cách 2: Thủ công**
```bash
# Terminal 1 - Frontend
npm start

# Terminal 2 - Proxy API
cd backend
node simple-proxy.js
```

### Truy Cập

- **Frontend**: http://localhost:3000
- **Proxy API**: http://localhost:5001
- **Admin**: http://localhost:3000/admin/login.html

---

## 📁 Cấu Trúc Thư Mục

```
cinestream/
├── index.html              # Trang chủ
├── movie-detail.html       # Chi tiết phim
├── watch.html             # Xem phim
├── search.html            # Tìm kiếm
├── login.html             # Đăng nhập
├── pricing.html           # Gói cước
├── profile.html           # Trang cá nhân
│
├── js/                    # JavaScript files
│   ├── api.js            # API service
│   ├── auth.js           # Authentication
│   ├── home.js           # Trang chủ logic
│   ├── movie-detail.js   # Chi tiết phim logic
│   ├── watch.js          # Video player logic
│   └── ...
│
├── admin/                 # Admin panel
│   ├── dashboard.html
│   ├── movies.html
│   ├── users.html
│   └── ...
│
├── backend/               # Backend services
│   ├── simple-proxy.js   # Proxy server (CORS bypass)
│   ├── server.js         # Main backend server
│   ├── controllers/      # API controllers
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   └── services/        # Business logic
│
└── docs/                 # Documentation
    ├── KHOI_DONG.md
    ├── XEM_NGAY.md
    └── ...
```

---

## 🎯 Các Trang Chính

### 1. Trang Chủ
**URL:** http://localhost:3000/

**Tính năng:**
- Hiển thị danh sách phim mới nhất
- Banner hero với phim nổi bật
- Grid phim responsive
- Navigation menu

### 2. Chi Tiết Phim
**URL:** http://localhost:3000/movie-detail.html?slug={slug}

**Tính năng:**
- Thông tin đầy đủ về phim
- Poster và backdrop
- Danh sách tập phim
- Đánh giá và bình luận
- Nút xem phim

### 3. Xem Phim
**URL:** http://localhost:3000/watch.html?slug={slug}&episode={episode}

**Tính năng:**
- Video player HLS.js
- Điều khiển phát/tạm dừng
- Fullscreen
- Lưu tiến trình xem
- Gợi ý phim liên quan

### 4. Tìm Kiếm
**URL:** http://localhost:3000/search.html

**Tính năng:**
- Tìm kiếm theo tên
- Lọc theo thể loại
- Lọc theo quốc gia
- Lọc theo năm

### 5. Admin Panel
**URL:** http://localhost:3000/admin/login.html

**Thông tin đăng nhập:**
- Username: `admin`
- Password: `admin123`

**Tính năng:**
- Dashboard thống kê
- Quản lý phim
- Quản lý users
- Quản lý thanh toán

---

## 🔧 Cấu Hình

### API Configuration
File: `js/config.js`

```javascript
const API_CONFIG = {
    BACKEND_URL: 'http://localhost:5001/api',
    USE_BACKEND: true,
    OPHIM_URL: 'https://ophim1.com',
    IMAGE_BASE: 'https://img.ophim.live/uploads/movies/'
};
```

### Backend Configuration
File: `backend/.env`

```env
PORT=5000
NODE_ENV=development
OPHIM_API_URL=https://ophim1.com
```

---

## 🎬 Luồng Xem Phim

```
1. User vào trang chủ (index.html)
   ↓
2. Frontend gọi API: GET /api/movies?page=1
   ↓
3. Proxy server fetch từ Ophim API
   ↓
4. Trả về danh sách phim cho Frontend
   ↓
5. Frontend render grid phim
   ↓
6. User click vào phim
   ↓
7. Chuyển đến movie-detail.html?slug={slug}
   ↓
8. Frontend gọi API: GET /api/movies/{slug}
   ↓
9. Hiển thị chi tiết phim + episodes
   ↓
10. User click "XEM NGAY"
    ↓
11. Chuyển đến watch.html?slug={slug}&episode={episode}
    ↓
12. Frontend lấy link m3u8 từ API
    ↓
13. HLS.js load và phát video
    ↓
14. User xem phim! 🎉
```

---

## 🧪 Testing

### Test Pages

1. **Test API:**
   ```
   http://localhost:3000/test-direct-api.html
   ```

2. **Test Video Player:**
   ```
   http://localhost:3000/test-video-player.html
   ```

3. **Test Movie List:**
   ```
   http://localhost:3000/index-test.html
   ```

4. **Demo Movie:**
   ```
   http://localhost:3000/demo-movie.html
   ```

### API Endpoints

```bash
# Health check
GET http://localhost:5001/health

# Get movies
GET http://localhost:5001/api/movies?page=1

# Get movie detail
GET http://localhost:5001/api/movies/{slug}

# Search movies
GET http://localhost:5001/api/movies/search?q={keyword}
```

---

## 🐛 Troubleshooting

### Phim không hiển thị?

**Kiểm tra:**
1. Proxy có chạy không? → http://localhost:5001/health
2. Console có lỗi gì? → F12 → Console
3. Network tab có request thành công? → F12 → Network

**Giải pháp:**
```bash
# Restart proxy
cd backend
node simple-proxy.js
```

### Video không phát?

**Kiểm tra:**
1. Link m3u8 có hợp lệ không?
2. HLS.js có load không?
3. Console có lỗi CORS không?

**Giải pháp:**
- Test video player: http://localhost:3000/test-video-player.html
- Thử phim khác
- Kiểm tra link m3u8 còn hoạt động không

### Port đã được sử dụng?

**Windows:**
```bash
# Tìm process đang dùng port
netstat -ano | findstr :3000
netstat -ano | findstr :5001

# Kill process
taskkill /PID {PID} /F
```

---

## 📚 Documentation

- `KHOI_DONG.md` - Hướng dẫn khởi động chi tiết
- `XEM_NGAY.md` - Hướng dẫn xem website nhanh
- `HUONG_DAN_XEM_PHIM_DAY_DU.md` - Hướng dẫn xem phim từng bước
- `START_HERE.md` - Bắt đầu từ đầu
- `BACKEND_API_GUIDE.md` - API documentation
- `INTEGRATION_GUIDE.md` - Hướng dẫn tích hợp

---

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Tailwind CSS (CDN)
- HLS.js (Video player)
- Material Icons

### Backend
- Node.js + Express
- Axios (HTTP client)
- CORS middleware

### API
- Ophim API (https://ophim1.com)
- Proxy server để bypass CORS

---

## 📊 Features Status

### ✅ Hoàn Thành
- [x] Trang chủ với danh sách phim
- [x] Chi tiết phim
- [x] Video player HLS
- [x] Tìm kiếm phim
- [x] Đăng ký/Đăng nhập
- [x] Admin panel
- [x] Responsive design
- [x] Proxy API (CORS bypass)

### 🚧 Đang Phát Triển
- [ ] MongoDB integration
- [ ] Payment gateway
- [ ] Email service
- [ ] Social login
- [ ] Advanced search filters

### 📝 Kế Hoạch
- [ ] Mobile app
- [ ] Chromecast support
- [ ] Download offline
- [ ] Multi-language

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra Documentation
2. Xem Console log (F12)
3. Test các trang test
4. Liên hệ support

---

## 🎉 Kết Luận

Website đã sẵn sàng để xem phim! 

**Quick Start:**
1. Chạy `start-all.bat` (Windows)
2. Mở http://localhost:3000/
3. Chọn phim và thưởng thức! 🍿

**Chúc bạn xem phim vui vẻ! 🎬✨**
