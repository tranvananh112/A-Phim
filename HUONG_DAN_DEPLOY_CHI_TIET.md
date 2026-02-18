# HƯỚNG DẪN DEPLOY BACKEND CHI TIẾT

## PHẦN 1: SETUP MONGODB ATLAS (Database Cloud - MIỄN PHÍ)

### Bước 1.1: Tạo tài khoản MongoDB Atlas

1. Truy cập: https://www.mongodb.com/cloud/atlas/register
2. Đăng ký bằng Google hoặc Email
3. Chọn "Build a Database" (Tạo database)

### Bước 1.2: Tạo Cluster (Free Tier)

1. Chọn **M0 FREE** (512MB storage - miễn phí mãi mãi)
2. Chọn Provider: **AWS** 
3. Chọn Region: **Singapore** (gần Việt Nam nhất)
4. Cluster Name: `CineStream` (hoặc tên bạn thích)
5. Click **Create**

⏱️ Đợi 3-5 phút để cluster được tạo...

### Bước 1.3: Tạo Database User

1. Bên trái, click **Database Access**
2. Click **Add New Database User**
3. Authentication Method: **Password**
4. Username: `cinestream_admin` (ghi nhớ)
5. Password: Click **Autogenerate Secure Password** → **Copy** (GHI NHỚ MẬT KHẨU NÀY!)
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

### Bước 1.4: Cho phép truy cập từ mọi nơi

1. Bên trái, click **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
4. Click **Confirm**

### Bước 1.5: Lấy Connection String

1. Quay lại **Database** (bên trái)
2. Click nút **Connect** trên cluster của bạn
3. Chọn **Drivers**
4. Copy connection string, sẽ có dạng:
   ```
   mongodb+srv://cinestream_admin:<password>@cinestream.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **QUAN TRỌNG**: Thay `<password>` bằng mật khẩu bạn đã copy ở bước 1.3
6. Thêm `/cinestream` sau `.net` để chỉ định database name:
   ```
   mongodb+srv://cinestream_admin:YOUR_PASSWORD@cinestream.xxxxx.mongodb.net/cinestream?retryWrites=true&w=majority
   ```

✅ **LƯU LẠI CONNECTION STRING NÀY!** Bạn sẽ cần nó ở bước tiếp theo.

---

## PHẦN 2: DEPLOY BACKEND LÊN RAILWAY (MIỄN PHÍ)

### Bước 2.1: Tạo tài khoản Railway

1. Truy cập: https://railway.app
2. Click **Login** → **Login with GitHub**
3. Authorize Railway truy cập GitHub của bạn

### Bước 2.2: Tạo Project mới

1. Click **New Project**
2. Chọn **Deploy from GitHub repo**
3. Chọn repository: **tranvananh112/A-Phim**
4. Railway sẽ tự động detect và bắt đầu build

⚠️ **LƯU Ý**: Build lần đầu sẽ FAIL - đừng lo, chúng ta sẽ fix!

### Bước 2.3: Cấu hình Root Directory

Vì backend nằm trong folder `backend/`:

1. Click vào service vừa tạo
2. Click tab **Settings**
3. Tìm **Root Directory**
4. Nhập: `backend`
5. Click **Save**

### Bước 2.4: Thêm Environment Variables

1. Click tab **Variables**
2. Click **New Variable** và thêm từng biến sau:

```
NODE_ENV = production
PORT = 5000
MONGO_URI = mongodb+srv://cinestream_admin:YOUR_PASSWORD@cinestream.xxxxx.mongodb.net/cinestream?retryWrites=true&w=majority
JWT_SECRET = cinestream-super-secret-jwt-key-2024-change-this-to-something-very-random-and-long
JWT_EXPIRE = 7d
CORS_ORIGIN = https://aphim.ddns.net
```

**QUAN TRỌNG**: 
- Thay `MONGO_URI` bằng connection string từ MongoDB Atlas (Bước 1.5)
- Thay `JWT_SECRET` bằng chuỗi ngẫu nhiên dài (có thể dùng: https://randomkeygen.com/)

3. Click **Deploy** để deploy lại

### Bước 2.5: Lấy URL Backend

1. Đợi deploy xong (khoảng 2-3 phút)
2. Click tab **Settings**
3. Tìm **Domains**
4. Click **Generate Domain**
5. Railway sẽ tạo URL dạng: `https://a-phim-production.up.railway.app`

✅ **LƯU LẠI URL NÀY!** Bạn sẽ cần nó ở bước tiếp theo.

