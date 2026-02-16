# 🎉 HƯỚNG DẪN SỬ DỤNG TRANG USERS MỚI

## ✅ ĐÃ HOÀN THÀNH

Tôi đã tạo trang users mới với:
- ✅ Giao diện đẹp (giống users.html cũ)
- ✅ Kết nối thật với MongoDB
- ✅ Không bị lỗi Tracking Prevention
- ✅ Hiển thị dữ liệu real-time
- ✅ Có thể block/unblock users
- ✅ Auto-refresh mỗi 30 giây

## 🚀 TRUY CẬP NGAY

### Trang mới (Khuyên dùng):
```
http://localhost:3000/admin/users-new.html
```

### So sánh:

| Tính năng | users.html (CŨ) | users-new.html (MỚI) |
|-----------|-----------------|----------------------|
| Giao diện | ✅ Đẹp | ✅ Đẹp (tương tự) |
| Kết nối MongoDB | ❌ Không | ✅ Có |
| Tracking Prevention | ❌ Bị lỗi | ✅ Không lỗi |
| Data thật | ❌ Demo | ✅ Real-time |
| Block/Unblock | ❌ Không hoạt động | ✅ Hoạt động |
| Auto-refresh | ❌ Không | ✅ 30 giây |

## 📋 CÁCH SỬ DỤNG

### Bước 1: Đăng nhập

Mở: http://localhost:3000/admin/login.html

- Email: `admin@cinestream.vn`
- Password: `admin123`

### Bước 2: Truy cập trang Users

Mở: http://localhost:3000/admin/users-new.html

Trang sẽ tự động:
1. Kiểm tra token
2. Load users từ MongoDB
3. Hiển thị 8 users thật

### Bước 3: Quản lý Users

**Tìm kiếm:**
- Gõ tên hoặc email vào ô search
- Kết quả tự động lọc

**Lọc:**
- Chọn gói: FREE, PREMIUM, FAMILY
- Chọn trạng thái: Hoạt động, Bị khóa

**Xem chi tiết:**
- Click icon mắt (👁️) để xem thông tin đầy đủ

**Khóa/Mở khóa:**
- Click icon khóa (🔒) để khóa user
- Click icon check (✓) để mở khóa

**Gửi thông báo:**
- Click icon chuông (🔔) để gửi thông báo

## 🎯 TÍNH NĂNG

### 1. Real-time Data
- Dữ liệu load trực tiếp từ MongoDB
- Auto-refresh mỗi 30 giây
- Cập nhật ngay sau mỗi thao tác

### 2. Smart Token Management
- Tự động lưu token vào sessionStorage
- Fallback sang localStorage nếu cần
- Không bị chặn bởi Tracking Prevention

### 3. Error Handling
- Hiển thị lỗi rõ ràng
- Tự động redirect về login nếu token hết hạn
- Có nút "Thử lại" khi lỗi

### 4. Responsive UI
- Giao diện đẹp, hiện đại
- Dark mode
- Smooth animations
- Loading states

## 📊 DỮ LIỆU HIỂN THỊ

Bạn sẽ thấy 8 users thật từ MongoDB:

```
┌─────────────────┬──────────────────────────┬─────────┬────────────┐
│ Tên             │ Email                    │ Plan    │ Status     │
├─────────────────┼──────────────────────────┼─────────┼────────────┤
│ Admin Master    │ admin@cinestream.vn      │ PREMIUM │ Active     │
│ Trần Anh        │ anhtran26042004@gmail... │ FREE    │ Active     │
│ demo2           │ anhtran2602004@gmail...  │ FREE    │ Active     │
│ Nguyễn Văn A    │ user1@example.com        │ FREE    │ Active     │
│ Trần Thị B      │ user2@example.com        │ PREMIUM │ Active     │
│ Lê Văn C        │ user3@example.com        │ PREMIUM │ Active     │
│ Phạm Thị D      │ user4@example.com        │ FREE    │ Active     │
│ Hoàng Văn E     │ user5@example.com        │ FAMILY  │ Active     │
└─────────────────┴──────────────────────────┴─────────┴────────────┘
```

## 🔧 FILES ĐÃ TẠO

1. **admin/users-new.html** - Trang users mới với giao diện đẹp
2. **js/admin/users-realtime.js** - Script kết nối MongoDB
3. **admin/users-old-backup.html** - Backup file cũ

## 🐛 TROUBLESHOOTING

### Vấn đề 1: "Vui lòng đăng nhập"

**Giải pháp:** Đăng nhập lại tại admin/login.html

### Vấn đề 2: "Lỗi kết nối MongoDB"

**Giải pháp:** 
```bash
# Kiểm tra backend
curl http://localhost:5000/health

# Nếu không chạy
cd backend
node server.js
```

### Vấn đề 3: Không thấy users

**Giải pháp:**
1. Mở Console (F12)
2. Xem log: "📡 Loading users from MongoDB..."
3. Nếu có lỗi, chụp màn hình gửi cho tôi

### Vấn đề 4: Token hết hạn

**Giải pháp:**
- Trang sẽ tự động redirect về login
- Đăng nhập lại là xong

## 📝 CONSOLE LOGS

Khi mở trang, bạn sẽ thấy logs:

```
🚀 Users page loaded - Real-time MongoDB mode
✅ Admin authenticated
✅ Token found in sessionStorage
📡 Loading users from MongoDB...
📊 API Response: {success: true, count: 8, data: [...]}
✅ Đã tải 8 người dùng từ MongoDB
```

Nếu có lỗi:
```
❌ Error loading users from MongoDB: ...
```

## 🎉 KẾT QUẢ

Sau khi mở trang, bạn sẽ thấy:

1. ✅ Sidebar với menu điều hướng
2. ✅ Header với tổng số users
3. ✅ Filters: Search, Plan, Status
4. ✅ Table với 8 users từ MongoDB
5. ✅ Pagination (nếu > 10 users)
6. ✅ Actions: View, Block, Notify

## 🔄 AUTO-REFRESH

Trang tự động refresh mỗi 30 giây:
- Không cần reload trang
- Dữ liệu luôn mới nhất
- Không làm gián đoạn công việc

## 🆘 HỖ TRỢ

Nếu cần hỗ trợ:
1. Chụp màn hình trang users-new.html
2. Chụp màn hình Console log (F12)
3. Chụp màn hình Network tab (F12)
4. Gửi cho tôi

---

**Tóm lại:** Dùng `admin/users-new.html` thay vì `admin/users.html` để có trải nghiệm tốt nhất!
