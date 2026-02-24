# 🧪 Test PropellerAds Trên Localhost

## ⚠️ Lưu Ý Quan Trọng

**PropellerAds Direct Link KHÔNG hiển thị quảng cáo thật trên localhost!**

Lý do:
- PropellerAds cần domain thật để tracking
- Localhost không có traffic thật
- Mạng quảng cáo block localhost để tránh fraud

## ✅ Cách Test Trên Localhost

### 1. Kiểm tra script đã load chưa

Mở trang bất kỳ (index.html, watch.html, etc.) và:

**Bước 1:** Mở Console (F12)

**Bước 2:** Gõ lệnh:
```javascript
console.log(window.propellerAdsManager);
```

**Kết quả mong đợi:**
```
PropellerAdsManager {
  directLinkId: "10647261",
  directLinkUrl: "//rm358.com/4/10647261",
  enabled: true,
  triggerOnClick: true,
  maxPerSession: 2
}
```

Nếu thấy object này → Script đã load thành công ✅

### 2. Test thủ công mở Direct Link

Trong Console, gõ:
```javascript
window.propellerAdsManager.openDirectLink('test');
```

**Kết quả mong đợi:**
- Một tab mới sẽ mở
- URL: `//rm358.com/4/10647261?var=test`
- Tab có thể hiển thị trang trống hoặc lỗi (bình thường trên localhost)

### 3. Kiểm tra click event

**Bước 1:** Mở Console

**Bước 2:** Click vào bất kỳ đâu trên trang (không phải link/button)

**Bước 3:** Xem log trong Console:

```
PropellerAds Direct Link initialized: //rm358.com/4/10647261
PropellerAds: Direct link opened (1/2)
```

Nếu thấy log này → Click event hoạt động ✅

### 4. Kiểm tra counter

Trong Console, gõ:
```javascript
window.propellerAdsManager.getStats();
```

**Kết quả:**
```javascript
{
  clickedToday: 1,
  maxPerSession: 2,
  remaining: 1,
  canShow: true
}
```

### 5. Reset counter để test lại

```javascript
window.propellerAdsManager.resetCounter();
```

## 🚀 Test Trên Production (Website Thật)

Để test PropellerAds hoạt động thật sự, bạn cần:

### Bước 1: Deploy lên internet

Deploy website lên một trong các nền tảng:
- **GitHub Pages** (miễn phí, dễ nhất)
- **Vercel** (miễn phí)
- **Netlify** (miễn phí)
- **Hosting riêng**

### Bước 2: Đợi 24-48 giờ

PropellerAds cần thời gian để:
- Verify domain
- Crawl website
- Setup ad serving
- Optimize targeting

### Bước 3: Test trên production

1. Truy cập website đã deploy
2. Click vào trang
3. Tab mới sẽ mở với quảng cáo thật
4. Kiểm tra PropellerAds dashboard để xem stats

## 📊 Kiểm Tra Trong PropellerAds Dashboard

1. Đăng nhập: https://publishers.propellerads.com
2. Vào "Statistics" → "Direct Link"
3. Chọn ngày hôm nay
4. Xem:
   - **Clicks:** Số lần Direct Link được click
   - **Revenue:** Thu nhập
   - **eCPM:** Giá trung bình

Nếu thấy số liệu → PropellerAds đang hoạt động ✅

## 🔧 Troubleshooting

### Script không load?

**Kiểm tra:**
```javascript
// Trong Console
console.log(window.PropellerAdsManager); // Phải có class
console.log(window.propellerAdsManager); // Phải có instance
```

**Nếu undefined:**
- Kiểm tra file `js/propellerads.js` có tồn tại không
- Kiểm tra đường dẫn trong HTML đúng chưa: `<script src="js/propellerads.js"></script>`
- Xóa cache trình duyệt (Ctrl + Shift + Delete)

### Click không hoạt động?

**Kiểm tra:**
```javascript
// Xem có lỗi không
console.error();

// Xem counter
window.propellerAdsManager.getStats();
```

**Nếu counter = 2:**
- Đã đạt giới hạn maxPerSession
- Reset: `window.propellerAdsManager.resetCounter()`

### Tab mới không mở?

**Nguyên nhân:**
- Popup blocker đang bật
- Trình duyệt block popup

**Giải pháp:**
- Cho phép popup cho localhost
- Test trên trình duyệt khác
- Test trên production (không bị block)

## 📝 Checklist Trước Khi Deploy

✅ File `js/propellerads.js` tồn tại  
✅ Script được thêm vào các trang HTML  
✅ Direct Link ID đúng: 10647261  
✅ Test trên localhost (script load OK)  
✅ Console không có lỗi  
✅ Click event hoạt động  

Nếu tất cả OK → Sẵn sàng deploy! 🚀

## 🎯 Kết Luận

**Trên localhost:**
- Script sẽ load ✅
- Click event sẽ hoạt động ✅
- Tab mới sẽ mở ✅
- NHƯNG không có quảng cáo thật ❌

**Trên production:**
- Mọi thứ hoạt động ✅
- Quảng cáo thật sẽ hiển thị ✅
- Bắt đầu kiếm tiền ✅

**Bước tiếp theo:** Deploy lên GitHub Pages, Vercel, hoặc Netlify để test thật!
