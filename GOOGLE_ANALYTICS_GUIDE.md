# Hướng Dẫn Google Analytics - APHIM.IO.VN

## Tracking ID
- **Google Analytics ID**: `G-QYK5R13WK2`
- **Trang web**: https://aphim.io.vn

## Các Event Được Theo Dõi

### 1. Navigation Tracking (Theo dõi điều hướng)
Tất cả các click vào menu navigation đều được theo dõi:

**Event Name**: `navigation_click`
- **event_category**: Navigation
- **event_label**: Tên menu item (Trang chủ, Phim, Thể Loại, Khám phá, Gói cước, Nuôi APhim)
- **destination_url**: URL đích
- **page_location**: URL hiện tại

**Ví dụ sử dụng**:
```javascript
trackNavigation('Nuôi APhim', 'support.html');
```

### 2. Page View Tracking (Theo dõi lượt xem trang)
**Event Name**: `page_view`
- **page_title**: Tiêu đề trang
- **page_category**: Danh mục trang
- **page_location**: URL đầy đủ
- **page_path**: Đường dẫn trang

### 3. Movie View Tracking (Theo dõi xem phim)
**Event Name**: `view_movie`
- **event_category**: Movie
- **event_label**: Tên phim
- **movie_slug**: Slug của phim

**Ví dụ sử dụng**:
```javascript
trackMovieView('linh-mieu', 'Linh Miêu');
```

### 4. Search Tracking (Theo dõi tìm kiếm)
**Event Name**: `search`
- **search_term**: Từ khóa tìm kiếm
- **results_count**: Số kết quả

**Ví dụ sử dụng**:
```javascript
trackSearch('phim hành động', 25);
```

### 5. Support Click Tracking (Theo dõi click ủng hộ)
**Event Name**: `support_click`
- **event_category**: Support
- **event_label**: Loại ủng hộ
- **page_location**: URL hiện tại

**Ví dụ sử dụng**:
```javascript
trackSupportClick('navigation_menu');
trackSupportClick('momo_payment');
trackSupportClick('bank_transfer');
```

### 6. Pricing Plan Selection (Theo dõi chọn gói cước)
**Event Name**: `select_plan`
- **event_category**: Pricing
- **event_label**: Tên gói (Miễn Phí, Cao Cấp, Gia Đình)
- **value**: Giá gói

**Ví dụ sử dụng**:
```javascript
trackPricingPlan('Cao Cấp', 69000);
```

### 7. User Actions (Hành động người dùng)
**Event Name**: Tùy chỉnh
- **event_category**: Danh mục
- **event_label**: Nhãn
- **value**: Giá trị

**Các action được theo dõi**:
- `mobile_menu_toggle`: Mở/đóng menu mobile
- `dropdown_open`: Mở dropdown menu
- `pricing_page_click`: Click vào trang gói cước
- `login_click`: Click nút đăng nhập
- `search_click`: Click icon tìm kiếm

### 8. Scroll Depth (Độ sâu cuộn trang)
**Event Name**: `scroll_depth`
- **event_category**: Engagement
- **event_label**: Phần trăm cuộn (25%, 50%, 75%, 100%)
- **value**: Giá trị phần trăm

### 9. Time on Page (Thời gian trên trang)
**Event Name**: `time_on_page`
- **event_category**: Engagement
- **event_label**: Tiêu đề trang
- **value**: Thời gian (giây)

## Cách Xem Dữ Liệu Trong Google Analytics

### 1. Truy cập Google Analytics
- Đăng nhập: https://analytics.google.com/
- Chọn property: APHIM.IO.VN (G-QYK5R13WK2)

### 2. Xem Real-time Events
- Vào **Reports** → **Realtime** → **Event count by Event name**
- Xem các event đang diễn ra trực tiếp

### 3. Xem Navigation Clicks
- Vào **Reports** → **Engagement** → **Events**
- Tìm event: `navigation_click`
- Xem chi tiết: event_label để biết menu nào được click nhiều nhất

### 4. Xem Support Clicks
- Vào **Reports** → **Engagement** → **Events**
- Tìm event: `support_click`
- Phân tích: Bao nhiêu người click vào "Nuôi APhim"

### 5. Xem Movie Views
- Vào **Reports** → **Engagement** → **Events**
- Tìm event: `view_movie`
- Xem phim nào được xem nhiều nhất

### 6. Xem Search Queries
- Vào **Reports** → **Engagement** → **Events**
- Tìm event: `search`
- Xem từ khóa tìm kiếm phổ biến

### 7. Tạo Custom Reports

#### Report 1: Navigation Performance
1. Vào **Explore** → **Create new exploration**
2. Thêm dimension: `Event name`, `Event label`
3. Thêm metric: `Event count`
4. Filter: `Event name = navigation_click`

#### Report 2: Support Funnel
1. Vào **Explore** → **Funnel exploration**
2. Bước 1: Page view (pricing.html)
3. Bước 2: navigation_click (Nuôi APhim)
4. Bước 3: support_click
5. Xem conversion rate

#### Report 3: User Engagement
1. Vào **Explore** → **Free form**
2. Dimensions: `Page path`, `Event name`
3. Metrics: `Event count`, `Average engagement time`
4. Segment: Active users

## Custom Dimensions & Metrics (Tùy chỉnh)

### Để tạo Custom Dimensions:
1. Vào **Admin** → **Data display** → **Custom definitions**
2. Click **Create custom dimension**
3. Thêm các dimension:
   - `movie_slug`: Scope = Event
   - `destination_url`: Scope = Event
   - `support_type`: Scope = Event

## Alerts & Notifications (Cảnh báo)

### Tạo Alert cho Support Clicks:
1. Vào **Admin** → **Custom alerts**
2. Tạo alert mới:
   - Name: "Support Click Alert"
   - Condition: `support_click` > 10 per day
   - Send email notification

### Tạo Alert cho Traffic Drop:
1. Condition: Daily users < 100
2. Send notification khi traffic giảm đột ngột

## Best Practices

1. **Kiểm tra tracking thường xuyên**: Vào Realtime để đảm bảo events đang hoạt động
2. **Phân tích hàng tuần**: Xem báo cáo navigation và support clicks
3. **A/B Testing**: Test vị trí menu "Nuôi APhim" để tối ưu conversion
4. **User Journey**: Phân tích đường đi của user từ trang chủ → pricing → support
5. **Mobile vs Desktop**: So sánh behavior giữa mobile và desktop users

## Troubleshooting

### Nếu events không hiển thị:
1. Kiểm tra console browser: `console.log(gtag)`
2. Đảm bảo `analytics.js` được load trước các script khác
3. Kiểm tra ad blocker có chặn Google Analytics không
4. Xem DebugView trong GA4: Admin → DebugView

### Test Events:
```javascript
// Mở console và chạy:
trackNavigation('Test Menu', 'test.html');
trackSupportClick('test_click');
```

## Liên Hệ
- Email: support@aphim.io.vn
- Website: https://aphim.io.vn
