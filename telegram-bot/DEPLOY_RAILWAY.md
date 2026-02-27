# 🚀 Deploy Telegram Bot lên Railway

## Bước 1: Push code lên GitHub

### 1.1. Tạo repository mới trên GitHub (nếu chưa có)

1. Vào https://github.com/new
2. Đặt tên repo: `aphim-telegram-bot`
3. Chọn **Private** (để bảo mật)
4. Nhấn **Create repository**

### 1.2. Push code lên GitHub

Mở terminal trong thư mục `telegram-bot`:

```bash
cd telegram-bot
git init
git add .
git commit -m "Initial commit: Aphim Telegram Bot"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aphim-telegram-bot.git
git push -u origin main
```

**Lưu ý:** Thay `YOUR_USERNAME` bằng username GitHub của bạn.

---

## Bước 2: Deploy lên Railway

### 2.1. Tạo project mới

1. Vào https://railway.app/dashboard
2. Nhấn **New Project**
3. Chọn **Deploy from GitHub repo**
4. Chọn repository `aphim-telegram-bot`
5. Nhấn **Deploy Now**

### 2.2. Thêm biến môi trường BOT_TOKEN

1. Trong Railway dashboard, chọn project vừa tạo
2. Vào tab **Variables**
3. Nhấn **New Variable**
4. Thêm:
   - **Key:** `BOT_TOKEN`
   - **Value:** `8715308625:AAHLCjkuU9NptJCzqMaw_Gs2Toagy-wMImk`
5. Nhấn **Add**

### 2.3. Kiểm tra deployment

1. Vào tab **Deployments**
2. Đợi build xong (màu xanh = thành công)
3. Vào tab **Logs** để xem bot có chạy không
4. Nếu thấy `🤖 Bot đang chạy...` là thành công!

---

## Bước 3: Test bot

1. Mở Telegram
2. Tìm bot của bạn
3. Gửi `/start`
4. Gõ tên phim: `Linh Miếu`
5. Bot sẽ reply link!

---

## Cách deploy nhanh (nếu đã có GitHub repo)

### Cách 1: Deploy từ Railway Dashboard

1. Vào https://railway.app/new
2. Chọn **Deploy from GitHub repo**
3. Chọn repo `aphim-telegram-bot`
4. Thêm biến `BOT_TOKEN` trong Variables
5. Xong!

### Cách 2: Deploy bằng Railway CLI

```bash
# Cài Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd telegram-bot
railway init
railway up
railway variables set BOT_TOKEN=8715308625:AAHLCjkuU9NptJCzqMaw_Gs2Toagy-wMImk
```

---

## Kiểm tra bot có chạy không

### Xem logs trên Railway:

1. Vào Railway dashboard
2. Chọn project bot
3. Vào tab **Logs**
4. Nếu thấy:
   ```
   🤖 Bot đang chạy...
   ```
   → Bot đã online!

### Test trong Telegram:

1. Gửi tin nhắn cho bot
2. Xem logs trên Railway có hiện:
   ```
   📩 Nhận tin nhắn: "Linh Miếu"
   🔄 Slug: linh-mieu
   ✅ Gửi link: https://aphim.io.vn/movie-detail.html?slug=linh-mieu
   ```

---

## Xử lý lỗi

### Lỗi: "Error: ETELEGRAM: 401 Unauthorized"

**Nguyên nhân:** BOT_TOKEN sai

**Giải pháp:**
1. Vào Railway → Variables
2. Kiểm tra lại BOT_TOKEN
3. Redeploy: Settings → Redeploy

### Lỗi: Bot không reply

**Nguyên nhân:** Privacy Mode chưa tắt

**Giải pháp:**
1. Gửi `/setprivacy` cho @BotFather
2. Chọn bot → Disable
3. Kick bot ra khỏi nhóm và thêm lại

### Lỗi: "Application failed to respond"

**Nguyên nhân:** Bot không phải web server, không cần port

**Giải pháp:** Bỏ qua lỗi này, bot vẫn chạy bình thường!

---

## Giám sát bot

### Xem thời gian đã dùng:

1. Vào Railway dashboard
2. Chọn project
3. Vào **Usage** → Xem số giờ đã dùng

### Tắt bot tạm thời:

1. Vào Railway dashboard
2. Chọn project
3. Settings → **Pause Deployment**

### Bật lại bot:

Settings → **Resume Deployment**

---

## Tóm tắt

1. ✅ Push code lên GitHub
2. ✅ Deploy từ Railway dashboard
3. ✅ Thêm biến `BOT_TOKEN`
4. ✅ Kiểm tra logs
5. ✅ Test bot trên Telegram

Bot sẽ chạy 24/7 trên Railway, không cần bật máy tính! 🎉
