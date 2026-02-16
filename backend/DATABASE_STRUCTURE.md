# CẤU TRÚC DATABASE - CINESTREAM

## 📍 Vị trí lưu trữ
- **Database**: MongoDB
- **Connection**: `mongodb://localhost:27017/cinestream`
- **Cấu hình**: `backend/.env` → `MONGODB_URI`

---

## 📊 CÁC COLLECTIONS (BẢNG DỮ LIỆU)

### 1. 👤 USERS (Người dùng)
**File**: `backend/models/User.js`

**Dữ liệu lưu trữ**:
- Thông tin cá nhân: name, email, phone, avatar
- Bảo mật: password (đã mã hóa), role (user/admin)
- Gói dịch vụ: subscription (plan, startDate, expiresAt, autoRenew)
- Trạng thái: isActive, isBlocked
- Thiết bị: devices[] (deviceId, deviceName, lastActive)
- Timestamps: createdAt, updatedAt, lastLogin

**Chức năng**:
- Đăng ký, đăng nhập
- Quản lý gói Premium/Family
- Theo dõi thiết bị đăng nhập
- Khóa/Mở khóa tài khoản

---

### 2. 🎬 MOVIES (Phim)
**File**: `backend/models/Movie.js`

**Dữ liệu lưu trữ**:
- Thông tin phim: name, originName, content, type, status
- Media: thumbUrl, posterUrl, trailerUrl
- Phân loại: category[], country[], actor[], director[]
- Tập phim: episodes[] (serverName, serverData[])
- Đánh giá: ratings (average, count, tmdb, imdb)
- Thống kê: view, isFeatured, isPublished
- SEO: seo (title, description, keywords)
- Đồng bộ: lastSyncedAt, syncSource (ophim)

**Chức năng**:
- Quản lý phim từ API Ophim
- Thêm/Sửa/Xóa phim thủ công
- Quản lý tập phim và server
- Theo dõi lượt xem

---

### 3. 💳 PAYMENTS (Thanh toán)
**File**: `backend/models/Payment.js`

**Dữ liệu lưu trữ**:
- Liên kết: user (ref User), subscription (ref Subscription)
- Giao dịch: transactionId, amount, currency
- Phương thức: paymentMethod (momo, vnpay, zalopay, banking, card, paypal)
- Trạng thái: status (pending, completed, failed, refunded, cancelled)
- Chi tiết: paymentGatewayResponse, description
- Thời gian: paidAt, refundedAt, refundReason

**Chức năng**:
- Lưu lịch sử thanh toán
- Theo dõi trạng thái giao dịch
- Xuất báo cáo doanh thu
- Xử lý hoàn tiền

---

### 4. 📦 SUBSCRIPTIONS (Gói thành viên)
**File**: `backend/models/Subscription.js`

**Dữ liệu lưu trữ**:
- Thông tin: name, slug, description, price
- Thời hạn: duration (value, unit: day/month/year)
- Tính năng: features[] (name, enabled)
- Giới hạn: limits (maxDevices, maxQuality, downloadAllowed, adsEnabled)
- Hiển thị: isActive, isPopular, displayOrder

**Chức năng**:
- Tạo/Sửa gói dịch vụ (FREE, PREMIUM, FAMILY)
- Quản lý tính năng từng gói
- Thiết lập giới hạn thiết bị, chất lượng

---

### 5. 💬 COMMENTS (Bình luận)
**File**: `backend/models/Comment.js`

**Dữ liệu lưu trữ**:
- Liên kết: user (ref User), movie (ref Movie), movieSlug
- Nội dung: content, rating (1-5 sao)
- Tương tác: likes[] (user IDs), replies[]
- Kiểm duyệt: isApproved, isReported, reportCount

**Chức năng**:
- Người dùng bình luận và đánh giá phim
- Admin duyệt/xóa bình luận
- Hệ thống báo cáo spam
- Trả lời bình luận

---

### 6. 🎯 BANNERS (Banner trang chủ)
**File**: `backend/models/Banner.js`

**Dữ liệu lưu trữ**:
- Nội dung: title, description, imageUrl, linkUrl
- Vị trí: position (hero, sidebar, footer, popup, inline)
- Loại: type (promotion, movie, subscription, announcement)
- Liên kết: targetMovie (ref Movie)
- Lịch trình: startDate, endDate, isActive
- Thống kê: clickCount, viewCount, displayOrder

**Chức năng**:
- Quản lý banner trang chủ
- Lên lịch hiển thị banner
- Theo dõi hiệu quả (clicks, views)

---

### 7. 📺 ADVERTISEMENTS (Quảng cáo video)
**File**: `backend/models/Advertisement.js`

