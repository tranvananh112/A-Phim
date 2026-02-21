// Cấu hình thanh toán
const PAYMENT_CONFIG = {
    bankId: '970422',
    accountNo: '048889019999',
    accountName: 'TRAN VAN ANH',
    template: 'compact'
};

// Thông tin các gói
const PLANS = {
    premium: {
        name: 'Gói Cao Cấp',
        amount: 69000,
        duration: '1 tháng',
        code: 'PREMIUM'
    },
    family: {
        name: 'Gói Gia Đình',
        amount: 699000,
        duration: '1 năm',
        code: 'FAMILY'
    }
};

// Lấy thông tin gói từ URL
function getPlanFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');
    return PLANS[plan] || null;
}

// Tạo nội dung chuyển khoản
function generateTransferContent(planCode) {
    const timestamp = Date.now().toString().slice(-6);
    return `APHIM ${planCode} ${timestamp}`;
}

// Tạo URL QR Code
function generateQRCodeURL(amount, content) {
    const params = new URLSearchParams({
        accountName: PAYMENT_CONFIG.accountName,
        amount: amount,
        addInfo: content
    });

    return `https://api.vietqr.io/image/${PAYMENT_CONFIG.bankId}-${PAYMENT_CONFIG.accountNo}-${PAYMENT_CONFIG.template}.jpg?${params.toString()}`;
}

// Format số tiền
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Khởi tạo trang thanh toán
function initPaymentPage() {
    const plan = getPlanFromURL();

    if (!plan) {
        alert('Không tìm thấy thông tin gói dịch vụ!');
        window.location.href = 'pricing.html';
        return;
    }

    // Tạo nội dung chuyển khoản
    const transferContent = generateTransferContent(plan.code);

    // Cập nhật thông tin gói
    document.getElementById('planName').textContent = `Thanh toán ${plan.name}`;
    document.getElementById('planNameDetail').textContent = plan.name;
    document.getElementById('planDuration').textContent = plan.duration;
    document.getElementById('totalAmount').textContent = formatCurrency(plan.amount);
    document.getElementById('amountText').textContent = formatCurrency(plan.amount);
    document.getElementById('contentText').textContent = transferContent;

    // Tạo và hiển thị QR Code
    const qrCodeURL = generateQRCodeURL(plan.amount, transferContent);
    document.getElementById('qrCode').src = qrCodeURL;

    // Xử lý nút xác nhận thanh toán
    setupPaymentConfirmation(plan, transferContent);
}

// Xử lý xác nhận thanh toán
function setupPaymentConfirmation(plan, transferContent) {
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    const confirmedBtn = document.getElementById('confirmedBtn');

    confirmBtn.addEventListener('click', function () {
        // Hiển thị xác nhận
        const confirmed = confirm(
            `Bạn đã chuyển khoản ${formatCurrency(plan.amount)} với nội dung "${transferContent}"?\n\n` +
            'Vui lòng chỉ xác nhận khi đã hoàn tất thanh toán.'
        );

        if (confirmed) {
            // Ẩn nút xanh, hiện nút đỏ
            confirmBtn.classList.add('hidden');
            confirmedBtn.classList.remove('hidden');
            confirmedBtn.classList.add('flex');

            // Lưu thông tin thanh toán vào localStorage
            savePaymentInfo(plan, transferContent);

            // Hiển thị thông báo
            showSuccessMessage(plan);
        }
    });
}

// Lưu thông tin thanh toán
function savePaymentInfo(plan, transferContent) {
    const paymentInfo = {
        plan: plan.name,
        amount: plan.amount,
        duration: plan.duration,
        transferContent: transferContent,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };

    // Lưu vào localStorage
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    payments.push(paymentInfo);
    localStorage.setItem('payments', JSON.stringify(payments));

    // Lưu gói hiện tại
    localStorage.setItem('currentPlan', JSON.stringify({
        name: plan.name,
        code: plan.code,
        expiryDate: calculateExpiryDate(plan.duration)
    }));
}

// Tính ngày hết hạn
function calculateExpiryDate(duration) {
    const now = new Date();
    if (duration.includes('tháng')) {
        now.setMonth(now.getMonth() + 1);
    } else if (duration.includes('năm')) {
        now.setFullYear(now.getFullYear() + 1);
    }
    return now.toISOString();
}

// Hiển thị thông báo thành công
function showSuccessMessage(plan) {
    const message = `
        ✅ Đã xác nhận thanh toán ${plan.name}!
        
        Gói dịch vụ của bạn sẽ được kích hoạt trong vòng 5-10 phút.
        
        Bạn sẽ được chuyển về trang chủ sau 5 giây...
    `;

    alert(message);

    // Chuyển về trang chủ sau 5 giây
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 5000);
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', initPaymentPage);
