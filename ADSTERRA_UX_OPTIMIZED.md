# 🎯 AdsTerra Popunder - Đã Tối Ưu UX

## ⚙️ Cấu Hình Mới (Thân Thiện User)

```javascript
const CONFIG = {
    enabled: true,
    maxPopsPerSession: 3,             // CHỈ 3 lần/session
    minTimeBetweenPops: 300000,       // 5 PHÚT giữa các lần
    initialDelay: 15000,              // Đợi 15 GIÂY khi vào trang
    requireInteraction: true,         // BẮT BUỘC user click/scroll
};
```

## 🔥 Thay Đổi Chính

| Thông Số | Cũ | Mới | Cải Thiện |
|----------|-----|-----|-----------|
| Delay ban đầu | 0s | **15s** | ✅ User có thời gian xem |
| Yêu cầu tương tác | ❌ | **✅** | Chỉ trigger khi user dùng |
| Thời gian giữa pops | 3 phút | **5 phút** | ✅ Giãn 67% |
| Số lần/session | 5 | **3** | ✅ Giảm 40% |

## 🎮 Timeline Thực Tế

**CŨ (Gây khó chịu):**
```
00:00 - Vào trang → Pop ngay ❌
00:01 - Pop lần 2 ❌ (lặp!)
03:01 - Pop lần 3
06:01 - Pop lần 4
09:01 - Pop lần 5
```

**MỚI (Thân thiện):**
```
00:00 - Vào trang
00:15 - Đợi user click/scroll... ✅
00:28 - User click → Pop lần 1 ✅
05:28 - Pop lần 2 ✅
10:28 - Pop lần 3 ✅
15:28 - DỪNG ⛔
```

## 📊 Console Logs

```
[AdsTerra] ⏳ Initializing in 15 seconds...
[AdsTerra] ✅ Ready
[AdsTerra] 👂 Listening for user interaction...
[AdsTerra] 👆 User interaction detected
[AdsTerra] ✅ Popunder loaded - Pop 1/3 | Next in 5 minutes
[AdsTerra] ⏰ Wait 5 minutes before next pop
[AdsTerra] ⛔ Max pops reached: 3/3
```

## 🎯 Tại Sao Tốt?

✅ Không làm phiền user mới vào (đợi 15s + yêu cầu interaction)
✅ Giãn cách hợp lý (5 phút = đủ xem 1-2 tập)
✅ Ít lần hơn (3 thay vì 5)
✅ User không bỏ đi → Retention tốt → Revenue dài hạn cao

## 🔧 Tùy Chỉnh

### Nếu vẫn nhiều:
```javascript
maxPopsPerSession: 2,
minTimeBetweenPops: 420000, // 7 phút
```

### Nếu muốn tích cực hơn:
```javascript
maxPopsPerSession: 4,
minTimeBetweenPops: 240000, // 4 phút
```

## 🧪 Test

```javascript
// Xem số lần
sessionStorage.getItem('adsterra_popunder_count')

// Reset
sessionStorage.clear()
```
