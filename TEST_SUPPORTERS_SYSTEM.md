# Test Hệ thống Ủng hộ

## Bước 1: Kiểm tra Backend đang chạy

Mở terminal và chạy:
```bash
cd backend
npm start
```

Hoặc kiểm tra bằng cách truy cập:
```
http://localhost:5000/health
```

Nếu thấy response JSON là backend đang chạy.

## Bước 2: Kiểm tra Admin đã đăng nhập chưa

1. Mở: `http://localhost:3000/admin/test-supporters.html`
2. Xem có token không
3. Nếu không có token → Click "Go to Login" và đăng nhập

## Bước 3: Test API

Sau khi đăng nhập:
1. Quay lại: `http://localhost:3000/admin/test-supporters.html`
2. Click "Test API"
3. Xem kết quả trong phần "Test Results"

## Bước 4: Vào trang Supporters

Nếu test API thành công:
1. Vào: `http://localhost:3000/admin/supporters.html`
2. Nếu vẫn bị văng ra → Mở Console (F12) và xem lỗi

## Debug Console Commands

Mở Console (F12) và chạy:

```javascript
// Kiểm tra token
console.log('Token:', localStorage.getItem('adminToken'));

// Kiểm tra API URL
console.log('API URL:', API_BASE_URL);

// Test API trực tiếp
fetch('http://localhost:5000/api/supporters/statistics', {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
    }
})
.then(r => r.json())
.then(d => console.log('API Response:', d))
.catch(e => console.error('API Error:', e));
```

## Các lỗi thường gặp

### 1. Lỗi: "No admin token found"
**Nguyên nhân:** Chưa đăng nhập
**Giải pháp:** Đăng nhập tại `http://localhost:3000/admin/login.html`

### 2. Lỗi: "401 Unauthorized"
**Nguyên nhân:** Token hết hạn hoặc không hợp lệ
**Giải pháp:** 
```javascript
localStorage.removeItem('adminToken');
// Sau đó đăng nhập lại
```

### 3. Lỗi: "403 Forbidden"
**Nguyên nhân:** Tài khoản không phải admin
**Giải pháp:** Đảm bảo đăng nhập bằng tài khoản admin

### 4. Lỗi: "Failed to fetch" hoặc "Network Error"
**Nguyên nhân:** Backend không chạy
**Giải pháp:** 
```bash
cd backend
npm start
```

### 5. Lỗi: "Cannot read property of undefined"
**Nguyên nhân:** Collection `supporters` chưa tồn tại trong MongoDB
**Giải pháp:** Đây là bình thường, collection sẽ tự tạo khi thêm supporter đầu tiên

## Tạo Supporter đầu tiên

Nếu vào được trang admin/supporters.html:
1. Click "Thêm người ủng hộ"
2. Nhập:
   - Tên: Test User
   - Số tiền: 50000
   - Trạng thái: Đã xác nhận
3. Click "Lưu"

## Kiểm tra MongoDB

Nếu dùng MongoDB Compass:
1. Kết nối đến: `mongodb+srv://cinestream_admin:vuRCrKzzCl26xzIV@cluster0.cc4bua2.mongodb.net/cinestream`
2. Xem database `cinestream`
3. Xem collection `supporters`

## Lỗi MetaMask/Extension

Lỗi này không ảnh hưởng đến hệ thống:
```
Uncaught (in promise) Object code: 403
```

Đây là do extension MetaMask hoặc extension khác đang chạy. Bạn có thể:
- Tắt extension tạm thời
- Hoặc bỏ qua (không ảnh hưởng)

## Kiểm tra cuối cùng

Nếu mọi thứ hoạt động:
1. ✓ Backend chạy tại port 5000
2. ✓ Frontend chạy tại port 3000
3. ✓ Admin đã đăng nhập
4. ✓ Token hợp lệ
5. ✓ API trả về dữ liệu
6. ✓ Trang supporters.html hiển thị

→ Hệ thống hoạt động bình thường!
