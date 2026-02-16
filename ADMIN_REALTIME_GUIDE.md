# HƯỚNG DẪN ADMIN PANEL - KẾT NỐI REAL-TIME VỚI MONGODB

## 🎯 TỔNG QUAN

Admin panel đã được cập nhật để kết nối **real-time** với MongoDB thông qua Backend API. Dữ liệu được tự động đồng bộ mỗi 30 giây.

---

## 📊 LUỒNG DỮ LIỆU

```
MongoDB (localhost:27017/cinestream)
    ↓
Backend API (localhost:5000/api)
    ↓
Admin Panel (localhost:3000/admin)
    ↓
Hiển thị real-time
```

---

## 🚀 CÁCH KHỞI ĐỘNG

### Bước 1: Khởi động MongoDB
```bash
# Windows
mongod

# Hoặc dùng MongoDB Compass
# Kết nối: mongodb://localhost:27017
```

### Bước 2: Khởi động Backend API
```bash
cd backend
npm install
npm start

# Backend chạy tại: http://localhost:5000
```

### Bước 3: Khởi động Frontend
```bash
# Mở terminal mới
npm start

# Frontend chạy tại: http://localhost:3000
```

### Bước 4: Tạo Admin Account
```bash
cd backend
node scripts/createAdmin.js

# Hoặc dùng thông tin mặc định:
# Email: admin@cinestream.vn
# Password: admin123
```

### Bước 5: Đăng nhập Admin
```
Truy cập: http://localhost:3000/admin/login.html
Email: admin@cinestream.vn
Password: admin123
```

---

## 📁 CẤU TRÚC FILE MỚI

```
js/admin/
├── auth.js           # Xác thực admin
├── dashboard.js      # Dashboard với real-time stats
├── users.js          # Quản lý users (đã cập nhật)
├── movies.js         # Quản lý phim
├── utils.js          # Utility functions (MỚI)
└── realtime.js       # Real-time sync module (MỚI)

backend/models/
├── User.js           # User model
├── Movie.js          # Movie model
├── Payment.js        # Payment model (MỚI)
├── Subscription.js   # Subscription model (MỚI)
├── Comment.js        # Comment model (MỚI)
├── Banner.js         # Banner model (MỚI)
├── Advertisement.js  # Advertisement model (MỚI)
├── Category.js       # Category model (MỚI)
├── ViewHistory.js    # ViewHistory model (MỚI)
└── Notification.js   # Notification model (MỚI)
```

---

## 🔄 TÍNH NĂNG REAL-TIME

### 1. Auto Refresh (Tự động làm mới)
- Dashboard stats: Mỗi 30 giây
- Users list: Mỗi 30 giây
- Không cần reload trang

### 2. Instant Updates (Cập nhật tức thì)
Khi admin thực hiện hành động:
- Khóa/Mở khóa user → Cập nhật ngay lập tức
- Thêm/Sửa/Xóa phim → Đồng bộ với database
- Gửi thông báo → Lưu vào MongoDB

### 3. Fallback Mode (Chế độ dự phòng)
Nếu không kết nối được MongoDB:
- Tự động chuyển sang dữ liệu demo
- Hiển thị thông báo lỗi
- Vẫn có thể xem giao diện

---

## 📡 API ENDPOINTS ĐƯỢC SỬ DỤNG

### Users Management
```javascript
// Lấy danh sách users
GET /api/users
Headers: { Authorization: 'Bearer <token>' }
Response: { success: true, data: [...users], count: 10 }

// Lấy thống kê users
GET /api/users/stats
Response: {
  success: true,
  data: {
    totalUsers: 100,
    activeUsers: 95,
    blockedUsers: 5,
    premiumUsers: 20,
    freeUsers: 80
  }
}

// Khóa/Mở khóa user
PUT /api/users/:id/block
Body: { isBlocked: true }
Response: { success: true, message: 'Đã khóa tài khoản' }

// Cập nhật user
PUT /api/users/:id
Body: { name: 'New Name', email: 'new@email.com' }
Response: { success: true, data: {...user} }

// Xóa user
DELETE /api/users/:id
Response: { success: true, message: 'Đã xóa người dùng' }
```

### Dashboard Stats
```javascript
// Lấy tổng quan
GET /api/users/stats
GET /api/movies?limit=1  // Để lấy total count
```

---

## 💾 DỮ LIỆU TRONG MONGODB

### Collections (Bảng)
1. **users** - Người dùng
2. **movies** - Phim
3. **payments** - Thanh toán
4. **subscriptions** - Gói thành viên
5. **comments** - Bình luận
6. **banners** - Banner
7. **advertisements** - Quảng cáo
8. **categories** - Danh mục
9. **viewhistories** - Lịch sử xem
10. **notifications** - Thông báo

### Xem dữ liệu
```bash
# Dùng MongoDB Compass
# Kết nối: mongodb://localhost:27017
# Database: cinestream

# Hoặc dùng mongosh
mongosh
use cinestream
db.users.find()
db.movies.find()
```

---

## 🔧 CÁCH SỬ DỤNG ADMIN PANEL

### Dashboard
- Xem tổng quan hệ thống
- Thống kê users, phim, lượt xem, doanh thu
- Biểu đồ real-time
- Hoạt động gần đây

### Quản lý Users
1. **Xem danh sách**: Tự động tải từ MongoDB
2. **Tìm kiếm**: Theo tên, email
3. **Lọc**: Theo gói (FREE/PREMIUM/FAMILY), trạng thái
4. **Khóa/Mở khóa**: Click nút khóa → Cập nhật MongoDB
5. **Xem chi tiết**: Click "Xem chi tiết" → Hiển thị đầy đủ thông tin
6. **Gửi thông báo**: Gửi thông báo cá nhân hoặc hàng loạt

