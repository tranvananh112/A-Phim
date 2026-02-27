# 🤖 Hướng dẫn tạo Bot và Nhóm Telegram cho A Phim

## Bước 1: Tạo Bot với @BotFather

### 1.1. Mở Telegram và tìm @BotFather

1. Mở ứng dụng Telegram trên điện thoại hoặc máy tính
2. Vào thanh tìm kiếm, gõ: `@BotFather`
3. Chọn tài khoản có dấu tick xanh (verified)
4. Nhấn **START** hoặc gửi `/start`

### 1.2. Tạo Bot mới

Gửi lệnh sau cho @BotFather:

```
/newbot
```

BotFather sẽ hỏi:

**Câu 1: "Alright, a new bot. How are we going to call it? Please choose a name for your bot."**

Trả lời tên hiển thị của bot (có thể có dấu cách):
```
A Phim Bot
```

**Câu 2: "Good. Now let's choose a username for your bot. It must end in `bot`."**

Trả lời username (không dấu cách, phải kết thúc bằng `bot`):
```
aphim_movie_bot
```

Hoặc các tên khác như:
- `aphimio_bot`
- `aphimvn_bot`
- `cinestream_bot`

### 1.3. Lưu Bot Token

BotFather sẽ gửi cho bạn một tin nhắn như này:

```
Done! Congratulations on your new bot. You will find it at t.me/aphim_movie_bot.

Use this token to access the HTTP API:
7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw

Keep your token secure and store it safely, it can be used by anyone to control your bot.
```

**⚠️ QUAN TRỌNG:** Copy dòng token (dạng `7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw`) và lưu lại!

### 1.4. Tắt Privacy Mode (Bắt buộc để bot đọc tin nhắn trong nhóm)

Gửi lệnh:
```
/setprivacy
```

BotFather sẽ hiện danh sách bot của bạn:
- Chọn `@aphim_movie_bot` (hoặc tên bot bạn vừa tạo)

BotFather hỏi: "Choose the desired privacy mode"
- Chọn **Disable** (hoặc gửi `/disable`)

Bạn sẽ thấy thông báo:
```
Success! The new status is: DISABLED. /help
```

✅ Xong! Bot giờ có thể đọc tất cả tin nhắn trong nhóm.

### 1.5. Tùy chỉnh Bot (Tùy chọn)

**Thêm ảnh đại diện:**
```
/setuserpic
```
Chọn bot → Gửi ảnh logo A Phim

**Thêm mô tả:**
```
/setdescription
```
Chọn bot → Gửi mô tả:
```
Bot tự động tạo link phim từ aphim.io.vn. Chỉ cần gõ tên phim!
```

**Thêm thông tin About:**
```
/setabouttext
```
Chọn bot → Gửi:
```
🎬 Bot hỗ trợ tìm phim từ aphim.io.vn
```

---

## Bước 2: Tạo Nhóm Telegram "A Phim"

### 2.1. Tạo nhóm mới

**Trên điện thoại:**
1. Mở Telegram
2. Nhấn vào biểu tượng **Bút** (góc dưới bên phải)
3. Chọn **New Group**
4. Đặt tên nhóm: `A Phim` hoặc `Cộng đồng A Phim`
5. Thêm ít nhất 1 người bạn để tạo nhóm (có thể xóa sau)
6. Nhấn **Create**

**Trên máy tính:**
1. Mở Telegram Desktop
2. Nhấn vào menu ☰ (góc trên bên trái)
3. Chọn **New Group**
4. Đặt tên nhóm: `A Phim`
5. Thêm thành viên → Nhấn **Create**

### 2.2. Thêm Bot vào nhóm

1. Vào nhóm **A Phim** vừa tạo
2. Nhấn vào tên nhóm ở trên cùng
3. Chọn **Add Members** (hoặc **Thêm thành viên**)
4. Tìm kiếm: `@aphim_movie_bot` (tên bot bạn vừa tạo)
5. Chọn bot → Nhấn **Add**

### 2.3. Cấp quyền Admin cho Bot (Khuyến nghị)

