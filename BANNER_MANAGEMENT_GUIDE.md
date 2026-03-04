# 🎬 Hướng Dẫn Quản Lý Banner Trang Chủ

## Tổng Quan

Hệ thống quản lý Banner cho phép Admin chọn phim để hiển thị làm Hero Banner (banner lớn) ở trang chủ thay vì tự động load từ API.

## Lợi Ích

✅ **Không còn lag**: Banner không tự động load từ API mỗi lần
✅ **Kiểm soát hoàn toàn**: Admin chọn phim nào hiển thị
✅ **Realtime**: Thay đổi banner ngay lập tức
✅ **Dễ quản lý**: Giao diện trực quan, dễ sử dụng

## Cấu Trúc Hệ Thống

### 1. Backend (MongoDB)
- **Model**: `backend/models/Banner.js` - Lưu thông tin banner
- **Controller**: `backend/controllers/bannerController.js` - Xử lý logic
- **Routes**: `backend/routes/banners.js` - API endpoints

### 2. Frontend
- **Admin Page**: `admin/banners.html` - Trang quản lý banner
- **Admin Script**: `js/admin/banners.js` - Logic quản lý
- **Hero Banner**: `js/hero-banner.js` - Load banner từ MongoDB

## Cách Sử Dụng

### Bước 1: Truy Cập Trang Quản Lý Banner

1. Đăng nhập Admin: http://localhost:3000/admin/login.html
2. Vào Dashboard: http://localhost:3000/admin/dashboard.html
3. Click "Banner" trong menu bên trái
4. Hoặc truy cập trực tiếp: http://localhost:3000/admin/banners.html

### Bước 2: Tải Phim Từ API

1. Click nút **"Tải Phim Mới"**
2. Chọn khoảng trang muốn tải (ví dụ: từ trang 1 đến trang 3)
   - Mỗi trang có khoảng 24 phim
   - Tối đa 20 trang
3. Click **"Tải Phim"**
4. Đợi hệ thống tải phim từ Ophim API

### Bước 3: Chọn Phim Làm Banner

1. Sau khi tải xong, danh sách phim sẽ hiển thị
2. Xem thông tin phim (poster, tên, năm, chất lượng)
3. Click **"Thêm vào Banner"** ở phim bạn muốn
4. Phim sẽ được thêm vào danh sách banner

### Bước 4: Kích Hoạt Banner

1. Trong bảng "Danh Sách Banner", tìm phim vừa thêm
2. Click nút **"Kích hoạt"**
3. Banner sẽ được hiển thị ngay lập tức ở trang chủ
4. Các banner khác sẽ tự động bị tắt (chỉ 1 banner active)

### Bước 5: Quản Lý Banner

- **Xem Banner Đang Hiển Thị**: Phần "Banner Đang Hiển Thị" ở trên cùng
- **Tắt Banner**: Click "Tắt" để ngừng hiển thị
- **Xóa Banner**: Click "Xóa" để xóa khỏi danh sách
- **Thay Đổi Banner**: Kích hoạt banner khác

## API Endpoints

### Public Endpoints

```
GET /api/banners/active
```
Lấy banner đang active (cho trang chủ)

### Admin Endpoints (Cần token)

```
GET /api/banners
```
Lấy tất cả banners

```
POST /api/banners/load-movies
Body: { startPage: 1, endPage: 3 }
```
Tải phim từ Ophim API

```
POST /api/banners
Body: { movieSlug, name, originName, ... }
```
Thêm banner mới

```
PUT /api/banners/:id
Body: { isActive: true/false, priority: 0 }
```
Cập nhật banner (kích hoạt/tắt)

```
DELETE /api/banners/:id
```
Xóa banner

## Cách Hoạt Động

### Trang Chủ (index.html)

1. `js/hero-banner.js` được load
2. Gọi API `GET /api/banners/active`
3. Nếu có banner active → Hiển thị banner đó
4. Nếu không có → Fallback load từ Ophim API (phim mới nhất)

### Trang Admin (admin/banners.html)

1. Load danh sách tất cả banners từ MongoDB
2. Hiển thị banner đang active
3. Cho phép admin:
   - Tải phim mới từ API
   - Thêm phim vào danh sách banner
   - Kích hoạt/tắt banner
   - Xóa banner

## Database Schema

```javascript
{
  movieSlug: String,        // Slug của phim
  name: String,             // Tên phim
  originName: String,       // Tên gốc
  thumbUrl: String,         // URL thumbnail
  posterUrl: String,        // URL poster
  content: String,          // Mô tả phim
  year: Number,             // Năm phát hành
  quality: String,          // Chất lượng (HD, FHD, 4K)
  lang: String,             // Ngôn ngữ (Vietsub, Thuyết minh)
  episodeCurrent: String,   // Tập hiện tại
  category: Array,          // Thể loại
  tmdb: Object,             // Thông tin TMDB
  imdb: Object,             // Thông tin IMDB
  isActive: Boolean,        // Đang hiển thị?
  priority: Number,         // Thứ tự ưu tiên
  sourcePage: Number,       // Trang API nguồn
  addedBy: ObjectId,        // Admin thêm
  createdAt: Date,          // Ngày tạo
  updatedAt: Date           // Ngày cập nhật
}
```

## Lưu Ý

⚠️ **Quan Trọng**:
- Chỉ có 1 banner được active tại một thời điểm
- Khi kích hoạt banner mới, banner cũ tự động bị tắt
- Banner được lưu trong MongoDB, không bị mất khi restart server
- Nếu không có banner active, trang chủ sẽ tự động load từ API

💡 **Tips**:
- Nên chọn phim có poster đẹp, chất lượng cao
- Cập nhật banner thường xuyên để thu hút người dùng
- Có thể tải nhiều phim một lúc (nhiều trang) để có nhiều lựa chọn
- Xóa banner cũ không dùng để giữ database gọn

## Troubleshooting

### Banner không hiển thị?
1. Kiểm tra backend đang chạy: http://localhost:5000/health
2. Kiểm tra có banner active không: http://localhost:5000/api/banners/active
3. Xem console log trong browser (F12)

### Không tải được phim từ API?
1. Kiểm tra kết nối internet
2. Kiểm tra Ophim API có hoạt động không
3. Thử giảm số trang tải (1-3 trang thay vì 10-20)

### Lỗi authentication?
1. Đăng nhập lại Admin
2. Kiểm tra token trong localStorage
3. Xóa cache và thử lại

## Kết Luận

Hệ thống quản lý Banner giúp bạn:
- ✅ Kiểm soát hoàn toàn nội dung trang chủ
- ✅ Giảm lag do không phải load API mỗi lần
- ✅ Dễ dàng thay đổi banner theo ý muốn
- ✅ Quản lý tập trung trong Admin Panel

Chúc bạn sử dụng hiệu quả! 🎉
