# Hướng dẫn chạy Proxy Server để xem phim

## Vấn đề
Link video từ các nguồn bên ngoài (như vip.opstream90.com) bị chặn CORS, không thể phát trực tiếp trên trình duyệt.

## Giải pháp
Sử dụng Proxy Server để bypass CORS và phát video.

## Cách chạy

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Chạy Proxy Server

**Cách 1: Chạy riêng proxy**
```bash
npm run proxy
```
Hoặc double-click file `start-proxy.bat`

**Cách 2: Chạy cả web server và proxy cùng lúc**
```bash
npm run start-all
```

### Bước 3: Kiểm tra
- Proxy server chạy tại: http://localhost:3001
- Web server chạy tại: http://localhost:3000
- Health check: http://localhost:3001/health

## Cách sử dụng

1. Mở admin panel: http://localhost:3000/admin/movies.html
2. Chọn "Phim Việt Nam"
3. Nhập link m3u8 vào ô "Link Video"
4. Nhấn "Lưu"
5. Nhấn "Xem" để test
6. Video sẽ tự động phát qua proxy

## Lưu ý

- Proxy server PHẢI chạy trước khi xem phim
- Nếu video không phát, kiểm tra:
  - Proxy server đang chạy (port 3001)
  - Link video còn hợp lệ
  - Console log để xem lỗi chi tiết

## Troubleshooting

### Lỗi: "Cannot GET /proxy"
→ Proxy server chưa chạy, chạy lệnh `npm run proxy`

### Lỗi: "Network error"
→ Link video không hợp lệ hoặc đã hết hạn

### Lỗi: "Port 3001 already in use"
→ Đóng process đang dùng port 3001 hoặc đổi port trong proxy-server.js
