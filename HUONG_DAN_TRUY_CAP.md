# 🎉 HƯỚNG DẪN TRUY CẬP WEBSITE

## ✅ Hệ thống đã chạy thành công!

### 🌐 Các Servers Đang Hoạt Động:

1. **Frontend (Giao diện người dùng)**: http://localhost:3000
2. **Backend API (Xử lý dữ liệu)**: http://localhost:5000
3. **Proxy Server (Xem phim)**: http://localhost:3001
4. **MongoDB Database**: mongodb://localhost:27017/cinestream

---

## 🎬 TRUY CẬP NGAY

### 1. Trang Chủ
```
http://localhost:3000
```
- Xem danh sách phim mới nhất
- Tìm kiếm phim
- Xem phim nổi bật

### 2. Đăng Nhập / Đăng Ký
```
http://localhost:3000/login.html
```

**Tài khoản test có sẵn:**
- Email: `user1@example.com`
- Password: `123456`

Hoặc đăng ký tài khoản mới!

### 3. Admin Dashboard
```
http://localhost:3000/admin/dashboard.html
```

**Đăng nhập Admin:**
- Email: `admin@cinestream.vn`
- Password: `admin123`

**Lưu ý:** Trang admin yêu cầu đăng nhập qua Backend API

---

## 🔧 SỬA LỖI ADMIN DASHBOARD

Nếu admin dashboard không hiển thị data, làm theo các bước sau:

### Bước 1: Test API
Mở file test: http://localhost:3000/test-admin-api.html

1. Click "Login as Admin" - Lấy token
2. Click "Get Stats" - Xem thống kê
3. Click "Get Users" - Xem danh sách users

### Bước 2: Kiểm tra Console
1. Mở DevTools (F12)
2. Tab Console
3. Xem có lỗi gì không

### Bước 3: Refresh lại trang
Sau khi login thành công ở test-admin-api.html, token đã được lưu vào localStorage. Bây giờ:

1. Mở: http://localhost:3000/admin/login.html
2. Đăng nhập với: admin@cinestream.vn / admin123
3. Sẽ tự động chuyển đến dashboard

---

## 📊 DATA CÓ SẴN

### Users trong Database:
1. **Admin**: admin@cinestream.vn (PREMIUM)
2. **User 1**: user1@example.com (FREE)
3. **User 2**: user2@example.com (PREMIUM)
4. **User 3**: user3@example.com (PREMIUM)
5. **User 4**: user4@example.com (FREE)
6. **User 5**: user5@example.com (FAMILY)

Tất cả password: `123456`

---

## 🎯 TÍNH NĂNG CHÍNH

### Người Dùng:
- ✅ Xem phim miễn phí
- ✅ Tìm kiếm phim
- ✅ Đánh giá & bình luận
- ✅ Lưu lịch sử xem
- ✅ Yêu thích phim
- ✅ Nâng cấp gói Premium

### Admin:
- ✅ Quản lý phim
- ✅ Quản lý users
- ✅ Xem thống kê
- ✅ Quản lý bình luận
- ✅ Quản lý thanh toán
- ✅ Cài đặt hệ thống

---

## 🐛 TROUBLESHOOTING

### Lỗi: Cannot connect to backend
**Giải pháp:**
```bash
# Kiểm tra backend đang chạy
curl http://localhost:5000/health
```

### Lỗi: Admin dashboard không load data
**Giải pháp:**
1. Đảm bảo đã login qua backend API
2. Kiểm tra token trong localStorage
3. Xem console log để debug

### Lỗi: MongoDB connection refused
**Giải pháp:**
```bash
# Kiểm tra MongoDB đang chạy
tasklist | findstr "mongod"

# Nếu chưa chạy, start MongoDB
net start MongoDB
```

### Lỗi: Video không phát được
**Giải pháp:**
1. Kiểm tra proxy server đang chạy (port 3001)
2. Thử refresh lại trang
3. Kiểm tra console log

---

## 🔄 DỪNG VÀ KHỞI ĐỘNG LẠI

### Dừng tất cả servers:
```bash
# Nhấn Ctrl+C trong mỗi terminal
# Hoặc chạy:
STOP_ALL.bat
```

### Khởi động lại:
```bash
START_ALL.bat
```

---

## 📝 API ENDPOINTS

### Authentication:
- POST `/api/auth/register` - Đăng ký
- POST `/api/auth/login` - Đăng nhập
- GET `/api/auth/me` - Thông tin user

### Movies:
- GET `/api/movies` - Danh sách phim
- GET `/api/movies/:slug` - Chi tiết phim
- GET `/api/movies/search?q=keyword` - Tìm kiếm

### Users (Admin only):
- GET `/api/users` - Danh sách users
- GET `/api/users/stats` - Thống kê users
- PUT `/api/users/:id` - Cập nhật user
- DELETE `/api/users/:id` - Xóa user

---

## 🎉 HOÀN TẤT!

Website của bạn đã sẵn sàng! Truy cập:

**Trang chủ:** http://localhost:3000

**Admin:** http://localhost:3000/admin/dashboard.html

Chúc bạn sử dụng vui vẻ! 🍿🎬
