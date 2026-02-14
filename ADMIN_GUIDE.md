# Hướng dẫn Admin Panel - CineStream

## 🔐 Đăng nhập Admin

**URL:** `http://localhost:3000/admin/login.html`

**Thông tin đăng nhập:**
- Username: `admin`
- Password: `admin123`

## 📊 Dashboard (Đã hoàn thành)

**URL:** `http://localhost:3000/admin/dashboard.html`

### Tính năng:
✅ Tổng quan thống kê:
- Tổng số người dùng
- Tổng số phim
- Lượt xem tháng này
- Doanh thu tháng này

✅ Biểu đồ:
- Biểu đồ doanh thu theo tháng
- Biểu đồ lượt xem theo tuần

✅ Hoạt động gần đây:
- Người dùng mới đăng ký
- Thanh toán mới
- Bình luận mới

## 🎬 Quản lý phim (Đã hoàn thành cơ bản)

**URL:** `http://localhost:3000/admin/movies.html`

### Tính năng đã triển khai:
✅ Danh sách phim từ API ophim17.cc
✅ Tìm kiếm phim theo tên
✅ Lọc theo trạng thái, năm
✅ Phân trang
✅ Xem chi tiết phim
✅ Chỉnh sửa thông tin phim
✅ Xóa phim

### Tính năng cần bổ sung:
- ⏳ Thêm phim mới (upload video)
- ⏳ Quản lý tập phim
- ⏳ Upload phụ đề (.srt, .vtt)
- ⏳ Quản lý chất lượng video (360p, 480p, 720p, 1080p, 4K)

## 📁 Quản lý danh mục & thể loại

**URL:** `http://localhost:3000/admin/categories.html`

### Tính năng cần triển khai:
- ⏳ Danh sách thể loại
- ⏳ Thêm/Sửa/Xóa thể loại
- ⏳ Danh sách quốc gia
- ⏳ Thêm/Sửa/Xóa quốc gia
- ⏳ Thống kê số phim theo danh mục

## 👥 Quản lý người dùng

**URL:** `http://localhost:3000/admin/users.html`

### Tính năng cần triển khai:
- ⏳ Danh sách người dùng
- ⏳ Lọc theo gói (Free/Premium/Family)
- ⏳ Lọc theo trạng thái (Active/Blocked)
- ⏳ Xem chi tiết user:
  - Thông tin cá nhân
  - Lịch sử xem phim
  - Gói đã mua
  - Lịch sử thanh toán
- ⏳ Khóa/Mở khóa tài khoản
- ⏳ Gửi thông báo đến user
- ⏳ Xuất danh sách Excel

## 💬 Quản lý bình luận

**URL:** `http://localhost:3000/admin/comments.html`

### Tính năng cần triển khai:
- ⏳ Danh sách tất cả bình luận
- ⏳ Lọc theo phim
- ⏳ Lọc theo người dùng
- ⏳ Lọc theo trạng thái (Đã duyệt/Chờ duyệt/Spam)
- ⏳ Duyệt bình luận
- ⏳ Xóa bình luận vi phạm
- ⏳ Xem báo cáo spam
- ⏳ Khóa người dùng spam

## 💳 Quản lý gói thành viên

**URL:** `http://localhost:3000/admin/subscriptions.html`

### Tính năng cần triển khai:
- ⏳ Danh sách các gói
- ⏳ Tạo gói mới:
  - Tên gói
  - Giá
  - Thời hạn (tháng/năm)
  - Tính năng (chất lượng, số thiết bị)
- ⏳ Sửa/Xóa gói
- ⏳ Danh sách người đăng ký
- ⏳ Thời hạn còn lại
- ⏳ Gia hạn thủ công

## 💰 Quản lý thanh toán

**URL:** `http://localhost:3000/admin/payments.html`

### Tính năng cần triển khai:
- ⏳ Lịch sử giao dịch:
  - Ngày giao dịch
  - Người dùng
  - Gói đã mua
  - Số tiền
  - Phương thức thanh toán
  - Trạng thái (Thành công/Thất bại/Chờ xử lý)
- ⏳ Lọc theo:
  - Ngày
  - Người dùng
  - Gói
  - Trạng thái
- ⏳ Xuất báo cáo:
  - Excel
  - PDF
- ⏳ Thống kê doanh thu:
  - Theo ngày
  - Theo tuần
  - Theo tháng
  - Theo năm

## 🎨 Quản lý banner & quảng cáo

**URL:** `http://localhost:3000/admin/banners.html`

### Tính năng cần triển khai:
- ⏳ Danh sách banner
- ⏳ Thêm banner mới:
  - Upload ảnh
  - Tiêu đề
  - Link đích
  - Vị trí hiển thị
  - Thứ tự ưu tiên
