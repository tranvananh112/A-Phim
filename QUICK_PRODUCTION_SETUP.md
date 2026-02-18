# Setup Nhanh cho Production (Không cần Backend)

Nếu bạn chưa muốn deploy backend, có thể dùng localStorage tạm thời cho production.

## Cách hoạt động

- **Local (localhost)**: Dùng MongoDB backend → Dữ liệu realtime, admin có thể xem
- **Production (aphim.ddns.net)**: Dùng localStorage → Mỗi user lưu data riêng trên trình duyệt

## Hạn chế của localStorage

1. ❌ Admin không thể xem danh sách user
2. ❌ Dữ liệu chỉ lưu trên trình duyệt (xóa cache = mất data)
3. ❌ Không đồng bộ giữa các thiết bị
4. ❌ Không có quản lý user tập trung

## Giải pháp đầy đủ

Để có dữ liệu realtime trên production, BẮT BUỘC phải:

1. ✅ Deploy backend lên cloud (Railway/Render/Vercel)
2. ✅ Setup MongoDB Atlas (free)
3. ✅ Cập nhật BACKEND_URL trong config.js
4. ✅ Bật USE_BACKEND_FOR_AUTH = true

Xem hướng dẫn chi tiết trong file: `DEPLOY_BACKEND_RAILWAY.md`

## Tóm tắt

| Tính năng | Local (có backend) | Production (không backend) |
|-----------|-------------------|---------------------------|
| Đăng ký/Đăng nhập | ✅ MongoDB | ✅ localStorage |
| Admin xem users | ✅ Realtime | ❌ Không có |
| Đồng bộ thiết bị | ✅ | ❌ |
| Bảo mật | ✅ | ⚠️ Trung bình |
| Quản lý tập trung | ✅ | ❌ |

**Khuyến nghị**: Deploy backend để có trải nghiệm đầy đủ!
