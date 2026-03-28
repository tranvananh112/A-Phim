/**
 * A PHIM - Firebase Chat Service
 * Sử dụng Firestore realtime cho chat cộng đồng
 */

(function () {
    'use strict';

    // ── Firebase Config ──────────────────────────────────────────────
    const firebaseConfig = {
        apiKey           : "AIzaSyBAcSx1rRMC79-yUz6XINMZOeYuKlNWA00",
        authDomain       : "chat-a-phim.firebaseapp.com",
        projectId        : "chat-a-phim",
        storageBucket    : "chat-a-phim.firebasestorage.app",
        messagingSenderId: "450796005025",
        appId            : "1:450796005025:web:c36985db03de84c6a972e0",
        measurementId    : "G-L6MK53GPM5"
    };

    // Tabs supported
    const TABS = ['general', 'movies', 'support'];
    // Max messages loaded per tab
    const MSG_LIMIT = 80;

    class FirebaseChat {
        constructor() {
            this.app       = null;
            this.db        = null;
            this.analytics = null;
            this.ready     = false;
            this._listeners = {}; // active Firestore unsubscribe fns
            this._onReady   = []; // callbacks waiting for init

            this._init();
        }

        // ── Init ───────────────────────────────────────────────────────
        _init() {
            try {
                if (typeof firebase === 'undefined') {
                    console.warn('[APFilmChat] Firebase SDK not loaded yet, retrying...');
                    setTimeout(() => this._init(), 500);
                    return;
                }

                // Initialize app (avoid duplicate)
                if (!firebase.apps.length) {
                    this.app = firebase.initializeApp(firebaseConfig);
                } else {
                    this.app = firebase.apps[0];
                }

                this.db = firebase.firestore();

                // Enable offline persistence for faster loads
                this.db.enablePersistence({ synchronizeTabs: true })
                    .catch(err => {
                        if (err.code !== 'failed-precondition' && err.code !== 'unimplemented') {
                            console.warn('[APFilmChat] Persistence error:', err.code);
                        }
                    });

                // Analytics (optional)
                if (typeof firebase.analytics === 'function') {
                    this.analytics = firebase.analytics();
                }

                this.ready = true;
                console.log('[APFilmChat] Firebase Firestore initialized ✓');

                // Flush pending callbacks
                this._onReady.forEach(fn => fn());
                this._onReady = [];

            } catch (err) {
                console.error('[APFilmChat] Firebase init error:', err);
            }
        }

        // ── Wait for ready ─────────────────────────────────────────────
        onReady(fn) {
            if (this.ready) { fn(); return; }
            this._onReady.push(fn);
        }

        // ── Collection reference ───────────────────────────────────────
        _msgCol(tab) {
            return this.db
                .collection('chats')
                .doc(tab)
                .collection('messages');
        }

        // ── Send a message ─────────────────────────────────────────────
        async sendMessage(tab, { user, text, color }) {
            if (!this.db) return null;
            if (!TABS.includes(tab)) tab = 'general';

            try {
                const ref = await this._msgCol(tab).add({
                    user     : user || 'Khách',
                    text     : text,
                    color    : color || '#ffd709',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    time     : new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                });
                return ref.id;
            } catch (err) {
                console.error('[APFilmChat] sendMessage error:', err);
                return null;
            }
        }

        // ── Listen to messages (realtime) ──────────────────────────────
        // callback(messages: Array<{id, user, text, color, time, isOwn}>)
        listenMessages(tab, currentUserName, callback) {
            if (!this.db) { callback([]); return () => {}; }
            if (!TABS.includes(tab)) tab = 'general';

            // Unsubscribe previous listener for this tab
            if (this._listeners[tab]) {
                this._listeners[tab]();
            }

            const unsubscribe = this._msgCol(tab)
                .orderBy('timestamp', 'asc')
                .limitToLast(MSG_LIMIT)
                .onSnapshot(snapshot => {
                    const msgs = [];
                    snapshot.forEach(doc => {
                        const d = doc.data();
                        msgs.push({
                            id   : doc.id,
                            user : d.user,
                            text : d.text,
                            color: d.color || '#ffd709',
                            time : d.time || '',
                            isOwn: d.user === currentUserName,
                        });
                    });
                    callback(msgs);
                }, err => {
                    console.warn('[APFilmChat] listenMessages error:', err.code);
                    callback([]);
                });

            this._listeners[tab] = unsubscribe;
            return unsubscribe;
        }

        // ── Stop listening to a tab ────────────────────────────────────
        stopListening(tab) {
            if (this._listeners[tab]) {
                this._listeners[tab]();
                delete this._listeners[tab];
            }
        }

        // ── Online presence ────────────────────────────────────────────
        // Returns an unsubscribe fn. callback(count: number)
        trackPresence(userId, callback) {
            if (!this.db) { callback(1); return () => {}; }

            const presenceRef = this.db.collection('presence').doc(userId);
            const onlineColRef = this.db.collection('presence');

            // Write own presence
            presenceRef.set({
                online   : true,
                lastSeen : firebase.firestore.FieldValue.serverTimestamp(),
                userId   : userId,
            }).catch(() => {});

            // Clean up on page unload
            window.addEventListener('beforeunload', () => {
                presenceRef.delete().catch(() => {});
            });

            // Listen to total online count (users active in last 2 min)
            const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000);
            const unsubscribe = onlineColRef
                .where('online', '==', true)
                .where('lastSeen', '>=', twoMinAgo)
                .onSnapshot(snap => {
                    callback(Math.max(snap.size, 1));
                }, () => callback(1));

            // Refresh own presence every 60s
            const refreshInterval = setInterval(() => {
                presenceRef.set({
                    online   : true,
                    lastSeen : firebase.firestore.FieldValue.serverTimestamp(),
                    userId   : userId,
                }, { merge: true }).catch(() => {});
            }, 60000);

            return () => {
                clearInterval(refreshInterval);
                unsubscribe();
                presenceRef.delete().catch(() => {});
            };
        }
    }

    // ── Singleton ──────────────────────────────────────────────────────
    window.firebaseChat = new FirebaseChat();

})();
