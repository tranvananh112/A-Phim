# 🚀 Hướng Dẫn Tích Hợp PropellerAds

## Tại Sao Chọn PropellerAds?

✅ Approve nhanh (1-2 ngày)
✅ CPM cao: $3-5 (VN)
✅ Rút tiền từ $5 (thấp hơn PopAds)
✅ Nhiều loại quảng cáo
✅ Thanh toán đúng hạn
✅ Support tốt

---

## Bước 1: Đăng Ký

1. Vào: https://propellerads.com
2. Click "Sign Up" → Chọn "Publisher"
3. Điền thông tin:
   - Email: [email của bạn]
   - Password: [mật khẩu mạnh]
   - Country: Vietnam
   - Payment method: PayPal hoặc Payoneer

4. Xác nhận email

---

## Bước 2: Thêm Website

1. Vào Dashboard → "Websites" → "Add Website"
2. Điền thông tin:
   ```
   Website URL: https://aphim.io.vn
   Category: Entertainment / Movies
   Traffic: 1,200 visitors/day
   Traffic sources: Organic, Social Media
   ```

3. Chọn loại quảng cáo:
   - ✅ Onclick Popunder (giống PopAds)
   - ✅ Banner Ads (thêm thu nhập)
   - ✅ Native Ads (không phiền user)
   - ⬜ Push Notifications (tùy chọn)

4. Submit và chờ approve (1-2 ngày)

---

## Bước 3: Lấy Mã Quảng Cáo

Sau khi approve, vào "Websites" → "Get Code"

### 1. Onclick Popunder Code:
```html
<script>
(function(d,z,s){
s.src='//'+d+'/400/'+z;
try{(document.body||document.documentElement).appendChild(s)}catch(e){}
})('domain.com', 'ZONE_ID', document.createElement('script'))
</script>
```

### 2. Banner Code (728x90):
```html
<script type="text/javascript">
atOptions = {
    'key' : 'YOUR_KEY',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
};
document.write('<scr' + 'ipt type="text/javascript" src="//domain.com/YOUR_KEY/invoke.js"></scr' + 'ipt>');
</script>
```

### 3. Banner Code (300x250):
```html
<script type="text/javascript">
atOptions = {
    'key' : 'YOUR_KEY',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
};
document.write('<scr' + 'ipt type="text/javascript" src="//domain.com/YOUR_KEY/invoke.js"></scr' + 'ipt>');
</script>
```

---

## Bước 4: Tích Hợp Vào Website

### File cần tạo: `js/propellerads.js`

```javascript
// PropellerAds Integration
(function () {
    'use strict';

    const CONFIG = {
        enabled: true,
        popunderZoneId: 'YOUR_ZONE_ID', // Thay bằng zone ID của bạn
        domain: 'YOUR_DOMAIN.com', // Thay bằng domain từ PropellerAds
        excludePages: ['/login.html', '/register.html', '/payment.html']
    };

    function shouldLoadAds() {
        const currentPath = window.location.pathname;
        for (let excludePath of CONFIG.excludePages) {
            if (currentPath.includes(excludePath)) {
                return false;
            }
        }
        return true;
    }

    function loadPopunder() {
        if (!CONFIG.enabled || !shouldLoadAds()) return;

        (function(d,z,s){
            s.src='//'+d+'/400/'+z;
            try{(document.body||document.documentElement).appendChild(s)}catch(e){}
        })(CONFIG.domain, CONFIG.popunderZoneId, document.createElement('script'));

        console.log('[PropellerAds] Popunder loaded');
    }

    // Load khi DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadPopunder);
    } else {
        loadPopunder();
    }

})();
```

### Thêm vào các trang:

**index.html, watch.html, movie-detail.html, categories.html, search.html:**

```html
<!-- PropellerAds Integration -->
<script src="js/propellerads.js"></script>
```

---

## Bước 5: Thêm Banner Ads

### Vị trí đề xuất:

**1. Trang chủ (index.html):**

