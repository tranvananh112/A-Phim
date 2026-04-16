// Banner Firebase configuration (a-phim-config)
const firebaseConfig = {
  apiKey: "AIzaSyCbI3KnCvfDQdFISYZ9qDj48D2yx-xjtkY",
  authDomain: "a-phim-config.firebaseapp.com",
  projectId: "a-phim-config",
  storageBucket: "a-phim-config.firebasestorage.app",
  messagingSenderId: "248477289615",
  appId: "1:248477289615:web:15b5e36fdfe4184f8974fa",
  measurementId: "G-8XBK7QGQ0F"
};

// Khởi tạo Firebase App với tên riêng biệt để không xung đột với các app khác
let app;
let db;

function initFirebase() {
    if (app && db) return true;
    if (typeof firebase === 'undefined') {
        console.error("Firebase SDK chưa được tải (compat version)!");
        return false;
    }
    
    try {
        // Find if it was already initialized
        const existingApp = firebase.apps.find(a => a.name === "aphim-config-banners");
        if (existingApp) {
            app = existingApp;
        } else {
            app = firebase.initializeApp(firebaseConfig, "aphim-config-banners");
        }
        db = app.firestore();
        return true;
    } catch (error) {
        console.error("Firebase Initialization Error:", error);
        return false;
    }
}

// Push mảng banner lên Firebase
export async function syncBannersToFirebase(banners) {
    if (!initFirebase()) return;
    try {
        await db.collection("site_config").doc("hero_banners").set({
            list: banners,
            updatedAt: new Date().toISOString()
        });
        console.log("Successfully synced banners to Firebase.");
    } catch (e) {
        console.error("Error syncing to Firebase:", e);
    }
}

// Lắng nghe thay đổi banner realtime
export function listenToBanners(callback) {
    if (!initFirebase()) {
        callback([]);
        return () => {};
    }
    
    return db.collection("site_config").doc("hero_banners").onSnapshot((docSnap) => {
        if (docSnap.exists) {
            const data = docSnap.data();
            console.log("Firebase Banners Update Received!");
            callback(data.list || []);
        } else {
            console.log("No banner document found, passing empty list.");
            callback([]);
        }
    }, (error) => {
        console.error("Error listening to banners:", error);
    });
}
