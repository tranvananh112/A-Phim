# Test Click Menu Ủng hộ

## Vấn đề
Đã đăng nhập vào dashboard nhưng click vào menu "Ủng hộ" bị văng ra login.

## Các bước test

### 1. Kiểm tra token trước khi click
Mở Console (F12) tại trang dashboard:
```javascript
console.log('Token:', localStorage.getItem('adminToken'));
```

Phải thấy token dài.

### 2. Click vào menu "Ủng hộ"
Xem Console có log gì không.

### 3. Nếu bị văng ra
Mở Console ngay lập tức và xem:
- Có log "Checking auth" không?
- Token còn không?

## Debug với tool

Mở: `http://localhost:3000/DEBUG_TOKEN.html`

1. Click "Check Token" - Phải thấy token
2. Click "Go to Supporters" - Xem có văng không
3. Nếu văng, quay lại và click "Check Token" - Token còn không?

## Nguyên nhân có thể

### 1. Token bị xóa khi chuyển trang
**Test:**
```javascript
// Tại dashboard
console.log('Before:', localStorage.getItem('adminToken'));
// Click vào Ủng hộ
// Tại supporters (nếu không văng)
console.log('After:', localStorage.getItem('adminToken'));
```

### 2. checkAuth() chạy quá nhanh
**Đã sửa:** Thêm delay 100ms

### 3. Token không hợp lệ
**Test:**
```javascript
const token = localStorage.getItem('adminToken');
fetch('http://localhost:5000/api/supporters/statistics', {
    headers: { 'Authorization': 'Bearer ' + token }
})
.then(r => console.log('Status:', r.status))
.catch(e => console.error('Error:', e));
```

## Giải pháp tạm thời

### Cách 1: Truy cập trực tiếp
Thay vì click menu, gõ trực tiếp:
```
http://localhost:3000/admin/supporters.html
```

### Cách 2: Mở tab mới
Right-click vào menu "Ủng hộ" → "Open in new tab"

### Cách 3: Đăng nhập lại
```javascript
localStorage.clear();
// Đăng nhập lại
```

## Kiểm tra cuối cùng

Nếu vẫn lỗi, chạy script này trong Console tại dashboard:

```javascript
// Save current token
const token = localStorage.getItem('adminToken');
console.log('Token before navigation:', token ? 'EXISTS' : 'MISSING');

// Navigate
window.location.href = 'supporters.html';

// Check in new page (run this in supporters page console)
setTimeout(() => {
    const tokenAfter = localStorage.getItem('adminToken');
    console.log('Token after navigation:', tokenAfter ? 'EXISTS' : 'MISSING');
    console.log('Same token?', token === tokenAfter);
}, 500);
```

## Nếu token bị mất

Có thể do:
1. Domain khác nhau (localhost vs 127.0.0.1)
2. Port khác nhau
3. HTTP vs HTTPS
4. localStorage bị clear

**Fix:** Đảm bảo luôn dùng cùng một URL:
- ✓ `http://localhost:3000/admin/dashboard.html`
- ✓ `http://localhost:3000/admin/supporters.html`
- ✗ `http://127.0.0.1:3000/...` (khác domain)

## Kết luận

Sau khi sửa (thêm delay 100ms), thử lại:
1. Đăng nhập vào dashboard
2. Mở Console
3. Click "Ủng hộ"
4. Xem log trong Console

Nếu vẫn lỗi, dùng DEBUG_TOKEN.html để kiểm tra chi tiết.
