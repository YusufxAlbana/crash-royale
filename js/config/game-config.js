/* ============================================
   GAME CONFIGURATION
   Semua konstanta dan setting game
   ============================================ */

const GameConfig = {
    // ========================================
    // ARENA SETTINGS (Diperbesar)
    // ========================================
    ARENA: {
        WIDTH: 450,           // Lebar arena dalam pixel (diperbesar dari 360)
        HEIGHT: 800,          // Tinggi arena dalam pixel (diperbesar dari 640)
        LANE_WIDTH: 180,      // Lebar setiap lane
        BRIDGE_Y: 400,        // Posisi Y jembatan (tengah arena)
        RIVER_HEIGHT: 50,     // Tinggi sungai
        
        // Batas spawn area untuk player (bagian bawah)
        PLAYER_SPAWN_MIN_Y: 500,
        PLAYER_SPAWN_MAX_Y: 750,
        
        // Batas spawn area untuk enemy (bagian atas)
        ENEMY_SPAWN_MIN_Y: 50,
        ENEMY_SPAWN_MAX_Y: 300,
    },

    // ========================================
    // TOWER POSITIONS (Disesuaikan dengan arena baru)
    // ========================================
    TOWERS: {
        // Player towers (bawah)
        PLAYER: {
            LEFT: { x: 90, y: 650 },
            RIGHT: { x: 360, y: 650 },
            KING: { x: 225, y: 740 }
        },
        // Enemy towers (atas)
        ENEMY: {
            LEFT: { x: 90, y: 150 },
            RIGHT: { x: 360, y: 150 },
            KING: { x: 225, y: 60 }
        }
    },

    // ========================================
    // TOWER STATS (HP ditambah untuk game lebih lama)
    // ========================================
    TOWER_STATS: {
        PRINCESS: {
            hp: 2800,            // Ditambah dari 1400
            damage: 70,          // Dikurangi dari 90
            attackSpeed: 1.0,    // Diperlambat dari 0.8
            range: 150,
            size: 40
        },
        KING: {
            hp: 4800,            // Ditambah dari 2400
            damage: 85,          // Dikurangi dari 110
            attackSpeed: 1.2,    // Diperlambat dari 1.0
            range: 160,
            size: 50,
            activationRange: 180
        }
    },

    // ========================================
    // ELIXIR SETTINGS (Diperlambat)
    // ========================================
    ELIXIR: {
        MAX: 10,
        START: 5,
        REGEN_RATE: 0.014,      // Elixir per frame (sekitar 4.2 detik per elixir - diperlambat)
        OVERTIME_REGEN_RATE: 0.028,  // 2x lebih cepat saat overtime
        DOUBLE_ELIXIR_REGEN: 0.028   // Double elixir rate
    },

    // ========================================
    // BATTLE TIMER
    // ========================================
    TIMER: {
        BATTLE_DURATION: 180,   // 3 menit dalam detik
        OVERTIME_DURATION: 60,  // 1 menit overtime
        SUDDEN_DEATH_DURATION: 120  // 2 menit sudden death (opsional)
    },

    // ========================================
    // GAMEPLAY SETTINGS
    // ========================================
    GAMEPLAY: {
        FPS: 60,
        FRAME_TIME: 1000 / 60,
        MAX_TROOPS_PER_SIDE: 20,
        COLLISION_PUSH_FORCE: 0.5,
        AGGRO_RANGE: 150,       // Range untuk troop mendeteksi musuh
        RETARGET_COOLDOWN: 500  // ms sebelum bisa ganti target
    },

    // ========================================
    // TROPHY SETTINGS
    // ========================================
    TROPHIES: {
        WIN: 30,
        LOSE: -20,
        DRAW: 0,
        THREE_CROWN_BONUS: 10
    },

    // ========================================
    // VISUAL SETTINGS
    // ========================================
    VISUAL: {
        HEALTH_BAR_WIDTH: 40,
        HEALTH_BAR_HEIGHT: 6,
        HEALTH_BAR_OFFSET_Y: -10,
        DAMAGE_NUMBER_DURATION: 1000,
        DEATH_EFFECT_DURATION: 500
    },

    // ========================================
    // COLORS
    // ========================================
    COLORS: {
        ARENA_GRASS: '#2d5a27',
        ARENA_GRASS_DARK: '#245020',
        RIVER: '#4a90d9',
        BRIDGE: '#8b7355',
        
        PLAYER_TEAM: '#4a90d9',      // Biru
        ENEMY_TEAM: '#d94a4a',       // Merah
        
        TOWER_PLAYER: '#3a7bd5',
        TOWER_ENEMY: '#d53a3a',
        TOWER_DESTROYED: '#555555',
        
        HEALTH_HIGH: '#4caf50',
        HEALTH_MEDIUM: '#ff9800',
        HEALTH_LOW: '#f44336',
        
        SPAWN_VALID: 'rgba(76, 175, 80, 0.3)',
        SPAWN_INVALID: 'rgba(244, 67, 54, 0.3)'
    },

    // ========================================
    // SOUND SETTINGS (placeholder)
    // ========================================
    SOUND: {
        ENABLED: true,
        MUSIC_VOLUME: 0.3,
        SFX_VOLUME: 0.5
    }
};

// Freeze config agar tidak bisa diubah
Object.freeze(GameConfig);
Object.freeze(GameConfig.ARENA);
Object.freeze(GameConfig.TOWERS);
Object.freeze(GameConfig.TOWER_STATS);
Object.freeze(GameConfig.ELIXIR);
Object.freeze(GameConfig.TIMER);
Object.freeze(GameConfig.GAMEPLAY);
Object.freeze(GameConfig.TROPHIES);
Object.freeze(GameConfig.VISUAL);
Object.freeze(GameConfig.COLORS);
Object.freeze(GameConfig.SOUND);

// Export
window.GameConfig = GameConfig;
