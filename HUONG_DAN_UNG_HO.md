# Hướng dẫn Hệ thống Ủng hộ - APHIM.IO.VN

## Tổng quan

Hệ thống ủng hộ cho phép người dùng đóng góp để duy trì server thông qua VietQR và admin quản lý danh sách ủng hộ theo thời gian thực.

## Các tính năng chính

### 1. Modal Thông báo (index.html)
- Tự động hiện khi người dùng truy cập lần đầu
- Lưu trạng thái đã xem trong localStorage
- Hiện lại sau 7 ngày
- 2 nút: "Đã hiểu" (đóng modal) và "Ủng hộ Admin" (chuyển đến trang ủng hộ)

### 2. Trang Ủng hộ (support.html)
- Form nhập thông tin: tên, số tiền, lời nhắn
- Chọn mức ủng hộ: 20k, 50k, 100k hoặc số khác
- Tự động tạo mã QR VietQR với thông tin đã nhập
- Hiển thị danh sách người ủng hộ gần đây (realtime)
- Tự động cập nhật mỗi 30 giây

### 3. Admin Quản lý (admin/supporters.html)
- Xem danh sách tất cả người ủng hộ
- Thống kê: tổng số, đã xác nhận, chờ xác nhận, tổng tiền
- Thêm/sửa/xóa người ủng hộ
- Lọc theo trạng thái: pending, verified, rejected
- Phân trang
- Cập nhật theo thời gian thực

## Cấu trúc Database

### Collection: supporters
```javascript
{
  name: String,           // Tên người ủng hộ
  amount: Number,         // Số tiền (VNĐ)
  message: String,        // Lời nhắn
  status: String,         // pending | verified | rejected
  verifiedBy: ObjectId,   // Admin xác nhận
  verifiedAt: Date,       // Thời gian xác nhận
  notes: String,          // Ghi chú nội bộ
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Public API
- `GET /api/supporters/recent` - Lấy danh sách ủng hộ gần đây (đã xác nhận)

### Admin API (Cần token)
- `GET /api/supporters` - Lấy tất cả người ủng hộ (có phân trang, lọc)
- `POST /api/supporters` - Thêm người ủng hộ mới
- `PUT /api/supporters/:id` - Cập nhật thông tin
- `DELETE /api/supporters/:id` - Xóa người ủng hộ
- `GET /api/supporters/statistics` - Lấy thống kê

## Cài đặt

### 1. Cập nhật Backend
```bash
cd backend
npm install
```

### 2. Khởi động Server
```bash
npm start
```

### 3. Truy cập
- Trang chủ: http://localhost:3000/index.html
- Trang ủng hộ: http://localhost:3000/support.html
- Admin: http://localhost:3000/admin/supporters.html

## Cấu hình VietQR

### Thông tin tài khoản (trong support.html và js/support.js)
```javascript
const BANK_ID = '970422';              // MB Bank
const ACCOUNT_NO = '048889019999';     // Số tài khoản (không có khoảng trắng)
const ACCOUNT_NAME = 'TRAN VAN ANH';   // Tên chủ tài khoản
```

### Hiển thị số tài khoản
Trong HTML hiển thị có khoảng trắng để dễ đọc: `0488 8901 9999`
Nhưng khi copy sẽ tự động loại bỏ khoảng trắng: `048889019999`

### URL Format
```
https://api.vietqr.io/image/{BANK_ID}-{ACCOUNT_NO}-{TEMPLATE}.jpg
  ?accountName={TEN_CHU_TK}
  &amount={SO_TIEN}
  &addInfo={NOI_DUNG}
```

## Hệ thống Thông báo Thông minh

### Các phương thức hiển thị modal

File: `js/notification-modal.js` có 3 phương thức:

#### 1. Theo thời gian (Time-based)
```javascript
showAfterDays: 7  // Hiện lại sau 7 ngày
```

#### 2. Theo số lần truy cập (Visit-based)
```javascript
showEveryNVisits: 5  // Hiện mỗi 5 lần truy cập
```

#### 3. Ẩn sau khi xác nhận ủng hộ
```javascript
hideDaysAfterDonation: 4  // Ẩn 3-5 ngày sau khi user xác nhận đã ủng hộ
```

### Cấu hình phương thức
```javascript
method: 'both'  // Có thể chọn: 'time', 'visits', 'both', 'donation'
```

- `time`: Chỉ dựa vào thời gian
- `visits`: Chỉ dựa vào số lần truy cập
- `both`: Hiện nếu ĐỦ 1 trong 2 điều kiện (khuyến nghị)
- `donation`: Chỉ ẩn khi user xác nhận đã ủng hộ

### Nút "Tôi đã ủng hộ"

Sau khi user cập nhật mã QR, sẽ hiện nút xanh "Tôi đã ủng hộ":
- User click xác nhận
- Lưu vào localStorage với timestamp
- Ẩn thông báo trong 3-5 ngày (random)
- Tự động chuyển về trang chủ sau 2 giây

### Debug & Testing

Mở Console và gõ:
```javascript
// Xem trạng thái hiện tại
aphimDebugModal()

