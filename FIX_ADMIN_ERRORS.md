# 🔧 SỬA LỖI ADMIN PANEL - KẾT NỐI MONGODB

## ✅ Đã sửa

1. ✅ **ADMIN_STORAGE_KEYS không được định nghĩa** trong `js/admin/auth.js`
2. ✅ **Backend sử dụng routes MongoDB** thay vì simple version
3. ✅ Tạo file test kết nối MongoDB

---

## 🚀 CÁCH KHẮC PHỤC LỖI

### Bước 1: Test kết nối MongoDB

```bash
cd backend
node test-connection.js
```

**Kết quả mong đợi:**
```
✅ MongoDB Connected Successfully!

📊 Collections in database:
  - users
  - movies
  - payments
  ...

📈 Document counts:
  - Users: 1
  - Movies: 0

⚠️  No movies found. Database is empty.
   Movies will be fetched from Ophim API on first request.
```

### Bước 2: Tạo Admin User (nếu chưa có)

```bash
cd backend
node scripts/createAdmin.js
```

**Thông tin đăng nhập:**
- Email: `admin@cinestream.vn`
- Password: `admin123`

### Bước 3: Khởi động Backend

```bash
cd backend
npm start
```

**Kiểm tra:**
- Backend chạy tại: `http://localhost:5000`
- Test API: `http://localhost:5000/health`

### Bước 4: Khởi động Frontend

```bash
# Terminal mới
npm start
```

**Truy cập:**
- Admin: `http://localhost:3000/admin/dashboard.html`

---

## 🐛 XỬ LÝ CÁC LỖI CỤ THỂ

### Lỗi 1: "ADMIN_STORAGE_KEYS is not defined"

**Nguyên nhân:** File `js/admin/auth.js` thiếu định nghĩa constants

**Giải pháp:** Đã sửa - thêm vào đầu file:
```javascript
const ADMIN_STORAGE_KEYS = {
    ADMIN_TOKEN: 'admin_token'
};

const ADMIN_CONFIG = {
    ADMIN_CREDENTIALS: {
        username: 'admin',
        password: 'admin123'
    }
};
```

### Lỗi 2: "500 Internal Server Error" từ `/api/movies`

**Nguyên nhân:** 
- Backend đang dùng `movies.simple` không tương thích
- Hoặc MongoDB chưa có dữ liệu

**Giải pháp:**
1. Đã sửa `backend/server.js` để dùng routes MongoDB đầy đủ
2. Kiểm tra MongoDB đang chạy:
```bash
mongod --version
# Nếu chưa chạy:
mongod
```

3. Test API trực tiếp:
```bash
curl http://localhost:5000/api/movies
```

### Lỗi 3: "Failed to fetch stats"

**Nguyên nhân:** API `/api/users/stats` trả về lỗi

**Giải pháp:** Kiểm tra backend logs:
```bash
cd backend
npm start
# Xem console output khi gọi API
```

### Lỗi 4: Dashboard hiển thị "0" cho tất cả stats

**Nguyên nhân:** MongoDB chưa có dữ liệu

**Giải pháp:**
1. Tạo admin user:
```bash
cd backend
node scripts/createAdmin.js
```

2. Đăng ký vài user test từ frontend:
```
http://localhost:3000/register.html
```

3. Refresh dashboard để xem dữ liệu mới

---

## 📊 KIỂM TRA DỮ LIỆU TRONG MONGODB

### Sử dụng MongoDB Compass (GUI)

1. Tải MongoDB Compass: https://www.mongodb.com/products/compass
2. Kết nối: `mongodb://localhost:27017`
3. Chọn database: `cinestream`
4. Xem collections: `users`, `movies`, `payments`

### Sử dụng mongosh (CLI)

```bash
mongosh
use cinestream

# Xem users
db.users.find().pretty()

# Đếm users
db.users.countDocuments()

# Xem movies
db.movies.find().limit(5).pretty()

# Xem stats
db.users.aggregate([
  {
    $group: {
      _id: "$subscription.plan",
      count: { $sum: 1 }
    }
  }
])
```

---

## 🔍 DEBUG TIPS

### 1. Kiểm tra Console (F12)

Mở DevTools trong browser và xem tab Console để thấy lỗi JavaScript

### 2. Kiểm tra Network Tab

Xem các API calls và response:
- Status code (200, 401, 500)
- Response body
- Request headers

### 3. Kiểm tra Backend Logs

Terminal chạy backend sẽ hiển thị:
- API requests
- MongoDB queries
- Errors

### 4. Test API với curl

```bash
# Test health
curl http://localhost:5000/health

# Test users stats (cần token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/users/stats

# Test movies
curl http://localhost:5000/api/movies?limit=5
```

---

## 📝 CHECKLIST HOÀN CHỈNH

- [ ] MongoDB đang chạy (`mongod`)
- [ ] Backend đang chạy (`npm start` trong folder backend)
- [ ] Frontend đang chạy (`npm start` trong root)
- [ ] Đã tạo admin user (`node scripts/createAdmin.js`)
- [ ] File `js/admin/auth.js` có ADMIN_STORAGE_KEYS
- [ ] File `backend/server.js` dùng `routes/movies` (không phải movies.simple)
- [ ] Test connection thành công (`node test-connection.js`)
- [ ] Có thể đăng nhập admin tại `/admin/login.html`
- [ ] Dashboard hiển thị dữ liệu (có thể là 0 nếu chưa có data)
- [ ] Console không có lỗi JavaScript

---

## 🎯 KẾT QUẢ MONG ĐỢI

Sau khi sửa xong, bạn sẽ thấy:

1. **Dashboard hiển thị:**
   - Tổng người dùng: số thực từ MongoDB
   - Tổng phim: số thực từ MongoDB (có thể 0)
   - Lượt xem: tính toán từ users
   - Doanh thu: tính toán từ premium users

2. **Users page hiển thị:**
   - Danh sách users từ MongoDB
   - Có thể tìm kiếm, lọc
   - Có thể khóa/mở khóa user

3. **Auto-refresh:**
   - Dữ liệu tự động cập nhật mỗi 30 giây

---

## 🆘 NẾU VẪN CÒN LỖI

Gửi cho tôi:
1. Screenshot console errors (F12)
2. Backend logs (terminal output)
3. Kết quả của `node test-connection.js`
4. Kết quả của `curl http://localhost:5000/health`

Tôi sẽ giúp bạn debug tiếp!
