# 🚀 BẮT ĐẦU XEM PHIM

## ✅ Đã Sửa Lỗi CORS!

Lỗi CORS đã được khắc phục bằng cách sử dụng proxy server đơn giản.

---

## 🎯 Servers Đang Chạy

1. **Frontend**: http://localhost:3000 (Process ID: 4)
2. **Proxy API**: http://localhost:5001 (Process ID: 13)

---

## 🎬 XEM PHIM NGAY

### Trang Chủ (Danh sách phim):
```
http://localhost:3000/
```

### Xem Phim "Ngày Xưa Có Một Chuyện Tình":
```
http://localhost:3000/watch.html?slug=ngay-xua-co-mot-chuyen-tinh&episode=full
```

### Chi Tiết Phim:
```
http://localhost:3000/movie-detail.html?slug=ngay-xua-co-mot-chuyen-tinh
```

---

## 🔧 Cấu Hình Hiện Tại

**File: `js/config.js`**
```javascript
BACKEND_URL: 'http://localhost:5001/api'  // Proxy server
USE_BACKEND: true  // Dùng proxy để tránh CORS
```

**Proxy Server: `backend/simple-proxy.js`**
- Chạy trên port 5001
- Proxy requests đến ophim1.com
- Tự động xử lý CORS

---

## 📊 Luồng Hoạt Động

```
Browser (localhost:3000)
    ↓
    ↓ Request: /api/movies
    ↓
Proxy Server (localhost:5001)
    ↓
    ↓ Proxy request
    ↓
Ophim API (ophim1.com)
    ↓
    ↓ Response: Movie data
    ↓
Proxy Server
    ↓
    ↓ Add CORS headers
    ↓
Browser → Hiển thị phim ✅
```

---

## 🎥 Video Player

Video được phát bằng HLS.js với link m3u8:
```
https://vip.opstream13.com/20251205/21005_1facae63/index.m3u8
```

Tính năng:
- ✅ Phát video HD
- ✅ Tua nhanh/chậm
- ✅ Fullscreen
- ✅ Lưu tiến trình xem
- ✅ Tự động chuyển tập

---

## 🐛 Nếu Có Lỗi

### 1. Kiểm tra servers đang chạy:
```bash
# Frontend
http://localhost:3000

# Proxy
http://localhost:5001/health
```

### 2. Xem Console Log:
- Mở DevTools (F12)
- Tab Console
- Xem có lỗi gì không

### 3. Restart Proxy:
```bash
# Stop process 13
# Start lại: node backend/simple-proxy.js
```

---

## 📝 Test API

### Test Proxy:
```bash
curl http://localhost:5001/health
```

### Test Movie List:
```bash
curl http://localhost:5001/api/movies?page=1
```

### Test Movie Detail:
```bash
curl http://localhost:5001/api/movies/ngay-xua-co-mot-chuyen-tinh
```

---

## 🎉 Hoàn Tất!

Mở trình duyệt và truy cập:
```
http://localhost:3000/
```

Phim sẽ tự động hiển thị trên trang chủ!

---

## 📚 Tài Liệu Khác

- `HUONG_DAN_XEM_PHIM.md` - Hướng dẫn chi tiết xem phim
- `QUICK_START.md` - Hướng dẫn khởi động nhanh
- `BACKEND_API_GUIDE.md` - API documentation

---

**Chúc bạn xem phim vui vẻ! 🍿🎬**
