# Hướng dẫn Setup MongoDB và Backend API

## Vấn đề hiện tại
- Dữ liệu đang lưu trong **localStorage** (chỉ trên trình duyệt)
- Mỗi thiết bị có dữ liệu riêng, không đồng bộ
- Admin không thấy user đăng ký từ thiết bị khác

## Giải pháp: Kết nối MongoDB Backend

### Bước 1: Cài đặt MongoDB

#### Option 1: MongoDB Local (Khuyến nghị cho development)
1. Tải MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Cài đặt và chạy MongoDB
3. MongoDB sẽ chạy tại: `mongodb://localhost:27017`

#### Option 2: MongoDB Atlas (Cloud - Miễn phí)
1. Đăng ký tài khoản: https://www.mongodb.com/cloud/atlas/register
2. Tạo cluster miễn phí (M0)
3. Lấy connection string
4. Cập nhật `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cinestream
   ```

### Bước 2: Cài đặt Dependencies

```bash
cd backend
npm install
```

### Bước 3: Khởi động Backend Server

```bash
cd backend
npm start
```

Hoặc dùng nodemon để auto-reload:
```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

### Bước 4: Tạo Admin Account

Chạy script tạo admin (nếu có) hoặc đăng ký thủ công:

```bash
# Sử dụng API để tạo admin
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@cinestream.vn",
    "password": "admin123"
  }'
```

Sau đó vào MongoDB và update role thành admin:
```javascript
db.users.updateOne(
  { email: "admin@cinestream.vn" },
  { $set: { role: "admin" } }
)
```

### Bước 5: Test API

```bash
# Health check
curl http://localhost:5000/health

# Get all users (cần admin token)
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Bước 6: Cập nhật Frontend

Frontend đã được cập nhật để kết nối với backend API:
- `admin/users.html` - Quản lý người dùng từ MongoDB
- `register.html` - Đăng ký user vào MongoDB
- `login.html` - Đăng nhập từ MongoDB

## Kiểm tra kết nối

1. Mở `http://localhost:3000/admin/users.html`
2. Đăng nhập với admin account
3. Xem danh sách users từ MongoDB
4. Thử đăng ký user mới từ thiết bị khác
5. Refresh admin panel - sẽ thấy user mới

## Lợi ích sau khi setup

✅ Dữ liệu đồng bộ trên mọi thiết bị
✅ Admin thấy tất cả users đăng ký
✅ Dữ liệu được lưu trữ an toàn trong database
✅ Có thể scale và deploy lên production
✅ Hỗ trợ nhiều tính năng nâng cao (search, filter, pagination)

## Troubleshooting

### Lỗi: Cannot connect to MongoDB
- Kiểm tra MongoDB đã chạy chưa: `mongod --version`
- Kiểm tra connection string trong `.env`
- Kiểm tra firewall/network

### Lỗi: CORS
- Đảm bảo `CLIENT_URL` trong `.env` đúng
- Kiểm tra backend có chạy không

### Lỗi: Unauthorized
- Kiểm tra admin token có hợp lệ không
- Đảm bảo user có role = "admin"

## Scripts hữu ích

```bash
# Khởi động backend
cd backend && npm start

# Khởi động frontend
npm start

# Khởi động cả hai (nếu có script)
npm run dev:all
```

## Cấu trúc API Endpoints

### Auth
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Users (Admin only)
- `GET /api/users` - Lấy tất cả users
- `GET /api/users/:id` - Lấy thông tin 1 user
- `PUT /api/users/:id/block` - Khóa/mở khóa user
- `PUT /api/users/:id/subscription` - Cập nhật gói dịch vụ
- `DELETE /api/users/:id` - Xóa user
- `GET /api/users/stats` - Thống kê users

### Movies
- `GET /api/movies` - Lấy danh sách phim
- `GET /api/movies/:slug` - Chi tiết phim
- `GET /api/movies/search?q=keyword` - Tìm kiếm

## Next Steps

1. ✅ Setup MongoDB
2. ✅ Kết nối backend với MongoDB
3. ✅ Cập nhật admin panel để dùng API
4. 🔄 Cập nhật register/login để dùng API
5. 🔄 Deploy lên production (Vercel + MongoDB Atlas)
