# Fix Dropdown Menu - Giải quyết vấn đề menu không hiển thị

## Vấn đề
Khi đứng ở các trang con như `phim-viet-nam.html`, `danh-sach.html`, di chuột vào các menu dropdown (Phim, Danh Sách, Thể Loại) thì menu không hiển thị hoặc biến mất ngay khi di chuột vào.

## Nguyên nhân
CSS `:hover` với `group-hover` không hoạt động tốt khi di chuyển chuột từ button vào dropdown menu. Khi chuột rời khỏi button, dropdown biến mất ngay lập tức trước khi chuột kịp vào menu.

## Giải pháp
Tạo file `js/dropdown-hover-fix.js` sử dụng JavaScript để kiểm soát dropdown:
- Thêm event listeners cho `mouseenter` và `mouseleave`
- Sử dụng `setTimeout` với delay 150ms để tránh đóng dropdown quá nhanh
- Giữ dropdown visible khi hover vào button HOẶC dropdown

## Files đã cập nhật
1. **js/dropdown-hover-fix.js** (NEW) - Script xử lý dropdown hover
2. **index.html** - Thêm script
3. **phim-viet-nam.html** - Thêm script
4. **danh-sach.html** - Thêm script
5. **phim-theo-quoc-gia.html** - Thêm script
6. **search.html** - Thêm script
7. **watch.html** - Thêm script
8. **pricing.html** - Thêm script
9. **movie-detail.html** - Thêm script
10. **profile.html** - Thêm script
11. **categories.html** - Thêm script

## Cách test
1. Mở trình duyệt: `http://localhost:3000/phim-viet-nam.html`
2. Di chuột vào button "Phim", "Danh Sách", hoặc "Thể Loại"
3. Di chuột vào dropdown menu
4. Dropdown phải giữ nguyên visible và không biến mất

## Kỹ thuật
```javascript
// Giữ dropdown visible khi hover
button.addEventListener('mouseenter', () => {
    clearTimeout(hideTimeout);
    dropdown.classList.remove('opacity-0', 'invisible');
    dropdown.classList.add('opacity-100', 'visible');
});

// Ẩn dropdown với delay 150ms
button.addEventListener('mouseleave', () => {
    hideTimeout = setTimeout(() => {
        dropdown.classList.remove('opacity-100', 'visible');
        dropdown.classList.add('opacity-0', 'invisible');
    }, 150);
});
```

## Kết quả
✅ Dropdown menu hoạt động mượt mà trên tất cả các trang
✅ Không bị đóng khi di chuột vào menu
✅ Có delay 150ms để UX tốt hơn
