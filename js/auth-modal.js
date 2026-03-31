/**
 * A PHIM - Auth Modal (Login / Register)
 * Hiện popup đăng nhập / đăng ký ngay tại trang mà không redirect
 */
(function () {
    'use strict';

    // ── Styles ────────────────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById('ap-auth-modal-css')) return;
        const s = document.createElement('style');
        s.id = 'ap-auth-modal-css';
        s.textContent = `
        /* ── Backdrop ── */
        #ap-auth-backdrop {
            position: fixed; inset: 0; z-index: 99999;
            background: rgba(10,10,20,0.82);
            backdrop-filter: blur(6px);
            display: flex; align-items: center; justify-content: center;
            padding: 16px;
            animation: ap-modal-fadein 0.25s ease;
        }
        @keyframes ap-modal-fadein {
            from { opacity:0; } to { opacity:1; }
        }

        /* ── Modal box ── */
        #ap-auth-modal {
            width: 100%; max-width: 700px;
            background: #1e2030;
            border-radius: 20px;
            overflow: hidden;
            display: flex;
            box-shadow: 0 30px 80px rgba(0,0,0,0.6);
            animation: ap-modal-slidein 0.3s cubic-bezier(0.34,1.56,0.64,1);
            position: relative;
        }
        @keyframes ap-modal-slidein {
            from { transform: scale(0.92) translateY(24px); opacity:0; }
            to   { transform: scale(1) translateY(0); opacity:1; }
        }

        /* ── Left panel ── */
        .ap-auth-left {
            width: 260px; flex-shrink: 0;
            background:
                linear-gradient(160deg, rgba(15,15,30,0.7) 0%, rgba(30,32,60,0.85) 100%),
                url('https://image.tmdb.org/t/p/w780/8b8R8l88Qje9dn9OE8Ez05N5cKk.jpg') center / cover no-repeat;
            display: flex; flex-direction: column;
            align-items: center; justify-content: flex-end;
            padding: 32px 24px;
            gap: 10px;
        }
        @media (max-width: 520px) { .ap-auth-left { display: none; } }
        .ap-auth-brand {
            display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .ap-auth-brand-logo {
            width: 52px; height: 52px; border-radius: 50%;
            border: 2px solid #fcd576;
            overflow: hidden; background: #000;
            display: flex; align-items: center; justify-content: center;
        }
        .ap-auth-brand-logo img { width: 36px; height: 36px; object-fit: contain; }
        .ap-auth-brand-name {
            font-size: 22px; font-weight: 800; color: #fff;
            letter-spacing: 0.5px;
        }
        .ap-auth-brand-name span { color: #fcd576; }
        .ap-auth-brand-tagline {
            font-size: 12px; color: rgba(255,255,255,0.5);
            text-align: center;
        }

        /* ── Right panel ── */
        .ap-auth-right {
            flex: 1; padding: 40px 32px;
            display: flex; flex-direction: column;
            gap: 0;
        }
        @media (max-width: 520px) { .ap-auth-right { padding: 32px 24px; } }

        .ap-auth-close {
            position: absolute; top: 16px; right: 16px;
            width: 32px; height: 32px; border-radius: 50%;
            background: rgba(255,255,255,0.08); border: none;
            color: rgba(255,255,255,0.6); cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            font-size: 18px; transition: all 0.2s;
        }
        .ap-auth-close:hover { background: rgba(255,255,255,0.16); color: #fff; }

        .ap-auth-title {
            font-size: 24px; font-weight: 800; color: #fff;
            margin: 0 0 6px;
        }
        .ap-auth-subtitle {
            font-size: 13px; color: #9ca3af; margin: 0 0 24px;
        }
        .ap-auth-subtitle a {
            color: #fcd576; text-decoration: none; font-weight: 600;
            cursor: pointer;
        }
        .ap-auth-subtitle a:hover { text-decoration: underline; }

        /* ── Inputs ── */
        .ap-auth-field { margin-bottom: 14px; }
        .ap-auth-field label {
            display: block; font-size: 12px; font-weight: 600;
            color: #9ca3af; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .ap-auth-input {
            width: 100%; box-sizing: border-box;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 10px; padding: 12px 14px;
            color: #fff; font-size: 14px; font-family: inherit;
            outline: none; transition: border-color 0.2s;
        }
        .ap-auth-input:focus { border-color: rgba(252,213,118,0.6); }
        .ap-auth-input::placeholder { color: #4b5563; }

        /* ── Submit button ── */
        .ap-auth-submit {
            width: 100%; padding: 13px;
            background: #fcd576; color: #1a1200;
            font-size: 15px; font-weight: 800;
            border: none; border-radius: 12px; cursor: pointer;
            transition: all 0.2s; margin-top: 6px;
            letter-spacing: 0.5px;
        }
        .ap-auth-submit:hover { background: #e8c15a; transform: translateY(-1px); }
        .ap-auth-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* ── Error/Success msg ── */
        .ap-auth-msg {
            font-size: 13px; padding: 10px 14px;
            border-radius: 8px; margin-bottom: 14px;
            display: none;
        }
        .ap-auth-msg.error   { background: rgba(239,68,68,0.15);  color: #fca5a5; display: block; }
        .ap-auth-msg.success { background: rgba(16,185,129,0.15); color: #6ee7b7; display: block; }

        /* ── Divider ── */
        .ap-auth-divider {
            display: flex; align-items: center; gap: 12px;
            margin: 18px 0 6px; color: #4b5563; font-size: 12px;
        }
        .ap-auth-divider::before, .ap-auth-divider::after {
            content:''; flex:1; height:1px; background: rgba(255,255,255,0.08);
        }

        /* ── Forgot password link ── */
        .ap-auth-forgot {
            text-align: center; margin-top: 14px;
            font-size: 12px; color: #6b7280;
            cursor: pointer;
        }
        .ap-auth-forgot:hover { color: #fcd576; }
        `;
        document.head.appendChild(s);
    }

    // ── Preload images silently in background so modal opens instantly ──
    let dynamicPosterURL = 'https://image.tmdb.org/t/p/w780/8b8R8l88Qje9dn9OE8Ez05N5cKk.jpg'; // fallback
    
    if (typeof window !== 'undefined') {
        setTimeout(async () => {
            try {
                // Fetch Phim Việt Nam mới nhất
                const res = await fetch('https://ophim1.com/v1/api/quoc-gia/viet-nam');
                const data = await res.json();
                if (data?.data?.items?.length > 0) {
                    const latestMovie = data.data.items[0];
                    const url = `https://img.ophim.live/uploads/movies/${latestMovie.thumb_url || latestMovie.poster_url}`;
                    dynamicPosterURL = url;
                    
                    // Preload immediately
                    const img = new Image();
                    img.src = url;
                }
            } catch(e) { console.error('Error preloading Vietnam movie', e) }
        }, 100);
    }

    // ── Create modal ─────────────────────────────────────────────────
    function createModal(mode) {
        // Xóa modal cũ nếu có
        removeModal();

        injectStyles();

        const randomBg = dynamicPosterURL;
        const isLogin  = mode !== 'register';

        const backdrop = document.createElement('div');
        backdrop.id = 'ap-auth-backdrop';

        backdrop.innerHTML = `
        <div id="ap-auth-modal">
            <!-- Close -->
            <button class="ap-auth-close" id="ap-auth-close-btn">✕</button>

            <!-- Left -->
            <div class="ap-auth-left" style="background: linear-gradient(to bottom, rgba(15,15,30,0.15) 0%, rgba(15,15,30,0.95) 100%), url('${randomBg}') center / cover no-repeat;">
                <div class="ap-auth-brand">
                    <div class="ap-auth-brand-logo">
                        <img src="/favicon.png" alt="A Phim">
                    </div>
                    <div class="ap-auth-brand-name">A <span>Phim</span></div>
                    <div class="ap-auth-brand-tagline">Phim hay cả rổ</div>
                </div>
            </div>

            <!-- Right -->
            <div class="ap-auth-right">
                <h2 class="ap-auth-title">${isLogin ? 'Đăng nhập' : 'Đăng ký'}</h2>
                <p class="ap-auth-subtitle">
                    ${isLogin
                        ? 'Chưa có tài khoản? <a id="ap-switch-to-register">Đăng ký ngay</a>'
                        : 'Đã có tài khoản? <a id="ap-switch-to-login">Đăng nhập</a>'
                    }
                </p>

                <div class="ap-auth-msg" id="ap-auth-msg"></div>

                <form id="ap-auth-form" autocomplete="off">
                    ${!isLogin ? `
                    <div class="ap-auth-field">
                        <label>Họ và tên</label>
                        <input class="ap-auth-input" type="text" id="ap-field-name" placeholder="Nguyễn Văn A" required>
                    </div>` : ''}

                    <div class="ap-auth-field">
                        <label>Email</label>
                        <input class="ap-auth-input" type="email" id="ap-field-email" placeholder="email@example.com" required>
                    </div>

                    ${!isLogin ? `
                    <div class="ap-auth-field">
                        <label>Số điện thoại</label>
                        <input class="ap-auth-input" type="tel" id="ap-field-phone" placeholder="0123456789">
                    </div>` : ''}

                    <div class="ap-auth-field">
                        <label>Mật khẩu</label>
                        <input class="ap-auth-input" type="password" id="ap-field-password" placeholder="••••••••" required>
                    </div>

                    ${!isLogin ? `
                    <div class="ap-auth-field">
                        <label>Xác nhận mật khẩu</label>
                        <input class="ap-auth-input" type="password" id="ap-field-confirm" placeholder="••••••••" required>
                    </div>` : ''}

                    <button class="ap-auth-submit" type="submit" id="ap-auth-submit-btn">
                        ${isLogin ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}
                    </button>
                </form>

                ${isLogin ? `<div class="ap-auth-forgot" id="ap-forgot-link">Quên mật khẩu?</div>` : ''}
            </div>
        </div>`;

        document.body.appendChild(backdrop);
        document.body.style.overflow = 'hidden';

        // ── Event listeners ──────────────────────────────────────────
        // Đóng khi click backdrop
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) removeModal();
        });

        // Nút X
        document.getElementById('ap-auth-close-btn').addEventListener('click', removeModal);

        // Escape key
        document._apModalEsc = (e) => { if (e.key === 'Escape') removeModal(); };
        document.addEventListener('keydown', document._apModalEsc);

        // Switch mode
        const switchRegister = document.getElementById('ap-switch-to-register');
        const switchLogin    = document.getElementById('ap-switch-to-login');
        if (switchRegister) switchRegister.addEventListener('click', () => createModal('register'));
        if (switchLogin)    switchLogin.addEventListener('click', () => createModal('login'));

        // Focus field
        setTimeout(() => {
            const firstInput = document.querySelector('#ap-auth-form .ap-auth-input');
            if (firstInput) firstInput.focus();
        }, 100);

        // ── Form submit ──────────────────────────────────────────────
        document.getElementById('ap-auth-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleSubmit(isLogin);
        });
    }

    // ── Handle submit ─────────────────────────────────────────────────
    async function handleSubmit(isLogin) {
        const btn     = document.getElementById('ap-auth-submit-btn');
        const msgEl   = document.getElementById('ap-auth-msg');
        const email   = (document.getElementById('ap-field-email')?.value || '').trim();
        const password = document.getElementById('ap-field-password')?.value || '';

        if (!email || !password) {
            showMsg('Vui lòng nhập đầy đủ thông tin', 'error'); return;
        }

        btn.disabled = true;
        btn.textContent = isLogin ? 'Đang đăng nhập...' : 'Đang đăng ký...';
        msgEl.className = 'ap-auth-msg';

        try {
            let result;
            if (isLogin) {
                result = await authService.login(email, password);
            } else {
                const name    = (document.getElementById('ap-field-name')?.value || '').trim();
                const phone   = (document.getElementById('ap-field-phone')?.value || '').trim();
                const confirm = document.getElementById('ap-field-confirm')?.value || '';

                if (!name) { showMsg('Vui lòng nhập họ tên', 'error'); resetBtn(btn, isLogin); return; }
                if (password !== confirm) { showMsg('Mật khẩu xác nhận không khớp', 'error'); resetBtn(btn, isLogin); return; }
                if (password.length < 6) { showMsg('Mật khẩu tối thiểu 6 ký tự', 'error'); resetBtn(btn, isLogin); return; }

                result = await authService.register(email, password, name, phone);
            }

            if (result.success) {
                showMsg(isLogin ? '✅ Đăng nhập thành công!' : '✅ Đăng ký thành công!', 'success');
                setTimeout(() => {
                    removeModal();
                    // Reload phần bình luận mà không reload cả trang
                    refreshCommentSection();
                    // Cập nhật UI header (nút đăng nhập → avatar)
                    if (typeof updateUserUI === 'function') updateUserUI();
                    else if (window.userUI) window.userUI.update?.();
                }, 800);
            } else {
                showMsg(result.message || 'Đăng nhập thất bại', 'error');
                resetBtn(btn, isLogin);
            }
        } catch (err) {
            showMsg('Lỗi kết nối server', 'error');
            resetBtn(btn, isLogin);
        }
    }

    function showMsg(text, type) {
        const el = document.getElementById('ap-auth-msg');
        if (!el) return;
        el.textContent = text;
        el.className   = 'ap-auth-msg ' + type;
    }

    function resetBtn(btn, isLogin) {
        btn.disabled    = false;
        btn.textContent = isLogin ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ';
    }

    // ── Refresh comment section sau login ─────────────────────────────
    function refreshCommentSection() {
        // Xóa ap-cmt-wrapper và rebuild
        const wrapper = document.getElementById('ap-cmt-wrapper');
        if (wrapper) wrapper.remove();

        // Gọi lại initCommentUI nếu còn expose
        if (typeof window._apInitComment === 'function') {
            window._apInitComment();
        } else {
            // Fallback: reload nhẹ chỉ section
            const section = document.getElementById('comments-section');
            if (section) {
                // Trigger reinit qua custom event
                document.dispatchEvent(new CustomEvent('ap-auth-changed'));
            }
        }
    }

    // ── Remove modal ──────────────────────────────────────────────────
    function removeModal() {
        const el = document.getElementById('ap-auth-backdrop');
        if (el) el.remove();
        document.body.style.overflow = '';
        if (document._apModalEsc) {
            document.removeEventListener('keydown', document._apModalEsc);
            delete document._apModalEsc;
        }
    }

    // ── Public API ────────────────────────────────────────────────────
    window.showAuthModal = function(mode) {
        createModal(mode || 'login');
    };

    // ── Intercept ALL clicks on login/register links (capture phase) ──
    // Dùng event delegation ở capture phase để chặn TRƯỚC browser redirect
    document.addEventListener('click', function (e) {
        const el = e.target.closest('a');
        if (!el) return;

        const href = el.getAttribute('href') || '';
        const isLogin    = href === 'login.html'    || href.startsWith('login.html?');
        const isRegister = href === 'register.html' || href.startsWith('register.html?');

        if (isLogin || isRegister) {
            e.preventDefault();
            e.stopImmediatePropagation();
            window.showAuthModal(isRegister ? 'register' : 'login');
        }
    }, true); // true = capture phase, chạy trước tất cả handler khác

})();