### Quản lý Phim
- Thêm phim từ API Ophim
- Thêm phim thủ công
- Sửa/Xóa phim
- Quản lý tập phim

### Quản lý Thanh toán
- Xem lịch sử giao dịch
- Xuất báo cáo
- Xử lý hoàn tiền

---

## 🐛 XỬ LÝ LỖI

### Lỗi: "Không thể kết nối với server"
**Nguyên nhân**: Backend chưa chạy hoặc MongoDB chưa khởi động

**Giải pháp**:
```bash
# 1. Kiểm tra MongoDB
mongod --version
# Nếu chưa cài: https://www.mongodb.com/try/download/community

# 2. Khởi động MongoDB
mongod

# 3. Khởi động Backend
cd backend
npm start
```

### Lỗi: "401 Unauthorized"
**Nguyên nhân**: Token hết hạn hoặc không hợp lệ

**Giải pháp**:
```javascript
// Đăng xuất và đăng nhập lại
localStorage.removeItem('admin_token');
// Truy cập: /admin/login.html
```

### Lỗi: "Đang dùng dữ liệu demo"
**Nguyên nhân**: Không kết nối được MongoDB

**Giải pháp**:
1. Kiểm tra MongoDB đang chạy
2. Kiểm tra Backend đang chạy
3. Kiểm tra file `backend/.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/cinestream
   ```

---

## 📊 MONITORING (GIÁM SÁT)

### Kiểm tra kết nối
```javascript
// Mở Console (F12) trong Admin Panel
// Xem logs:
console.log('Loading users from backend...');
console.log('Backend response:', data);
console.log('Processed users:', allUsers);
```

### Kiểm tra API
```bash
# Test API trực tiếp
curl http://localhost:5000/health
curl http://localhost:5000/api/users -H "Authorization: Bearer <token>"
```

### Kiểm tra MongoDB
```bash
mongosh
use cinestream
db.users.countDocuments()
db.movies.countDocuments()
```

---

## 🎨 TÍNH NĂNG MỚI

### 1. Real-time Sync Module (`js/admin/realtime.js`)
```javascript
// Tự động đồng bộ dữ liệu
const realtimeSync = new RealtimeSync('http://localhost:5000/api');

// Subscribe to updates
realtimeSync.subscribe('users', (users) => {
    console.log('Users updated:', users);
    renderUsers(users);
});
```

### 2. Utility Functions (`js/admin/utils.js`)
```javascript
// Toast notifications
showToast('Thành công!', 'success');
showToast('Có lỗi xảy ra', 'error');

// Format helpers
formatDate('2024-01-01');           // 01/01/2024
formatRelativeTime('2024-01-01');   // 2 tháng trước
formatCurrency(99000);              // 99.000đ
formatNumber(1500000);              // 1.5M

// Export data
exportToCSV(users, 'users.csv');
downloadJSON(users, 'users.json');
```

### 3. Auto Refresh
- Tự động làm mới mỗi 30 giây
- Không làm gián đoạn người dùng
- Có thể tắt bằng `stopAutoRefresh()`

---

## 🔐 BẢO MẬT

### JWT Token
- Lưu trong localStorage: `admin_token`
- Thời hạn: 7 ngày (cấu hình trong backend/.env)
- Tự động kiểm tra khi gọi API

### Role-based Access
- Chỉ admin mới truy cập được admin panel
- Kiểm tra role trong JWT token
- Redirect về login nếu không phải admin

---

## 📈 PERFORMANCE

### Caching
- Stats được cache 60 giây
- Giảm tải cho database
- Tự động xóa cache khi hết hạn

### Pagination
- Mỗi trang hiển thị 10 items
- Giảm tải dữ liệu
- Tăng tốc độ render

### Debouncing
- Search input debounce 300ms
- Giảm số lần gọi API
- Tối ưu trải nghiệm

---

## 🎯 ROADMAP

### Đã hoàn thành ✅
- [x] Kết nối MongoDB
- [x] Real-time sync
- [x] Auto refresh
- [x] User management
- [x] Dashboard stats
- [x] Toast notifications
- [x] Error handling

### Đang phát triển 🚧
- [ ] Movie management với MongoDB
- [ ] Payment management
- [ ] Comment moderation
- [ ] Banner management
- [ ] Analytics dashboard
- [ ] Export reports

### Kế hoạch 📋
- [ ] WebSocket cho real-time updates
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Role permissions
- [ ] Audit logs

---

## 📞 HỖ TRỢ

### Kiểm tra logs
```bash
# Backend logs
cd backend
npm start
# Xem console output

# Frontend logs
# Mở DevTools (F12) → Console tab
```

### Debug mode
```javascript
// Bật debug trong console
localStorage.setItem('debug', 'true');

// Tắt debug
localStorage.removeItem('debug');
```

### Reset dữ liệu
```bash
# Xóa tất cả dữ liệu trong MongoDB
mongosh
use cinestream
db.dropDatabase()

# Tạo lại admin
cd backend
node scripts/createAdmin.js
```

---

## ✨ KẾT LUẬN

Admin panel đã được tích hợp đầy đủ với MongoDB và cập nhật real-time. Tất cả dữ liệu đều được lưu trữ trong database và đồng bộ tự động.

**Lưu ý quan trọng**:
1. Luôn khởi động MongoDB trước
2. Sau đó khởi động Backend
3. Cuối cùng mở Admin Panel
4. Kiểm tra console nếu có lỗi

Chúc bạn quản lý hệ thống thành công! 🎉
