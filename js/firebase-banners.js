import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";

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

try {
    app = initializeApp(firebaseConfig, "aphim-config-banners");
    db = getFirestore(app);
} catch (error) {
    console.error("Firebase Initialization Error:", error);
}

// Push mảng banner lên Firebase
export async function syncBannersToFirebase(banners) {
    if (!db) return;
    try {
        await setDoc(doc(db, "site_config", "hero_banners"), {
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
    if (!db) {
        callback([]);
        return () => {};
    }
    
    return onSnapshot(doc(db, "site_config", "hero_banners"), (docSnap) => {
        if (docSnap.exists()) {
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
