# 🎬 HƯỚNG DẪN XEM PHIM ĐẦY ĐỦ

## ✅ Kiểm tra Servers đang chạy

Trước tiên, đảm bảo cả 2 servers đang chạy:

### 1. Kiểm tra Frontend (Port 3000)
Mở: http://localhost:3000/
- Phải thấy trang chủ CineStream
- Phải thấy danh sách phim

### 2. Kiểm tra Proxy (Port 5001)
Mở: http://localhost:5001/health
- Phải trả về: `{"status":"ok","message":"Simple proxy is running"}`

---

## 🎯 LUỒNG XEM PHIM HOÀN CHỈNH

### Bước 1: Vào Trang Chủ
```
http://localhost:3000/
```

**Kiểm tra:**
- ✅ Có hiển thị danh sách phim không?
- ✅ Có thấy poster phim không?
- ✅ Có thấy tên phim, năm, rating không?

**Nếu KHÔNG thấy phim:**
1. Mở Console (F12)
2. Xem có lỗi gì không
3. Kiểm tra proxy: http://localhost:5001/health

---

### Bước 2: Click vào một phim bất kỳ

**Ví dụ:** Click vào phim "Ngày Xưa Có Một Chuyện Tình"

**Sẽ chuyển đến:**
```
http://localhost:3000/movie-detail.html?slug=ngay-xua-co-mot-chuyen-tinh
```

**Kiểm tra:**
- ✅ Có hiển thị poster phim lớn không?
- ✅ Có thông tin: tên, năm, thể loại, diễn viên không?
- ✅ Có mô tả nội dung không?
- ✅ Có nút "XEM NGAY" không?

---

### Bước 3: Click nút "XEM NGAY"

**Sẽ chuyển đến:**
```
http://localhost:3000/watch.html?slug=ngay-xua-co-mot-chuyen-tinh&episode=full
```

**Kiểm tra:**
- ✅ Có thấy video player (khung đen) không?
- ✅ Có nút play không?
- ✅ Click play, video có phát không?

---

## 🧪 TEST TỪNG BƯỚC

### Test 1: Kiểm tra API trả về phim
```
http://localhost:3000/test-direct-api.html
```

Click "Test Proxy" → Phải thấy danh sách phim JSON

---

### Test 2: Kiểm tra hiển thị phim
```
http://localhost:3000/index-test.html
```

Phải thấy grid phim hiển thị

---

### Test 3: Kiểm tra video player
```
http://localhost:3000/test-video-player.html
```

Click "Load Movie from API" → Video phải phát được

---

### Test 4: Xem phim trực tiếp
```
http://localhost:3000/demo-movie.html
```

Video phải tự động load và sẵn sàng phát

---

## 🔧 XỬ LÝ LỖI

### Lỗi 1: Không thấy phim trên trang chủ

**Nguyên nhân:** Proxy chưa chạy hoặc API lỗi

**Giải pháp:**
1. Kiểm tra proxy: http://localhost:5001/health
2. Nếu lỗi, khởi động lại:
   ```bash
   cd backend
   node simple-proxy.js
   ```
3. Refresh trang: Ctrl + Shift + R

---

### Lỗi 2: Click vào phim nhưng không load chi tiết

**Nguyên nhân:** JavaScript lỗi hoặc slug không đúng

**Giải pháp:**
1. Mở Console (F12)
2. Xem lỗi gì
3. Thử URL trực tiếp:
   ```
   http://localhost:3000/movie-detail.html?slug=ngay-xua-co-mot-chuyen-tinh
   ```

---

### Lỗi 3: Video không phát

**Nguyên nhân:** 
- Link m3u8 hết hạn
- HLS.js chưa load
- CORS trên video server

**Giải pháp:**
1. Test video player: http://localhost:3000/test-video-player.html
2. Xem Console log
3. Thử phim khác

---

## 📊 DANH SÁCH PHIM CÓ SẴN

Các phim đã test và hoạt động:

### 1. Ngày Xưa Có Một Chuyện Tình (2024)
- **Slug:** `ngay-xua-co-mot-chuyen-tinh`
- **Link xem:** http://localhost:3000/watch.html?slug=ngay-xua-co-mot-chuyen-tinh&episode=full
- **Chất lượng:** HD - Lồng Tiếng
- **Trạng thái:** ✅ Hoạt động

### 2. Các phim khác
Xem danh sách đầy đủ tại: http://localhost:3000/

---

## 🎥 VIDEO PLAYER

### Tính năng:
- ✅ Phát video HLS (m3u8)
- ✅ Play/Pause
- ✅ Tua nhanh/chậm
- ✅ Fullscreen (double-click hoặc nút)
- ✅ Điều chỉnh âm lượng
- ✅ Tự động lưu tiến trình xem

### Phím tắt:
- **Space:** Play/Pause
- **F:** Fullscreen
- **M:** Mute/Unmute
- **←/→:** Tua 5 giây
- **↑/↓:** Tăng/giảm âm lượng

---

## 📱 RESPONSIVE

Website hoạt động tốt trên:
- ✅ Desktop (1920x1080)
- ✅ Laptop (1366x768)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667)

---

## 🚀 QUICK START

### Cách nhanh nhất để xem phim:

1. **Khởi động servers:**
   ```bash
   # Terminal 1
   npm start
   
   # Terminal 2
   cd backend
   node simple-proxy.js
   ```

2. **Mở trình duyệt:**
   ```
   http://localhost:3000/
   ```

3. **Chọn phim và xem!**

---

## 📞 CẦN TRỢ GIÚP?

### Nếu vẫn không xem được phim:

1. **Kiểm tra Console (F12)** - Xem lỗi gì
2. **Test API:** http://localhost:3000/test-direct-api.html
3. **Test Video:** http://localhost:3000/test-video-player.html
4. **Xem log proxy:** Trong terminal chạy proxy

### Các file hướng dẫn khác:
- `KHOI_DONG.md` - Hướng dẫn khởi động
- `XEM_NGAY.md` - Hướng dẫn xem nhanh
- `START_HERE.md` - Bắt đầu từ đầu

---

## ✅ CHECKLIST XEM PHIM

- [ ] Frontend đang chạy (port 3000)
- [ ] Proxy đang chạy (port 5001)
- [ ] Trang chủ hiển thị phim
- [ ] Click vào phim → Thấy chi tiết
- [ ] Click "XEM NGAY" → Video player hiện
- [ ] Click Play → Video phát

**Nếu tất cả đều ✅ → Bạn đã sẵn sàng xem phim! 🎉**

---

**Chúc bạn xem phim vui vẻ! 🍿🎬**