// Reset để test lại
aphimResetModal()
```

### 2. Thay đổi mức ủng hộ mặc định
File: `support.html`
```html
<!-- Tìm và sửa các button với data-amount -->
<button data-amount="20000">20.000đ</button>
<button data-amount="50000">50.000đ</button>
```

### 3. Thay đổi số lượng hiển thị gần đây
File: `js/support.js`
```javascript
const response = await fetch(`${API_BASE_URL}/api/supporters/recent?limit=10`);
// Đổi limit=10 thành số bạn muốn
```

### 4. Thay đổi tần suất cập nhật
File: `js/support.js`
```javascript
setInterval(loadRecentSupporters, 30000); // 30000ms = 30 giây
```

## Workflow Sử dụng

### Người dùng:
1. Truy cập trang chủ → Thấy modal thông báo
2. Click "Ủng hộ Admin" → Chuyển đến support.html
3. Chọn mức ủng hộ hoặc nhập số tiền tùy ý
4. Nhập tên và lời nhắn (tùy chọn)
5. Click "Cập nhật mã QR"
6. Quét mã QR và chuyển khoản
7. Tên sẽ xuất hiện trong "Ủng hộ gần đây" sau khi admin xác nhận

### Admin:
1. Đăng nhập admin panel
2. Vào menu "Ủng hộ"
3. Kiểm tra danh sách "Chờ xác nhận"
4. Thêm người ủng hộ mới (sau khi nhận được chuyển khoản)
5. Hoặc cập nhật trạng thái từ pending → verified
6. Người dùng sẽ thấy ngay trên trang support.html

## Lưu ý Bảo mật

1. **API Admin**: Tất cả endpoint admin đều yêu cầu token xác thực
2. **Validation**: Backend kiểm tra đầy đủ dữ liệu đầu vào
3. **Rate Limiting**: Giới hạn số request để tránh spam
4. **XSS Protection**: Escape HTML trong hiển thị dữ liệu người dùng

## Troubleshooting

### Modal không hiện
- Kiểm tra localStorage: `localStorage.getItem('aphim_notification_seen')`
- Kiểm tra donation status: `localStorage.getItem('aphim_donation_confirmed')`
- Xóa để test: `aphimResetModal()` trong console
- Hoặc: `localStorage.clear()`

### QR không cập nhật
- Kiểm tra console log
- Đảm bảo đã chọn số tiền
- Kiểm tra URL VietQR có đúng format
- Số tài khoản phải không có khoảng trắng trong URL

### Danh sách không load
- Kiểm tra backend đang chạy
- Kiểm tra API_BASE_URL trong js/config.js
- Xem console log lỗi
- Kiểm tra MongoDB đã kết nối chưa

### Admin không thấy dữ liệu hoặc bị văng ra login
- Kiểm tra token trong localStorage: `localStorage.getItem('adminToken')`
- Đảm bảo đã đăng nhập với tài khoản admin
- Kiểm tra MongoDB connection
- Nếu collection `supporters` chưa có data, sẽ hiển thị "Không có dữ liệu" (bình thường)
- Thử thêm 1 supporter để test

### Lỗi CORS
- Kiểm tra backend có chạy không
- Kiểm tra CORS_ORIGIN trong backend/.env
- Đảm bảo frontend và backend URL khớp với config

## Deploy Production

### 1. Cập nhật thông tin tài khoản
Sửa trong `support.html` và `js/support.js`:
- BANK_ID
- ACCOUNT_NO  
- ACCOUNT_NAME

### 2. Cập nhật API URL
File: `js/config.js`
```javascript
const API_BASE_URL = 'https://your-domain.com';
```

### 3. Deploy Backend
- Upload code lên server
- Cài đặt dependencies
- Cấu hình .env
- Khởi động server

### 4. Deploy Frontend
- Upload các file HTML, CSS, JS
- Đảm bảo đường dẫn đúng
- Test trên production

## Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Console log trình duyệt
2. Backend logs
3. MongoDB connection
4. Network tab trong DevTools

---

**Phiên bản**: 1.0.0  
**Ngày tạo**: 2024  
**Tác giả**: APHIM.IO.VN Team
