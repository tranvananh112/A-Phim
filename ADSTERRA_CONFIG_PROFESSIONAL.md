# Cấu Hình AdsTerra Popunder - Chuyên Nghiệp & Cân Bằng

## 🎯 Chiến Lược

Cấu hình được tối ưu để **tăng doanh thu** nhưng **không làm phiền người dùng quá mức**.

## ⚙️ Thông Số Cấu Hình

### Desktop (TĂNG DOANH THU)
- **Max pops:** 6 lần/session (tăng gấp đôi)
- **Delay giữa các lần:** 2 phút (giảm từ 5 phút)
- **Delay lần đầu:** 5 giây (giảm từ 10 giây)
- **Grace period:** 20 giây (giảm từ 45 giây)
- **Yêu cầu tương tác:** Có (click/scroll/touch)
- **Preload Navigation:** BẬT - Trang load trước khi popunder xuất hiện

### Mobile
- **Max pops:** 3 lần/session (tăng từ 2)
- **Delay giữa các lần:** 5 phút (giảm từ 8 phút)
- **Delay lần đầu:** 10 giây (giảm từ 15 giây)
- **Grace period:** 20 giây (giảm từ 45 giây)
- **Yêu cầu tương tác:** Có
- **Preload Navigation:** BẬT

### Excluded Pages
- `/payment.html` - Trang thanh toán
- `/pricing.html` - Trang bảng giá

**Lưu ý:** Login và Register vẫn có popunder nhưng trigger trực tiếp (không kiểm soát) vì người dùng thường vào nhanh, ra nhanh.

## 📊 Kịch Bản Hoạt Động

### Scenario 1: User Desktop vào trang chủ (MỚI - TĂNG DOANH THU)
```
1. Vào index.html
2. Đợi 3s (initialDelay) - trang load xong
3. Đợi 20s (gracePeriod) - người dùng làm quen
4. User click/scroll (tương tác đầu tiên)
5. Đợi 1s (interactionDelay)
6. Đợi 5s (firstPopDelay)
7. ✅ POP 1 xuất hiện
8. Đợi 2 phút
9. User click vào phim → Trang phim preload → POP 2 xuất hiện → Navigate
10. ✅ POP 2 xuất hiện (trang đích đã load sẵn)
11. Đợi 2 phút
12. User click "XEM NGAY" → Trang watch preload → POP 3 xuất hiện → Navigate
13. ✅ POP 3 xuất hiện (trang watch đã load sẵn)
14. Đợi 2 phút
15. User click phim khác → POP 4
16. Đợi 2 phút
17. User click thể loại → POP 5
18. Đợi 2 phút
19. User click tìm kiếm → POP 6
20. ⛔ Hết quota (6/6) - không pop nữa
```

### Scenario 2: User Mobile vào trang phim (MỚI)
```
1. Vào movie-detail.html
2. Đợi 3s (initialDelay)
3. Đợi 20s (gracePeriod)
4. User scroll (tương tác đầu tiên)
5. Đợi 1s (interactionDelay)
6. Đợi 10s (firstPopDelay)
7. ✅ POP 1 xuất hiện
8. Đợi 5 phút
9. User click "XEM NGAY" → Trang watch preload → POP 2 → Navigate
10. ✅ POP 2 xuất hiện (trang watch đã load sẵn)
11. Đợi 5 phút
12. User click phim khác → POP 3
13. ⛔ Hết quota (3/3) - không pop nữa
```

