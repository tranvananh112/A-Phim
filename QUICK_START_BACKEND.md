# 🚀 Quick Start - Kết nối Backend MongoDB

## Vấn đề hiện tại
❌ Dữ liệu lưu trong localStorage - không đồng bộ giữa các thiết bị
❌ Admin không thấy users đăng ký từ thiết bị khác

## Giải pháp
✅ Kết nối MongoDB để lưu trữ dữ liệu tập trung
✅ Tất cả thiết bị đồng bộ dữ liệu từ database

---

## 📋 Các bước thực hiện

### 1. Cài đặt MongoDB

**Option A: MongoDB Local (Khuyến nghị)**
```bash
# Download: https://www.mongodb.com/try/download/community
# Sau khi cài đặt, MongoDB sẽ chạy tại: mongodb://localhost:27017
```

**Option B: MongoDB Atlas (Cloud - Miễn phí)**
```bash
# 1. Đăng ký: https://www.mongodb.com/cloud/atlas/register
# 2. Tạo cluster miễn phí
# 3. Lấy connection string và cập nhật vào backend/.env
```

### 2. Cài đặt dependencies

```bash
cd backend
npm install
```

### 3. Tạo Admin account

```bash
npm run create-admin
```

Output:
```
✅ Admin created successfully!
📧 Email: admin@cinestream.vn
🔑 Password: admin123
```

### 4. Khởi động Backend

```bash
npm start
# hoặc
npm run dev  # auto-reload khi code thay đổi
```

Server chạy tại: `http://localhost:5000`

### 5. Khởi động Frontend

```bash
# Mở terminal mới
npm start
```

Frontend chạy tại: `http://localhost:3000`

### 6. Test hệ thống

1. Mở `http://localhost:3000/admin/login.html`
2. Đăng nhập:
   - Email: `admin@cinestream.vn`
   - Password: `admin123`
3. Vào `http://localhost:3000/admin/users.html`
4. Xem danh sách users từ MongoDB

---

## ✅ Kiểm tra kết nối thành công

### Test 1: Backend health check
```bash
curl http://localhost:5000/health
```

Kết quả:
```json
{
  "success": true,
  "message": "Server is running"
}
```

### Test 2: Đăng ký user mới
1. Mở `http://localhost:3000/register.html`
2. Đăng ký tài khoản mới
3. Vào admin panel - sẽ thấy user mới

### Test 3: Đồng bộ giữa thiết bị
1. Đăng ký user từ máy A
2. Mở admin panel từ máy B
3. Sẽ thấy user vừa đăng ký từ máy A

---

## 🔧 Troubleshooting

### Lỗi: Cannot connect to MongoDB
```bash
# Kiểm tra MongoDB đã chạy chưa
mongod --version

# Khởi động MongoDB (nếu chưa chạy)
# Windows: Mở Services -> MongoDB Server -> Start
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Lỗi: Port 5000 already in use
```bash
# Thay đổi port trong backend/.env
PORT=5001
```

### Lỗi: CORS
```bash
# Kiểm tra CLIENT_URL trong backend/.env
CLIENT_URL=http://localhost:3000
```

---

## 📚 API Endpoints

### Auth
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Thông tin user

### Users (Admin)
- `GET /api/users` - Danh sách users
- `PUT /api/users/:id/block` - Khóa/mở user
- `GET /api/users/stats` - Thống kê

### Movies
- `GET /api/movies` - Danh sách phim
- `GET /api/movies/:slug` - Chi tiết phim

---

## 🎯 Next Steps

1. ✅ Setup MongoDB
2. ✅ Tạo admin account
3. ✅ Kết nối frontend với backend
4. 🔄 Deploy lên production (Vercel + MongoDB Atlas)

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. MongoDB đã chạy chưa
2. Backend server đã chạy chưa (port 5000)
3. Frontend server đã chạy chưa (port 3000)
4. Console log có lỗi gì không

Xem chi tiết: `SETUP_MONGODB.md`