### Bước 2.6: Test Backend

Mở trình duyệt, truy cập:
```
https://YOUR-RAILWAY-URL.up.railway.app/health
```

Nếu thấy:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-..."
}
```

→ **THÀNH CÔNG!** Backend đã chạy!

---

## PHẦN 3: IMPORT DỮ LIỆU MẪU VÀO MONGODB ATLAS

### Bước 3.1: Cập nhật .env local

Tạo file `backend/.env` (nếu chưa có):

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://cinestream_admin:YOUR_PASSWORD@cinestream.xxxxx.mongodb.net/cinestream?retryWrites=true&w=majority
JWT_SECRET=local-dev-secret
JWT_EXPIRE=7d
```

### Bước 3.2: Import seed data

Mở terminal trong VS Code:

```bash
cd backend
node scripts/importSeedData.js
```

Bạn sẽ thấy:
```
📥 Importing seed data to MongoDB...
✅ Imported: admin@cinestream.vn (Admin Master)
✅ Imported: user1@example.com (Người dùng 1)
...
```

---

## PHẦN 4: CẬP NHẬT FRONTEND CONFIG

### Bước 4.1: Cập nhật js/config.js

Mở file `js/config.js` và sửa:

```javascript
BACKEND_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://YOUR-RAILWAY-URL.up.railway.app/api', // Thay YOUR-RAILWAY-URL

// ...

USE_BACKEND_FOR_AUTH: true, // Đổi thành true
```

**QUAN TRỌNG**: Thay `YOUR-RAILWAY-URL` bằng URL Railway từ Bước 2.5

### Bước 4.2: Commit và Push

```bash
git add .
git commit -m "Update backend URL for production"
git push origin main
```

### Bước 4.3: Đợi GitHub Pages deploy

Đợi 2-3 phút để GitHub Pages cập nhật.

---

## PHẦN 5: TEST PRODUCTION

### Bước 5.1: Test đăng ký

1. Truy cập: https://aphim.ddns.net/register.html
2. Đăng ký tài khoản mới
3. Nếu thành công → Chuyển về trang chủ

### Bước 5.2: Test đăng nhập

1. Truy cập: https://aphim.ddns.net/login.html
2. Đăng nhập bằng:
   - Email: `admin@cinestream.vn`
   - Password: `admin123`
3. Nếu thành công → Thấy tên user ở góc phải

### Bước 5.3: Test Admin Dashboard

1. Truy cập: https://aphim.ddns.net/admin/dashboard.html
2. Đăng nhập admin (nếu chưa)
3. Click **Quản lý Người dùng**
4. Bạn sẽ thấy danh sách users realtime từ MongoDB!

---

## TROUBLESHOOTING (Xử lý lỗi)

### Lỗi: CORS Error

**Nguyên nhân**: Backend chưa cho phép frontend truy cập

**Giải pháp**:
1. Vào Railway → Variables
2. Kiểm tra `CORS_ORIGIN` có đúng `https://aphim.ddns.net` không
3. Redeploy backend

### Lỗi: Failed to fetch

**Nguyên nhân**: Backend URL sai hoặc backend chưa chạy

**Giải pháp**:
1. Kiểm tra Railway backend có đang chạy không
2. Test URL: `https://YOUR-URL.up.railway.app/health`
3. Kiểm tra `js/config.js` có đúng URL không

### Lỗi: MongoServerError

**Nguyên nhân**: Connection string sai hoặc IP chưa được whitelist

**Giải pháp**:
1. Kiểm tra MongoDB Atlas → Network Access → 0.0.0.0/0 đã được thêm chưa
2. Kiểm tra MONGO_URI có đúng password không
3. Kiểm tra có `/cinestream` sau `.net` không

---

## HOÀN TẤT! 🎉

Bây giờ hệ thống của bạn đã:
- ✅ Backend chạy trên Railway (miễn phí)
- ✅ Database trên MongoDB Atlas (miễn phí)
- ✅ Frontend trên GitHub Pages (miễn phí)
- ✅ Dữ liệu realtime, admin có thể quản lý users
- ✅ Đăng nhập/đăng ký hoạt động trên production

**Chi phí**: $0 (100% miễn phí!)

**Giới hạn**:
- Railway: 500 giờ/tháng, $5 credit
- MongoDB Atlas: 512MB storage
- GitHub Pages: 100GB bandwidth/tháng

Nếu cần thêm tài nguyên, có thể nâng cấp sau!
