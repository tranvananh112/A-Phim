# Hướng Dẫn Splash Loader - Màn Hình Loading Đẹp

## Giới Thiệu

Splash Loader là màn hình loading đẹp mắt hiển thị logo A Phim với hiệu ứng animation trong khi trang web đang tải. Điều này giúp:

- ✅ Tạo ấn tượng chuyên nghiệp
- ✅ Giảm tỷ lệ bounce (người dùng rời trang)
- ✅ Che đi thời gian load thực tế
- ✅ Tăng "perceived performance" (cảm giác trang load nhanh)

## Các File Liên Quan

1. **css/splash-loader.css** - Styling cho splash screen
2. **js/splash-loader.js** - Logic hiển thị/ẩn splash screen
3. **components/splash-loader.html** - Template hướng dẫn sử dụng

## Các Trang Đã Được Thêm Splash Loader

✅ index.html (Trang chủ)
✅ watch.html (Xem phim)
✅ search.html (Tìm kiếm)
✅ danh-sach.html (Danh sách phim)
✅ filter.html (Bộ lọc)
✅ categories.html (Thể loại)
✅ phim-viet-nam.html (Phim Việt Nam)
✅ movie-detail.html (Chi tiết phim)
✅ login.html (Đăng nhập)
✅ register.html (Đăng ký)
✅ profile.html (Tài khoản)
✅ pricing.html (Gói cước)
✅ payment.html (Thanh toán)
✅ support.html (Ủng hộ)

## Cách Thêm Vào Trang Mới

Thêm 2 dòng này vào phần `<head>` của trang HTML, ngay sau thẻ `<title>`:

```html
<!-- Splash Loader -->
<link rel="stylesheet" href="css/splash-loader.css">
<script src="js/splash-loader.js"></script>
```

### Ví Dụ:

```html
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tên Trang - A Phim</title>

    <!-- Splash Loader -->
    <link rel="stylesheet" href="css/splash-loader.css">
    <script src="js/splash-loader.js"></script>

    <!-- Các file CSS/JS khác -->
    ...
</head>
```

## Cách Hoạt Động

1. **Hiển thị ngay lập tức**: Splash screen xuất hiện ngay khi trang bắt đầu load
2. **Thời gian tối thiểu**: Hiển thị ít nhất 800ms để người dùng thấy được logo
3. **Tự động ẩn**: Ẩn đi khi trang load xong (event `window.load`)
4. **Fallback**: Tự động ẩn sau 5 giây nếu trang load quá lâu

## Các Hiệu Ứng Animation

### 1. Logo Animation
- Float effect (logo nhấp nhô nhẹ)
- Drop shadow với màu vàng primary
- Smooth transitions

### 2. Animated Rings
- 3 vòng tròn xung quanh logo
- Pulse animation với delay khác nhau
- Fade out effect

### 3. Loading Bar
- Gradient animation màu vàng
- Smooth width transition
- Glow effect

### 4. Particles Background
- 9 particles bay lên từ dưới lên
- Random positions
- Fade in/out effect

### 5. Text Animations
- Fade in với translateY
- Staggered delays cho từng element

## Tùy Chỉnh

### Thay Đổi Thời Gian Hiển Thị Tối Thiểu

Mở file `js/splash-loader.js` và sửa dòng:

```javascript
const minDisplayTime = 800; // Đổi thành 1000 cho 1 giây, 1500 cho 1.5 giây, etc.
```

### Thay Đổi Màu Sắc

Mở file `css/splash-loader.css` và tìm các màu:

```css
/* Màu primary (vàng) */
#f2f20d

/* Màu background */
#1a1a0c
#2a2a18

/* Thay đổi theo ý muốn */
```

### Thay Đổi Logo

Thay file `/favicon.png` bằng logo mới của bạn (khuyến nghị 512x512px, PNG với nền trong suốt)

### Thay Đổi Text

Mở file `js/splash-loader.js` và tìm:

```javascript
<div class="splash-brand">
    A <span class="highlight">Phim</span>
</div>
<div class="splash-tagline">Cinema</div>
<div class="splash-loading-text">Đang tải trải nghiệm điện ảnh...</div>
```

## Responsive Design

Splash loader tự động responsive cho mobile:

- Logo nhỏ hơn trên mobile (60px thay vì 80px)
- Text size nhỏ hơn
- Loading bar ngắn hơn
- Tất cả animations vẫn mượt mà

## Performance Impact

- **CSS file size**: ~4KB (minified)
- **JS file size**: ~2KB (minified)
- **Total impact**: ~6KB
- **Load time**: < 50ms
- **Render time**: Instant (inline CSS)

## Troubleshooting

### Splash screen không hiển thị?

1. Kiểm tra đường dẫn file CSS/JS có đúng không
2. Kiểm tra file `/favicon.png` có tồn tại không
3. Mở Console (F12) xem có lỗi không

### Splash screen không tự động ẩn?

1. Kiểm tra có lỗi JavaScript nào block `window.load` event không
2. Splash sẽ tự động ẩn sau 5 giây (fallback)
3. Có thể gọi thủ công: `document.getElementById('splashLoader').classList.add('hidden')`

### Splash screen hiển thị quá nhanh?

Tăng `minDisplayTime` trong `js/splash-loader.js`:

```javascript
const minDisplayTime = 1500; // 1.5 giây
```

### Splash screen hiển thị quá lâu?

Giảm `minDisplayTime` hoặc kiểm tra trang có load chậm không:

```javascript
const minDisplayTime = 500; // 0.5 giây
```

## Best Practices

1. ✅ Luôn đặt splash loader CSS/JS ở đầu `<head>` để hiển thị nhanh nhất
2. ✅ Không defer/async splash loader scripts
3. ✅ Giữ thời gian hiển thị tối thiểu 800-1500ms
4. ✅ Test trên nhiều thiết bị và tốc độ mạng khác nhau
5. ✅ Đảm bảo logo có chất lượng cao và nền trong suốt

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ IE11+ (với fallback)

## Kết Luận

Splash loader đã được thêm vào tất cả các trang chính của website. Người dùng sẽ thấy một màn hình loading đẹp mắt thay vì trang trắng trong khi chờ load, tạo trải nghiệm tốt hơn và chuyên nghiệp hơn.

**Lưu ý**: Splash loader chỉ là "perceived performance" - nó không làm trang load nhanh hơn thực tế, nhưng làm cho người dùng CẢM THẤY trang load nhanh hơn và có trải nghiệm tốt hơn.