**Dữ liệu lưu trữ**:
- Nội dung: title, videoUrl, imageUrl, clickUrl
- Loại: type (pre-roll, mid-roll, post-roll, banner, popup)
- Cài đặt: duration, skipAfter
- Targeting: targetAudience (subscriptionTypes, countries)
- Lịch trình: startDate, endDate, isActive
- Thống kê: impressions, clicks, budget (total, spent)

**Chức năng**:
- Quản lý quảng cáo video (pre-roll, mid-roll)
- Targeting theo gói dịch vụ
- Theo dõi ROI (impressions, clicks, CTR)

---

### 8. 📂 CATEGORIES (Danh mục/Thể loại)
**File**: `backend/models/Category.js`

**Dữ liệu lưu trữ**:
- Thông tin: name, slug, description, imageUrl
- Phân loại: type (genre, country, year, custom)
- Hiển thị: isActive, displayOrder, movieCount

**Chức năng**:
- Quản lý thể loại phim (Action, Romance...)
- Quản lý quốc gia sản xuất
- Tự động đếm số phim trong mỗi danh mục

---

### 9. 📜 VIEW_HISTORY (Lịch sử xem)
**File**: `backend/models/ViewHistory.js`

**Dữ liệu lưu trữ**:
- Liên kết: user (ref User), movie (ref Movie), movieSlug
- Tập phim: episode (name, slug)
- Tiến độ: watchedDuration, totalDuration, progress (%)
- Trạng thái: completed, lastWatchedAt

**Chức năng**:
- Lưu lịch sử xem của user
- Tiếp tục xem từ vị trí đã dừng
- Thống kê phim đã xem
- Gợi ý phim dựa trên lịch sử

---

### 10. 🔔 NOTIFICATIONS (Thông báo)
**File**: `backend/models/Notification.js`

**Dữ liệu lưu trữ**:
- Liên kết: user (ref User), relatedMovie (ref Movie)
- Nội dung: title, message, actionUrl
- Phân loại: type (info, success, warning, error, promotion, system)
- Category: category (movie, subscription, payment, account, system)
- Trạng thái: isRead, isBroadcast, readAt

**Chức năng**:
- Gửi thông báo cá nhân
- Gửi thông báo hàng loạt (broadcast)
- Thông báo phim mới, gói sắp hết hạn
- Đánh dấu đã đọc

---

## 🔗 QUAN HỆ GIỮA CÁC COLLECTIONS

```
USER
├── has many → PAYMENTS
├── has many → COMMENTS
├── has many → VIEW_HISTORY
├── has many → NOTIFICATIONS
└── has one → SUBSCRIPTION (embedded)

MOVIE
├── has many → COMMENTS
├── has many → VIEW_HISTORY
├── belongs to many → CATEGORIES
└── referenced by → BANNERS

SUBSCRIPTION
└── has many → PAYMENTS

PAYMENT
├── belongs to → USER
└── belongs to → SUBSCRIPTION
```

---

## 📊 THỐNG KÊ ADMIN CẦN

### Dashboard
```javascript
// Tổng quan
- Tổng số users: User.countDocuments()
- Tổng số phim: Movie.countDocuments()
- Tổng lượt xem: Movie.aggregate([{ $group: { _id: null, total: { $sum: "$view" }}}])
- Doanh thu: Payment.aggregate([{ $match: { status: 'completed' }}, { $group: { _id: null, total: { $sum: "$amount" }}}])

// Biểu đồ
- Lượt xem theo ngày: ViewHistory.aggregate() + group by date
- Doanh thu theo gói: Payment.aggregate() + group by subscription
- User mới theo tháng: User.aggregate() + group by createdAt
```

---

## 🚀 CÁCH SỬ DỤNG

### 1. Kết nối Database
```bash
# Khởi động MongoDB
mongod

# Hoặc dùng MongoDB Atlas (cloud)
# Cập nhật MONGODB_URI trong backend/.env
```

### 2. Khởi động Backend
```bash
cd backend
npm install
npm start
```

### 3. Tạo Admin đầu tiên
```bash
node backend/scripts/createAdmin.js
```

### 4. Test API
- Health check: http://localhost:5000/health
- API docs: http://localhost:5000/api/docs

---

## 📝 GHI CHÚ

- Tất cả models đều có `timestamps: true` → tự động tạo `createdAt` và `updatedAt`
- Password được mã hóa bằng bcrypt trước khi lưu
- JWT token có thời hạn 7 ngày (cấu hình trong .env)
- Indexes đã được tối ưu cho các query thường dùng
- Hỗ trợ pagination, sorting, filtering cho tất cả collections

---

## 🔧 CÔNG VIỆC TIẾP THEO

1. ✅ Tạo đầy đủ models (DONE)
2. ⏳ Tạo controllers cho từng model
3. ⏳ Tạo routes API
4. ⏳ Tạo admin UI để quản lý
5. ⏳ Tích hợp payment gateway (MoMo, VNPay)
6. ⏳ Tạo dashboard với biểu đồ thống kê
