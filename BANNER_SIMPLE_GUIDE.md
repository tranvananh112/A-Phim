# 🎬 Hướng Dẫn Quản Lý Banner (Phiên Bản Đơn Giản)

## Tổng Quan

Hệ thống quản lý Banner đơn giản - KHÔNG CẦN BACKEND!
- Load phim trực tiếp từ Ophim API
- Lưu banner vào localStorage
- Trang chủ load banner từ localStorage

## Cách Sử Dụng

### Bước 1: Đăng Nhập Admin
1. Mở: http://localhost:3000/admin/login.html
2. Đăng nhập:
   - Username: `admin`
   - Password: `admin123`

### Bước 2: Vào Trang Quản Lý Banner
1. Từ Dashboard: Click "Banner" trong menu
2. Hoặc trực tiếp: http://localhost:3000/admin/banners.html

### Bước 3: Tải Phim Từ API
1. Click nút **"Tải Phim Mới"**
2. Chọn khoảng trang (ví dụ: 1 đến 3)
3. Click **"Tải Phim"**
4. Đợi load (mỗi trang ~24 phim)

### Bước 4: Chọn Phim Làm Banner
1. Xem danh sách phim hiển thị
2. Click **"Thêm vào Banner"** ở phim bạn thích
3. Phim sẽ được lưu vào localStorage

### Bước 5: Kích Hoạt Banner
1. Trong bảng "Danh Sách Banner"
2. Click **"Kích hoạt"** ở phim muốn hiển thị
3. Banner sẽ hiển thị NGAY LẬP TỨC ở trang chủ!

## Cách Hoạt Động

### Admin Page (admin/banners.html)
```javascript
// 1. Load phim từ Ophim API
fetch('https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=1')

// 2. Lưu banner vào localStorage
localStorage.setItem('cinestream_banners', JSON.stringify(banners))

// 3. Kích hoạt banner
banner.isActive = true
```

### Trang Chủ (index.html)
```javascript
// 1. Load banner từ localStorage
const banners = JSON.parse(localStorage.getItem('cinestream_banners') || '[]')
const activeBanner = banners.find(b => b.isActive)

// 2. Hiển thị banner
if (activeBanner) {
    renderHeroBanner(activeBanner)
} else {
    // Fallback: load từ API
    loadFallbackBanner()
}
```

## Lợi Ích

✅ **Cực kỳ đơn giản**: Không cần backend, MongoDB
✅ **Nhanh**: Load trực tiếp từ localStorage
✅ **Realtime**: Thay đổi ngay lập tức
✅ **Không lag**: Không phải gọi API mỗi lần load trang chủ

## Data Structure

```javascript
{
  "cinestream_banners": [
    {
      "slug": "linh-mieu",
      "name": "Linh Miêu",
      "origin_name": "The Soul Eater",
      "thumb_url": "linh-mieu-thumb.jpg",
      "poster_url": "linh-mieu-poster.jpg",
      "content": "Mô tả phim...",
      "year": 2024,
      "quality": "HD",
      "lang": "Vietsub",
      "episode_current": "Full",
      "category": [...],
      "tmdb": {...},
      "imdb": {...},
      "isActive": true,  // Chỉ 1 banner có isActive = true
      "priority": 0,
      "sourcePage": 1,
      "addedAt": "2024-03-04T..."
    }
  ]
}
```

## Test Ngay

### 1. Kiểm Tra localStorage
Mở Console (F12):
```javascript
// Xem tất cả banners
JSON.parse(localStorage.getItem('cinestream_banners') || '[]')

// Xem banner đang active
JSON.parse(localStorage.getItem('cinestream_banners') || '[]').find(b => b.isActive)

// Xóa tất cả (reset)
localStorage.removeItem('cinestream_banners')
```

### 2. Test Flow Hoàn Chỉnh
1. Vào admin/banners.html
2. Tải phim (trang 1-2)
3. Thêm 2-3 phim vào banner
4. Kích hoạt 1 phim
5. Mở trang chủ (index.html)
6. Thấy banner phim vừa chọn!

### 3. Test Thay Đổi Banner
1. Vào admin/banners.html
2. Kích hoạt phim khác
3. Refresh trang chủ
4. Banner đã thay đổi!

## Troubleshooting

### Banner không hiển thị ở trang chủ?

1. **Kiểm tra localStorage**:
```javascript
const banners = JSON.parse(localStorage.getItem('cinestream_banners') || '[]')
console.log('Banners:', banners)
console.log('Active:', banners.find(b => b.isActive))
```

2. **Kiểm tra Console**:
- Mở F12 > Console
- Xem có lỗi gì không

3. **Clear cache và thử lại**:
- Ctrl + Shift + R (hard refresh)

### Không tải được phim từ API?

1. **Kiểm tra internet**
2. **Test API trực tiếp**:
```javascript
fetch('https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=1')
  .then(r => r.json())
  .then(d => console.log(d))
```

3. **Thử giảm số trang**: Chỉ load 1-2 trang thay vì 10-20

### localStorage bị đầy?

localStorage có giới hạn ~5-10MB. Nếu thêm quá nhiều banner:
```javascript
// Xóa banner cũ không dùng
let banners = JSON.parse(localStorage.getItem('cinestream_banners') || '[]')
banners = banners.filter(b => b.isActive || b.addedAt > '2024-01-01')
localStorage.setItem('cinestream_banners', JSON.stringify(banners))
```

## So Sánh Với Backend Version

| Feature | localStorage | Backend (MongoDB) |
|---------|-------------|-------------------|
| Setup | ✅ Không cần | ❌ Cần cài MongoDB |
| Speed | ✅ Cực nhanh | ⚠️ Phụ thuộc server |
| Sync | ❌ Chỉ local | ✅ Sync nhiều máy |
| Capacity | ⚠️ ~5-10MB | ✅ Không giới hạn |
| Security | ⚠️ Client-side | ✅ Server-side |

## Kết Luận

Phiên bản localStorage:
- ✅ Hoàn hảo cho single admin
- ✅ Cực kỳ đơn giản, không cần backend
- ✅ Nhanh, realtime
- ⚠️ Chỉ lưu trên 1 máy (không sync)

Nếu cần sync nhiều admin → Dùng backend version (MongoDB)

Chúc bạn sử dụng hiệu quả! 🎉