- ⏳ Sửa/Xóa banner
- ⏳ Bật/Tắt banner
- ⏳ Quản lý quảng cáo video:
  - Pre-roll (trước phim)
  - Mid-roll (giữa phim)
  - Post-roll (sau phim)
- ⏳ Thống kê hiệu quả:
  - Số lần hiển thị
  - Số lần click
  - CTR (Click Through Rate)

## ⚙️ Cài đặt hệ thống

**URL:** `http://localhost:3000/admin/settings.html`

### Tính năng cần triển khai:

#### Cài đặt chung:
- ⏳ Tên website
- ⏳ Logo
- ⏳ Favicon
- ⏳ Thông tin liên hệ:
  - Email
  - Số điện thoại
  - Địa chỉ
- ⏳ Mạng xã hội:
  - Facebook
  - Twitter
  - Instagram
  - YouTube

#### Cài đặt thanh toán:
- ⏳ Momo:
  - Partner Code
  - Access Key
  - Secret Key
- ⏳ ZaloPay:
  - App ID
  - Key1
  - Key2
- ⏳ VNPay:
  - TMN Code
  - Hash Secret

#### Cài đặt SEO:
- ⏳ Meta Title
- ⏳ Meta Description
- ⏳ Meta Keywords
- ⏳ Google Analytics ID
- ⏳ Facebook Pixel ID

#### Cài đặt email:
- ⏳ SMTP Host
- ⏳ SMTP Port
- ⏳ SMTP Username
- ⏳ SMTP Password
- ⏳ From Email
- ⏳ From Name

## 📁 Cấu trúc file Admin

```
admin/
├── login.html              # Đăng nhập admin ✅
├── dashboard.html          # Dashboard ✅
├── movies.html             # Quản lý phim ⏳
├── categories.html         # Quản lý danh mục ⏳
├── users.html              # Quản lý người dùng ⏳
├── comments.html           # Quản lý bình luận ⏳
├── subscriptions.html      # Quản lý gói thành viên ⏳
├── payments.html           # Quản lý thanh toán ⏳
├── banners.html            # Quản lý banner ⏳
└── settings.html           # Cài đặt hệ thống ⏳

js/admin/
├── config.js               # Cấu hình admin ✅
├── auth.js                 # Xác thực admin ✅
├── dashboard.js            # Logic dashboard ✅
├── movies.js               # Logic quản lý phim ✅
├── categories.js           # Logic danh mục ⏳
├── users.js                # Logic người dùng ⏳
├── comments.js             # Logic bình luận ⏳
├── subscriptions.js        # Logic gói thành viên ⏳
├── payments.js             # Logic thanh toán ⏳
├── banners.js              # Logic banner ⏳
└── settings.js             # Logic cài đặt ⏳
```

## 🚀 Hướng dẫn phát triển tiếp

### 1. Hoàn thiện trang quản lý phim:
```javascript
// Thêm chức năng upload video
async function uploadVideo(file) {
    // Upload to cloud storage (AWS S3, Cloudinary, etc.)
    // Return video URL
}

// Thêm chức năng upload phụ đề
async function uploadSubtitle(file, language) {
    // Upload subtitle file
    // Parse and save to database
}
```

### 2. Tạo trang quản lý người dùng:
```javascript
// Load users with filters
async function loadUsers(filters) {
    const users = JSON.parse(localStorage.getItem('cinestream_all_users') || '[]');
    // Apply filters
    // Render table
}

// Block/Unblock user
function toggleUserStatus(userId) {
    // Update user status
    // Send notification
}
```

### 3. Tạo hệ thống thông báo:
```javascript
// Send notification to user
function sendNotification(userId, message) {
    const notifications = JSON.parse(localStorage.getItem('cinestream_notifications') || '[]');
    notifications.push({
        userId,
        message,
        createdAt: new Date().toISOString(),
        read: false
    });
    localStorage.setItem('cinestream_notifications', JSON.stringify(notifications));
}
```

### 4. Tích hợp thanh toán thực:
```javascript
// Momo payment
async function createMomoPayment(amount, orderInfo) {
    // Call Momo API
    // Return payment URL
}

// VNPay payment
async function createVNPayPayment(amount, orderInfo) {
    // Call VNPay API
    // Return payment URL
}
```

## 📝 Ghi chú

- ✅ = Đã hoàn thành
- ⏳ = Chưa hoàn thành, cần phát triển thêm
- Tất cả dữ liệu hiện tại lưu trong localStorage (demo)
- Để production cần:
  - Backend API (Node.js, PHP, Python)
  - Database (MySQL, PostgreSQL, MongoDB)
  - Cloud storage cho video (AWS S3, Cloudinary)
  - Payment gateway integration
  - Email service (SendGrid, AWS SES)

## 🔗 Liên kết hữu ích

- [Momo Payment API](https://developers.momo.vn/)
- [VNPay API](https://sandbox.vnpayment.vn/apis/)
- [ZaloPay API](https://docs.zalopay.vn/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