Thêm banner 728x90 dưới navigation:
```html
<!-- PropellerAds Banner 728x90 -->
<div class="container mx-auto px-6 py-4">
    <div class="flex justify-center">
        <script type="text/javascript">
        atOptions = {
            'key' : 'YOUR_KEY_728x90',
            'format' : 'iframe',
            'height' : 90,
            'width' : 728,
            'params' : {}
        };
        document.write('<scr' + 'ipt type="text/javascript" src="//YOUR_DOMAIN.com/YOUR_KEY/invoke.js"></scr' + 'ipt>');
        </script>
    </div>
</div>
```

**2. Trang xem phim (watch.html):**

Thêm banner 300x250 bên cạnh video:
```html
<!-- PropellerAds Banner 300x250 -->
<div class="mt-6">
    <script type="text/javascript">
    atOptions = {
        'key' : 'YOUR_KEY_300x250',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
    };
    document.write('<scr' + 'ipt type="text/javascript" src="//YOUR_DOMAIN.com/YOUR_KEY/invoke.js"></scr' + 'ipt>');
    </script>
</div>
```

---

## Bước 6: Theo Dõi Doanh Thu

1. Vào Dashboard → "Statistics"
2. Xem:
   - Impressions (số lần hiển thị)
   - Revenue (doanh thu)
   - CPM (giá mỗi 1000 impressions)
   - Fill Rate (tỷ lệ lấp đầy)

3. Tối ưu:
   - Nếu CPM thấp → Liên hệ support
   - Nếu Fill Rate thấp → Thêm nhiều zone
   - Nếu Revenue thấp → Thêm banner

---

## Dự Toán Doanh Thu

### Với 1,200 visitors/ngày:

**Popunder:**
```
1,200 visitors × 1 pop = 1,200 impressions
CPM $4 → $4.8/ngày = $144/tháng
```

**Banner 728x90 (trang chủ):**
```
1,200 visitors × 3 pageviews = 3,600 impressions
CPM $2 → $7.2/ngày = $216/tháng
```

**Banner 300x250 (trang xem phim):**
```
800 visitors × 2 pageviews = 1,600 impressions
CPM $3 → $4.8/ngày = $144/tháng
```

**TỔNG: $16.8/ngày = $504/tháng**

---

## So Sánh PopAds vs PropellerAds

| Chỉ số | PopAds | PropellerAds |
|--------|--------|--------------|
| CPM | $2-3 | $3-5 |
| Rút tiền | $10 | $5 |
| Approve | 2-3 ngày | 1-2 ngày |
| Loại QC | Popunder | Pop + Banner + Native |
| Support | Email | Live Chat + Email |
| Thanh toán | NET 30 | NET 30 |

**Kết luận:** PropellerAds TỐT HƠN PopAds!

---

## Lưu Ý Quan Trọng

1. **Không dùng cùng lúc 2 Popunder:**
   - Nếu dùng PopAds → Tắt PropellerAds Popunder
   - Hoặc ngược lại
   - Có thể dùng PopAds Popunder + PropellerAds Banner

2. **Vị trí banner:**
   - Đặt ở vị trí dễ thấy nhưng không phiền user
   - Không đặt quá nhiều (tối đa 3 banner/trang)

3. **Test trước khi deploy:**
   - Test trên localhost
   - Kiểm tra xem banner có hiển thị không
   - Kiểm tra xem có ảnh hưởng đến UI không

---

## Hỗ Trợ

Nếu cần giúp tích hợp, gửi cho tôi:
1. Zone ID từ PropellerAds
2. Domain từ PropellerAds
3. Mã banner (nếu có)

Tôi sẽ tích hợp ngay vào website!

---

## Checklist

- [ ] Đăng ký PropellerAds
- [ ] Thêm website
- [ ] Chờ approve
- [ ] Lấy mã Popunder
- [ ] Lấy mã Banner
- [ ] Tạo file js/propellerads.js
- [ ] Tích hợp vào các trang
- [ ] Test
- [ ] Deploy
- [ ] Theo dõi doanh thu

**Thời gian hoàn thành:** 2-3 ngày (bao gồm thời gian approve)
**Doanh thu dự kiến:** $15-20/ngày = $450-600/tháng
