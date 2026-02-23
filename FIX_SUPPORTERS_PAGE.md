# Sửa lỗi trang Admin Supporters bị văng ra Login

## Vấn đề
Khi truy cập `http://localhost:3000/admin/supporters.html` bị văng ra trang login.

## Nguyên nhân có thể
1. Chưa đăng nhập admin
2. Token hết hạn
3. Backend chưa chạy
4. Middleware auth thiếu hàm `adminOnly`

## Giải pháp

### Bước 1: Đảm bảo Backend đang chạy

```bash
cd backend
npm start
```

Kiểm tra: `http://localhost:5000/health`

### Bước 2: Đăng nhập Admin

1. Vào: `http://localhost:3000/admin/login.html`
2. Đăng nhập với tài khoản admin
3. Kiểm tra token đã lưu:
   - Mở Console (F12)
   - Gõ: `localStorage.getItem('adminToken')`
   - Phải thấy một chuỗi token dài

### Bước 3: Test API

Vào: `http://localhost:3000/admin/test-supporters.html`
- Xem có token không
- Click "Test API"
- Xem kết quả

### Bước 4: Kiểm tra Console

Mở Console (F12) khi vào trang supporters.html và xem:
- Có log "Checking auth, token exists: true" không?
- Có lỗi API nào không?
- Response status là gì?

### Bước 5: Nếu vẫn lỗi

Chạy trong Console:

```javascript
// Clear và login lại
localStorage.clear();
window.location.href = 'login.html';
```

## Lỗi MetaMask (Không quan trọng)

Lỗi này từ extension trình duyệt, không ảnh hưởng:
```
Uncaught (in promise) Object code: 403
permission error
```

Bạn có thể:
- Bỏ qua (không ảnh hưởng hệ thống)
- Tắt extension MetaMask tạm thời
- Dùng chế độ Incognito

## Kiểm tra Backend Middleware

File: `backend/middleware/auth.js` phải có:

```javascript
exports.adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Chỉ admin mới có quyền truy cập'
        });
    }
    next();
};
```

Nếu thiếu → Đã được thêm vào rồi, restart backend:
```bash
# Ctrl+C để dừng
npm start
```

## Test thủ công API

Trong Console:

```javascript
const token = localStorage.getItem('adminToken');
console.log('Token:', token ? 'Exists' : 'Missing');

// Test statistics
fetch('http://localhost:5000/api/supporters/statistics', {
    headers: { 'Authorization': 'Bearer ' + token }
})
.then(r => {
    console.log('Status:', r.status);
    return r.json();
})
.then(d => console.log('Data:', d))
.catch(e => console.error('Error:', e));
```

## Kết quả mong đợi

Nếu thành công:
- Status: 200
- Data: `{ success: true, statistics: {...} }`

Nếu lỗi 401:
- Token không hợp lệ → Đăng nhập lại

Nếu lỗi 403:
- Không phải admin → Dùng tài khoản admin

Nếu lỗi 500:
- Backend lỗi → Xem log backend

## Tạo Admin nếu chưa có

```bash
cd backend
node scripts/createAdmin.js
```

Nhập thông tin admin mới.

## Checklist

- [ ] Backend đang chạy (port 5000)
- [ ] Frontend đang chạy (port 3000)
- [ ] Đã đăng nhập admin
- [ ] Token tồn tại trong localStorage
- [ ] API test thành công
- [ ] Middleware adminOnly đã có
- [ ] MongoDB đã kết nối

Nếu tất cả đều OK → Trang supporters.html sẽ hoạt động!
