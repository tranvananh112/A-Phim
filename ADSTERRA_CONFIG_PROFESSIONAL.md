# Cấu Hình AdsTerra Popunder - Chuyên Nghiệp & Cân Bằng

## 🎯 Chiến Lược

Cấu hình được tối ưu để **tăng doanh thu** nhưng **không làm phiền người dùng quá mức**.

## ⚙️ Thông Số Cấu Hình

### Desktop
- **Max pops:** 3 lần/session
- **Delay giữa các lần:** 5 phút
- **Delay lần đầu:** 10 giây (sau grace period + tương tác)
- **Grace period:** 45 giây (người dùng có thời gian làm quen)
- **Yêu cầu tương tác:** Có (click/scroll/touch)

### Mobile
- **Max pops:** 2 lần/session
- **Delay giữa các lần:** 8 phút
- **Delay lần đầu:** 15 giây (sau grace period + tương tác)
- **Grace period:** 45 giây
- **Yêu cầu tương tác:** Có

### Excluded Pages
- `/payment.html` - Trang thanh toán
- `/pricing.html` - Trang bảng giá

**Lưu ý:** Login và Register vẫn có popunder nhưng trigger trực tiếp (không kiểm soát) vì người dùng thường vào nhanh, ra nhanh.

## 📊 Kịch Bản Hoạt Động

### Scenario 1: User Desktop vào trang chủ
```
1. Vào index.html
2. Đợi 5s (initialDelay) - trang load xong
3. Đợi 45s (gracePeriod) - người dùng làm quen
4. User click/scroll (tương tác đầu tiên)
5. Đợi 3s (interactionDelay)
6. Đợi 10s (firstPopDelay)
7. ✅ POP 1 xuất hiện
8. Đợi 5 phút
9. User click/scroll
10. ✅ POP 2 xuất hiện
11. Đợi 5 phút
12. User click/scroll
13. ✅ POP 3 xuất hiện
14. ⛔ Hết quota - không pop nữa
```

### Scenario 2: User Mobile vào trang phim
```
1. Vào movie-detail.html
2. Đợi 5s (initialDelay)
3. Đợi 45s (gracePeriod)
4. User scroll (tương tác đầu tiên)
5. Đợi 3s (interactionDelay)
6. Đợi 15s (firstPopDelay)
7. ✅ POP 1 xuất hiện
8. Đợi 8 phút
9. User click "XEM NGAY"
10. ✅ POP 2 xuất hiện
11. ⛔ Hết quota - không pop nữa
```

### Scenario 3: User chuyển trang
```
1. Vào index.html → POP 1 (sau 45s + tương tác)
2. Chuyển sang categories.html → Counter vẫn giữ (1/3)
3. Đợi 5 phút, click → POP 2 (2/3)
4. Chuyển sang movie-detail.html → Counter vẫn giữ (2/3)
5. Đợi 5 phút, click → POP 3 (3/3)
6. ⛔ Hết quota
```

## 🔍 Cách Kiểm Tra

### Test trong Console (F12)

```javascript
// Xem logs
[AdsTerra] ⏳ Initializing in 5 seconds...
[AdsTerra] 📱 Device: Desktop | Max pops: 3 | Min time: 5 min | Grace period: 45 s
[AdsTerra] 📦 Preloading popunder script...
[AdsTerra] ✅ Ready
[AdsTerra] 👂 Listening for user interaction...
[AdsTerra] 🛡️ Grace period active. Wait 42 seconds (let user browse first)
[AdsTerra] 👆 User interaction detected
[AdsTerra] 🎯 Ready to trigger popunder
[AdsTerra] ✅ Popunder loaded (interaction) - Desktop - Pop 1/3 | Next in 10 seconds

// Kiểm tra counter
sessionStorage.getItem('adsterra_popunder_count') // "1"
sessionStorage.getItem('adsterra_popunder_time') // timestamp
sessionStorage.getItem('adsterra_first_visit') // timestamp

// Reset để test lại
sessionStorage.clear()
```

## 📈 Dự Đoán Revenue

### Với 1000 visitors/ngày:

**Desktop (60% = 600 users):**
- 70% xem >= 2 trang → 420 users × 2 pops = 840 impressions
- 20% xem >= 3 trang → 120 users × 3 pops = 360 impressions
- 10% xem 1 trang → 60 users × 1 pop = 60 impressions
- **Subtotal Desktop:** 1,260 impressions

**Mobile (40% = 400 users):**
- 60% xem >= 2 trang → 240 users × 2 pops = 480 impressions
- 30% xem 1 trang → 120 users × 1 pop = 120 impressions
- 10% bounce → 40 users × 0 pops = 0 impressions
- **Subtotal Mobile:** 600 impressions

**Tổng:** ~1,860 impressions/ngày

**Revenue ước tính:**
- CPM $3-5 → **$5.6 - $9.3/ngày**
- **$168 - $279/tháng**

## ✅ Ưu Điểm Cấu Hình Này

1. **Grace Period 45s:** Người dùng có thời gian tìm phim, không bị pop ngay
2. **Yêu cầu tương tác:** Chỉ pop khi user thực sự đang dùng trang
3. **Delay 3s sau tương tác:** Không pop ngay lập tức, tránh làm gián đoạn
4. **Max 3 pops Desktop, 2 pops Mobile:** Đủ để kiếm tiền, không quá spam
5. **5-8 phút giữa các lần:** Thời gian hợp lý, không quá dày
6. **Counter giữ qua trang:** Tránh spam khi user chuyển trang

## ⚠️ Lưu Ý

### Trang Login/Register
- Vẫn có script trực tiếp (không kiểm soát)
- Lý do: User vào nhanh, ra nhanh, không ảnh hưởng nhiều
- Nếu muốn kiểm soát: Thêm `<script defer src="js/adsterra.js"></script>` và xóa script trực tiếp

### Trang Payment/Pricing
- KHÔNG có popunder (excluded)
- Lý do: Tránh làm gián đoạn quá trình thanh toán

### Popup Blocker
- Một số trình duyệt có popup blocker mạnh
- User có thể cần tắt popup blocker để xem quảng cáo
- Không ảnh hưởng đến chức năng chính của trang

## 🔧 Điều Chỉnh

Nếu muốn thay đổi:

### Tăng doanh thu (aggressive)
```javascript
maxPopsPerSession: isMobile ? 3 : 4,
minTimeBetweenPops: isMobile ? 360000 : 240000, // 6 phút, 4 phút
gracePeriod: 30000, // 30 giây
```

### Giảm phiền người dùng (conservative)
```javascript
maxPopsPerSession: isMobile ? 1 : 2,
minTimeBetweenPops: isMobile ? 600000 : 420000, // 10 phút, 7 phút
gracePeriod: 60000, // 60 giây
```

### Tắt hoàn toàn
```javascript
enabled: false,
```

## 📝 File Liên Quan

- `js/adsterra.js` - File cấu hình chính
- `index.html`, `watch.html`, `movie-detail.html`, v.v. - Load `js/adsterra.js`
- `login.html`, `register.html` - Load script trực tiếp (không kiểm soát)

## ✅ Kết Luận

Cấu hình này cân bằng tốt giữa:
- ✅ Doanh thu: ~$168-279/tháng với 1000 visitors/ngày
- ✅ UX: Không quá phiền, có grace period, yêu cầu tương tác
- ✅ Chuyên nghiệp: Có logging, tracking, kiểm soát đầy đủ

**Sẵn sàng cho production!** 🚀