1. Vào nhóm, nhấn tên nhóm ở trên
2. Chọn **Administrators** (hoặc **Quản trị viên**)
3. Nhấn **Add Administrator**
4. Chọn bot `@aphim_movie_bot`
5. Tắt hết các quyền, chỉ bật:
   - ✅ **Delete messages** (Xóa tin nhắn - nếu cần)
   - Hoặc không cần quyền gì cũng được
6. Nhấn **Save**

---

## Bước 3: Cấu hình Bot trên máy tính

### 3.1. Mở file .env

Mở file `telegram-bot/.env` bằng Notepad hoặc VS Code:

```env
BOT_TOKEN=your_bot_token_here
```

### 3.2. Paste Bot Token

Thay `your_bot_token_here` bằng token thật từ @BotFather:

```env
BOT_TOKEN=7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
```

**⚠️ Lưu ý:** Không có dấu cách, không có dấu ngoặc kép!

### 3.3. Lưu file

Nhấn **Ctrl + S** để lưu file `.env`

---

## Bước 4: Chạy Bot

### 4.1. Cài đặt dependencies

Mở Command Prompt hoặc Terminal, chạy:

```bash
cd telegram-bot
npm install
```

### 4.2. Khởi động Bot

```bash
npm start
```

Bạn sẽ thấy:
```
🤖 Bot đang chạy...
```

✅ Bot đã sẵn sàng!

---

## Bước 5: Test Bot

### 5.1. Test trong chat riêng

1. Mở Telegram, tìm bot `@aphim_movie_bot`
2. Gửi `/start`
3. Bot sẽ reply: "👋 Xin chào! Gõ tên phim để tôi tìm link cho bạn."
4. Gõ tên phim: `Linh Miếu`
5. Bot sẽ trả về:
   ```
   🎬 Linh Miếu
   🔗 https://aphim.io.vn/movie-detail.html?slug=linh-mieu
   ```

### 5.2. Test trong nhóm

1. Vào nhóm **A Phim**
2. Gõ tên phim bất kỳ: `Quỷ Nhập Tràng 2`
3. Bot sẽ tự động reply link nếu phim tồn tại
4. Nếu phim không tồn tại, bot sẽ im lặng (không spam)

---

## 🎯 Tóm tắt các bước

1. ✅ Tạo bot với @BotFather → Lấy token
2. ✅ Tắt Privacy Mode (`/setprivacy` → Disable)
3. ✅ Tạo nhóm "A Phim"
4. ✅ Thêm bot vào nhóm
5. ✅ Paste token vào file `.env`
6. ✅ Chạy `npm install` và `npm start`
7. ✅ Test bot trong nhóm

---

## 🐛 Xử lý lỗi thường gặp

### Lỗi: Bot không nhận tin nhắn trong nhóm

**Nguyên nhân:** Privacy Mode chưa tắt

**Giải pháp:**
1. Gửi `/setprivacy` cho @BotFather
2. Chọn bot
3. Chọn **Disable**
4. Kick bot ra khỏi nhóm và thêm lại

### Lỗi: "Error: ETELEGRAM: 401 Unauthorized"

**Nguyên nhân:** Bot token sai hoặc không hợp lệ

**Giải pháp:**
1. Kiểm tra lại token trong file `.env`
2. Copy lại token từ @BotFather (gửi `/token` → chọn bot)
3. Đảm bảo không có dấu cách thừa

### Lỗi: Bot không reply

**Nguyên nhân:** Link phim không tồn tại

**Giải pháp:**
- Bot chỉ reply khi link hợp lệ (status 200)
- Thử với tên phim đơn giản: `Linh Miếu`, `Mai`
- Kiểm tra console log để xem slug được tạo ra

---

## 📞 Liên hệ

Nếu gặp vấn đề, kiểm tra:
1. Console log khi bot chạy
2. File `.env` có đúng token không
3. Bot có trong nhóm không
4. Privacy Mode đã tắt chưa

Chúc bạn thành công! 🎉
