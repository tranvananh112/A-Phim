/**
 * A PHIM - Chat Widget Controller  v3.0  (Firebase Realtime)
 * Flow: Welcome → Enter Name → Chat Room (Firestore realtime)
 */

class APFilmChat {
    constructor() {
        this.currentScreen = 'welcome'; // welcome | enterName | room
        this.currentTab    = 'general';
        this.userName      = '';
        this.userColor     = '#ffd709';
        this.userId        = this._genUserId();
        this.isMinimized   = false;
        this.isOpen        = false;
        this.unreadCount   = 0;
        this._stopPresence = null; // unsubscribe fn
        this._isMaximized  = false;
        this._defaultW     = 390;
        this._defaultH     = 600;

        this.emojis = [
            '😀','😄','😆','😅','😂','🤣','😊','😇',
            '🥰','😍','🤩','😘','😋','😎','🤓','🥳',
            '😏','😒','😞','😔','😢','😭','😤','😡',
            '👍','👎','👏','🙌','🤝','💪','❤️','🔥',
            '⭐','🎬','🍿','🎭','🎥','📽️','🎞️','🎉',
            '🤔','💯','✅','❌','🔴','🟡','🟢','✨',
        ];

        this._init();
    }

    _init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._setup());
        } else {
            this._setup();
        }
    }

    _setup() {
        this._cacheDOM();
        if (!this.el.fab) return;

        this._buildEmojiGrid();
        this._restoreUser();
        this._attachEvents();
        this._initDragResize();
        this._initMobileKeyboardFix();
        this._initMobileResize();

        // Init screens
        if (this.userName) {
            this._showScreen('room');
            this._updateUserDisplay();
            this._enterRoomFirebase();
        } else {
            this._showScreen('welcome');
        }
    }

    /* ── DOM Cache ─────────────────────────────────────────── */
    _cacheDOM() {
        const $ = id => document.getElementById(id);
        this.el = {
            fab              : $('chatFab'),
            fabBadge         : $('chatFabBadge'),
            window           : $('chatWindow'),
            body             : $('chatBody'),
            inputArea        : $('chatInputArea'),
            header           : $('chatHeader'),
            minimizeBtn      : $('chatMinimizeBtn'),
            closeBtn         : $('chatCloseBtn'),
            headerOnline     : $('headerOnlineCount'),
            screenWelcome    : $('screenWelcome'),
            screenName       : $('screenEnterName'),
            screenRoom       : $('screenRoom'),
            screenSupport    : $('screenSupport'),
            supportStartTawk : $('supportStartTawk'),
            welcomeStart     : $('welcomeStartBtn'),
            welcomeOnline    : $('welcomeOnline'),
            backBtn          : $('enterNameBackBtn'),
            colorRow         : $('colorPickerRow'),
            nameInput        : $('chatNameInput'),
            nameCharCount    : $('nameCharCount'),
            nameError        : $('nameErrorMsg'),
            previewAvatar    : $('previewAvatar'),
            previewName      : $('previewName'),
            joinBtn          : $('chatJoinBtn'),
            messagesArea     : $('messagesArea'),
            typingIndicator  : $('typingIndicator'),
            quickReactions   : $('quickReactions'),
            tabs             : document.querySelectorAll('.chat-tab'),
            messageInput     : $('chatMessageInput'),
            sendBtn          : $('chatSendBtn'),
            emojiToggle      : $('emojiToggleBtn'),
            emojiPanel       : $('emojiPickerPanel'),
            emojiGrid        : $('emojiGrid'),
            currentUserAvatar: $('currentUserAvatar'),
            currentUserName  : $('currentUserName'),
            changeNameLink   : $('changeNameLink'),
        };
    }

    /* ── Emoji ─────────────────────────────────────────────── */
    _buildEmojiGrid() {
        if (!this.el.emojiGrid) return;
        this.el.emojiGrid.innerHTML = this.emojis
            .map(e => `<div class="emoji-cell" data-emoji="${e}">${e}</div>`)
            .join('');
    }

    /* ── User Persistence ──────────────────────────────────── */
    _restoreUser() {
        try {
            const saved = localStorage.getItem('aphim_chat_user');
            if (saved) {
                const { name, color, uid } = JSON.parse(saved);
                this.userName  = name  || '';
                this.userColor = color || '#ffd709';
                if (uid) this.userId = uid;
            }
        } catch (e) { /* ignore */ }
    }

    _saveUser() {
        try {
            localStorage.setItem('aphim_chat_user', JSON.stringify({
                name : this.userName,
                color: this.userColor,
                uid  : this.userId,
            }));
        } catch (e) { /* ignore */ }
    }

    _genUserId() {
        try {
            let uid = localStorage.getItem('aphim_uid');
            if (!uid) {
                uid = 'u_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
                localStorage.setItem('aphim_uid', uid);
            }
            return uid;
        } catch (e) {
            return 'u_' + Math.random().toString(36).slice(2, 10);
        }
    }

    /* ── Events ────────────────────────────────────────────── */
    _attachEvents() {
        const el = this.el;

        el.fab?.addEventListener('click', () => this.open());
        el.closeBtn?.addEventListener('click', () => this.close());
        el.minimizeBtn?.addEventListener('click', () => this.toggleMinimize());
        el.header?.addEventListener('click', e => {
            if (this.isMinimized && !e.target.closest('button')) this.toggleMinimize();
        });

        // Welcome → Enter Name
        el.welcomeStart?.addEventListener('click', () => this._showScreen('enterName'));

        // Enter Name → Welcome (back)
        el.backBtn?.addEventListener('click', () => this._showScreen('welcome'));

        // Color picker
        el.colorRow?.querySelectorAll('.color-option').forEach(opt => {
            opt.addEventListener('click', () => {
                el.colorRow.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                this.userColor = opt.dataset.color;
                this._updatePreview();
            });
        });

        // Name input
        el.nameInput?.addEventListener('input', () => {
            const val = el.nameInput.value;
            el.nameCharCount.textContent = `${val.length} / 20`;
            this._updatePreview();
            this._validateName();
        });

        // Join button + Enter key
        el.joinBtn?.addEventListener('click', () => this._joinRoom());
        el.nameInput?.addEventListener('keydown', e => {
            if (e.key === 'Enter') this._joinRoom();
        });

        // Tab switch
        el.tabs?.forEach(tab => {
            tab.addEventListener('click', () => this._switchTab(tab.dataset.tab));
        });

        // Message input
        el.messageInput?.addEventListener('input', () => {
            el.sendBtn.disabled = el.messageInput.value.trim() === '';
        });
        el.messageInput?.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this._sendMessage();
            }
        });
        el.sendBtn?.addEventListener('click', () => this._sendMessage());

        // Quick reactions
        el.quickReactions?.querySelectorAll('.quick-react-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.userName) this._sendMessageText(btn.dataset.text);
            });
        });

        // Emoji
        el.emojiToggle?.addEventListener('click', e => {
            e.stopPropagation();
            el.emojiPanel?.classList.toggle('show');
        });
        el.emojiGrid?.addEventListener('click', e => {
            const cell = e.target.closest('.emoji-cell');
            if (cell && el.messageInput) {
                el.messageInput.value += cell.dataset.emoji;
                el.messageInput.focus();
                el.sendBtn.disabled = false;
                el.emojiPanel?.classList.remove('show');
            }
        });
        document.addEventListener('click', e => {
            if (el.emojiPanel && !el.emojiPanel.contains(e.target) && e.target !== el.emojiToggle) {
                el.emojiPanel.classList.remove('show');
            }
        });

        // Change name
        el.changeNameLink?.addEventListener('click', () => this._showScreen('enterName'));

        // Support screen: nút mở Tawk.to popup
        el.supportStartTawk?.addEventListener('click', () => {
            if (typeof window.showTawkTo === 'function') {
                window.showTawkTo();
            } else if (typeof Tawk_API !== 'undefined' && Tawk_API.maximize) {
                Tawk_API.showWidget();
                Tawk_API.maximize();
            } else {
                window.open('https://tawk.to/chat/69c7d8abf493031c356334cf/1jkqaco0t', '_blank');
            }
        });
    }

    /* ── Screen Management ─────────────────────────────────── */
    _showScreen(name) {
        const map = {
            welcome  : this.el.screenWelcome,
            enterName: this.el.screenName,
            room     : this.el.screenRoom,
        };

        Object.entries(map).forEach(([key, el]) => {
            if (!el) return;
            el.classList.toggle('active', key === name);
        });

        this.currentScreen = name;

        // Input area only visible in room
        if (this.el.inputArea) {
            this.el.inputArea.style.display = name === 'room' ? 'block' : 'none';
        }

        if (this.el.body) {
            this.el.body.style.overflow = name === 'room' ? 'hidden' : 'auto';
        }

        if (name === 'enterName' && this.el.nameInput) {
            setTimeout(() => this.el.nameInput.focus(), 350);
            if (this.userName) {
                this.el.nameInput.value = this.userName;
                if (this.el.nameCharCount) this.el.nameCharCount.textContent = `${this.userName.length} / 20`;
                this._updatePreview();
                if (this.el.joinBtn) this.el.joinBtn.disabled = false;
            }
            this.el.colorRow?.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.toggle('selected', opt.dataset.color === this.userColor);
            });
        }

        if (name === 'room') {
            this._scrollToBottom();
        }
    }

    /* ── Name Validation ───────────────────────────────────── */
    _validateName() {
        const val   = (this.el.nameInput?.value || '').trim();
        const regex = /^[a-zA-Z0-9_\sÀ-ỹ]+$/;
        const valid = val.length >= 3 && val.length <= 20 && regex.test(val);

        if (val.length > 0 && !valid) {
            this.el.nameInput?.classList.add('error');
            this.el.nameError?.classList.add('show');
        } else {
            this.el.nameInput?.classList.remove('error');
            this.el.nameError?.classList.remove('show');
        }

        if (this.el.joinBtn) this.el.joinBtn.disabled = !valid;
        return valid;
    }

    _updatePreview() {
        const val    = (this.el.nameInput?.value || '').trim();
        const letter = val ? val.charAt(0).toUpperCase() : 'A';

        if (this.el.previewAvatar) {
            this.el.previewAvatar.style.background = this.userColor;
            this.el.previewAvatar.textContent = letter;
        }
        if (this.el.previewName) {
            this.el.previewName.textContent = val || 'Biệt danh của bạn';
        }
    }

    /* ── Join Room ─────────────────────────────────────────── */
    _joinRoom() {
        if (!this._validateName()) return;

        this.userName = (this.el.nameInput?.value || '').trim();
        this._saveUser();
        this._updateUserDisplay();
        this._showScreen('room');
        this._enterRoomFirebase();

        // System announcement
        this._appendSystemMessage(`🎉 <strong>${this._esc(this.userName)}</strong> vừa tham gia phòng chat!`);
    }

    _updateUserDisplay() {
        const letter = this.userName ? this.userName.charAt(0).toUpperCase() : 'A';
        if (this.el.currentUserAvatar) {
            this.el.currentUserAvatar.style.background = this.userColor;
            this.el.currentUserAvatar.textContent = letter;
        }
        if (this.el.currentUserName) {
            this.el.currentUserName.textContent = this.userName || 'Khách';
        }
    }

    /* ── Firebase: Enter Room ──────────────────────────────── */
    _enterRoomFirebase() {
        const init = () => {
            // Start presence tracking
            if (this._stopPresence) this._stopPresence();
            this._stopPresence = window.firebaseChat.trackPresence(
                this.userId,
                count => {
                    const fmt = count.toLocaleString('vi-VN');
                    if (this.el.headerOnline)  this.el.headerOnline.textContent  = `${fmt} người trực tuyến`;
                    if (this.el.welcomeOnline) this.el.welcomeOnline.textContent = fmt;
                }
            );

            // Load tab messages
            this._listenTab(this.currentTab);
        };

        if (window.firebaseChat?.ready) {
            init();
        } else {
            window.firebaseChat?.onReady(init);
        }
    }

    /* ── Firebase: Listen Tab ──────────────────────────────── */
    _listenTab(tab) {
        if (!window.firebaseChat?.ready) return;

        window.firebaseChat.listenMessages(tab, this.userName, msgs => {
            this._renderAllMessages(msgs);
        });
    }

    /* ── Tab Switch ────────────────────────────────────────── */
    _switchTab(tabName) {
        // Tab Hỗ trợ → hiện màn hình Support (screen 4) bên trong widget
        if (tabName === 'support') {
            this.currentTab = 'support';
            // Đánh dấu tab active
            this.el.tabs?.forEach(tab => {
                tab.classList.toggle('active', tab.dataset.tab === 'support');
            });
            // Ẩn room, hiện màn support  
            this.el.screenRoom?.classList.remove('active');
            this.el.screenSupport?.classList.add('active');
            // Chỉ ẩn phần input gõ tin, giữ nguyên thanh tab
            const inputRow = this.el.inputArea?.querySelector('.input-row');
            const inputFooter = this.el.inputArea?.querySelector('.input-footer');
            if (inputRow) inputRow.style.display = 'none';
            if (inputFooter) inputFooter.style.display = 'none';
            return;
        }

        // Khi chuyển từ support về tab khác: ẩn support screen, hiện room
        if (this.currentTab === 'support') {
            this.el.screenSupport?.classList.remove('active');
            this.el.screenRoom?.classList.add('active');
            // Hiện lại phần input gõ tin
            const inputRow = this.el.inputArea?.querySelector('.input-row');
            const inputFooter = this.el.inputArea?.querySelector('.input-footer');
            if (inputRow) inputRow.style.display = '';
            if (inputFooter) inputFooter.style.display = '';
        }

        this.currentTab = tabName;
        this.el.tabs?.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Clear messages and re-listen Firebase
        this._clearMessages();
        this._listenTab(tabName);
    }

    /* ── Render All Messages (from Firebase snapshot) ─────── */
    _renderAllMessages(msgs) {
        if (!this.el.messagesArea) return;

        // Clear existing dynamic messages (keep date separator + sys msg)
        const existing = this.el.messagesArea.querySelectorAll('.msg-group, .msg-firebase');
        existing.forEach(m => m.remove());

        msgs.forEach(msg => {
            this._appendMessage(msg, false);
        });

        this._scrollToBottom();
    }

    _clearMessages() {
        if (!this.el.messagesArea) return;
        const existing = this.el.messagesArea.querySelectorAll('.msg-group, .msg-firebase');
        existing.forEach(m => m.remove());
    }

    /* ── Send Message ──────────────────────────────────────── */
    _sendMessage() {
        const text = (this.el.messageInput?.value || '').trim();
        if (!text || !this.userName) return;
        this._sendMessageText(text);
        if (this.el.messageInput) this.el.messageInput.value = '';
        if (this.el.sendBtn) this.el.sendBtn.disabled = true;
        if (this.el.emojiPanel) this.el.emojiPanel.classList.remove('show');
    }

    _sendMessageText(text) {
        if (!text || !this.userName) return;

        const msg = {
            user : this.userName,
            color: this.userColor,
            text,
        };

        if (window.firebaseChat?.ready) {
            window.firebaseChat.sendMessage(this.currentTab, msg);
        } else {
            // Offline fallback: show locally
            this._appendMessage({ ...msg, time: this._now(), isOwn: true });
            window.firebaseChat?.onReady(() => {
                window.firebaseChat.sendMessage(this.currentTab, msg);
            });
        }

        // Support tab auto-reply
        if (this.currentTab === 'support') {
            this._showTyping();
            setTimeout(() => {
                this._hideTyping();
                const replies = [
                    'Cảm ơn bạn! Đội hỗ trợ sẽ phản hồi sớm nhất có thể. 🙏',
                    'Đã nhận được! Hãy mô tả thêm chi tiết nhé bạn.',
                    'Chúng tôi đang xem xét vấn đề của bạn, sẽ có phản hồi trong vài phút!',
                ];
                const reply = {
                    user : 'Admin A Phim',
                    color: '#ffd709',
                    text : replies[Math.floor(Math.random() * replies.length)],
                };
                window.firebaseChat?.sendMessage('support', reply);
            }, 2000);
        }
    }

    /* ── Render Message Bubble ─────────────────────────────── */
    _appendMessage(msg, doScroll = true) {
        if (!this.el.messagesArea) return;

        const letter = msg.user ? msg.user.charAt(0).toUpperCase() : '?';
        const own    = msg.isOwn ? 'own' : '';
        const time   = msg.time || this._now();

        const div = document.createElement('div');
        div.className = `msg-group msg-firebase ${own}`;
        div.innerHTML = `
            <div class="msg-avatar" style="background:${this._esc(msg.color || '#ffd709')};color:rgba(0,0,0,0.7);">${letter}</div>
            <div class="msg-content">
                ${!msg.isOwn ? `<div class="msg-name">${this._esc(msg.user)}</div>` : ''}
                <div class="msg-bubble">${this._esc(msg.text)}</div>
                <div class="msg-meta"><span class="msg-time">${time}</span></div>
            </div>
        `;

        const typing = this.el.typingIndicator;
        if (typing) {
            this.el.messagesArea.insertBefore(div, typing);
        } else {
            this.el.messagesArea.appendChild(div);
        }

        if (doScroll) this._scrollToBottom();
    }

    _appendSystemMessage(html) {
        if (!this.el.messagesArea) return;
        const div = document.createElement('div');
        div.className = 'sys-msg msg-firebase';
        div.innerHTML = `<span>${html}</span>`;
        const typing = this.el.typingIndicator;
        if (typing) {
            this.el.messagesArea.insertBefore(div, typing);
        } else {
            this.el.messagesArea.appendChild(div);
        }
    }

    /* ── Typing Indicator ──────────────────────────────────── */
    _showTyping() { this.el.typingIndicator?.classList.add('show'); this._scrollToBottom(); }
    _hideTyping() { this.el.typingIndicator?.classList.remove('show'); }

    /* ── Scroll ────────────────────────────────────────────── */
    _scrollToBottom() {
        if (this.el.messagesArea) {
            this.el.messagesArea.scrollTop = this.el.messagesArea.scrollHeight;
        }
    }

    /* ── Window Controls ───────────────────────────────────── */
    open() {
        if (!this.el.window) return;
        this.isOpen = true;
        this._resetWindowBounds();
        this.el.window.classList.add('active');
        if (this.el.fab) this.el.fab.style.display = 'none';
        this._resetUnread();
        if (this.currentScreen === 'room') this._scrollToBottom();
    }

    _resetWindowBounds() {
        const win = this.el.window;
        win.style.width  = '';
        win.style.height = '';
        win.style.left   = '';
        win.style.top    = '';
        win.style.right  = '';
        win.style.bottom = '';
        this._isMaximized = false;
        const icon = this.el.maximizeBtn?.querySelector('.material-icons');
        if (icon) icon.textContent = 'open_in_full';
    }

    close() {
        if (!this.el.window) return;
        this.isOpen = false;
        this.el.window.classList.remove('active');
        if (this.el.fab) this.el.fab.style.display = '';
        this.isMinimized = false;
        this.el.window.classList.remove('minimized');
    }

    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.el.window?.classList.toggle('minimized', this.isMinimized);
        if (this.el.minimizeBtn) {
            const icon = this.el.minimizeBtn.querySelector('.material-icons');
            if (icon) icon.textContent = this.isMinimized ? 'open_in_full' : 'remove';
        }
    }

    /* ── Unread Badge ──────────────────────────────────────── */
    _addUnread() {
        this.unreadCount++;
        if (this.el.fabBadge) {
            this.el.fabBadge.textContent = this.unreadCount;
            this.el.fabBadge.classList.add('show');
        }
    }

    _resetUnread() {
        this.unreadCount = 0;
        if (this.el.fabBadge) this.el.fabBadge.classList.remove('show');
    }

    /* ── Helpers ───────────────────────────────────────────── */
    _now() {
        return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }

    _esc(str) {
        if (!str) return '';
        const d = document.createElement('div');
        d.textContent = String(str);
        return d.innerHTML;
    }

    /* ── Drag & Resize (Desktop only) ─────────────────────── */
    _initDragResize() {
        if (window.innerWidth <= 768) return;
        this._addResizeHandles();
        this._addMaximizeBtn();
        this._attachDragMove();
        this._attachResize();
    }

    _addResizeHandles() {
        const dirs = ['n','ne','e','se','s','sw','w','nw'];
        dirs.forEach(d => {
            const h = document.createElement('div');
            h.className = `cr-resize-handle cr-resize-${d}`;
            h.dataset.dir = d;
            this.el.window.appendChild(h);
        });
    }

    _addMaximizeBtn() {
        if (document.getElementById('chatMaximizeBtn')) return;
        const btn = document.createElement('button');
        btn.className = 'chat-header-btn';
        btn.id = 'chatMaximizeBtn';
        btn.title = 'Phóng to / Thu nhỏ';
        btn.innerHTML = '<span class="material-icons">open_in_full</span>';
        btn.addEventListener('click', () => this._toggleMaximize());
        this.el.minimizeBtn?.parentElement?.insertBefore(btn, this.el.minimizeBtn);
        this.el.maximizeBtn = btn;
    }

    _toggleMaximize() {
        const win = this.el.window;
        if (this._isMaximized) {
            win.style.width  = this._defaultW + 'px';
            win.style.height = this._defaultH + 'px';
            win.style.left   = '';
            win.style.top    = '';
            win.style.right  = '28px';
            win.style.bottom = '100px';
            this._isMaximized = false;
            const icon = this.el.maximizeBtn?.querySelector('.material-icons');
            if (icon) icon.textContent = 'open_in_full';
            win.classList.remove('cr-maximized');
        } else {
            const margin = 16;
            win.style.left   = margin + 'px';
            win.style.top    = margin + 'px';
            win.style.right  = '';
            win.style.bottom = '';
            win.style.width  = (window.innerWidth  - margin * 2) + 'px';
            win.style.height = (window.innerHeight - margin * 2) + 'px';
            this._isMaximized = true;
            const icon = this.el.maximizeBtn?.querySelector('.material-icons');
            if (icon) icon.textContent = 'close_fullscreen';
            win.classList.add('cr-maximized');
        }
    }

    _attachDragMove() {
        const header = this.el.header;
        const win    = this.el.window;
        let dragging = false, ox = 0, oy = 0;

        header.addEventListener('mousedown', e => {
            if (e.target.closest('button') || this._isMaximized) return;
            const r = win.getBoundingClientRect();
            win.style.left   = r.left + 'px';
            win.style.top    = r.top  + 'px';
            win.style.right  = '';
            win.style.bottom = '';
            ox = e.clientX - r.left;
            oy = e.clientY - r.top;
            dragging = true;
            win.classList.add('cr-dragging');
            this._blockSelect(true);
        });

        document.addEventListener('mousemove', e => {
            if (!dragging) return;
            let nx = e.clientX - ox;
            let ny = e.clientY - oy;
            nx = Math.max(0, Math.min(nx, window.innerWidth  - win.offsetWidth));
            ny = Math.max(0, Math.min(ny, window.innerHeight - 60));
            win.style.left = nx + 'px';
            win.style.top  = ny + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (!dragging) return;
            dragging = false;
            win.classList.remove('cr-dragging');
            this._blockSelect(false);
        });
    }

    _attachResize() {
        const win = this.el.window;
        const MIN_W = 300, MIN_H = 400;
        let resizing = false, dir = '', sx, sy, sw, sh, sl, st;

        win.addEventListener('mousedown', e => {
            const h = e.target.closest('.cr-resize-handle');
            if (!h || this._isMaximized) return;
            e.preventDefault();
            dir = h.dataset.dir;
            resizing = true;
            const r = win.getBoundingClientRect();
            sx = e.clientX; sy = e.clientY;
            sw = r.width;   sh = r.height;
            sl = r.left;    st = r.top;
            win.style.left   = sl + 'px';
            win.style.top    = st + 'px';
            win.style.right  = '';
            win.style.bottom = '';
            win.style.width  = sw + 'px';
            win.style.height = sh + 'px';
            this._blockSelect(true);
        });

        document.addEventListener('mousemove', e => {
            if (!resizing) return;
            const dx = e.clientX - sx;
            const dy = e.clientY - sy;
            let nw = sw, nh = sh, nl = sl, nt = st;
            const maxW = window.innerWidth  - 20;
            const maxH = window.innerHeight - 20;

            if (dir.includes('e')) nw = Math.min(maxW, Math.max(MIN_W, sw + dx));
            if (dir.includes('s')) nh = Math.min(maxH, Math.max(MIN_H, sh + dy));
            if (dir.includes('w')) {
                nw = Math.min(maxW, Math.max(MIN_W, sw - dx));
                nl = sl + (sw - nw);
            }
            if (dir.includes('n')) {
                nh = Math.min(maxH, Math.max(MIN_H, sh - dy));
                nt = st + (sh - nh);
            }
            win.style.width  = nw + 'px';
            win.style.height = nh + 'px';
            win.style.left   = nl + 'px';
            win.style.top    = nt + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (!resizing) return;
            resizing = false;
            this._blockSelect(false);
        });
    }

    _blockSelect(on) {
        document.body.style.userSelect     = on ? 'none' : '';
        document.body.style.pointerEvents  = on ? 'none' : '';
        this.el.window.style.pointerEvents = 'all';
    }

    /* ── Mobile: Fix keyboard zoom ────────────────────────────────── */
    _initMobileKeyboardFix() {
        if (window.innerWidth > 768) return;
        const win = this.el.window;
        if (!win) return;

        // Lưu chiều cao viewport ban đầu
        let initialVH = window.innerHeight;
        let keyboardOpen = false;

        const onResize = () => {
            const currentVH = window.innerHeight;
            const diff = initialVH - currentVH;

            if (diff > 150) {
                // Keyboard đang mở
                if (!keyboardOpen) {
                    keyboardOpen = true;
                    win.classList.add('keyboard-open');
                    // Giữ window cố định, chỉ điều chỉnh chiều cao
                    win.style.height = (currentVH - 90) + 'px';
                    // Scroll to bottom
                    setTimeout(() => this._scrollToBottom(), 100);
                }
            } else {
                // Keyboard đóng
                if (keyboardOpen) {
                    keyboardOpen = false;
                    win.classList.remove('keyboard-open');
                    win.style.height = '';
                    initialVH = window.innerHeight;
                }
            }
        };

        // Dùng visualViewport API (tốt hơn trên iOS)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                const currentVH = window.visualViewport.height;
                const diff = initialVH - currentVH;

                if (diff > 150) {
                    if (!keyboardOpen) {
                        keyboardOpen = true;
                        win.classList.add('keyboard-open');
                        win.style.bottom = '8px';
                        win.style.height = (currentVH - 90) + 'px';
                        setTimeout(() => this._scrollToBottom(), 100);
                    }
                } else {
                    if (keyboardOpen) {
                        keyboardOpen = false;
                        win.classList.remove('keyboard-open');
                        win.style.bottom = '';
                        win.style.height = '';
                        initialVH = window.visualViewport.height;
                    }
                }
            });
        } else {
            window.addEventListener('resize', onResize);
        }
    }

    /* ── Mobile: Touch Resize 8 hướng + header drag ────────────── */
    _initMobileResize() {
        if (window.innerWidth > 768) return;
        const win = this.el.window;
        if (!win) return;

        const MIN_W = 240, MIN_H = 200;
        const MARGIN = 8;

        // ── Tạo 8 resize handles ──────────────────────────────────
        const dirs = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
        dirs.forEach(d => {
            const h = document.createElement('div');
            h.className = `cr-resize-handle cr-resize-${d} cr-touch-handle`;
            h.dataset.dir = d;
            win.appendChild(h);
        });

        // ── Helper: anchor window tại vị trí tuyệt đối ───────────
        const snapToAbsolute = () => {
            const r = win.getBoundingClientRect();
            win.style.left   = r.left + 'px';
            win.style.top    = r.top  + 'px';
            win.style.right  = '';
            win.style.bottom = '';
            win.style.width  = r.width  + 'px';
            win.style.height = r.height + 'px';
        };

        // ── Touch resize ──────────────────────────────────────────
        let resizing = false, rDir = '';
        let rsx = 0, rsy = 0, rsw = 0, rsh = 0, rsl = 0, rst = 0;

        win.addEventListener('touchstart', (e) => {
            const h = e.target.closest('.cr-resize-handle');
            if (!h) return;
            e.preventDefault();
            e.stopPropagation();
            snapToAbsolute();
            rDir = h.dataset.dir;
            const t = e.touches[0];
            rsx = t.clientX; rsy = t.clientY;
            rsw = win.offsetWidth;  rsh = win.offsetHeight;
            rsl = parseFloat(win.style.left) || 0;
            rst = parseFloat(win.style.top)  || 0;
            resizing = true;
            win.querySelectorAll('.cr-resize-handle').forEach(el => el.classList.remove('active'));
            h.classList.add('active');
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (!resizing) return;
            e.preventDefault();
            const t = e.touches[0];
            const dx = t.clientX - rsx;
            const dy = t.clientY - rsy;
            let nw = rsw, nh = rsh, nl = rsl, nt = rst;
            const maxW = window.innerWidth  - MARGIN * 2;
            const maxH = window.innerHeight - MARGIN * 2;

            if (rDir.includes('e'))  nw = Math.min(maxW, Math.max(MIN_W, rsw + dx));
            if (rDir.includes('s'))  nh = Math.min(maxH, Math.max(MIN_H, rsh + dy));
            if (rDir.includes('w')) { nw = Math.min(maxW, Math.max(MIN_W, rsw - dx)); nl = rsl + (rsw - nw); }
            if (rDir.includes('n')) { nh = Math.min(maxH, Math.max(MIN_H, rsh - dy)); nt = rst + (rsh - nh); }

            nl = Math.max(MARGIN, Math.min(nl, window.innerWidth  - nw - MARGIN));
            nt = Math.max(MARGIN, Math.min(nt, window.innerHeight - nh - MARGIN));

            win.style.width  = nw + 'px';
            win.style.height = nh + 'px';
            win.style.left   = nl + 'px';
            win.style.top    = nt + 'px';
        }, { passive: false });

        document.addEventListener('touchend', () => {
            if (!resizing) return;
            resizing = false; rDir = '';
            win.querySelectorAll('.cr-resize-handle').forEach(el => el.classList.remove('active'));
        });

        // ── Header drag (touch) ───────────────────────────────────
        const header = this.el.header;
        if (!header) return;

        let dragging = false;
        let dgx = 0, dgy = 0, dgl = 0, dgt = 0;

        header.addEventListener('touchstart', (e) => {
            if (e.target.closest('button')) return;
            snapToAbsolute();
            const t = e.touches[0];
            dgx = t.clientX; dgy = t.clientY;
            dgl = parseFloat(win.style.left) || 0;
            dgt = parseFloat(win.style.top)  || 0;
            dragging = true;
            win.classList.add('cr-dragging');
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!dragging || resizing) return;
            e.preventDefault();
            const t = e.touches[0];
            let nx = dgl + (t.clientX - dgx);
            let ny = dgt + (t.clientY - dgy);
            nx = Math.max(MARGIN, Math.min(nx, window.innerWidth  - win.offsetWidth  - MARGIN));
            ny = Math.max(MARGIN, Math.min(ny, window.innerHeight - win.offsetHeight - MARGIN));
            win.style.left = nx + 'px';
            win.style.top  = ny + 'px';
        }, { passive: false });

        document.addEventListener('touchend', () => {
            if (!dragging) return;
            dragging = false;
            win.classList.remove('cr-dragging');
        });
    }
}

// Launch
window.aphimChat = new APFilmChat();
