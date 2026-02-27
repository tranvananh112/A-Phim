# 📝 Tóm tắt Telegram Bot

## ✅ Tính năng đã hoàn thành

1. **Chuyển tên phim thành slug** - Bỏ dấu tiếng Việt, chuyển thành URL-friendly
2. **Tìm kiếm thông minh** - Gọi API search ophim1.com để tìm phim
3. **Xử lý phim trùng tên** - Nếu tìm thấy >1 kết quả, hiển thị danh sách cho user chọn
4. **Lấy ảnh poster** - Từ API ophim1.com (dùng thumb_url)
5. **Gửi ảnh + button** - Button "👉 Xem phim tại đây" dẫn đến aphim.io.vn
6. **Chào mừng thành viên mới** - Tự động chào và hướng dẫn khi có người vào nhóm
7. **Xử lý lỗi** - Nếu không có ảnh hoặc API lỗi, vẫn gửi button

## 🎯 Logic hoạt động

### Trường hợp 1: Tìm thấy nhiều phim (>1)
```
User gõ: "Mai"
→ Bot tìm thấy 24 kết quả
→ Hiển thị 5 phim đầu tiên với button:
   • Mai (2024)
   • Mai Mai Miracle (2009)
   • Mai (2019)
   • Tam Độ Mai: Hoa Mai Lạc (1993)
   • Tôi Là Diệp Chi Mai (2025)
→ User click chọn phim muốn xem
```

### Trường hợp 2: Chỉ có 1 kết quả
```
User gõ: "Linh Miếu"
→ Bot tìm thấy 1 kết quả
→ Gửi ảnh poster + button "👉 Xem phim tại đây"
```

### Trường hợp 3: Không tìm thấy
```
User gõ: "Phim không tồn tại"
→ Bot im lặng (không spam)
```

## 🔧 Cách chạy bot

```bash
cd telegram-bot
npm install
npm start
```

## 🧪 Test bot

Gõ trong Telegram:
- `Mai` → Hiển thị danh sách 5 phim để chọn
- `Avengers` → Hiển thị danh sách 5 phim để chọn
- `Quỷ Nhập Tràng` → Hiển thị 3 phim để chọn
- `Linh Miếu` → Gửi ảnh + button trực tiếp (1 kết quả)

## 📊 Log mẫu khi bot chạy

### Nhiều kết quả:
```
🤖 Bot đang chạy...
📩 Nhận tin nhắn: "Mai"
🔍 Tìm kiếm: https://ophim1.com/v1/api/tim-kiem?keyword=Mai
📋 Tìm thấy 24 kết quả
✅ Gửi danh sách 5 phim
```

### 1 kết quả:
```
📩 Nhận tin nhắn: "Linh Miếu"
🔍 Tìm kiếm: https://ophim1.com/v1/api/tim-kiem?keyword=Linh%20Mi%C3%AAu
🔄 Slug: linh-mieu-quy-nhap-trang
🔍 Gọi API: https://ophim1.com/v1/api/phim/linh-mieu-quy-nhap-trang
🖼️ Poster URL: https://img.ophim.live/uploads/movies/linh-mieu-thumb.jpg
✅ Gửi ảnh và link: https://aphim.io.vn/movie-detail.html?slug=linh-mieu-quy-nhap-trang
```

## 🚀 Deploy lên Railway

1. Push code lên GitHub
2. Vào railway.app → New Project → Deploy from GitHub
3. Chọn repo `aphim-telegram-bot`
4. Thêm biến môi trường: `BOT_TOKEN=8715308625:AAHLCjkuU9NptJCzqMaw_Gs2Toagy-wMImk`
5. Deploy!

## ⚠️ Lưu ý

- Bot phải tắt Privacy Mode trên @BotFather
- Bot cần quyền đọc tin nhắn trong nhóm
- Khi có >1 kết quả, bot hiển thị tối đa 5 phim đầu tiên
- User click button để chọn phim muốn xem
- Nếu không tìm thấy phim, bot im lặng (không spam)

## 📁 Files quan trọng

- `bot.js` - Code chính với logic search
- `.env` - Chứa BOT_TOKEN (không commit lên Git)
- `package.json` - Dependencies
- `railway.json` - Config cho Railway
- `Procfile` - Lệnh chạy trên Railway
- `test-search-api.js` - Test API search
