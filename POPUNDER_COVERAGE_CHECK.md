# Kiểm Tra Coverage Popunder AdsTerra

## ✅ Các Trang ĐÃ CÀI Popunder

### Trang Chính (User-facing)
1. ✅ `index.html` - Trang chủ
2. ✅ `categories.html` - Danh mục phim
3. ✅ `phim-viet-nam.html` - Phim Việt Nam
4. ✅ `search.html` - Tìm kiếm
5. ✅ `movie-detail.html` - Chi tiết phim
6. ✅ `watch.html` - Xem phim
7. ✅ `filter.html` - Lọc phim
8. ✅ `profile.html` - Trang cá nhân
9. ✅ `support.html` - Ủng hộ

### Trang Excluded (KHÔNG có popunder)
- ❌ `login.html` - Đăng nhập (excluded by config)
- ❌ `register.html` - Đăng ký (excluded by config)
- ❌ `payment.html` - Thanh toán (excluded by config)

### Trang Test/Demo (Không cần)
- `test-*.html` - Các trang test
- `demo-*.html` - Các trang demo
- `admin/*` - Trang admin

## 🎯 Cấu Hình Popunder

### Thông Số
```javascript
maxPopsPerSession: 4        // Tối đa 4 pops/session
minTimeBetweenPops: 180000  // 3 phút giữa các pops
firstPopDelay: 5000         // 5 giây cho lần đầu
initialDelay: 3000          // 3 giây sau khi load trang
interactionDelay: 1000      // 1 giây sau interaction
resetOnPageChange: false    // KHÔNG reset khi chuyển trang
```

### Excluded Pages
```javascript
excludePages: [
    '/login.html',
    '/register.html', 
    '/payment.html'
]
```

## 📊 Kịch Bản Hoạt Động

### Scenario 1: User vào trang chủ
```
1. Vào index.html
2. Đợi 3s (initialDelay)
3. User click/scroll
4. Đợi 1s (interactionDelay)
5. ✅ POP 1 xuất hiện
6. Đợi 5s (firstPopDelay)
7. User click/scroll
8. ✅ POP 2 xuất hiện
9. Đợi 3 phút
10. User click/scroll
11. ✅ POP 3 xuất hiện
12. Đợi 3 phút
13. User click/scroll
14. ✅ POP 4 xuất hiện
15. ⛔ Hết quota - không pop nữa
```

### Scenario 2: User chuyển trang
```
1. Vào index.html → POP 1
2. Chuyển sang categories.html → Counter vẫn giữ (1/4)
3. Đợi 5s, click → POP 2 (2/4)
4. Chuyển sang movie-detail.html → Counter vẫn giữ (2/4)
5. Click "XEM NGAY" → POP đặc biệt (không tính vào counter)
6. Chuyển sang watch.html → Counter vẫn giữ (2/4)
7. Đợi 3 phút, click → POP 3 (3/4)
8. Đợi 3 phút, click → POP 4 (4/4)
9. ⛔ Hết quota
```

### Scenario 3: Nút "XEM NGAY" đặc biệt
```
1. Vào movie-detail.html
2. Click nút "XEM NGAY"
3. ✅ POP đặc biệt (1 lần/session)
4. Click lại "XEM NGAY" → ⛔ Không pop nữa
5. Vào phim khác, click "XEM NGAY" → ⛔ Không pop nữa
```

## 🔍 Cách Test

### Test 1: Kiểm tra pop tự động
```javascript
// 1. Mở trang bất kỳ (index.html)
// 2. Mở Console (F12)
// 3. Xem logs:
[AdsTerra] ⏳ Initializing in 3 seconds...
[AdsTerra] ✅ Ready
[AdsTerra] 👂 Listening for user interaction...

// 4. Click hoặc scroll
[AdsTerra] 👆 User interaction detected
[AdsTerra] 🎯 Ready to trigger popunder

// 5. Sau 1 giây
[AdsTerra] ✅ Popunder loaded (interaction) - Pop 1/4 | Next in 5 seconds

// 6. Kiểm tra sessionStorage
sessionStorage.getItem('adsterra_popunder_count') // "1"
```

