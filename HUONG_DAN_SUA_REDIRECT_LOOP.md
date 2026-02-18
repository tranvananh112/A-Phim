# ✅ ĐÃ SỬA XONG LỖI REDIRECT LOOP

## 🎯 Vấn Đề Đã Khắc Phục

Khi truy cập https://aphim.ddns.net/login.html, trang tự động nhảy về index.html liên tục.

## ✅ Giải Pháp Đã Áp Dụng

Đã xóa đoạn code tự động redirect trong `js/login.js`:

```javascript
// ❌ CODE CŨ (Gây lỗi)
if (authService.isLoggedIn()) {
    window.location.href = 'index.html';
    return;
}

// ✅ CODE MỚI (Đã sửa)
// Allow users to access login page even if logged in
// They can logout manually if needed
```

## 🚀 Các Bước Tiếp Theo

### Bước 1: Import Dữ Liệu Vào MongoDB Atlas

Chạy lệnh sau để tạo tài khoản test:

```bash
IMPORT_DATA.bat
```

Hoặc:

```bash
cd backend
node scripts/importSeedData.js
```

### Bước 2: Xóa Cache Trình Duyệt

Mở Console (F12) trên trang https://aphim.ddns.net và chạy:

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Bước 3: Test Đăng Nhập

Truy cập: https://aphim.ddns.net/login.html

Đăng nhập với:
- Email: `admin@cinestream.vn`
- Password: `admin123`

## 📝 Lưu Ý

- Code đã được push lên Git
- Vercel/Netlify sẽ tự động deploy (nếu bạn dùng)
- Nếu dùng DDNS thủ công, cần pull code mới về server

## 🔍 Kiểm Tra

1. ✅ Truy cập login.html không bị redirect loop
2. ✅ Có thể nhập email/password
3. ✅ Đăng nhập thành công chuyển về index.html
4. ✅ Người dùng đã đăng nhập vẫn có thể vào login.html (để logout hoặc đổi tài khoản)

## 🆘 Nếu Vẫn Gặp Lỗi

Kiểm tra:
1. Backend Railway có chạy không: https://a-phim-production.up.railway.app/health
2. MongoDB Atlas có dữ liệu chưa (chạy import script)
3. Console có lỗi gì không (F12)
4. Clear cache đã chưa

## 📞 Tài Khoản Test

**Admin:**
- Email: admin@cinestream.vn
- Password: admin123

**User:**
- Email: user1@example.com
- Password: 123456
