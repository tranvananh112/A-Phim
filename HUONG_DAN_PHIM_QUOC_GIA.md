# 🌍 Hướng Dẫn Xem Phim Theo Quốc Gia

## 📋 Tổng Quan

Hệ thống đã được mở rộng để hỗ trợ xem phim từ **32+ quốc gia** khác nhau thông qua API Ophim.

## 🎬 Các Trang Đã Tạo

### 1. **phim-theo-quoc-gia.html** - Trang Chính
- Giao diện chọn quốc gia với các nút bấm đẹp mắt
- Hỗ trợ 12+ quốc gia phổ biến nhất
- Phân trang tự động
- Responsive design

**Quốc gia được hỗ trợ:**
- 🇻🇳 Việt Nam
- 🇰🇷 Hàn Quốc
- 🇨🇳 Trung Quốc
- 🇯🇵 Nhật Bản
- 🇹🇭 Thái Lan
- 🇺🇸 Âu Mỹ
- 🇭🇰 Hồng Kông
- 🇹🇼 Đài Loan
- 🇮🇳 Ấn Độ
- 🇬🇧 Anh
- 🇫🇷 Pháp
- 🇨🇦 Canada

### 2. **phim-viet-nam.html** - Trang Riêng Việt Nam
- Trang chuyên biệt cho phim Việt Nam
- Đã tồn tại từ trước
- Có thể giữ lại hoặc redirect sang trang mới

### 3. **test-countries-api.html** - Test API
- Test nhanh API của từng quốc gia
- Hiển thị số lượng phim, trang
- Xem preview 12 phim đầu tiên

### 4. **test-all-countries.html** - Thống Kê Toàn Bộ
- Test tất cả 32 quốc gia cùng lúc
- Thống kê tổng hợp
- Top 10 quốc gia nhiều phim nhất
- Export kết quả ra JSON

## 🔧 File JS Hỗ Trợ

### **js/countries.js**
```javascript
// Danh sách 32 quốc gia với slug và flag
const COUNTRIES = [
    { slug: 'viet-nam', name: 'Việt Nam', flag: '🇻🇳' },
    { slug: 'han-quoc', name: 'Hàn Quốc', flag: '🇰🇷' },
    // ... 30 quốc gia khác
];
```

## 📊 API Endpoint

```
https://ophim1.com/v1/api/quoc-gia/{country-slug}?page={page}
```

**Ví dụ:**
- Việt Nam: `https://ophim1.com/v1/api/quoc-gia/viet-nam?page=1`
- Hàn Quốc: `https://ophim1.com/v1/api/quoc-gia/han-quoc?page=1`
- Nhật Bản: `https://ophim1.com/v1/api/quoc-gia/nhat-ban?page=1`

## 🚀 Cách Sử Dụng

### Xem Phim Theo Quốc Gia
1. Mở `phim-theo-quoc-gia.html`
2. Click vào quốc gia muốn xem
3. Duyệt qua các trang phim

### Test API
1. Mở `test-countries-api.html`
2. Click vào quốc gia để test
3. Xem thông tin và preview phim

### Thống Kê Toàn Bộ
1. Mở `test-all-countries.html`
2. Click "Test Tất Cả Quốc Gia"
3. Đợi kết quả (khoảng 30 giây)
4. Xem thống kê và top 10

## 📈 Dữ Liệu Mẫu (Ước Tính)

| Quốc Gia | Số Phim | Trang |
|----------|---------|-------|
| 🇻🇳 Việt Nam | ~400+ | 18 |
| 🇰🇷 Hàn Quốc | ~2000+ | 80+ |
| 🇨🇳 Trung Quốc | ~3000+ | 120+ |
| 🇯🇵 Nhật Bản | ~1500+ | 60+ |
| 🇺🇸 Âu Mỹ | ~5000+ | 200+ |
| 🇹🇭 Thái Lan | ~800+ | 35+ |

## 🎨 Tính Năng

### Trang Phim Theo Quốc Gia
- ✅ Chọn quốc gia dễ dàng
- ✅ Skeleton loading
- ✅ Phân trang thông minh
- ✅ Hiển thị số lượng phim
- ✅ Responsive mobile
- ✅ Hover effects đẹp mắt
- ✅ Active state cho quốc gia đang chọn

### Trang Test
- ✅ Test từng quốc gia
- ✅ Test tất cả cùng lúc
- ✅ Thống kê chi tiết
- ✅ Export JSON
- ✅ Top 10 ranking

## 🔗 Tích Hợp Vào Navigation

Để thêm vào menu chính, cập nhật dropdown "Phim":

```html
<div class="relative group">
    <button class="nav-item">Phim</button>
    <div class="dropdown">
        <a href="phim-viet-nam.html">🇻🇳 Phim Việt Nam</a>
        <a href="phim-theo-quoc-gia.html">🌍 Phim Theo Quốc Gia</a>
    </div>
</div>
```

## 📱 Responsive Design

Tất cả các trang đều responsive:
- Mobile: 2 cột
- Tablet: 3 cột
- Desktop: 5 cột

## 🎯 Các Bước Tiếp Theo

1. **Test API**: Chạy `test-all-countries.html` để xem quốc gia nào có nhiều phim
2. **Cập nhật Navigation**: Thêm link vào menu chính
3. **Tối ưu**: Thêm cache cho danh sách phim
4. **SEO**: Thêm meta tags cho từng quốc gia
5. **Analytics**: Track quốc gia nào được xem nhiều nhất

## 🐛 Troubleshooting

### API không trả về dữ liệu
- Kiểm tra slug quốc gia có đúng không
- Thử với page=1 trước
- Xem console log để debug

### Không có phim
- Một số quốc gia ít phim hơn
- Thử quốc gia khác như Hàn Quốc, Trung Quốc

### Lỗi CORS
- API Ophim hỗ trợ CORS
- Nếu lỗi, thử dùng proxy

## 📞 Support

Nếu cần thêm quốc gia hoặc tính năng:
1. Thêm vào `js/countries.js`
2. Cập nhật `phim-theo-quoc-gia.html`
3. Test với `test-countries-api.html`

---

**Tạo bởi:** Kiro AI Assistant
**Ngày:** 2026-03-03
**Version:** 1.0
