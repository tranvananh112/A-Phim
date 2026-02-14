# 🎬 Hướng Dẫn Xem Phim: Ngày Xưa Có Một Chuyện Tình

## 🚀 Các Cách Xem Phim

### 1️⃣ Trang Demo (Đơn giản nhất - Khuyến nghị)
```
http://localhost:3000/demo-movie.html
```
✅ Phát video trực tiếp với HLS.js  
✅ Hiển thị đầy đủ thông tin phim  
✅ Không cần đăng nhập  

---

### 2️⃣ Trang Watch Chính Thức
```
http://localhost:3000/watch.html?slug=ngay-xua-co-mot-chuyen-tinh&episode=full
```
✅ Giao diện đầy đủ như Netflix  
✅ Lưu tiến trình xem  
✅ Gợi ý phim liên quan  

---

### 3️⃣ Xem Chi Tiết Phim Trước
```
http://localhost:3000/movie-detail.html?slug=ngay-xua-co-mot-chuyen-tinh
```
✅ Xem thông tin đầy đủ  
✅ Đọc mô tả, diễn viên  
✅ Click "XEM NGAY" để xem phim  

---

### 4️⃣ Test API
```
http://localhost:3000/test-movie-api.html
```
✅ Kiểm tra API hoạt động  
✅ Xem cấu trúc dữ liệu  
✅ Debug nếu có lỗi  

---

## 📊 Thông Tin Phim

**Tên phim:** Ngày Xưa Có Một Chuyện Tình  
**Tên gốc:** Once Upon A Love Story  
**Năm:** 2024  
**Thời lượng:** 135 Phút  
**Chất lượng:** HD - Lồng Tiếng  
**Thể loại:** Tình Cảm  
**Quốc gia:** Việt Nam  

**Đạo diễn:** Trinh Dinh Le Minh  
**Diễn viên:** Ngọc Xuân, Lương Anh Vũ, Đỗ Nhật Hoàng, Hạo Khang, Rima Thanh Vy, Kiều Trinh

**Nội dung:**  
Ngày Xưa Có Một Chuyện Tình xoay quanh câu chuyện tình bạn, tình yêu giữa hai chàng trai và một cô gái từ thuở ấu thơ cho đến khi trưởng thành, phải đối mặt với những thử thách của số phận. Trải dài trong 4 giai đoạn từ năm 1987 - 2000, ba người bạn cùng tuổi - Vinh, Miền, Phúc đã cùng yêu, cùng bỡ ngỡ bước vào đời, va vấp và vượt qua.

---

## 🔧 Cấu Hình API

### Dữ liệu API từ Ophim:

```json
{
  "status": "success",
  "data": {
    "item": {
      "name": "Ngày Xưa Có Một Chuyện Tình",
      "slug": "ngay-xua-co-mot-chuyen-tinh",
      "origin_name": "Once Upon A Love Story",
      "year": 2024,
      "quality": "HD",
      "lang": "Lồng Tiếng",
      "time": "135 Phút",
      "episode_current": "Full",
      "episodes": [
        {
          "server_name": "Lồng Tiếng #1",
          "server_data": [
            {
              "name": "Full",
              "slug": "full",
              "link_m3u8": "https://vip.opstream13.com/20251205/21005_1facae63/index.m3u8"
            }
          ]
        }
      ]
    }
  }
}
```

### Link Stream Video:
```
https://vip.opstream13.com/20251205/21005_1facae63/index.m3u8
```

---

## 🎯 Cách Hoạt Động

### Luồng Xem Phim:

1. **User truy cập trang** → `watch.html?slug=ngay-xua-co-mot-chuyen-tinh&episode=full`

2. **JavaScript load phim:**
   ```javascript
   const response = await movieAPI.getMovieDetail('ngay-xua-co-mot-chuyen-tinh');
   const movie = response.data.item;
   const episode = movie.episodes[0].server_data[0];
   ```

3. **Lấy link stream:**
   ```javascript
   const streamURL = episode.link_m3u8;
   // https://vip.opstream13.com/20251205/21005_1facae63/index.m3u8
   ```

4. **Phát video với HLS.js:**
   ```javascript
   const hls = new Hls();
   hls.loadSource(streamURL);
   hls.attachMedia(videoElement);
   ```

5. **Video được phát!** 🎉

---

## 🔍 Troubleshooting

### ❌ Video không phát?

**Kiểm tra:**
1. Mở DevTools (F12) → Console tab
2. Xem có lỗi gì không
3. Kiểm tra Network tab → Xem request đến API

**Giải pháp:**
- Đảm bảo `USE_BACKEND: false` trong `js/config.js`
- Thử mở `test-movie-api.html` để test API
- Kiểm tra link m3u8 có hoạt động không

### ❌ API không trả về dữ liệu?

**Kiểm tra:**
```javascript
// Mở Console và chạy:
fetch('https://ophim17.cc/phim/ngay-xua-co-mot-chuyen-tinh')
  .then(r => r.json())
  .then(d => console.log(d));
```

### ❌ CORS Error?

**Giải pháp:**
- Dùng backend proxy (set `USE_BACKEND: true`)
- Hoặc cài extension CORS Unblock cho Chrome

---

## 📝 Tích Hợp Phim Khác

Để thêm phim khác, bạn chỉ cần:

1. **Lấy slug từ Ophim API:**
   ```
   https://ophim17.cc/phim/[slug-phim]
   ```

2. **Tạo link xem:**
   ```
   http://localhost:3000/watch.html?slug=[slug-phim]&episode=full
   ```

3. **Hoặc link chi tiết:**
   ```
   http://localhost:3000/movie-detail.html?slug=[slug-phim]
   ```

### Ví dụ với phim khác:
```
http://localhost:3000/watch.html?slug=dao-hai-tac&episode=tap-1
http://localhost:3000/watch.html?slug=conan&episode=tap-1000
```

---

## 🎬 Tính Năng Đã Có

✅ Phát video HLS (m3u8)  
✅ Tự động lưu tiến trình xem  
✅ Chuyển tập tự động  
✅ Điều chỉnh tốc độ phát  
✅ Fullscreen  
✅ Responsive (mobile-friendly)  
✅ Gợi ý phim liên quan  
✅ Đánh giá & bình luận  
✅ Lưu phim yêu thích  

---

## 🚀 Bắt Đầu Ngay

1. Đảm bảo server đang chạy:
   ```bash
   npm start
   ```

2. Mở trình duyệt:
   ```
   http://localhost:3000/demo-movie.html
   ```

3. Click Play và thưởng thức! 🍿

---

**Chúc bạn xem phim vui vẻ! 🎉**
