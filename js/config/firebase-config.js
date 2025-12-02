/* ============================================
   FIREBASE CONFIGURATION
   ============================================
   
   PENTING: Ganti nilai-nilai di bawah ini dengan
   Firebase config milik Anda sendiri!
   
   Cara mendapatkan config:
   1. Buka https://console.firebase.google.com
   2. Buat project baru atau pilih project yang ada
   3. Klik ikon gear (Settings) > Project settings
   4. Scroll ke bawah ke "Your apps"
   5. Klik "Add app" > pilih Web (</>)
   6. Register app dan copy config yang diberikan
   
   Pastikan juga mengaktifkan:
   - Authentication > Sign-in method > Email/Password
   - Firestore Database > Create database
   ============================================ */

const firebaseConfig = {
    // ========================================
    // GANTI SEMUA NILAI DI BAWAH INI!
    // ========================================
  apiKey: "AIzaSyAxmBkKyK_rUJ0vsBnP834eCu1qybtGDDY",
  authDomain: "crash-royale-112.firebaseapp.com",
  projectId: "crash-royale-112",
  storageBucket: "crash-royale-112.firebasestorage.app",
  messagingSenderId: "866067364072",
  appId: "1:866067364072:web:9bbe046922b7123fd9b15d",
  measurementId: "G-L46NMBM6C3"
    // ========================================
};

// Initialize Firebase
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;

// Flag untuk mode offline/guest
let isOfflineMode = false;

/**
 * Initialize Firebase dengan config di atas
 * Jika config belum diisi, game akan berjalan dalam mode offline
 */
function initializeFirebase() {
    try {
        // Check if config is still placeholder
        if (firebaseConfig.apiKey === "AIzaSyAxmBkKyK_rUJ0vsBnP834eCu1qybtGDDY") {
            console.warn("⚠️ Firebase config belum diisi! Game berjalan dalam mode OFFLINE.");
            console.warn("📝 Buka js/config/firebase-config.js dan isi dengan config Firebase Anda.");
            isOfflineMode = true;
            return false;
        }

        // Initialize Firebase
        firebaseApp = firebase.initializeApp(firebaseConfig);
        firebaseAuth = firebase.auth();
        firebaseDb = firebase.firestore();

        // Enable offline persistence
        firebaseDb.enablePersistence({ synchronizeTabs: true })
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.warn("Firestore persistence failed: Multiple tabs open");
                } else if (err.code === 'unimplemented') {
                    console.warn("Firestore persistence not supported in this browser");
                }
            });

        console.log("✅ Firebase initialized successfully!");
        return true;
    } catch (error) {
        console.error("❌ Firebase initialization error:", error);
        isOfflineMode = true;
        return false;
    }
}

/**
 * Check apakah game dalam mode offline
 */
function isGameOffline() {
    return isOfflineMode;
}

// Export untuk digunakan di file lain
window.FirebaseConfig = {
    init: initializeFirebase,
    isOffline: isGameOffline,
    getAuth: () => firebaseAuth,
    getDb: () => firebaseDb
};
