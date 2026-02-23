# SỬA LỖI 404 - Route not found

## Vấn đề
```
GET http://localhost:5000/api/supporters/statistics 404 (Not Found)
GET http://localhost:5000/api/supporters 404 (Not Found)
```

## Nguyên nhân
Backend đã có route `/api/supporters` trong code NHƯNG **chưa được restart** nên route chưa load.

## Giải pháp - RESTART BACKEND

### Cách 1: Dùng file BAT
```
RESTART_BACKEND.bat
```

### Cách 2: Thủ công

**Bước 1: Dừng backend hiện tại**
- Vào terminal đang chạy backend
- Nhấn `Ctrl + C`
- Chọn `Y` để terminate

**Bước 2: Start lại**
```bash
cd backend
npm start
```

### Cách 3: Dùng START_BACKEND.bat
```
START_BACKEND.bat
```

## Kiểm tra Backend đã chạy

Mở trình duyệt:
```
http://localhost:5000/health
```

Phải thấy:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "..."
}
```

## Kiểm tra Route Supporters

Mở Console và chạy:
```javascript
fetch('http://localhost:5000/api/supporters/recent')
  .then(r => r.json())
  .then(d => console.log('Supporters API:', d))
  .catch(e => console.error('Error:', e));
```

Nếu thành công, sẽ thấy:
```json
{
  "success": true,
  "supporters": []
}
```

## Sau khi restart

1. **Reload trang supporters:**
   ```
   http://localhost:3000/admin/supporters.html
   ```
   Nhấn Ctrl+F5

2. **Kiểm tra Console:**
   - Không còn lỗi 404
   - Thấy "Chưa có dữ liệu" (bình thường vì chưa có supporter nào)

3. **Thêm supporter đầu tiên:**
   - Click "Thêm người ủng hộ"
   - Nhập thông tin
   - Click "Lưu"
   - Phải thành công!

## Nếu vẫn lỗi 404

### 1. Kiểm tra backend có chạy không
```bash
# Xem process
tasklist | findstr node

# Hoặc kiểm tra port 5000
netstat -ano | findstr :5000
```

### 2. Kiểm tra file routes/supporters.js tồn tại
```
backend/routes/supporters.js
```

### 3. Kiểm tra server.js đã include route
Mở `backend/server.js`, tìm dòng:
```javascript
app.use('/api/supporters', require('./routes/supporters'));
```

Phải có dòng này!

### 4. Kiểm tra log backend
Xem terminal backend có lỗi gì không.

## Checklist

- [ ] Backend đang chạy (port 5000)
- [ ] File `backend/routes/supporters.js` tồn tại
- [ ] File `backend/controllers/supporterController.js` tồn tại
- [ ] File `backend/models/Supporter.js` tồn tại
- [ ] `server.js` đã include route supporters
- [ ] Đã restart backend
- [ ] Test `/health` thành công
- [ ] Test `/api/supporters/recent` thành công
- [ ] Trang admin/supporters.html load được

## Tóm tắt

**Vấn đề:** Backend chưa restart sau khi thêm route mới
**Giải pháp:** Restart backend (Ctrl+C rồi npm start)
**Kết quả:** Route `/api/supporters` hoạt động, trang admin có thể thêm/sửa/xóa supporters

---

**LƯU Ý:** Mỗi khi thêm route mới hoặc sửa code backend, PHẢI restart backend!
