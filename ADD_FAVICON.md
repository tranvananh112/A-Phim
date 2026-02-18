# 🎨 Thêm Favicon (Logo trên Tab Trình Duyệt)

## Bước 1: Lưu Logo

1. Lưu logo bạn vừa gửi vào thư mục gốc với tên: `favicon.png`
2. Hoặc tạo các kích thước khác nhau:
   - `favicon-16x16.png` (16x16 pixels)
   - `favicon-32x32.png` (32x32 pixels)
   - `favicon.ico` (file .ico cho trình duyệt cũ)

## Bước 2: Thêm Favicon vào HTML

Thêm dòng này vào phần `<head>` của tất cả các file HTML:

```html
<!-- Favicon -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="shortcut icon" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
```

## Bước 3: Tạo Favicon từ Logo

### Option 1: Dùng Online Tool (Đơn giản nhất)

1. Vào: https://favicon.io/favicon-converter/
2. Upload logo của bạn
3. Download file zip
4. Giải nén và copy các file vào thư mục gốc

### Option 2: Dùng Photoshop/GIMP

1. Mở logo
2. Resize về 32x32 pixels
3. Save as PNG: `favicon-32x32.png`
4. Resize về 16x16 pixels
5. Save as PNG: `favicon-16x16.png`

### Option 3: Dùng ImageMagick (Command line)

```bash
# Cài đặt ImageMagick
# Windows: choco install imagemagick
# Mac: brew install imagemagick

# Tạo các kích thước
magick logo.png -resize 32x32 favicon-32x32.png
magick logo.png -resize 16x16 favicon-16x16.png
magick logo.png -resize 180x180 apple-touch-icon.png
```

## Bước 4: Cấu Trúc Thư Mục

```
/
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png
├── index.html
├── login.html
└── ...
```

## Bước 5: Test

1. Clear cache trình duyệt: Ctrl + Shift + Delete
2. Reload trang: Ctrl + F5
3. Kiểm tra tab trình duyệt có logo chưa

## Lưu Ý

- File favicon nên đặt ở thư mục gốc (root)
- Kích thước chuẩn: 16x16, 32x32, 180x180 (cho Apple)
- Format: PNG hoặc ICO
- Nên có background trong suốt (transparent)

## Tự Động Thêm vào Tất Cả HTML

Tôi sẽ tự động thêm favicon vào tất cả các file HTML chính.
