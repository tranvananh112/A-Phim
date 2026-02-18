# 🌐 Hướng Dẫn Cấu Hình Tên Miền aphim.io.vn

## Bước 1: Cấu Hình DNS Tại iNET

Vào trang quản lý DNS của iNET và thêm các bản ghi sau:

### A Records (Trỏ về GitHub Pages)

Thêm 4 bản ghi A:

| Tên bản ghi | Loại | Giá trị | TTL |
|-------------|------|---------|-----|
| @ | A | 185.199.108.153 | 300 |
| @ | A | 185.199.109.153 | 300 |
| @ | A | 185.199.110.153 | 300 |
| @ | A | 185.199.111.153 | 300 |

### CNAME Record (Cho www)

| Tên bản ghi | Loại | Giá trị | TTL |
|-------------|------|---------|-----|
| www | CNAME | tranvananh112.github.io | 300 |

## Bước 2: Cấu Hình GitHub Pages

1. Vào repository GitHub: https://github.com/tranvananh112/A-Phim
2. Vào **Settings** > **Pages**
3. Trong phần **Custom domain**, nhập: `aphim.io.vn`
4. Nhấn **Save**
5. Đợi vài phút để GitHub verify domain
6. Sau khi verify xong, tick vào **Enforce HTTPS**

## Bước 3: Commit File CNAME

File `CNAME` đã được tạo trong thư mục gốc với nội dung:
```
aphim.io.vn
```

Commit và push:

```bash
git add CNAME
git commit -m "Add custom domain aphim.io.vn"
git push
```

## Bước 4: Đợi DNS Propagate

DNS có thể mất từ 5 phút đến 48 giờ để propagate. Kiểm tra bằng:

```bash
nslookup aphim.io.vn
```

Hoặc dùng tool online: https://dnschecker.org

## Bước 5: Cập Nhật Backend CORS

Cập nhật `backend/server.js` để thêm domain mới:

```javascript
const allowedOrigins = [
    'http://localhost:3000',
    'https://aphim.ddns.net',
    'https://aphim.io.vn',
    'https://www.aphim.io.vn'
];
```

## Kiểm Tra

Sau khi DNS propagate, truy cập:
- https://aphim.io.vn
- https://www.aphim.io.vn

## Lưu Ý

1. **HTTPS**: GitHub Pages tự động cấp SSL certificate miễn phí
2. **www vs non-www**: Cả 2 đều hoạt động nhờ CNAME record
3. **Thời gian**: DNS có thể mất vài giờ để cập nhật toàn cầu
4. **aphim.ddns.net**: Vẫn hoạt động bình thường, có thể giữ hoặc xóa sau

## Troubleshooting

### Lỗi: "Domain's DNS record could not be retrieved"

Đợi thêm vài phút và thử lại. DNS chưa propagate.

### Lỗi: "HTTPS not available"

1. Bỏ tick **Enforce HTTPS**
2. Đợi 5-10 phút
3. Tick lại **Enforce HTTPS**

### Lỗi: "Domain is already taken"

Domain đã được dùng bởi repo khác. Xóa CNAME file ở repo cũ.

## Cấu Hình DNS Chi Tiết Tại iNET

### Bước 1: Đăng nhập iNET
1. Vào: https://portal.inet.vn
2. Đăng nhập tài khoản
3. Vào **Dịch vụ** > **Tên miền**
4. Chọn `aphim.io.vn`

### Bước 2: Quản lý DNS
1. Nhấn **Quản lý DNS** hoặc **DNS Manager**
2. Xóa tất cả bản ghi cũ (nếu có)
3. Thêm bản ghi mới theo bảng trên

### Bước 3: Lưu và Đợi
1. Nhấn **Lưu** hoặc **Save**
2. Đợi 5-30 phút để DNS cập nhật

## Sau Khi Hoàn Tất

Website sẽ có 2 domain:
- ✅ https://aphim.io.vn (Domain chính mới)
- ✅ https://aphim.ddns.net (Domain cũ, vẫn hoạt động)

Bạn có thể redirect từ domain cũ sang mới bằng JavaScript nếu muốn.
