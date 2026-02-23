# HƯỚNG DẪN ĐĂNG NHẬP ADMIN

## Vấn đề hiện tại
Bạn chưa đăng nhập admin nên không có token → Bị văng ra trang login.

## Giải pháp: Đăng nhập Admin

### Cách 1: Tạo Admin nhanh (Nếu chưa có)

**Chạy file:**
```
CREATE_ADMIN_QUICK.bat
```

Hoặc chạy lệnh:
```bash
cd backend
node scripts/createAdmin.js
```

**Thông tin admin mặc định:**
- Email: `admin@aphim.io.vn`
- Password: `admin123`
- Role: `admin`

### Cách 2: Đăng nhập

1. **Mở trang login:**
   ```
   http://localhost:3000/admin/login.html
   ```

2. **Nhập thông tin:**
   - Email: `admin@aphim.io.vn`
   - Password: `admin123`

3. **Click "Đăng nhập"**

4. **Kiểm tra token:**
   - Mở Console (F12)
   - Gõ: `localStorage.getItem('adminToken')`
   - Phải thấy một chuỗi token dài

### Cách 3: Kiểm tra đã đăng nhập chưa

Mở Console (F12) và chạy:

```javascript
const token = localStorage.getItem('adminToken');
if (token) {
    console.log('✓ Đã đăng nhập');
    console.log('Token:', token.substring(0, 50) + '...');
} else {
    console.log('✗ Chưa đăng nhập');
    console.log('Vui lòng đăng nhập tại: http://localhost:3000/admin/login.html');
}
```

## Sau khi đăng nhập

### Test lại API:
```
http://localhost:3000/admin/test-supporters.html
```
- Phải thấy: "✓ Token found"
- Click "Test API" → Phải thành công

### Vào trang Supporters:
```
http://localhost:3000/admin/supporters.html
```
- Không bị văng ra nữa
- Hiển thị trang quản lý ủng hộ

## Nếu vẫn lỗi

### 1. Token hết hạn
```javascript
// Xóa token cũ
localStorage.removeItem('adminToken');
// Đăng nhập lại
window.location.href = 'login.html';
```

### 2. Backend chưa chạy
```bash
cd backend
npm start
```

### 3. Tài khoản không phải admin

Kiểm tra trong MongoDB hoặc tạo lại admin:
```bash
cd backend
node scripts/createAdmin.js
```

## Checklist

- [ ] Backend đang chạy (port 5000)
- [ ] Đã tạo tài khoản admin
- [ ] Đã đăng nhập tại admin/login.html
- [ ] Token đã lưu trong localStorage
- [ ] Test API thành công
- [ ] Vào được trang supporters.html

## Lưu ý

**Lỗi MetaMask** (code 403, permission error):
- Đây là lỗi từ extension trình duyệt
- KHÔNG ảnh hưởng đến hệ thống
- Có thể bỏ qua hoàn toàn

**Lỗi quan trọng cần fix:**
- "No token found" ← Đây mới là vấn đề chính
- Giải pháp: Đăng nhập admin

## Video hướng dẫn (Các bước)

1. Chạy `CREATE_ADMIN_QUICK.bat`
2. Mở `http://localhost:3000/admin/login.html`
3. Đăng nhập với `admin@aphim.io.vn` / `admin123`
4. Mở `http://localhost:3000/admin/test-supporters.html`
5. Click "Test API" → Thành công
6. Mở `http://localhost:3000/admin/supporters.html`
7. Hoàn tất!

---

**Tóm tắt:** Bạn chỉ cần đăng nhập admin là xong!
