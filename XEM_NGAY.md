# 🎬 HƯỚNG DẪN XEM WEBSITE

## ✅ Servers Đang Chạy

Kiểm tra các servers:

1. **Frontend**: http://localhost:3000 ✅
2. **Proxy API**: http://localhost:5001 ✅
3. **Backend**: http://localhost:5000 ✅

---

## 🌐 CÁC TRANG CHÍNH

### 1. TRANG CHỦ (Danh sách phim)
```
http://localhost:3000/
```
hoặc
```
http://localhost:3000/index.html
```

**Tính năng:**
- Hiển thị danh sách phim mới nhất từ API
- Click vào phim để xem chi tiết
- Tìm kiếm phim

---

### 2. CHI TIẾT PHIM
```
http://localhost:3000/movie-detail.html?slug=ngay-xua-co-mot-chuyen-tinh
```

**Tính năng:**
- Xem thông tin đầy đủ về phim
- Đọc mô tả, diễn viên, đạo diễn
- Xem danh sách tập phim
- Click "XEM NGAY" để xem phim

---

### 3. XEM PHIM
```
http://localhost:3000/watch.html?slug=ngay-xua-co-mot-chuyen-tinh&episode=full
```

**Tính năng:**
- Phát video HD với HLS.js
- Điều khiển phát/tạm dừng
- Fullscreen
- Lưu tiến trình xem
- Gợi ý phim liên quan

---

### 4. TÌM KIẾM
```
http://localhost:3000/search.html
```

**Tính năng:**
- Tìm kiếm phim theo tên
- Lọc theo thể loại, quốc gia
- Kết quả real-time

---

### 5. ĐĂNG NHẬP
```
http://localhost:3000/login.html
```

**Tính năng:**
- Đăng ký tài khoản mới
- Đăng nhập
- Quên mật khẩu

---

### 6. ADMIN PANEL
```
http://localhost:3000/admin/login.html
```

**Thông tin đăng nhập:**
- Username: `admin`
- Password: `admin123`

**Tính năng:**
- Quản lý phim
- Quản lý users
- Thống kê dashboard

---

## 🧪 CÁC TRANG TEST

### Test 1: Danh sách phim đơn giản
```
http://localhost:3000/index-test.html
```
Hiển thị phim với log chi tiết

### Test 2: Test API trực tiếp
```
http://localhost:3000/test-direct-api.html
```
Kiểm tra API proxy hoạt động

### Test 3: Test Video Player
```
http://localhost:3000/test-video-player.html
```
Test phát video với HLS.js

### Test 4: Demo phim cụ thể
```
http://localhost:3000/demo-movie.html
```
Demo phim "Ngày Xưa Có Một Chuyện Tình"

### Test 5: Test API đầy đủ
```
http://localhost:3000/test-final.html
```
Test toàn bộ API service

---

## 🎯 LUỒNG XEM PHIM HOÀN CHỈNH

### Bước 1: Vào trang chủ
```
http://localhost:3000/
```

### Bước 2: Chọn phim
Click vào bất kỳ phim nào trong danh sách

### Bước 3: Xem chi tiết
Trang chi tiết sẽ hiển thị:
- Poster phim
- Thông tin (năm, thể loại, diễn viên)
- Mô tả nội dung
- Danh sách tập

### Bước 4: Click "XEM NGAY"
Video player sẽ mở và tự động phát phim

---

## 🔍 KIỂM TRA HỆ THỐNG

### Kiểm tra Frontend
```
http://localhost:3000/
```
Phải thấy trang chủ với logo CineStream

### Kiểm tra Proxy
```
http://localhost:5001/health
```
Phải trả về: `{"status":"ok","message":"Simple proxy is running"}`

### Kiểm tra Backend
```
http://localhost:5000/health
```
Phải trả về health status

### Kiểm tra API Movies
```
http://localhost:5001/api/movies?page=1
```
Phải trả về danh sách phim JSON

---

## 📊 THỐNG KÊ PHIM

Hiện tại hệ thống đang load phim từ **Ophim API** qua proxy:

- **Tổng phim mỗi trang**: ~24 phim
- **Chất lượng**: HD, Full HD, 4K
- **Ngôn ngữ**: Lồng Tiếng, Phụ Đề, Thuyết Minh
- **Thể loại**: Hành động, Tình cảm, Kinh dị, Hài, v.v.

---

## 🎬 PHIM MẪU

### Phim đã test:
**Ngày Xưa Có Một Chuyện Tình (2024)**
- Slug: `ngay-xua-co-mot-chuyen-tinh`
- Link xem: http://localhost:3000/watch.html?slug=ngay-xua-co-mot-chuyen-tinh&episode=full
- Chất lượng: HD - Lồng Tiếng
- Thời lượng: 135 phút

---

## 🐛 NẾU CÓ LỖI

### Phim không hiển thị?
1. Kiểm tra Console (F12)
2. Xem tab Network
3. Kiểm tra proxy đang chạy: http://localhost:5001/health

### Video không phát?
1. Mở http://localhost:3000/test-video-player.html
2. Click "Load Movie from API"
3. Xem log trong Console

### API lỗi?
1. Mở http://localhost:3000/test-direct-api.html
2. Click "Test Proxy"
3. Xem response

---

## 📱 RESPONSIVE

Website hoạt động tốt trên:
- ✅ Desktop (1920x1080)
- ✅ Laptop (1366x768)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667)

---

## 🚀 BẮT ĐẦU NGAY

### Cách nhanh nhất:

1. Mở trình duyệt
2. Vào: **http://localhost:3000/**
3. Chọn phim bất kỳ
4. Click "XEM NGAY"
5. Thưởng thức! 🍿

---

## 📞 LIÊN HỆ & HỖ TRỢ

- Frontend: http://localhost:3000
- API Proxy: http://localhost:5001
- Backend: http://localhost:5000

**Tài liệu:**
- `START_HERE.md` - Hướng dẫn khởi động
- `HUONG_DAN_XEM_PHIM.md` - Hướng dẫn xem phim chi tiết
- `QUICK_START.md` - Quick start guide
- `BACKEND_API_GUIDE.md` - API documentation

---

**Chúc bạn xem phim vui vẻ! 🎉🎬**