### Scenario 3: User chuyển trang với Preload Navigation (MỚI)
```
1. Vào index.html → POP 1 (sau 20s + tương tác)
2. Click vào phim:
   - Trang movie-detail.html bắt đầu preload (fetch HTML)
   - POP 2 xuất hiện
   - Navigate đến movie-detail.html (đã load sẵn)
   - User thấy trang load nhanh!
3. Đợi 2 phút, click "XEM NGAY":
   - Trang watch.html preload
   - POP 3 xuất hiện
   - Navigate đến watch.html (đã load sẵn)
4. Đợi 2 phút, click phim khác → POP 4 (4/6)
5. Đợi 2 phút, click thể loại → POP 5 (5/6)
6. Đợi 2 phút, click tìm kiếm → POP 6 (6/6)
7. ⛔ Hết quota
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

## 📈 Dự Đoán Revenue (CẬP NHẬT)

### Với 1000 visitors/ngày:

**Desktop (60% = 600 users) - TĂNG DOANH THU:**
- 80% xem >= 3 trang → 480 users × 4 pops = 1,920 impressions
- 15% xem >= 5 trang → 90 users × 6 pops = 540 impressions
- 5% xem 1-2 trang → 30 users × 1 pop = 30 impressions
- **Subtotal Desktop:** 2,490 impressions (tăng 97% so với cũ)

**Mobile (40% = 400 users):**
- 70% xem >= 2 trang → 280 users × 2 pops = 560 impressions
- 20% xem >= 3 trang → 80 users × 3 pops = 240 impressions
- 10% xem 1 trang → 40 users × 1 pop = 40 impressions
- **Subtotal Mobile:** 840 impressions (tăng 40% so với cũ)

**Tổng:** ~3,330 impressions/ngày (tăng 79% so với cũ: 1,860)

**Revenue ước tính:**
- CPM $3-5 → **$10 - $16.65/ngày**
- **$300 - $500/tháng** (tăng gần gấp đôi so với cũ: $168-279)

### Thời gian đạt $10 (rút tiền):
- Trước: 3-10 giờ
- Bây giờ: **1-5 giờ** ⚡⚡⚡

## ✅ Ưu Điểm Cấu Hình Mới

1. **Preload Navigation:** Trang load trước khi popunder xuất hiện → UX tốt hơn
2. **Tăng gấp đôi pops Desktop:** 6 lần thay vì 3 → Doanh thu tăng 97%
3. **Delay ngắn hơn:** 2 phút thay vì 5 → Trigger nhiều hơn trong cùng session
4. **Grace period ngắn:** 20s thay vì 45s → Trigger nhanh hơn
5. **Interaction delay ngắn:** 1s thay vì 3s → Phản hồi nhanh hơn
6. **Tối ưu cho Desktop:** Desktop có màn hình lớn, chịu được nhiều pops hơn
7. **Vẫn giữ UX tốt:** Preload navigation giúp trang load nhanh khi user quay lại

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

### Tắt Preload Navigation (nếu gặp vấn đề)
```javascript
preloadNavigation: false, // Tắt preload, popunder trigger bình thường
```

### Tăng doanh thu hơn nữa (very aggressive)
```javascript
maxPopsPerSession: isMobile ? 4 : 8,
minTimeBetweenPops: isMobile ? 240000 : 90000, // 4 phút, 1.5 phút
gracePeriod: 10000, // 10 giây
```

### Giảm về mức cũ (conservative)
```javascript
maxPopsPerSession: isMobile ? 2 : 3,
minTimeBetweenPops: isMobile ? 480000 : 300000, // 8 phút, 5 phút
gracePeriod: 45000, // 45 giây
preloadNavigation: false,
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

Cấu hình mới tối ưu cho:
- ✅ Doanh thu: ~$300-500/tháng với 1000 visitors/ngày (tăng gần gấp đôi)
- ✅ UX: Preload navigation giúp trang load nhanh khi user quay lại
- ✅ Desktop: Tăng gấp đôi pops (6 lần) để tận dụng màn hình lớn
- ✅ Mobile: Tăng nhẹ (3 lần) để không làm phiền quá nhiều
- ✅ Trigger nhanh: Grace period 20s, delay 2 phút

**So với cấu hình cũ:**
- Desktop: 3 pops → 6 pops (+100%)
- Mobile: 2 pops → 3 pops (+50%)
- Delay: 5 phút → 2 phút (-60%)
- Grace: 45s → 20s (-56%)
- **Doanh thu tăng ~79%**

**Sẵn sàng cho production!** 🚀💰
