# Hướng dẫn Deploy A Phim lên Vercel

## 🚀 Bước 1: Khởi tạo Git và Push lên GitHub

Mở terminal trong thư mục dự án và chạy các lệnh sau:

```bash
# Khởi tạo git repository
git init

# Thêm remote repository
git remote add origin git@github.com:tranvananh112/A-Phim.git

# Thêm tất cả file vào staging
git add .

# Commit với message
git commit -m "Initial commit - A Phim website with modern UI"

# Đẩy code lên GitHub (branch main)
git push -u origin main
```

**Lưu ý:** Nếu branch mặc định là `master`, dùng:
```bash
git branch -M main
git push -u origin main
```

## 🌐 Bước 2: Deploy lên Vercel

### Cách 1: Deploy qua Vercel Dashboard (Khuyến nghị)

1. Truy cập https://vercel.com
2. Đăng nhập bằng GitHub account
3. Click "Add New Project"
4. Import repository `tranvananh112/A-Phim`
5. Vercel sẽ tự động detect cấu hình
6. Click "Deploy"

### Cách 2: Deploy qua Vercel CLI

```bash
# Cài đặt Vercel CLI
npm install -g vercel

# Login vào Vercel
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

## ⚙️ Bước 3: Cấu hình Environment Variables (Nếu cần Backend)

Nếu bạn muốn sử dụng tính năng đăng nhập/user, cần setup:

1. Vào Vercel Dashboard → Project Settings → Environment Variables
2. Thêm các biến sau:

```
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-secret-key-here
PORT=3000
NODE_ENV=production
```

## 📋 Checklist sau khi Deploy

✅ Kiểm tra trang chủ: `https://your-domain.vercel.app`
✅ Kiểm tra navigation: Trang chủ, Thể loại, Khám phá
✅ Kiểm tra tìm kiếm phim
✅ Kiểm tra xem phim (video player)
✅ Kiểm tra responsive trên mobile

## 🔧 Troubleshooting

### Lỗi: "Failed to load resource"
- Kiểm tra CORS của API Ophim
- Thử clear cache và reload

### Lỗi: "Cannot find module"
- Chạy `npm install` trong folder backend
- Commit lại package.json và package-lock.json

### Video không play
- Kiểm tra HLS.js đã load chưa
- Kiểm tra URL video từ API

## 📱 Custom Domain (Tùy chọn)

1. Vào Vercel Dashboard → Project Settings → Domains
2. Thêm domain của bạn
3. Cấu hình DNS theo hướng dẫn của Vercel

## 🎉 Hoàn thành!

Website của bạn đã sẵn sàng tại: `https://your-domain.vercel.app`

---

**Lưu ý quan trọng:**
- Frontend (HTML/CSS/JS) sẽ hoạt động 100%
- Backend cần MongoDB để chạy đầy đủ tính năng
- API Ophim được gọi trực tiếp từ client, không cần backend
