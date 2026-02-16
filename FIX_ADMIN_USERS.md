# 🔧 SỬA LỖI ADMIN USERS PAGE

## ❌ Vấn đề hiện tại:
- Trang `admin/users.html` hiển thị dữ liệu demo
- Không kết nối được với MongoDB
- Lỗi MetaMask (không quan trọng - có thể bỏ qua)

## ✅ GIẢI PHÁP

### Bước 1: Test kết nối API

Mở trang test: http://localhost:3000/admin/test-connection.html

1. Click "Check Token" - Xem có token không
2. Click "Login as Admin" - Đăng nhập và lấy token mới
3. Click "Get All Users" - Lấy danh sách users từ MongoDB
4. Click "Get User Stats" - Xem thống kê

Nếu tất cả đều OK → Chuyển sang Bước 2

### Bước 2: Đăng nhập lại Admin

1. Mở: http://localhost:3000/admin/login.html
2. Đăng nhập với:
   - Email: `admin@cinestream.vn`
   - Password: `admin123`
3. Sau khi đăng nhập thành công, token sẽ được lưu vào localStorage

### Bước 3: Truy cập Users Page

Mở: http://localhost:3000/admin/users.html

Trang sẽ tự động:
1. Kiểm tra token
2. Gọi API `/api/users`
3. Hiển thị dữ liệu từ MongoDB

## 🔍 DEBUG

### Kiểm tra Console Log

Mở DevTools (F12) → Tab Console

Xem các log:
- "Loading users from MongoDB..."
- "Đã tải X người dùng từ database"

Nếu có lỗi:
- "Error loading users from MongoDB: ..."
- "Lỗi kết nối database: ..."

### Kiểm tra Network Tab

Mở DevTools (F12) → Tab Network

Xem request đến `/api/users`:
- Status: 200 OK ✅
- Status: 401 Unauthorized ❌ (Cần login lại)
- Status: 500 Error ❌ (Lỗi server)

### Kiểm tra Token

Mở DevTools (F12) → Tab Application → Local Storage

Tìm key: `admin_token`
- Có giá trị → OK ✅
- Null/undefined → Cần login lại ❌

## 🐛 CÁC LỖI THƯỜNG GẶP

### Lỗi 1: "Vui lòng đăng nhập để truy cập"

**Nguyên nhân:** Token không hợp lệ hoặc hết hạn

**Giải pháp:**
1. Xóa token cũ: `localStorage.removeItem('admin_token')`
2. Đăng nhập lại tại: http://localhost:3000/admin/login.html

### Lỗi 2: "Failed to fetch"

**Nguyên nhân:** Backend không chạy

**Giải pháp:**
```bash
# Kiểm tra backend
curl http://localhost:5000/health

# Nếu không chạy, start lại
cd backend
node server.js
```

### Lỗi 3: "Đang dùng dữ liệu demo..."

**Nguyên nhân:** Không kết nối được MongoDB hoặc API

**Giải pháp:**
1. Kiểm tra MongoDB đang chạy:
```bash
tasklist | findstr "mongod"
```

2. Kiểm tra backend logs:
- Xem terminal backend
- Tìm dòng "MongoDB Connected"

3. Test API trực tiếp:
```bash
# Get token first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@cinestream.vn\",\"password\":\"admin123\"}"

# Use token to get users
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Lỗi 4: MetaMask extension not found

**Nguyên nhân:** Extension MetaMask trong trình duyệt đang cố kết nối

**Giải pháp:** Bỏ qua lỗi này - không ảnh hưởng đến chức năng admin

## 📊 DATA HIỆN CÓ

Trong MongoDB database `cinestream`:

### Users:
1. admin@cinestream.vn (Admin, PREMIUM)
2. user1@example.com (User, FREE)
3. user2@example.com (User, PREMIUM)
4. user3@example.com (User, PREMIUM)
5. user4@example.com (User, FREE)
6. user5@example.com (User, FAMILY)

Tất cả password: `123456` (trừ admin: `admin123`)

## 🎯 KIỂM TRA CUỐI CÙNG

Sau khi sửa xong, kiểm tra:

1. ✅ Trang users.html hiển thị 6 users (không phải demo)
2. ✅ Có thể click vào user để xem chi tiết
3. ✅ Có thể khóa/mở khóa user
4. ✅ Số liệu thống kê đúng
5. ✅ Không có lỗi trong console (trừ MetaMask)

## 📝 GHI CHÚ

- File `js/admin/users.js` đã được cấu hình để kết nối MongoDB
- Nếu không kết nối được, sẽ tự động fallback sang demo data
- Auto-refresh mỗi 30 giây để cập nhật data mới

## 🆘 NẾU VẪN KHÔNG ĐƯỢC

1. Restart tất cả servers:
```bash
# Stop all
Ctrl+C trong mỗi terminal

# Start lại
START_ALL.bat
```

2. Clear browser cache và localStorage:
```javascript
// Trong Console
localStorage.clear();
location.reload();
```

3. Đăng nhập lại từ đầu

---

**Cần hỗ trợ thêm?** Mở file test: http://localhost:3000/admin/test-connection.html
