# 🔗 Hướng Dẫn PropellerAds Direct Link

## ✅ Direct Link Đã Được Tích Hợp!

**Direct Link ID:** 10647261  
**URL:** //rm358.com/4/10647261

---

## 📋 Direct Link là gì?

**Direct Link** là link chuyển hướng trực tiếp từ PropellerAds. Khi user click vào link này, họ sẽ được tự động chuyển đến quảng cáo phù hợp nhất dựa trên:
- Vị trí địa lý (country)
- Loại thiết bị (desktop/mobile)
- Trình duyệt
- Hành vi người dùng

### Ưu điểm:
✅ Đơn giản, dễ tích hợp  
✅ Tự động tối ưu quảng cáo  
✅ CPM ổn định  
✅ Không cần permission từ user  

---

## 🎯 Các Trang Đã Tích Hợp

✅ `index.html` - Trang chủ  
✅ `watch.html` - Trang xem phim  
✅ `categories.html` - Danh mục  
✅ `filter.html` - Lọc phim  
✅ `search.html` - Tìm kiếm

**Cách hoạt động:** Khi user click vào bất kỳ đâu trên trang, Direct Link sẽ tự động mở trong tab mới (tối đa 2 lần/session).

---

## 🧪 Cách Kiểm Tra

### Test nhanh:
1. Mở `test-propellerads.html`
2. Click vào khu vực test
3. Tab mới sẽ mở với quảng cáo

### Console:
```javascript
window.propellerAdsManager.openDirectLink('test');
```

---

## ⚙️ Cấu Hình

File `js/propellerads.js`:

```javascript
window.propellerAdsManager = new PropellerAdsManager({
    directLinkId: '10647261',
    directLinkUrl: '//rm358.com/4/10647261',
    enabled: true,
    triggerOnClick: true, // Tự động mở khi click
    maxPerSession: 2 // Tối đa 2 lần/session
});
```

---

## 💰 Thu Nhập Dự Kiến

| Traffic/Ngày | Click Rate | Thu Nhập/Ngày | Thu Nhập/Tháng |
|--------------|------------|---------------|----------------|
| 1,000        | 50%        | $1-2.5        | $30-75         |
| 5,000        | 50%        | $5-12.5       | $150-375       |
| 10,000       | 50%        | $10-25        | $300-750       |

---

## 📊 Xem Thống Kê

1. Đăng nhập: https://publishers.propellerads.com
2. Vào "Statistics" → "Direct Link"
3. Xem clicks, revenue, eCPM

---

## 💸 Rút Tiền

- Minimum: $5
- Thanh toán: Weekly
- Phương thức: PayPal, Payoneer, Wire Transfer

---

## ⚠️ Lưu Ý

✅ Giới hạn 1-2 lần/session  
✅ Kết hợp với quảng cáo khác  
❌ Không tự click  
❌ Không fake traffic  

**Chúc bạn kiếm được nhiều tiền! 💰**