### Test 2: Kiểm tra nút "XEM NGAY"
```javascript
// 1. Vào movie-detail.html
// 2. Mở Console
// 3. Xem logs:
[AdsTerra] 👂 Listening for "XEM NGAY" button click

// 4. Click nút "XEM NGAY"
[AdsTerra] 🎯 "XEM NGAY" button clicked
[AdsTerra] 🎬 Watch button popunder loaded INSTANTLY (1 time per session)

// 5. Kiểm tra sessionStorage
sessionStorage.getItem('adsterra_watch_button') // "true"
```

### Test 3: Kiểm tra excluded pages
```javascript
// 1. Vào login.html
// 2. Mở Console
// 3. Xem logs:
[AdsTerra] ⏭️ Skipped on excluded page: /login.html

// Không có pop nào xuất hiện
```

### Test 4: Kiểm tra max pops
```javascript
// 1. Trigger 4 pops
// 2. Thử trigger thêm
// 3. Xem logs:
[AdsTerra] ⛔ Max pops reached for this session: 4/4

// Không có pop nào xuất hiện nữa
```

### Test 5: Reset session
```javascript
// Clear sessionStorage để test lại
sessionStorage.clear()

// Hoặc đóng trình duyệt và mở lại
```

## 🌐 Tương Thích Trình Duyệt

### ✅ Hoạt động trên:
- Chrome/Edge (Chromium)
- Firefox
- Safari (Desktop & Mobile)
- Opera
- Brave
- Samsung Internet

### ⚠️ Lưu ý:
- **Popup Blocker**: Một số trình duyệt có popup blocker mạnh có thể chặn popunder
- **Private/Incognito Mode**: sessionStorage bị xóa khi đóng tab
- **Mobile Browser**: Một số browser mobile có thể chặn popunder

## 📈 Dự Đoán Revenue

### Với 1000 visitors/ngày:
```
Scenario trung bình:
- 70% users xem >= 2 trang → 700 users × 2 pops = 1,400 impressions
- 20% users xem >= 4 trang → 200 users × 4 pops = 800 impressions
- 10% users xem 1 trang → 100 users × 1 pop = 100 impressions
- 30% users click "XEM NGAY" → 300 impressions đặc biệt

Tổng: ~2,600 impressions/ngày

CPM $3-5 → Revenue: $7.8 - $13/ngày
```

## 🔧 Troubleshooting

### Popunder không xuất hiện?
1. Kiểm tra Console có lỗi không
2. Kiểm tra popup blocker
3. Kiểm tra sessionStorage: `sessionStorage.getItem('adsterra_popunder_count')`
4. Clear sessionStorage và thử lại
5. Kiểm tra có phải excluded page không

### Popunder xuất hiện quá nhiều?
1. Kiểm tra `maxPopsPerSession` trong config
2. Kiểm tra `resetOnPageChange` = false
3. Kiểm tra sessionStorage counter

### Nút "XEM NGAY" không trigger pop?
1. Kiểm tra có đúng trang movie-detail.html không
2. Kiểm tra nút có đúng class `text-lg tracking-wide` không
3. Kiểm tra Console có log "Listening for XEM NGAY" không
4. Kiểm tra đã pop lần nào chưa: `sessionStorage.getItem('adsterra_watch_button')`

## 📝 Commit History

- `537a123` - Optimize popunder config - Balanced approach (4 pops/session, no page reset)
- `391499c` - Add data caching & performance optimization
- `bc54ffe` - Remove ad banners for better performance

## ✅ Kết Luận

Popunder đã được cài đặt đầy đủ trên:
- ✅ 9 trang chính (user-facing)
- ✅ Excluded 3 trang (login, register, payment)
- ✅ Cấu hình balanced: 4 pops/session, không reset
- ✅ Tương thích tất cả trình duyệt
- ✅ Có tracking và logging đầy đủ

**Sẵn sàng cho production!** 🚀
