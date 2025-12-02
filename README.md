# ⚔️ Battle Arena - Clash Royale Clone

Game web real-time strategy yang terinspirasi dari Clash Royale, dibangun dengan JavaScript vanilla dan Firebase.

## 🎮 Fitur Game

### Mekanik Gameplay
- **Arena 1v1** dengan 2 lane dan jembatan
- **6 Tower** (2 Princess + 1 King per pemain)
- **Elixir System** - regenerasi otomatis, max 10
- **Card System** - 4 kartu aktif + 1 cadangan dengan rotasi
- **Timer** - 3 menit battle + 1 menit overtime
- **AI Opponent** - bermain melawan bot dengan berbagai difficulty

### Troops Tersedia
| Troop | Elixir | Tipe | Deskripsi |
|-------|--------|------|-----------|
| 🗡️ Knight | 3 | Melee | Tank dengan HP dan damage seimbang |
| 🏹 Archer | 3 | Ranged | 2 unit ranged DPS |
| 👹 Giant | 5 | Melee | High HP, hanya menyerang building |
| 🔫 Musketeer | 4 | Ranged | High damage single target |
| 🤖 Mini P.E.K.K.A | 4 | Melee | Fast, high damage |
| ⚔️ Valkyrie | 4 | Melee | Area damage |
| 💣 Bomber | 2 | Ranged | Splash damage |
| 💀 Skeleton Army | 3 | Melee | 12 skeleton swarm |
| 🧙 Wizard | 5 | Ranged | Splash magic damage |
| 👺 Goblins | 2 | Melee | 3 fast cheap units |
| 🐴 Prince | 5 | Melee | Charge attack 2x damage |
| 🐗 Hog Rider | 4 | Melee | Fast, jump river, building only |

## 🚀 Cara Menjalankan

### 1. Clone/Download Project
```bash
git clone <repository-url>
cd battle-arena
```

### 2. Setup Firebase (Opsional)
Buka `js/config/firebase-config.js` dan ganti placeholder dengan config Firebase Anda:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

**Cara mendapatkan Firebase config:**
1. Buka https://console.firebase.google.com
2. Buat project baru atau pilih yang ada
3. Klik Settings ⚙️ > Project settings
4. Scroll ke "Your apps" > Add app > Web
5. Copy config yang diberikan

**Aktifkan Firebase services:**
- Authentication > Sign-in method > Email/Password
- Firestore Database > Create database

### 3. Jalankan dengan Local Server

**Menggunakan VS Code Live Server:**
- Install extension "Live Server"
- Klik kanan `index.html` > "Open with Live Server"

**Menggunakan Python:**
```bash
python -m http.server 8080
# Buka http://localhost:8080
```

**Menggunakan Node.js:**
```bash
npx serve
# atau
npx http-server
```

### 4. Mode Guest (Tanpa Firebase)
Game bisa dimainkan tanpa setup Firebase dengan klik "Play as Guest".
Data tidak akan tersimpan ke cloud.

## 📁 Struktur Project

```
battle-arena/
├── index.html              # Entry point
├── css/
│   ├── style.css          # Main styles
│   ├── game.css           # Game screen styles
│   └── ui.css             # UI components styles
├── js/
│   ├── config/
│   │   ├── firebase-config.js  # Firebase setup
│   │   ├── game-config.js      # Game constants
│   │   └── cards-data.js       # Card definitions
│   ├── services/
│   │   ├── firebase-service.js    # Database operations
│   │   ├── auth-service.js        # Authentication
│   │   └── matchmaking-service.js # Find opponents
│   ├── game/
│   │   ├── utils.js        # Helper functions
│   │   ├── entity.js       # Base entity class
│   │   ├── troop.js        # Troop class
│   │   ├── tower.js        # Tower class
│   │   ├── projectile.js   # Projectile class
│   │   ├── arena.js        # Arena rendering
│   │   ├── game-engine.js  # Main game loop
│   │   └── ai-opponent.js  # AI logic
│   ├── ui/
│   │   ├── screens.js      # Screen management
│   │   ├── deck-builder.js # Deck builder UI
│   │   └── game-ui.js      # In-game UI
│   └── main.js             # App initialization
└── README.md
```

## 🎯 Cara Bermain

1. **Login/Register** atau main sebagai Guest
2. Klik **BATTLE** untuk mulai pertandingan
3. **Pilih kartu** dari hand (4 kartu bawah)
4. **Drag & drop** ke area spawn (bagian bawah arena)
5. Troop akan **bergerak otomatis** ke tower musuh
6. **Hancurkan tower** untuk mendapat crown
7. **Menang** dengan lebih banyak crown atau hancurkan King Tower

### Tips
- Perhatikan **elixir** sebelum spawn troop
- Gunakan **Giant** sebagai tank di depan
- **Archer/Musketeer** efektif dari belakang
- **Valkyrie/Wizard** bagus melawan swarm
- Jaga **King Tower** - jika hancur, langsung kalah!

## 🔧 Kustomisasi

### Menambah Troop Baru
Edit `js/config/cards-data.js`:

```javascript
newTroop: {
    id: 'newTroop',
    name: 'New Troop',
    type: 'troop',
    rarity: 'rare',
    elixirCost: 4,
    icon: '🆕',
    stats: {
        hp: 500,
        damage: 100,
        attackSpeed: 1.0,
        moveSpeed: 60,
        range: 25,
        size: 16,
        attackType: 'melee',
        targetType: 'ground',
        targets: 'all',
        count: 1
    }
}
```

### Mengubah Game Balance
Edit `js/config/game-config.js` untuk:
- Tower HP/damage
- Elixir regeneration rate
- Battle duration
- Trophy rewards

## 🌐 Deploy ke Vercel

1. Push project ke GitHub
2. Buka https://vercel.com
3. Import repository
4. Deploy (tidak perlu konfigurasi khusus)

## 📝 License

MIT License - bebas digunakan dan dimodifikasi.
