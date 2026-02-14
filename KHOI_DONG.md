# 🚀 HƯỚNG DẪN KHỞI ĐỘNG WEBSITE

## ✅ Cách 1: Tự động (Khuyến nghị)

### Windows:
Double-click file:
```
start-all.bat
```

Script sẽ tự động:
1. Khởi động Frontend (port 3000)
2. Khởi động Proxy (port 5001)
3. Mở trình duyệt

---

## ⚙️ Cách 2: Thủ công

### Bước 1: Khởi động Frontend
Mở Terminal/CMD tại thư mục gốc:
```bash
npm start
```

Đợi đến khi thấy:
```
🎬 CineStream Server đang chạy!
🌐 URL: http://localhost:3000
```

### Bước 2: Khởi động Proxy
Mở Terminal/CMD mới tại thư mục `backend`:
```bash
cd backend
node simple-proxy.js
```

Đợi đến khi thấy:
```
🔄 Simple Proxy Server running on http://localhost:5001
```

### Bước 3: Mở trình duyệt
```
http://localhost:3000/
```

---

## 🔍 Kiểm tra servers đang chạy

### Kiểm tra Frontend:
```
http://localhost:3000/
```
Phải thấy trang chủ CineStream

### Kiểm tra Proxy:
```
http://localhost:5001/health
```
Phải trả về: `{"status":"ok","message":"Simple proxy is running"}`

---

## 🐛 Xử lý lỗi

### Lỗi: Port đã được sử dụng

**Frontend (port 3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Proxy (port 5001):**
```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

### Lỗi: ERR_CONNECTION_REFUSED

**Nguyên nhân:** Proxy chưa chạy

**Giải pháp:**
```bash
cd backend
node simple-proxy.js
```

### Lỗi: Cannot find module

**Giải pháp:** Cài đặt dependencies
```bash
npm install
cd backend
npm install
```

---

## 🛑 Dừng servers

### Cách 1: Đóng cửa sổ Terminal/CMD

### Cách 2: Nhấn Ctrl+C trong Terminal

---

## 📊 Trạng thái servers

Sau khi khởi động thành công:

```
✅ Frontend:  http://localhost:3000  (Running)
✅ Proxy:     http://localhost:5001  (Running)
```

---

## 🎬 Xem website

Mở trình duyệt và vào:
```
http://localhost:3000/
```

**Các trang có sẵn:**
- Trang chủ: `/`
- Chi tiết phim: `/movie-detail.html?slug=<slug>`
- Xem phim: `/watch.html?slug=<slug>&episode=<episode>`
- Tìm kiếm: `/search.html`
- Đăng nhập: `/login.html`
- Admin: `/admin/login.html`

---

## 💡 Tips

1. **Luôn khởi động cả 2 servers** (Frontend + Proxy)
2. **Đợi servers khởi động hoàn tất** trước khi mở browser
3. **Hard refresh** (Ctrl+Shift+R) nếu thấy lỗi cache
4. **Xem Console log** (F12) để debug

---

## 📞 Cần trợ giúp?

Xem các file hướng dẫn:
- `XEM_NGAY.md` - Hướng dẫn xem website
- `START_HERE.md` - Hướng dẫn tổng quan
- `QUICK_START.md` - Quick start guide

---

**Chúc bạn xem phim vui vẻ! 🎉**
