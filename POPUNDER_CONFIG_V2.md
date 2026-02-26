# Cấu Hình Popunder V2 - Revenue Optimized

## 🎯 Cấu Hình Mới

### ⚙️ Thông Số Chính

| Thông số | Giá trị cũ | Giá trị mới | Thay đổi |
|----------|------------|-------------|----------|
| Initial Delay | 15s | **10s** | ⬇️ -5s |
| Max Pops/Session | 3 | **4** | ⬆️ +1 |
| First Pop Delay | 3 phút | **10s** | ⬇️ -2m50s |
| Next Pops Delay | 3 phút | **4 phút** | ⬆️ +1 phút |

### 📊 Kịch Bản Hoạt Động

#### 🔄 Popunder Tự Động (4 lần/session)

**Lần 1 (First Pop):**
```
User vào trang → Đợi 10s → User click/scroll → Đợi 3s → POP 1
```

**Lần 2:**
```
Sau 10 giây từ Pop 1 → User click/scroll → POP 2
```

**Lần 3:**
```
Sau 4 phút từ Pop 2 → User click/scroll → POP 3
```

**Lần 4:**
```
Sau 4 phút từ Pop 3 → User click/scroll → POP 4
```

**Sau đó:**
```
⛔ Không pop nữa cho đến khi đóng trình duyệt
```

#### 🎬 Popunder Đặc Biệt - Nút "XEM NGAY"

**Điều kiện:**
- Chỉ hoạt động trên trang `movie-detail.html`
- Nhận diện nút có text: `<span class="text-lg tracking-wide">XEM NGAY</span>`
- **1 lần duy nhất** mỗi session

**Kịch bản:**
```
User vào trang chi tiết phim → Click nút "XEM NGAY" → POP đặc biệt
```

**Lưu ý:**
- Pop này KHÔNG tính vào 4 lần pop tự động
- Chỉ trigger 1 lần duy nhất mỗi session
- Không ảnh hưởng đến counter của pop tự động

## 📈 So Sánh Revenue

### Cấu Hình Cũ
```
Session 30 phút:
- Pop 1: 15s
- Pop 2: 3m15s (3 phút sau Pop 1)
- Pop 3: 6m15s (3 phút sau Pop 2)
= 3 pops trong 30 phút
```

### Cấu Hình Mới
```
Session 30 phút:
- Pop 1: 10s
- Pop 2: 20s (10s sau Pop 1)
- Pop 3: 4m20s (4 phút sau Pop 2)
- Pop 4: 8m20s (4 phút sau Pop 3)
+ Pop đặc biệt: Khi click "XEM NGAY"
= 4-5 pops trong 30 phút
```

**Tăng trưởng dự kiến:**
- Số pop: +33% (3 → 4 pops)
- Pop đặc biệt: +20-30% (nếu user click "XEM NGAY")
- **Tổng tăng: +50-60% revenue**

## 🎯 Tối Ưu Hóa

### Ưu điểm
✅ Tăng số lần pop từ 3 → 4 lần  
✅ Lần đầu nhanh hơn (10s thay vì 15s)  
✅ Khoảng cách lần 1-2 ngắn (10s) để tận dụng engagement cao  
✅ Khoảng cách lần 2-3-4 dài hơn (4 phút) để giảm phiền  
✅ Pop đặc biệt khi click "XEM NGAY" tăng thêm revenue  

### Cân nhắc
⚠️ Lần đầu nhanh hơn có thể hơi aggressive  
⚠️ 4 pops có thể ảnh hưởng UX nếu user ở lâu  
⚠️ Pop "XEM NGAY" có thể làm user bực nếu muốn xem phim  

## 🔧 Technical Details

### Storage Keys
```javascript
// Main popunder tracking
sessionStorage: 'adsterra_popunder_count'  // Số lần đã pop
sessionStorage: 'adsterra_popunder_time'   // Thời gian pop cuối
sessionStorage: 'adsterra_popunder_first_done' // Đã pop lần đầu

// Watch button special pop
sessionStorage: 'adsterra_watch_button_pop' // Đã pop nút "XEM NGAY"
```

### Functions
```javascript
loadPopunder(source)      // Pop tự động
loadWatchButtonPop()      // Pop đặc biệt nút "XEM NGAY"
setupWatchButtonListener() // Setup listener cho nút
```

### Console Logs
```
[AdsTerra] ⏳ Initializing in 10 seconds...
[AdsTerra] ✅ Ready
[AdsTerra] 👂 Listening for user interaction...
[AdsTerra] 👆 User interaction detected
[AdsTerra] 🎯 Ready to trigger popunder
[AdsTerra] ✅ Popunder loaded (interaction) - Pop 1/4 | Next in 10 seconds
[AdsTerra] 👂 Listening for "XEM NGAY" button click
[AdsTerra] 🎯 "XEM NGAY" button clicked
[AdsTerra] 🎬 Watch button popunder loaded (1 time per session)
```

## 📊 Monitoring

### Kiểm tra trong Console
```javascript
// Check pop count
sessionStorage.getItem('adsterra_popunder_count')

// Check last pop time
sessionStorage.getItem('adsterra_popunder_time')

// Check watch button pop
sessionStorage.getItem('adsterra_watch_button_pop')

// Clear all (for testing)
sessionStorage.clear()
```

### Test Scenarios

**Test 1: Pop tự động**
1. Vào trang bất kỳ
2. Đợi 10s
3. Click/scroll
4. Đợi 3s → Pop 1
5. Đợi 10s, click/scroll → Pop 2
6. Đợi 4 phút, click/scroll → Pop 3
7. Đợi 4 phút, click/scroll → Pop 4

**Test 2: Pop nút "XEM NGAY"**
1. Vào trang movie-detail.html
2. Click nút "XEM NGAY" → Pop đặc biệt
3. Click lại → Không pop nữa

**Test 3: Combined**
1. Vào trang → Pop 1 (tự động)
2. Vào movie-detail → Click "XEM NGAY" → Pop đặc biệt
3. Tiếp tục duyệt → Pop 2, 3, 4 (tự động)
= Tổng 5 pops trong 1 session

## 🚀 Deployment

File đã cập nhật: `js/adsterra.js`

Không cần thay đổi gì ở các file HTML, script tự động hoạt động.

## 📞 Support

Nếu cần điều chỉnh:
- Thay đổi `maxPopsPerSession` để tăng/giảm số lần pop
- Thay đổi `firstPopDelay` để điều chỉnh khoảng cách lần 1-2
- Thay đổi `minTimeBetweenPops` để điều chỉnh khoảng cách lần 2-3-4
- Thay đổi `initialDelay` để điều chỉnh thời gian đợi ban đầu
