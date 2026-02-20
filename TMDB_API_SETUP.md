# Hướng dẫn cấu hình TMDB API để hiển thị hình ảnh diễn viên

## Vấn đề hiện tại
- API key TMDB hiện tại bị lỗi 401 (Unauthorized)
- Không thể tải hình ảnh diễn viên cho các bộ phim

## Giải pháp: Lấy API key TMDB mới (MIỄN PHÍ)

### Bước 1: Đăng ký tài khoản TMDB
1. Truy cập: https://www.themoviedb.org/signup
2. Điền thông tin đăng ký (email, username, password)
3. Xác nhận email

### Bước 2: Đăng ký API key
1. Đăng nhập vào TMDB
2. Vào Settings: https://www.themoviedb.org/settings/api
3. Click "Request an API Key"
4. Chọn "Developer" (cho mục đích phát triển)
5. Điền thông tin:
   - Application Name: CineStream
   - Application URL: http://localhost:3000 (hoặc domain của bạn)
   - Application Summary: Movie streaming website
6. Đồng ý với Terms of Use
7. Submit

### Bước 3: Copy API Key
1. Sau khi được chấp thuận, bạn sẽ thấy:
   - **API Key (v3 auth)** - Copy cái này
   - API Read Access Token (v4 auth)
2. Copy API Key (v3 auth)

### Bước 4: Cập nhật vào code
Mở file `js/tmdb-api.js` và thay thế:

```javascript
const TMDB_API_KEY = 'YOUR_TMDB_API_KEY_HERE';
```

Thành:

```javascript
const TMDB_API_KEY = 'your_actual_api_key_here';
```

### Bước 5: Test
1. Refresh trang movie detail
2. Mở Console (F12)
3. Kiểm tra log:
   - ✅ "Found movie on TMDB" = Thành công
   - ❌ "Movie not found on TMDB" = Phim không có trên TMDB

## Lưu ý quan trọng

### Phim Việt Nam
- Nhiều phim Việt Nam mới (như "Mùi Phở" 2026) chưa có trên TMDB
- Chỉ các phim quốc tế hoặc phim Việt nổi tiếng mới có đầy đủ thông tin

### Giải pháp cho phim không có trên TMDB
Code đã được cải thiện với các fallback:
1. Tìm kiếm với năm
2. Tìm kiếm không có năm
3. Thử dùng OMDb API (nếu có IMDb ID)
4. Giữ nguyên avatar placeholder nếu không tìm thấy

### Test với phim quốc tế
Thử với các phim này để test API:
- Guardians of the Galaxy Vol. 2 (2017)
- Avengers: Endgame (2019)
- Parasite (2019)
- Squid Game (2021)

## API Limits
- TMDB Free tier: 40 requests/10 seconds
- Đủ cho website cá nhân
- Nếu cần nhiều hơn, nâng cấp lên paid plan

## Troubleshooting

### Lỗi 401 - Unauthorized
- API key sai hoặc chưa được kích hoạt
- Kiểm tra lại API key đã copy đúng chưa

### Lỗi 404 - Not Found
- Phim không có trên TMDB
- Thử tìm kiếm thủ công trên TMDB.org xem phim có không

### Không load được hình
- Kiểm tra Console log
- Kiểm tra Network tab xem request có thành công không
- Kiểm tra CORS (nếu chạy local thì không vấn đề)

## Alternative: Sử dụng OMDb API
Nếu không muốn dùng TMDB, có thể dùng OMDb:
- Website: http://www.omdbapi.com/
- Free tier: 1000 requests/day
- Nhưng OMDb không cung cấp hình ảnh diễn viên, chỉ có tên

## Kết luận
TMDB API là lựa chọn tốt nhất để lấy hình ảnh diễn viên. Chỉ cần 5 phút để đăng ký và cấu hình.
