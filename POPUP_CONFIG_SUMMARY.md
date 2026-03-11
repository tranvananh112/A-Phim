# Tóm tắt cấu hình Popup/Popunder Ads

## 📱 CẤU HÌNH MOBILE (Điện thoại/Tablet)

### Tần suất hiển thị
- **Số lần tối đa**: 4 popup/session
- **Thời gian giữa các lần**: 3 phút (180 giây)
- **Lần đầu tiên**: Sau 10 giây kể từ khi tương tác đầu tiên
- **Grace Period**: 20 giây (thời gian làm quen trang)

### Điều kiện kích hoạt
✅ **BẮT BUỘC có tương tác** (click, scroll, touch, keydown)
✅ Chờ 3 giây sau khi trang load xong
✅ Chờ thêm 1 giây sau khi người dùng tương tác
✅ Không hiển thị trên trang thanh toán (/payment.html, /pricing.html)

### Ví dụ timeline Mobile:
```
0s    → Trang load
3s    → Script sẵn sàng
20s   → Grace period kết thúc
25s   → User click/scroll (tương tác đầu tiên)
26s   → Popup #1 xuất hiện (sau 1s delay)
206s  → Popup #2 có thể xuất hiện (sau 3 phút)
386s  → Popup #3 có thể xuất hiện (sau 3 phút nữa)
566s  → Popup #4 có thể xuất hiện (sau 3 phút nữa)
```

---

## 💻 CẤU HÌNH DESKTOP (Máy tính)

### Tần suất hiển thị
- **Số lần tối đa**: 10 popup/session (TĂNG MẠNH để tối đa doanh thu)
- **Thời gian giữa các lần**: 1.5 phút (90 giây)
- **Lần đầu tiên**: Sau 3 giây kể từ khi tương tác đầu tiên
- **Grace Period**: 15 giây (thời gian làm quen trang)

### Điều kiện kích hoạt
✅ **BẮT BUỘC có tương tác** (click, scroll, keydown)
✅ Chờ 3 giây sau khi trang load xong
✅ Chờ thêm 1 giây sau khi người dùng tương tác
✅ Không hiển thị trên trang thanh toán
✅ Chỉ load trên màn hình >= 1024px

### Ví dụ timeline Desktop:
```
0s    → Trang load
3s    → Script sẵn sàng
15s   → Grace period kết thúc
18s   → User click/scroll (tương tác đầu tiên)
19s   → Popup #1 xuất hiện (sau 1s delay)
109s  → Popup #2 có thể xuất hiện (sau 1.5 phút)
199s  → Popup #3 có thể xuất hiện (sau 1.5 phút nữa)
...
739s  → Popup #10 có thể xuất hiện (popup cuối cùng)
```

---

## 🎯 TÍNH NĂNG ĐẶC BIỆT

### 1. Preload Navigation (BẬT)
- Khi user click vào link nội bộ, trang đích được preload trước
- Popup xuất hiện NGAY SAU khi preload xong
- Navigate đến trang mới sau 300ms
- **Mục đích**: Giảm độ trễ, UX mượt mà hơn

### 2. Grace Period (Thời gian làm quen)
- Mobile: 20 giây
- Desktop: 15 giây
- Trong thời gian này, KHÔNG có popup nào xuất hiện
- **Mục đích**: Cho người dùng thời gian làm quen với trang

### 3. Interaction Required (BẮT BUỘC)
- Popup CHỈ xuất hiện sau khi user có tương tác
- Các loại tương tác: click, scroll, touch, keydown
- **Mục đích**: Tránh làm phiền người dùng ngay khi vào trang

### 4. Session Persistence
- Counter được lưu trong sessionStorage
- Không reset khi chuyển trang
- Reset khi đóng tab/browser
- **Mục đích**: Kiểm soát số lần popup trong 1 session

---

## 📊 SO SÁNH MOBILE vs DESKTOP

| Tiêu chí | Mobile | Desktop |
|----------|--------|---------|
| Số popup tối đa | 4 | 10 |
| Thời gian giữa các lần | 3 phút | 1.5 phút |
| Delay lần đầu | 10s | 3s |
| Grace period | 20s | 15s |
| Màn hình tối thiểu | - | >= 1024px |
| Tương tác bắt buộc | ✅ | ✅ |
| Preload navigation | ✅ | ✅ |

---

## 🔧 FILES LIÊN QUAN

1. **js/adsterra.js** - Cấu hình chính cho cả mobile và desktop
2. **js/popunder-desktop.js** - Script riêng cho desktop (không dùng nữa, thay bằng adsterra.js)

---

## 💡 CHIẾN LƯỢC DOANH THU

### Desktop (Tích cực)
- 10 popup/session = Tối đa hóa doanh thu
- 1.5 phút/lần = Tần suất cao nhưng không quá spam
- Delay ngắn (3s) = Trigger nhanh

### Mobile (Cân bằng - Tăng nhẹ)
- 4 popup/session = Tăng nhẹ để cải thiện doanh thu
- 3 phút/lần = Tần suất vừa phải, UX tốt
- Delay dài hơn (10s) = Cho user thời gian

---

## 🚫 TRANG LOẠI TRỪ

Popup KHÔNG xuất hiện trên:
- `/payment.html` - Trang thanh toán
- `/pricing.html` - Trang bảng giá

---

## 📝 GHI CHÚ

- Script URL: `https://encyclopediainsoluble.com/bd/33/6d/bd336d4948e946b0e4a42348436b9f13.js`
- Preload được bật để giảm độ trễ
- Navigation interceptor hoạt động để preload trang đích
- Console logs chi tiết để debug
