# 📊 Tổng Quan Quảng Cáo - Tránh Chồng Lấn

## 🎯 Cấu Hình Hiện Tại

### 1. AdsTerra Popunder (js/adsterra.js)
**Trạng thái:** ✅ BẬT
**Trigger:** Tự động sau tương tác
**Cấu hình:**
- Delay ban đầu: 3 giây
- Yêu cầu tương tác: click/scroll
- Sau tương tác: 1 giây → pop
- Lần đầu: 5 giây
- Các lần sau: 3 phút
- Max: 4 pops/session

**⚠️ VẤN ĐỀ:** Có listener riêng cho nút "XEM NGAY" → CHỒNG với Smartlink!

---

### 2. Smartlink (js/smartlink.js)
**Trạng thái:** ✅ BẬT
**Trigger:** Click vào nút cụ thể

**Desktop (2 pops, cách 5 phút):**
- Trigger 1: Nút "XEM NGAY" (movie-detail.html)
- Trigger 2: Nút "Tập X" (watch.html)

**Mobile (1 pop):**
- Trigger: Nút "ĐĂNG NHẬP" (login.html)

**⚠️ VẤN ĐỀ:** Cũng trigger trên "XEM NGAY" → CHỒNG với AdsTerra!

---

### 3. PopAds (js/popads.js)
**Trạng thái:** ❌ TẮT
**Lý do:** Chuyển sang AdsTerra

---

## ⚠️ CHỒNG LẤN QUẢNG CÁO

### Tình huống xấu nhất:

**User vào movie-detail.html và click "XEM NGAY":**
1. AdsTerra: Pop ngay lập tức (listener riêng)
2. Smartlink: Pop ngay lập tức (listener riêng)
3. → **2 POP CÙNG LÚC!** ❌

---

## ✅ GIẢI PHÁP ĐỀ XUẤT

### Option 1: TẮT AdsTerra listener cho "XEM NGAY"
- Giữ Smartlink trigger "XEM NGAY"
- AdsTerra chỉ trigger tự động sau tương tác
- Tránh chồng lấn hoàn toàn

### Option 2: TẮT Smartlink trigger "XEM NGAY"
- Giữ AdsTerra trigger "XEM NGAY"
- Smartlink chỉ trigger ở nút "Tập X"
- Desktop chỉ còn 1 pop thay vì 2

### Option 3: Thêm delay giữa 2 quảng cáo
- AdsTerra pop trước
- Smartlink đợi 30 giây rồi mới pop
- Vẫn có 2 pops nhưng không cùng lúc

---

## 📋 TIMELINE QUẢNG CÁO (Nếu không fix)

**User journey trên Desktop:**

1. **Vào trang chủ (index.html)**
   - 0s: Load trang
   - 3s: AdsTerra ready
   - User scroll/click
   - +1s: AdsTerra pop #1 ✅

2. **Click vào phim → movie-detail.html**
   - User click "XEM NGAY"
   - AdsTerra pop #2 ✅ (instant)
   - Smartlink pop #1 ✅ (instant)
   - **→ 2 POPS CÙNG LÚC!** ❌

3. **Vào watch.html**
   - +3 phút: AdsTerra có thể pop #3
   - User click "Tập 2"
   - Smartlink pop #2 ✅ (nếu đã 5 phút từ lần 1)

4. **Tổng trong 1 session:**
   - AdsTerra: 4 pops
   - Smartlink: 2 pops
   - **TỔNG: 6 POPS** (có thể spam user!)

---

## 🎯 KHUYẾN NGHỊ

**Chọn Option 1: TẮT AdsTerra listener "XEM NGAY"**

**Lý do:**
- Smartlink có CPM cao hơn (theo yêu cầu của bạn)
- Tránh chồng lấn hoàn toàn
- Vẫn giữ đủ số lần pop

**Timeline sau khi fix:**
1. Trang chủ: AdsTerra pop sau tương tác
2. Click "XEM NGAY": Chỉ Smartlink pop
3. Click "Tập X": Smartlink pop lần 2
4. Các trang khác: AdsTerra tiếp tục pop (nếu đủ thời gian)

**Tổng: 4-5 pops/session, không chồng lấn**

---

## 🔧 CODE CẦN SỬA

**File: js/adsterra.js**
- Xóa function `setupWatchButtonListener()`
- Xóa dòng gọi `setupWatchButtonListener()` trong `initialize()`

Hoặc bạn muốn giữ cái nào?
