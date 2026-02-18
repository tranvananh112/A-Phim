# 🔍 Kiểm Tra Token Admin

## Vấn Đề

Đăng nhập thành công nhưng bị redirect loop khi vào dashboard.

## Nguyên Nhân

Có 2 hệ thống auth đang conflict:

1. **Backend API Auth** (login.html) - Lưu token từ Railway backend
2. **Local Auth** (dashboard.html) - Check token local

## Cách Kiểm Tra

### Bước 1: Mở Console (F12) trên trang login

Sau khi đăng nhập thành công, chạy:

```javascript
// Kiểm tra token nào được lưu
console.log('All localStorage keys:');
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(key + ':', localStorage.getItem(key));
}
```

### Bước 2: Kiểm tra token cụ thể

```javascript
console.log('cinestream_admin_token:', localStorage.getItem('cinestream_admin_token'));
console.log('admin_token:', localStorage.getItem('admin_token'));
```

## Giải Pháp Tạm Thời

Chạy lệnh này sau khi đăng nhập thành công:

```javascript
// Copy token từ backend sang local storage key
const backendToken = localStorage.getItem('cinestream_admin_token');
if (backendToken) {
    console.log('✅ Token found, redirecting to dashboard...');
    window.location.href = '/admin/dashboard.html';
} else {
    console.log('❌ No token found');
}
```

## Giải Pháp Lâu Dài

Cần thống nhất 1 hệ thống auth:

**Option 1: Dùng Backend API Auth (Khuyến nghị)**
- Dashboard cũng check token từ backend
- Gọi API để verify token
- An toàn hơn

**Option 2: Dùng Local Auth**
- Login.html không gọi backend
- Chỉ check username/password local
- Đơn giản nhưng kém bảo mật

## Lệnh Clear Cache

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## Test Thủ Công

1. Vào: https://aphim.ddns.net/admin/login.html
2. Mở Console (F12)
3. Đăng nhập với: admin@cinestream.vn / admin123
4. Chạy lệnh kiểm tra token ở trên
5. Nếu có token, chạy redirect thủ công
