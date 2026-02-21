# Vô hiệu hóa đăng nhập Google/Facebook

## Những gì đã thay đổi:

### 1. Trang Đăng ký (register.html)
- Giữ nguyên nút "Đăng ký với Google" và "Đăng ký với Facebook"
- Khi người dùng click vào:
  - Hiện thông báo đỏ: "Hiện tại chưa hỗ trợ đăng ký bằng Google/Facebook. Vui lòng đăng ký thủ công bên dưới."
  - Tự động cuộn xuống form đăng ký thủ công
  - Highlight form bằng viền đỏ nhấp nháy (pulsing effect)
  - Viền đỏ tự động biến mất sau 5 giây

### 2. Trang Đăng nhập (login.html)
- Giữ nguyên nút "Google" và "Facebook"
- Khi người dùng click vào:
  - Hiện thông báo đỏ: "Hiện tại chưa hỗ trợ đăng nhập bằng Google/Facebook. Vui lòng đăng ký tài khoản thủ công."
  - Sau 1.5 giây tự động chuyển sang trang register.html
  - Trang register sẽ tự động cuộn xuống và highlight form đăng ký

## Cách hoạt động:

### Trên trang Đăng ký:
1. User click "Đăng ký với Google" hoặc "Đăng ký với Facebook"
2. Thông báo lỗi hiện ra
3. Trang tự động cuộn xuống form đăng ký thủ công
4. Form được highlight bằng viền đỏ + hiệu ứng pulsing
5. Sau 5 giây viền đỏ tự động biến mất

### Trên trang Đăng nhập:
1. User click "Google" hoặc "Facebook"
2. Thông báo lỗi hiện ra
3. Sau 1.5 giây tự động chuyển sang trang register.html
4. Trang register tự động cuộn xuống và highlight form

## Files đã chỉnh sửa:
- `js/register.js` - Thêm logic vô hiệu hóa và highlight form
- `js/login.js` - Thêm logic chuyển hướng sang trang đăng ký

## Khi nào muốn bật lại Google/Facebook login:
Chỉ cần thay đổi lại code trong 2 function:
- `loginWithGoogle()` 
- `loginWithFacebook()`

Trong cả 2 file `js/register.js` và `js/login.js`
