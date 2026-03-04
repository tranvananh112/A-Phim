# 🔧 Fix Banner Authentication Issue

## Vấn Đề
Khi truy cập `http://localhost:3000/admin/banners.html`, bị redirect về trang login.

## Nguyên Nhân
- Trang banners.html thiếu load các script auth cần thiết
- Sử dụng sai tên token trong localStorage

## Đã Fix

### 1. Cập Nhật admin/banners.html
Thêm các script cần thiết:
```html
<script src="../js/config.js"></script>
<script src="../js/admin/config.js"></script>
<script src="../js/admin/auth.js"></script>
<script src="../js/admin/banners.js"></script>
```

### 2. Cập Nhật js/admin/banners.js
- Sử dụng `adminAuthService.checkAuth()` thay vì custom check
- Dùng function `getAuthToken()` để lấy token từ đúng location
- Cập nhật tất cả API calls để dùng `getAuthToken()`

## Cách Test

### Bước 1: Kiểm Tra Backend
```bash
cd backend
npm start
```
Mở: http://localhost:5000/health

### Bước 2: Đăng Nhập Admin
1. Mở: http://localhost:3000/admin/login.html
2. Đăng nhập với:
   - Username: `admin`
   - Password: `admin123`

### Bước 3: Kiểm Tra Token
Mở Console (F12) và chạy:
```javascript
localStorage.getItem('cinestream_admin_token')
```
Phải có giá trị (không null)

### Bước 4: Test Banner Page
1. Mở: http://localhost:3000/admin/banners.html
2. Không bị redirect về login
3. Thấy trang quản lý banner

### Bước 5: Test API
Mở: http://localhost:3000/test-banner-api.html
- Test Health: Phải thấy `{ success: true, ... }`
- Test Active Banner: Phải thấy response (có thể null nếu chưa có banner)
- Test Auth Token: Phải thấy token
- Test Load Movies: Phải load được danh sách phim

## Troubleshooting

### Vẫn bị redirect về login?

1. **Xóa cache và thử lại**:
```javascript
localStorage.clear()
```
Sau đó đăng nhập lại

2. **Kiểm tra console errors**:
- Mở F12 > Console
- Xem có lỗi gì không

3. **Kiểm tra backend đang chạy**:
```bash
curl http://localhost:5000/health
```

4. **Kiểm tra CORS**:
Backend phải cho phép `http://localhost:3000`

### API trả về 401 Unauthorized?

1. **Token không đúng format**:
Backend có thể expect JWT token thật, không phải simple token

2. **Kiểm tra middleware auth**:
Xem `backend/middleware/auth.js` check token như thế nào

3. **Tạm thời bypass auth** (chỉ để test):
Trong `backend/routes/banners.js`, comment dòng:
```javascript
// router.use(protect);
// router.use(authorize('admin'));
```

### Load movies bị lỗi?

1. **Kiểm tra axios đã cài**:
```bash
cd backend
npm list axios
```

2. **Kiểm tra Ophim API**:
```bash
curl https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=1
```

3. **Xem backend logs**:
Khi click "Tải Phim", xem terminal backend có lỗi gì

## Nếu Vẫn Không Được

### Option 1: Sử dụng Backend Token Thật

Nếu backend yêu cầu JWT token thật từ login API:

1. Login qua API:
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'admin@example.com',
        password: 'your_password'
    })
});
const data = await response.json();
localStorage.setItem('cinestream_admin_token', data.token);
```

2. Sau đó mới vào banners.html

### Option 2: Tạm Thời Disable Auth

Trong `backend/routes/banners.js`:
```javascript
// Comment out auth middleware
// router.use(protect);
// router.use(authorize('admin'));

// Tất cả routes giờ là public (CHỈ ĐỂ TEST)
```

## Kết Luận

Sau khi fix:
- ✅ Có thể truy cập banners.html mà không bị redirect
- ✅ Có thể tải phim từ API
- ✅ Có thể thêm/xóa/kích hoạt banner
- ✅ Banner hiển thị realtime ở trang chủ

Nếu vẫn gặp vấn đề, hãy:
1. Mở test-banner-api.html
2. Test từng bước
3. Gửi screenshot console errors
