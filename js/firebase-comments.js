/**
 * A PHIM - Firebase Comments Service v4
 * Giữ nguyên Input Box chuẩn ban đầu + Nâng cấp Giao diện bình luận phía dưới
 */

(function () {
    'use strict';

    const COMMENTS_CONFIG = {
        apiKey           : "AIzaSyAY4Lp6JR2zYyDWgfWJGOs5hyPbjC3SgGM",
        authDomain       : "aphim-comments.firebaseapp.com",
        projectId        : "aphim-comments",
        storageBucket    : "aphim-comments.firebasestorage.app",
        messagingSenderId: "369841727524",
        appId            : "1:369841727524:web:4a16c483184d2a9bb350b1",
        measurementId    : "G-7R819RHS99"
    };

    const COMMENTS_APP_NAME = 'aphim-comments';
    const COMMENT_LIMIT = 200;

    const AVATAR_COLORS = [
        '#f59e0b','#10b981','#3b82f6','#ef4444','#8b5cf6',
        '#f97316','#06b6d4','#ec4899','#84cc16','#6366f1'
    ];

    const AVATAR_LIST = [
        "https://i.ex-cdn.com/giadinhmoi.vn/files/content/2024/12/13/470107535_1156674079362932_3220600486106282952_n-0953.jpg",
        "https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/07/anh-son-tung-2.jpg",
        "https://cdn2.fptshop.com.vn/unsafe/800x0/anh_lisa_6_d83ab4e404.jpg",
        "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482756agE/anh-mo-ta.png",
        "https://tophinhanh.net/wp-content/uploads/2023/12/anh-kim-jisoo-cute-1.jpg",
        "https://i.pinimg.com/736x/3c/d7/24/3cd724dd754d0b42bd6599efe18ceff0.jpg"
    ];

    function getAvatarColor(name) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
    }

    function timeAgo(ts) {
        if (!ts) return '';
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        const diff = Math.floor((new Date() - date) / 1000);
        if (diff < 60)     return 'vừa xong';
        if (diff < 3600)   return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400)  return `${Math.floor(diff / 3600)} giờ trước`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    }

    function sanitize(str) {
        if (typeof str !== 'string') return '';
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    // Lấy thông tin tập phim tự động
    function getEpisodeInfo() {
        try {
            const activeEp = document.querySelector('#episode-list a.active, .episode-btn.active, .server-btn.active');
            if (activeEp) {
                let epText = activeEp.textContent.trim();
                if (/^\d+$/.test(epText)) epText = `Tập ${epText}`;
                return `P.1 - ${epText}`;
            }
        } catch(e) {}
        return '';
    }

    function getCurrentUser() {
        try {
            if (typeof authService !== 'undefined' && authService.isLoggedIn()) {
                return authService.getCurrentUser();
            }
        } catch (e) {}
        return null;
    }

    // ── FIREBASE SERVICE ──────────────────────────────────────────────
    class FirebaseComments {
        constructor() {
            this.app = null; this.db = null;
            this.ready = false; this._onReady = [];
            this._unsub = null;
            this.currentSlug = null;
            this._init();
        }
        _init() {
            const wait = () => {
                if (typeof firebase === 'undefined') { setTimeout(wait, 300); return; }
                try {
                    const ex = firebase.apps.find(a => a.name === COMMENTS_APP_NAME);
                    this.app = ex || firebase.initializeApp(COMMENTS_CONFIG, COMMENTS_APP_NAME);
                    this.db  = this.app.firestore();
                    this.ready = true;
                    this._onReady.forEach(fn => fn());
                    this._onReady = [];
                } catch (e) { console.error('[APComments]', e); }
            };
            wait();
        }
        onReady(fn) { this.ready ? fn() : this._onReady.push(fn); }
        
        _col(slug) { return this.db.collection('comments').doc(slug).collection('items'); }

        async add(slug, { name, text, isSpoiler, parentId, userEmail, avatarUrl }) {
            if (!this.db || !slug) return { ok: false, msg: 'Lỗi kết nối' };
            text = (text || '').trim();
            name = (name || 'Người dùng').trim() || 'Người dùng';
            if (text.length < 2)    return { ok: false, msg: 'Bình luận quá ngắn!' };
            if (text.length > 1000) return { ok: false, msg: 'Tối đa 1000 ký tự!' };
            
            try {
                await this._col(slug).add({
                    name, text,
                    email    : userEmail || '',
                    color    : getAvatarColor(name || userEmail || 'U'),
                    avatarUrl: avatarUrl || '',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    isSpoiler: !!isSpoiler,
                    parentId : parentId || null,
                    episodeInfo: getEpisodeInfo(),
                    likes    : 0,
                    likedBy  : [],
                    dislikedBy: []
                });
                return { ok: true };
            } catch (e) {
                return { ok: false, msg: 'Gửi thất bại, thử lại!' };
            }
        }

        async vote(slug, commentId, type, userEmail) {
            if (!this.db || !userEmail) return;
            const docRef = this._col(slug).doc(commentId);
            const { arrayUnion, arrayRemove } = firebase.firestore.FieldValue;
            
            try {
                if (type === 'up') {
                    await docRef.update({
                        likedBy: arrayUnion(userEmail),
                        dislikedBy: arrayRemove(userEmail)
                    });
                } else if (type === 'down') {
                    await docRef.update({
                        dislikedBy: arrayUnion(userEmail),
                        likedBy: arrayRemove(userEmail)
                    });
                } else if (type === 'removeUp') {
                    await docRef.update({ likedBy: arrayRemove(userEmail) });
                } else if (type === 'removeDown') {
                    await docRef.update({ dislikedBy: arrayRemove(userEmail) });
                }
            } catch (e) {}
        }

        async toggleSpoiler(slug, commentId, currentState) {
            if (!this.db) return;
            try {
                await this._col(slug).doc(commentId).update({
                    isSpoiler: !currentState
                });
            } catch (e) {}
        }

        listen(slug, cb) {
            if (!this.db) { cb({ comments: [], count: 0 }); return; }
            this.currentSlug = slug;
            if (this._unsub) this._unsub();
            
            this._unsub = this._col(slug)
                .orderBy('timestamp', 'asc').limit(COMMENT_LIMIT)
                .onSnapshot(snap => {
                    const rawList = [];
                    snap.forEach(doc => {
                        const d = doc.data();
                        rawList.push({ 
                            id: doc.id, 
                            name: d.name || 'Khách', 
                            email: d.email || '',
                            text: d.text || '',
                            color: d.color || '#f59e0b', 
                            avatarUrl: d.avatarUrl || '',
                            timestamp: d.timestamp,
                            isSpoiler: !!d.isSpoiler,
                            parentId: d.parentId || null,
                            episodeInfo: d.episodeInfo || '',
                            likedBy: d.likedBy || [],
                            dislikedBy: d.dislikedBy || []
                        });
                    });
                    
                    const parents = [];
                    const childrenMap = {};
                    
                    rawList.forEach(c => {
                        if (c.parentId) {
                            if (!childrenMap[c.parentId]) childrenMap[c.parentId] = [];
                            childrenMap[c.parentId].push(c);
                        } else {
                            parents.unshift(c); 
                        }
                    });
                    
                    parents.forEach(p => { p.replies = childrenMap[p.id] || []; });
                    cb({ comments: parents, count: snap.size });
                }, err => { cb({ comments:[], count:0 }); });
        }
        stopListen() { if (this._unsub) { this._unsub(); this._unsub = null; } }
    }

    if(!window.firebaseComments) {
        window.firebaseComments = new FirebaseComments();
    }

    // ════════════════════════════════════════════════════════════════════
    // ── UI CONTROLLER ─────────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById('ap-cmt-css-v4')) return;
        const s = document.createElement('style');
        s.id = 'ap-cmt-css-v4';
        s.textContent = `
        /* ── Wrapper ── */
        .ap-cmt-wrapper { margin-top:0; }

        /* ── BOX CHƯA ĐĂNG NHẬP (LẤY LẠI GIAO DIỆN CŨ) ── */
        .ap-cmt-guest {
            padding: 32px 20px; text-align: center;
            background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.12);
            border-radius: 16px; margin-bottom: 24px;
        }
        .ap-guest-icon { font-size: 48px; margin-bottom: 12px; color: rgba(255,255,255,0.3); }
        .ap-cmt-guest h4 { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .ap-cmt-guest p { font-size: 13px; color: #9ca3af; margin-bottom: 20px; }
        .ap-guest-btns { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
        .ap-btn-login {
            display:inline-flex; align-items:center; gap:6px;
            padding: 10px 24px; border-radius: 24px;
            background: #fcd576; color: #1a1200;
            font-weight: 700; font-size: 14px; text-decoration: none; transition: background 0.2s; border:none; cursor:pointer;
        }
        .ap-btn-login:hover { background: #e0b84e; }
        .ap-btn-register {
            display:inline-flex; align-items:center; gap:6px;
            padding: 10px 24px; border-radius: 24px;
            background: rgba(255,255,255,0.08); color: #fff;
            font-weight: 600; font-size: 14px; text-decoration: none; border: 1px solid rgba(255,255,255,0.15);
            transition: background 0.2s; cursor:pointer;
        }
        .ap-btn-register:hover { background: rgba(255,255,255,0.14); }

        /* ── BOX ĐÃ ĐĂNG NHẬP (LẤY LẠI GIAO DIỆN CŨ ĐẸP) ── */
        .ap-cmt-form-logged {
            background: #323447; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; 
            overflow: hidden; transition: border-color 0.2s ease; margin-bottom:24px;
        }
        .ap-cmt-form-logged:focus-within { border-color: rgba(255,255,255,0.55); }
        .ap-form-user-bar {
            display: flex; align-items: center; gap: 10px; padding: 12px 16px;
            border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02);
        }
        .ap-form-user-ava {
            width: 32px; height: 32px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-weight: 700; font-size: 13px; color: #fff; flex-shrink:0;
        }
        .ap-form-user-name { font-size: 13px; font-weight: 600; color: #fff; }
        .ap-form-user-badge {
            font-size: 11px; color: #10b981; font-weight:500;
            background: rgba(16,185,129,0.12); padding: 2px 8px; border-radius: 12px;
        }
        .ap-form-logout-btn {
            margin-left: auto; font-size: 11px; color: #6b7280;
            background: none; border: none; cursor: pointer;
            padding: 4px 8px; border-radius: 8px; transition: color 0.2s;
        }
        .ap-form-logout-btn:hover { color: #ef4444; }

        .ap-cmt-textarea {
            width: 100%; background: transparent; border: none; outline: none;
            color: #e5e7eb; font-size: 14px; line-height: 1.6;
            padding: 16px; resize: none; font-family: inherit;
            box-sizing: border-box; min-height: 90px;
            -webkit-appearance: none; box-shadow: none !important; border-radius: 0;
        }
        .ap-cmt-textarea::placeholder { color: #6b7280; }

        .ap-form-footer {
            display: flex; align-items: center; justify-content: space-between;
            padding: 10px 16px; border-top: 1px solid rgba(255,255,255,0.06);
        }
        
        /* Chuyển Slider UI (Spoiler Toggle) của cũ */
        .ap-spoiler-row {
            display: flex; align-items: center; gap: 10px; padding: 8px 16px; border-top: 1px solid rgba(255,255,255,0.06);
        }
        .ap-toggle-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
        .ap-toggle { position: relative; width: 36px; height: 20px; flex-shrink: 0; }
        .ap-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
        .ap-toggle-track { position: absolute; inset: 0; background: #4b5563; border-radius: 20px; transition: background 0.25s; }
        .ap-toggle input:checked + .ap-toggle-track { background: #fcd576; }
        .ap-toggle-thumb {
            position: absolute; left: 3px; top: 3px; width: 14px; height: 14px; 
            border-radius: 50%; background: #fff; transition: transform 0.25s; pointer-events: none;
        }
        .ap-toggle input:checked ~ .ap-toggle-thumb { transform: translateX(16px); }
        .ap-spoiler-label { font-size: 13px; color: #9ca3af; }
        .ap-spoiler-label.active { color: #fcd576; font-weight: 600; }

        .ap-char-count { font-size: 11px; color: #6b7280; }
        .ap-send-btn {
            display: flex; align-items: center; gap: 6px;
            padding: 8px 20px; border-radius: 20px;
            background: #fcd576; color: #1a1200;
            font-weight: 700; font-size: 13px; border: none;
            cursor: pointer; transition: all 0.2s;
        }
        .ap-send-btn:hover { background: #e0b84e; transform: scale(1.02); }
        .ap-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        
        /* ── AVATAR SELECTOR ── */
        .ap-ava-select { position: relative; margin-left: auto; display: flex; align-items: center; }
        .ap-btn-ava {
            display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px;
            background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #d1d5db;
            font-size: 13px; cursor: pointer; transition: background 0.2s;
        }
        .ap-btn-ava:hover { background: rgba(255,255,255,0.1); }
        .ap-ava-preview { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; }
        .ap-ava-dropdown {
            position: absolute; bottom: 120%; right: 0; background: #282a3a;
            border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px;
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 220px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5); opacity: 0; pointer-events: none;
            transform: translateY(10px); transition: all 0.2s ease; z-index: 100;
        }
        .ap-ava-dropdown.show { opacity: 1; pointer-events: auto; transform: translateY(0); }
        .ap-ava-option {
            width: 56px; height: 56px; border-radius: 50%; object-fit: cover; cursor: pointer;
            border: 2px solid transparent; transition: border-color 0.2s, transform 0.2s;
        }
        .ap-ava-option:hover { transform: scale(1.1); }
        .ap-ava-option.selected { border-color: #fcd576; transform: scale(1.1); }

        /* ── GIAO DIỆN BÌNH LUẬN TRẢ LỜI ĐẸP & THANH LỊCH NHƯ TIKTOK/YOUTUBE ── */
        .ap-cmt-list { display: flex; flex-direction: column; text-align: left; }
        .ap-cmt-item { display: flex; gap: 14px; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.05); animation: ap-in 0.3s ease; position:relative; align-items: flex-start; text-align: left; }
        .ap-cmt-item:last-child { border-bottom: none; }
        
        .ap-cmt-avatar { flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: #fff;}
        .ap-cmt-body { flex: 1; min-width: 0; display:flex; flex-direction:column; align-items: flex-start; text-align: left; }
        
        .ap-cmt-info { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap:wrap; width: 100%;}
        .ap-cmt-badge {
            font-size: 9px; font-weight: 700; color: #10b981; border: 1px solid rgba(16,185,129,0.5); 
            padding: 1px 5px; border-radius: 3px; background: transparent; letter-spacing: 0.5px;
        }
        .ap-cmt-name { font-weight: 700; font-size: 13px; color: #fff; display:flex; align-items:center; gap:4px; }
        .ap-cmt-name .infinity { color: #f59e0b; font-size: 15px; font-weight:bold; line-height: 1;}
        .ap-cmt-time { font-size: 11px; color: #6b7280; }
        
        .ap-ep-tag { font-size: 12px; color: #9ca3af; padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.02); margin-left:auto; }

        .ap-cmt-text { 
            font-size: 13.5px; color: #d1d5db; line-height: 1.5; margin-bottom: 8px;
            white-space: pre-wrap; word-break: break-word; transition: filter 0.3s;
            text-align: left; width: 100%;
        }
        .ap-cmt-text.is-spoiler { filter: blur(6px); cursor: pointer; user-select: none; }
        .ap-cmt-text.is-spoiler.revealed { filter: blur(0); }

        /* Action Menu - Material Icons */
        .ap-cmt-actions { display: flex; align-items: center; gap: 14px; color: #9ca3af; font-size: 12px; font-weight: 600; width: 100%;}
        .ap-action-btn { background: none; border: none; padding: 4px 6px; border-radius: 6px; color: #9ca3af; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: color 0.2s, background 0.2s;}
        .ap-action-btn:hover { color: #fff; }
        
        .ap-action-btn.upvote.active { color:#10b981; }
        .ap-action-btn.downvote.active { color:#ef4444; }

        .ap-action-btn .material-icons-round { font-size: 17px; }

        /* Dropdown Thêm */
        .ap-dropdown-wrap { position: relative; }
        .ap-dropdown-menu {
            position: absolute; bottom: 100%; left: 0; margin-bottom: 8px;
            background: #ffffff; border-radius: 8px; padding: 6px 0;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 50; min-width: 160px; pointer-events: none;
            opacity: 0; transform: translateY(10px); transition: all 0.2s ease;
        }
        .ap-dropdown-menu.show { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .ap-dropdown-item {
            display: flex; align-items: center; gap: 10px; width: 100%; text-align: left;
            padding: 10px 16px; background: none; border: none; font-size: 14px; color: #1f2937; cursor: pointer;
        }
        .ap-dropdown-item:hover { background: #f3f4f6; }
        .ap-dropdown-item .material-icons-round { font-size: 18px; color: #4b5563; }

        /* Nested Comments Layout */
        .ap-cmt-replies { margin-top: 14px; display: flex; flex-direction: column;}
        .ap-cmt-replies .ap-cmt-item { border-bottom: none; padding-top: 10px; padding-bottom:0; }
        .ap-cmt-replies .ap-cmt-avatar { width: 30px; height: 30px; font-size: 12px; }
        
        /* Form Trả lời lồng nhau */
        .ap-reply-form-container { margin-top: 16px; display: none; margin-bottom: 8px;}
        .ap-reply-form-container.active { display: block; animation: ap-in 0.2s ease; }

        @keyframes ap-in { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

        /* Toast */
        #ap-cmt-toast {
            position:fixed; bottom:80px; left:50%; transform:translateX(-50%) translateY(20px);
            padding:10px 20px; border-radius:24px; font-size:13px; font-weight:600;
            z-index:9999; opacity:0; transition:all 0.3s; white-space:nowrap;
            box-shadow:0 4px 20px rgba(0,0,0,0.3); color:#fff; pointer-events:none;
        }
        `;
        document.head.appendChild(s);
    }

    function showToast(msg, type = 'info') {
        let t = document.getElementById('ap-cmt-toast');
        if (!t) { t = document.createElement('div'); t.id = 'ap-cmt-toast'; document.body.appendChild(t); }
        t.textContent = msg;
        t.style.background = type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6';
        requestAnimationFrame(() => { t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)'; });
        clearTimeout(t._t);
        t._t = setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(20px)'; }, 3000);
    }

    // ── Generate Lại Khung Đăng Nhập / Trả Lời Cũ ────────────────────────
    function renderInputForm(boxId = null, rootId = null) {
        const user = getCurrentUser();
        const pid = boxId || 'main';
        // Tức là khi submit, nó sẽ chèn vào rootId (hoặc nếu là comment đầu thì là null)
        const submitPid = rootId || boxId || '';

        if (!user) {
            return `
            <div class="ap-cmt-guest">
                <div class="ap-guest-icon">💬</div>
                <h4>Đăng nhập để bình luận</h4>
                <p>Tham gia cộng đồng A Phim để chia sẻ cảm nhận về những bộ phim hay nhất!</p>
                <div class="ap-guest-btns">
                    <button class="ap-btn-login" onclick="window.showAuthModal && window.showAuthModal('login')">
                        <span class="material-icons-round" style="font-size:16px">login</span> Đăng nhập
                    </button>
                    <button class="ap-btn-register" onclick="window.showAuthModal && window.showAuthModal('register')">
                        <span class="material-icons-round" style="font-size:16px">person_add</span> Đăng kí tài khoản
                    </button>
                </div>
            </div>`;
        }
        
        const color   = getAvatarColor(user.name || user.email || 'U');
        const initial = sanitize((user.name || user.email || 'U').charAt(0).toUpperCase());
        const displayName = sanitize(user.name || user.email || 'Người dùng');
        const savedAva = localStorage.getItem('ap_chosen_avatar') || '';

        const avaHtml = savedAva ? `<img src="${savedAva}" class="ap-form-user-ava" id="ap-user-ava-${pid}" style="object-fit:cover;">` : `<div class="ap-form-user-ava" id="ap-user-ava-${pid}" style="background:${color}">${initial}</div>`;
        const previewHtml = savedAva ? `<img src="${savedAva}" class="ap-ava-preview" id="ap-preview-${pid}">` : `<span class="material-icons-round" style="font-size:18px" id="ap-preview-${pid}">account_circle</span>`;

        let optionsHtml = '';
        AVATAR_LIST.forEach(link => {
            optionsHtml += `<img src="${link}" class="ap-ava-option ${savedAva === link ? 'selected' : ''}" onclick="window.selectAvatar('${link}', '${pid}')">`;
        });

        return `
        <div class="ap-cmt-form-logged">
            <div class="ap-form-user-bar">
                ${avaHtml}
                <span class="ap-form-user-name">${displayName}</span>
                <span class="ap-form-user-badge">✓ Đã đăng nhập</span>
                <button class="ap-form-logout-btn" onclick="try{ authService.logout(); } catch(e){ window.location.href = 'login.html'; }">Đăng xuất</button>
            </div>
            <textarea class="ap-cmt-textarea" id="ap-input-${pid}" placeholder="Chia sẻ cảm nhận của bạn về bộ phim này..." maxlength="1000"></textarea>
            <div class="ap-spoiler-row">
                <label class="ap-toggle-wrap">
                    <span class="ap-toggle">
                        <input type="checkbox" id="ap-spoiler-${pid}" onchange="this.parentElement.nextElementSibling.classList.toggle('active', this.checked)">
                        <span class="ap-toggle-track"></span>
                        <span class="ap-toggle-thumb"></span>
                    </span>
                    <span class="ap-spoiler-label">Tiết lộ nội dung?</span>
                </label>
            </div>
            <div class="ap-form-footer">
                <span class="ap-char-count" id="ap-count-${pid}">0 / 1000</span>
                <div class="ap-ava-select" id="ap-ava-select-${pid}">
                    <button class="ap-btn-ava" onclick="document.getElementById('ap-ava-drop-${pid}').classList.toggle('show')">
                        ${previewHtml} Chọn đổi ảnh
                    </button>
                    <div class="ap-ava-dropdown" id="ap-ava-drop-${pid}">
                        ${optionsHtml}
                    </div>
                </div>
                <button class="ap-send-btn" onclick="window.submitComment('${submitPid}', '${pid}')" id="ap-btn-${pid}" disabled style="margin-left:12px;">
                    Gửi <span class="material-icons-round" style="font-size:16px">send</span>
                </button>
            </div>
        </div>
        `;
    }

    // ── Generate Comment List Item ───────────────────────────────────
    function generateHtml(c, userEmail, isChild = false, rootId = null) {
        const initial = sanitize((c.name || 'K').charAt(0).toUpperCase());
        const tAgo = sanitize(timeAgo(c.timestamp));
        const txt = sanitize(c.text);
        
        const liked = userEmail && c.likedBy.includes(userEmail);
        const disliked = userEmail && c.dislikedBy.includes(userEmail);

        const badgeHtml = `<span class="ap-cmt-badge">ROX</span>`; 
        const currentRootId = rootId || c.id;

        let repliesHtml = '';
        if (c.replies && c.replies.length > 0) {
            repliesHtml = `<div class="ap-cmt-replies">${c.replies.map(r => generateHtml(r, userEmail, true, currentRootId)).join('')}</div>`;
        }

        // Like count
        const likeCountStr = c.likedBy.length > 0 ? c.likedBy.length : '';
        const userAva = c.avatarUrl ? `<img src="${sanitize(c.avatarUrl)}" class="ap-cmt-avatar" style="object-fit:cover;">` : `<div class="ap-cmt-avatar" style="background:${sanitize(c.color)}">${initial}</div>`;

        return `
        <div class="ap-cmt-item" data-id="${c.id}">
            ${userAva}
            <div class="ap-cmt-body">
                <div class="ap-cmt-info">
                    ${badgeHtml}
                    <span class="ap-cmt-name">${sanitize(c.name)} <span class="infinity">∞</span></span>
                    <span class="ap-cmt-time">${tAgo}</span>
                    ${!isChild && c.episodeInfo ? `<span class="ap-ep-tag">${sanitize(c.episodeInfo)}</span>` : ''}
                </div>
                
                <div class="ap-cmt-text ${c.isSpoiler ? 'is-spoiler' : ''}" onclick="this.classList.add('revealed')">${c.isSpoiler ? '<span class="material-icons-round" style="font-size:14px;vertical-align:middle">visibility_off</span> [Nội dung bị ẩn] CLICK ĐỂ XEM<br>' : ''}${txt}</div>
                
                <div class="ap-cmt-actions">
                    <button class="ap-action-btn upvote ${liked ? 'active' : ''}" onclick="window.actionVote('${c.id}', 'up')">
                        <span class="material-icons-round">arrow_circle_up</span> ${likeCountStr}
                    </button>
                    <button class="ap-action-btn downvote ${disliked ? 'active' : ''}" onclick="window.actionVote('${c.id}', 'down')">
                        <span class="material-icons-round">arrow_circle_down</span>
                    </button>
                    <button class="ap-action-btn" onclick="window.actionReplyToggle('${c.id}', '${currentRootId}')">
                        <span class="material-icons-round" style="transform: scaleX(-1)">reply</span> Trả lời
                    </button>
                    
                    <div class="ap-dropdown-wrap">
                        <button class="ap-action-btn" onclick="window.actionToggleMore('${c.id}')">
                            <span class="material-icons-round">more_horiz</span> Thêm
                        </button>
                        <div class="ap-dropdown-menu" id="ap-menu-${c.id}">
                            <button class="ap-dropdown-item" onclick="window.actionToggleSpoiler('${c.id}', ${c.isSpoiler})">
                                <span class="material-icons-round">visibility</span> Tiết lộ nội dung
                            </button>
                            <button class="ap-dropdown-item" onclick="showToast('Đã gửi báo cáo!', 'success'); document.getElementById('ap-menu-${c.id}').classList.remove('show');">
                                <span class="material-icons-round">flag</span> Báo xấu
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="ap-reply-form-container" id="reply-form-${c.id}"></div>

                ${repliesHtml}
            </div>
        </div>
        `;
    }

    // ── Global Handlers for clicks ────────────────────────────────────
    window.actionReplyToggle = function(clickId, rootId) {
        const user = getCurrentUser();
        if (!user) { window.showAuthModal && window.showAuthModal('login'); return; }

        if(!rootId) rootId = clickId;

        const box = document.getElementById(`reply-form-${clickId}`);
        if (!box) return;
        
        document.querySelectorAll('.ap-reply-form-container.active').forEach(el => {
            if (el.id !== `reply-form-${clickId}`) {
                el.innerHTML = ''; el.classList.remove('active');
            }
        });

        if (box.classList.contains('active')) {
            box.innerHTML = ''; box.classList.remove('active');
        } else {
            box.innerHTML = renderInputForm(clickId, rootId);
            box.classList.add('active');
            setupInputEvents(clickId);
            document.getElementById(`ap-input-${clickId}`).focus();
        }
    }

    window.actionToggleMore = function(commentId) {
        const mId = `ap-menu-${commentId}`;
        document.querySelectorAll('.ap-dropdown-menu').forEach(menu => {
            if (menu.id !== mId) menu.classList.remove('show');
        });
        const m = document.getElementById(mId);
        if (m) m.classList.toggle('show');
    }

    window.selectAvatar = function(url, pid) {
        localStorage.setItem('ap_chosen_avatar', url);
        document.querySelectorAll(`#ap-ava-drop-${pid} .ap-ava-option`).forEach(img => img.classList.remove('selected'));
        event.target.classList.add('selected');
        
        const preview = document.getElementById(`ap-preview-${pid}`);
        if(preview) {
            if(preview.tagName === 'SPAN') {
                preview.outerHTML = `<img src="${url}" class="ap-ava-preview" id="ap-preview-${pid}">`;
            } else {
                preview.src = url;
            }
        }
        document.getElementById(`ap-ava-drop-${pid}`).classList.remove('show');
        
        // Cập nhật DOM ảnh đại diện ở bar góc trên (Bar User) cho tất cả các form hiện tại
        document.querySelectorAll('div[id^="ap-user-ava-"], img[id^="ap-user-ava-"]').forEach(barAva => {
            if(barAva.tagName === 'DIV') {
                barAva.outerHTML = `<img src="${url}" class="ap-form-user-ava" id="${barAva.id}" style="object-fit:cover;">`;
            } else {
                barAva.src = url;
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.ap-dropdown-wrap')) {
            document.querySelectorAll('.ap-dropdown-menu.show').forEach(m => m.classList.remove('show'));
        }
        if (!e.target.closest('.ap-ava-select')) {
            document.querySelectorAll('.ap-ava-dropdown.show').forEach(m => m.classList.remove('show'));
        }
    });

    window.actionVote = async function(commentId, type) {
        const user = getCurrentUser();
        if (!user) { window.showAuthModal && window.showAuthModal('login'); return; }
        const btn = event.currentTarget;
        const isActive = btn.classList.contains('active');
        const trueType = isActive ? (type==='up'?'removeUp':'removeDown') : type;
        await window.firebaseComments.vote(window.firebaseComments.currentSlug, commentId, trueType, user.email);
    }

    window.actionToggleSpoiler = async function(commentId, isCurrentlySpoiler) {
        const user = getCurrentUser();
        if(!user) return;
        await window.firebaseComments.toggleSpoiler(window.firebaseComments.currentSlug, commentId, isCurrentlySpoiler);
        document.getElementById(`ap-menu-${commentId}`).classList.remove('show');
        showToast('Đã cập nhật trạng thái hiển thị!', 'success');
    }

    window.submitComment = async function(submitParentId, boxId) {
        const user = getCurrentUser();
        if (!user) return;
        const slug = window.firebaseComments.currentSlug;
        const pid = boxId || 'main';
        const avatarUrl = localStorage.getItem('ap_chosen_avatar') || '';
        
        const ta = document.getElementById(`ap-input-${pid}`);
        const text = ta.value.trim();
        const sc = document.getElementById(`ap-spoiler-${pid}`);
        const isSpoiler = sc ? sc.checked : false;
        
        const btn = document.getElementById(`ap-btn-${pid}`);
        if(btn) { btn.disabled = true; btn.innerHTML = 'Đang gửi...'; }

        const res = await window.firebaseComments.add(slug, {
            name: user.name, userEmail: user.email, text, isSpoiler, parentId: submitParentId || null, avatarUrl
        });

        if (res.ok) {
            ta.value = '';
            if (boxId && boxId !== 'main') {
                const b = document.getElementById(`reply-form-${boxId}`);
                if (b) { b.classList.remove('active'); b.innerHTML = ''; }
            }
            showToast('Bình luận đã được gửi! ✅', 'success');
        } else {
            showToast(res.msg, 'error');
            if(btn) { btn.disabled = false; btn.innerHTML = 'Gửi <span class="material-icons-round" style="font-size:16px">send</span>'; }
        }
    }

    // ── Input Length Helper ────────────────────────────────────
    function setupInputEvents(idSuffix) {
        const ta = document.getElementById(`ap-input-${idSuffix}`);
        const c  = document.getElementById(`ap-count-${idSuffix}`);
        const sb = document.getElementById(`ap-btn-${idSuffix}`);
        if(!ta || !c || !sb) return;
        ta.addEventListener('input', () => {
            const l = ta.value.trim().length;
            c.textContent = `${l} / 1000`;
            c.style.color = l > 900 ? '#ef4444' : l > 700 ? '#f59e0b' : '#6b7280';
            sb.disabled = l < 1;
        });
    }

    // ── Khởi Tạo Chính ──────────────────────────────────────────────────
    function initCommentUI() {
        const params = new URLSearchParams(window.location.search);
        let slug = params.get('slug');
        if(!slug) {
            const m = window.location.pathname.match(/\/phim\/([^\/]+)/);
            if(m) slug = m[1];
        }
        if (!slug && window.location.pathname.includes('watch.html')) slug = 'demo-cam-nang-yeu';
        if (!slug) return;

        const section = document.getElementById('comments-section');
        if (!section) return;

        injectStyles();
        window._apInitComment = initCommentUI;

        const innerBox = section.querySelector('.mt-8') || section.querySelector('div');
        if (!innerBox) return;

        const heading = innerBox.querySelector('h3');
        Array.from(innerBox.children).forEach(child => { if (child !== heading) child.remove(); });

        const wrapper = document.createElement('div');
        wrapper.className = 'ap-cmt-wrapper';
        innerBox.appendChild(wrapper);

        // FORM MAIN
        const formWrap = document.createElement('div');
        formWrap.innerHTML = renderInputForm(null);
        wrapper.appendChild(formWrap);
        setupInputEvents('main');

        // LIST
        const listEl = document.createElement('div');
        listEl.className = 'ap-cmt-list';
        listEl.innerHTML = '<div style="text-align:center;color:#6b7280;padding:20px;">⏳ Đang tải bình luận...</div>';
        wrapper.appendChild(listEl);

        const user = getCurrentUser();
        const userEmail = user ? user.email : null;

        // Firebase Sync
        window.firebaseComments.onReady(() => {
            window.firebaseComments.listen(slug, ({ comments, count }) => {
                if (heading) heading.innerHTML = `<span class="material-icons-round text-primary outline-none">sentiment_satisfied_alt</span> Bình luận (${count})`;
                if (comments.length === 0) {
                    listEl.innerHTML = '<div style="text-align:center;color:#6b7280;padding:20px;">💬 Hãy là người đầu tiên bình luận!</div>';
                } else {
                    listEl.innerHTML = comments.map(c => generateHtml(c, userEmail, false)).join('');
                }
                setupInputEvents('main');
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCommentUI);
    } else {
        setTimeout(initCommentUI, 100);
    }

    window.addEventListener('beforeunload', () => {
        if (window.firebaseComments) window.firebaseComments.stopListen();
    });

})();
