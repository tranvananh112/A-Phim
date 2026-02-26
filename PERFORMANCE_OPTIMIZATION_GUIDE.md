# Hướng Dẫn Tối Ưu Hóa Tốc Độ Load Trang

## 🚀 Các Cải Thiện Đã Thực Hiện

### 1. **Skeleton Loading (Hiển Thị Ngay)**
- Thay vì chỉ hiển thị spinner, giờ hiển thị skeleton cards ngay lập tức
- Người dùng thấy layout ngay, không phải chờ
- CSS animation tạo hiệu ứng loading mượt mà

### 2. **Lazy Load Quảng Cáo**
- Quảng cáo không chặn render trang chính
- Load quảng cáo sau 2 giây (khi nội dung chính đã hiển thị)
- Giảm thời gian First Contentful Paint (FCP)

### 3. **Preload Tài Nguyên Quan Trọng**
```html
<link rel="preconnect" href="https://ophim1.com">
<link rel="dns-prefetch" href="https://img.ophim.live">
```
- Kết nối sớm đến API server
- DNS lookup nhanh hơn cho images

### 4. **Lazy Loading Images**
- Thêm `loading="lazy"` vào thẻ `<img>`
- Chỉ load ảnh khi gần vào viewport
- Giảm bandwidth ban đầu

### 5. **Performance Module**
- API caching: Cache kết quả API 5 phút
- Link prefetching: Prefetch links khi hover
- Instant navigation: Điều hướng nhanh hơn

### 6. **Page Optimization Module**
- Preload ảnh quan trọng (5 ảnh đầu)
- Defer non-critical CSS
- Optimize font loading với `display=swap`

## 📊 Kết Quả Dự Kiến

| Metric | Trước | Sau | Cải Thiện |
|--------|-------|-----|----------|
| First Contentful Paint (FCP) | ~2.5s | ~0.8s | 68% ⬇️ |
| Largest Contentful Paint (LCP) | ~4.5s | ~2.0s | 56% ⬇️ |
| Time to Interactive (TTI) | ~5.0s | ~2.5s | 50% ⬇️ |
| Cumulative Layout Shift (CLS) | 0.15 | 0.05 | 67% ⬇️ |

## 🔧 Cách Sử Dụng

### Trên Trang Phim Việt Nam
```javascript
// Tự động khởi động khi page load
document.addEventListener('DOMContentLoaded', () => {
    loadVietnameseMovies(1);  // Bắt đầu load data ngay
    loadAdsLazy();             // Load ads sau 2 giây
});
```

### Trên Các Trang Khác
1. Thêm CSS skeleton:
```html
<link rel="stylesheet" href="css/skeleton-loading.css">
```

2. Thêm script optimization:
```html
<script src="js/performance.js"></script>
<script src="js/page-optimization.js"></script>
```

3. Tạo skeleton HTML:
```html
<div id="skeletonGrid" class="grid grid-cols-5 gap-6">
    <div class="skeleton-card">
        <div class="skeleton-poster"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>
    </div>
    <!-- Repeat 10 times -->
</div>
```

## 💡 Best Practices

### 1. **Lazy Load Ads**
```javascript
function loadAdsLazy() {
    setTimeout(() => {
        // Load ad script here
    }, 2000); // Delay 2 seconds
}
```

### 2. **Preload Critical Resources**
```html
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="https://cdn.example.com">
<link rel="preload" as="image" href="/critical-image.jpg">
```

### 3. **Use Intersection Observer**
```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Load content when visible
        }
    });
});
```

### 4. **Cache API Responses**
```javascript
// Automatic caching in performance.js
const cached = performanceOptimizer.getFromCache(url);
if (cached) return cached; // Use cache
```

## 🎯 Metrics Để Theo Dõi

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s ✅
- **FID (First Input Delay)**: < 100ms ✅
- **CLS (Cumulative Layout Shift)**: < 0.1 ✅

### Performance Metrics
- **FCP (First Contentful Paint)**: < 1.8s
- **TTI (Time to Interactive)**: < 3.8s
- **Speed Index**: < 3.4s

## 📱 Mobile Optimization

### Network Throttling
- Simulate 4G: ~4Mbps download
- Test on real devices
- Monitor performance on slow networks

### Image Optimization
- Use WebP format with fallback
- Responsive images with srcset
- Compress images to < 100KB

## 🔍 Testing

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Run audit
4. Check Performance score

### Performance API
```javascript
// Measure performance
const timing = window.performance.timing;
const loadTime = timing.loadEventEnd - timing.navigationStart;
console.log(`Load time: ${loadTime}ms`);
```

## 🚨 Common Issues

### Issue: Skeleton không hiển thị
**Solution**: Kiểm tra CSS file được load đúng
```html
<link rel="stylesheet" href="css/skeleton-loading.css">
```

### Issue: Ads chặn render
**Solution**: Sử dụng lazy load
```javascript
setTimeout(() => {
    // Load ads after 2 seconds
}, 2000);
```

### Issue: Images load chậm
**Solution**: Thêm lazy loading
```html
<img src="..." loading="lazy">
```

## 📈 Monitoring

### Google Analytics
```javascript
gtag('event', 'page_load_time', {
    'value': loadTime,
    'event_category': 'performance'
});
```

### Custom Metrics
```javascript
// Send to your analytics
fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify({
        fcp: fcpTime,
        lcp: lcpTime,
        tti: ttiTime
    })
});
```

## 🎓 Tài Liệu Tham Khảo

- [Web Vitals](https://web.dev/vitals/)
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Image Optimization](https://web.dev/image-optimization/)

---

**Cập nhật lần cuối**: 26/02/2026
**Phiên bản**: 1.0
