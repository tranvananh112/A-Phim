# 🎯 HƯỚNG DẪN SỬA LỖI ADMIN USERS PAGE

## ✅ Backend đã hoạt động tốt!

Test vừa xong cho thấy:
- ✅ Backend API chạy tốt trên port 5000
- ✅ MongoDB có 8 users (bao gồm admin và 7 users thật)
- ✅ API `/api/users` trả về dữ liệu đúng

## ❌ Vấn đề: Trang admin/users.html hiển thị demo data

**Nguyên nhân:** Chưa đăng nhập đúng cách hoặc token không hợp lệ

## 🔧 GIẢI PHÁP - THỰC HIỆN THEO THỨ TỰ

### Bước 1: Xóa token cũ và đăng nhập lại

1. Mở trình duyệt và vào: http://localhost:3000/admin/login.html

2. Mở DevTools (F12) → Tab Console

3. Chạy lệnh để xóa token cũ:
```javascript
localStorage.removeItem('admin_token');
localStorage.removeItem('admin_user');
console.log('Đã xóa token cũ');
```

4. Đăng nhập với:
   - Email: `admin@cinestream.vn`
   - Password: `admin123`

5. Sau khi đăng nhập thành công, kiểm tra token:
```javascript
console.log('Token:', localStorage.getItem('admin_token'));
```

### Bước 2: Test kết nối trước

Mở trang test: http://localhost:3000/admin/test-connection.html

1. Click "Check Token" → Phải thấy token
2. Click "Get All Users" → Phải thấy 8 users từ MongoDB

Nếu thấy lỗi "401 Unauthorized" → Quay lại Bước 1

### Bước 3: Truy cập Users Page

Mở: http://localhost:3000/admin/users.html

**Kiểm tra Console Log:**
- Phải thấy: "Loading users from MongoDB..."
- Phải thấy: "Đã tải 8 người dùng từ database"

**Kiểm tra Network Tab:**
- Request đến: `http://localhost:5000/api/users`
- Status: 200 OK
- Response: Có 8 users

**Nếu vẫn thấy demo data:**
1. Hard refresh: Ctrl + Shift + R
2. Hoặc clear cache: Ctrl + Shift + Delete

### Bước 4: Xác nhận dữ liệu thật

Trên trang users.html, bạn phải thấy:

**8 users thật từ MongoDB:**
1. Admin Master (admin@cinestream.vn) - PREMIUM
2. Trần Anh (anhtran26042004@gmail.com) - FREE
3. demo2 (anhtran2602004@gmail.com) - FREE
4. Nguyễn Văn A (user1@example.com) - FREE
5. Trần Thị B (user2@example.com) - PREMIUM
6. Lê Văn C (user3@example.com) - PREMIUM
7. Phạm Thị D (user4@example.com) - FREE
8. Hoàng Văn E (user5@example.com) - FAMILY

**KHÔNG phải demo data như:**
- Nguyễn Văn An
- Trần Thị Bình
- Lê Hoàng Cường
- ...

## 🐛 TROUBLESHOOTING

### Vấn đề 1: Vẫn thấy demo data sau khi đăng nhập

**Giải pháp:**

1. Mở Console và chạy:
```javascript
// Force reload users from API
localStorage.removeItem('cinestream_all_users');
location.reload();
```

2. Hoặc sửa trực tiếp trong file `js/admin/users.js`:

Tìm dòng:
```javascript
if (!silent) {
    showToast(`Lỗi kết nối database: ${error.message}. Đang dùng dữ liệu demo...`, 'error');
}
```

Thêm log để debug:
```javascript
console.error('Full error:', error);
console.log('Token:', localStorage.getItem('admin_token'));
console.log('API URL:', `${API_URL}/users`);
```

### Vấn đề 2: Lỗi "Failed to fetch"

**Nguyên nhân:** Backend không chạy hoặc CORS issue

**Giải pháp:**

1. Kiểm tra backend:
```bash
curl http://localhost:5000/health
```

2. Xem backend logs trong terminal
3. Restart backend nếu cần

### Vấn đề 3: Lỗi 401 Unauthorized

**Nguyên nhân:** Token không hợp lệ

**Giải pháp:**

1. Xóa token và đăng nhập lại:
```javascript
localStorage.clear();
location.href = '/admin/login.html';
```

2. Đăng nhập lại với admin@cinestream.vn / admin123

### Vấn đề 4: Token có nhưng vẫn không load được

**Nguyên nhân:** Token format không đúng

**Giải pháp:**

Kiểm tra token trong Console:
```javascript
const token = localStorage.getItem('admin_token');
console.log('Token length:', token.length);
console.log('Token starts with:', token.substring(0, 20));

// Token phải bắt đầu với: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

Nếu token không đúng format JWT → Đăng nhập lại

## 📊 KIỂM TRA CUỐI CÙNG

Sau khi hoàn thành, bạn phải thấy:

1. ✅ Trang users.html hiển thị 8 users (không phải 12 demo users)
2. ✅ Có email thật: admin@cinestream.vn, anhtran26042004@gmail.com, ...
3. ✅ Có thể click vào user để xem chi tiết
4. ✅ Có thể khóa/mở khóa user
5. ✅ Console log: "Đã tải 8 người dùng từ database"
6. ✅ Network tab: Request đến /api/users trả về 200 OK

## 🎯 TEST NHANH

Chạy lệnh này trong Console của trang users.html:

```javascript
// Kiểm tra xem đang dùng data gì
console.log('Total users:', allUsers.length);
console.log('First user:', allUsers[0]);
console.log('Is demo?', allUsers[0].email.includes('example.com') && allUsers[0].name === 'Nguyễn Văn An');

// Nếu is demo = true → Vẫn đang dùng demo data
// Nếu is demo = false → Đã dùng MongoDB data ✅
```

## 📝 LƯU Ý

- Lỗi MetaMask có thể bỏ qua - không ảnh hưởng chức năng
- Auto-refresh mỗi 30 giây để cập nhật data mới
- Nếu vẫn không được, restart tất cả servers và thử lại

## 🆘 NẾU VẪN KHÔNG ĐƯỢC

1. Chụp màn hình Console log
2. Chụp màn hình Network tab
3. Gửi cho tôi để debug tiếp

---

**Token mẫu đã test thành công:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OTFiYTcyMGY4YWNjN2Y0NDQ5YTZkMiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MTIyNDAyNywiZXhwIjoxNzcxODI4ODI3fQ.USncN6-sS00qrb8JTG_DpTxCfsoxTxE6Gy0qz2FVQEA
```

Bạn có thể dùng token này để test bằng cách:
```javascript
localStorage.setItem('admin_token', 'TOKEN_Ở_TRÊN');
location.reload();
```
