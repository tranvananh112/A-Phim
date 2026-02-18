# ✅ ĐÃ SỬA XONG LỖI CORS CHO ADMIN PANEL

## 🎯 Vấn Đề Đã Khắc Phục

Khi truy cập https://aphim.ddns.net/admin/login.html, gặp lỗi CORS:

```
Access to fetch at 'http://localhost:5000/api/auth/login' from origin 'https://aphim.ddns.net' 
has been blocked by CORS policy
```

## ❌ Nguyên Nhân

Các file admin đang hardcode `http://localhost:5000` thay vì tự động detect môi trường.

## ✅ Giải Pháp Đã Áp Dụng

Đã cập nhật tất cả file admin để tự động detect môi trường:

### Files đã sửa:

1. **admin/login.html** - Trang đăng nhập admin
2. **admin/users-mongodb.html** - Quản lý users
3. **admin/test-api.html** - Test API
4. **admin/test-connection.html** - Test connection
5. **js/admin/users.js** - Users management script
6. **js/admin/users-realtime.js** - Realtime users script
7. **js/admin/dashboard.js** - Dashboard script
8. **js/admin/realtime.js** - Realtime sync script

### Code mới:

```javascript
// Auto-detect environment
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://a-phim-production.up.railway.app/api';
```

## 🚀 Cách Test

### Bước 1: Xóa Cache

Mở https://aphim.ddns.net/admin/login.html, nhấn F12, chạy:

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Bước 2: Đăng Nhập Admin

- Email: `admin@cinestream.vn`
- Password: `admin123`

### Bước 3: Kiểm Tra Console

Không còn lỗi CORS, thay vào đó sẽ thấy:

```
✅ Fetching: https://a-phim-production.up.railway.app/api/auth/login
✅ Login successful
```

## 📊 Môi Trường

| Môi trường | API URL |
|------------|---------|
| Local | http://localhost:5000/api |
| Production | https://a-phim-production.up.railway.app/api |

## 🔍 Kiểm Tra Backend Railway

Test backend health:
```
https://a-phim-production.up.railway.app/health
```

Kết quả mong đợi:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-..."
}
```

## 📝 Lưu Ý

- Code đã được push lên Git
- Hosting sẽ tự động deploy (nếu dùng auto-deploy)
- Nếu dùng DDNS thủ công, cần pull code mới về server
- Backend Railway phải đang chạy
- MongoDB Atlas phải có dữ liệu (chạy `IMPORT_DATA.bat`)

## 🆘 Nếu Vẫn Gặp Lỗi

1. **Kiểm tra Railway backend:**
   ```
   https://a-phim-production.up.railway.app/health
   ```

2. **Kiểm tra MongoDB Atlas:**
   - Vào MongoDB Atlas Dashboard
   - Xem collection "users" có dữ liệu chưa

3. **Import dữ liệu:**
   ```bash
   IMPORT_DATA.bat
   ```

4. **Clear cache:**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

## ✅ Checklist

- [x] Sửa hardcoded localhost URLs
- [x] Auto-detect environment
- [x] Test admin login
- [x] Test admin dashboard
- [x] Commit & push code
- [ ] Clear cache trên production
- [ ] Test đăng nhập admin
- [ ] Verify không còn lỗi CORS

## 📞 Tài Khoản Admin

**Email:** admin@cinestream.vn  
**Password:** admin123

**Lưu ý:** Tài khoản này chỉ tồn tại sau khi chạy `IMPORT_DATA.bat`
