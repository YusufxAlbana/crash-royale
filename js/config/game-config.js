/* ============================================
   GAME CONFIGURATION
   Semua konstanta dan setting game
   ============================================ */

const GameConfig = {
    // ========================================
    // ARENA SETTINGS
    // ========================================
    ARENA: {
        WIDTH: 360,           // Lebar arena dalam pixel
        HEIGHT: 640,          // Tinggi arena dalam pixel
        LANE_WIDTH: 140,      // Lebar setiap lane
        BRIDGE_Y: 320,        // Posisi Y jembatan (tengah arena)
        RIVER_HEIGHT: 40,     // Tinggi sungai
        
        // Batas spawn area untuk player (bagian bawah)
        PLAYER_SPAWN_MIN_Y: 400,
        PLAYER_SPAWN_MAX_Y: 600,
        
        // Batas spawn area untuk enemy (bagian atas)
        ENEMY_SPAWN_MIN_Y: 40,
        ENEMY_SPAWN_MAX_Y: 240,
    },

    // ========================================
    // TOWER POSITIONS
    // ========================================
    TOWERS: {
        // Player towers (bawah)
        PLAYER: {
            LEFT: { x: 72, y: 520 },
            RIGHT: { x: 288, y: 520 },
            KING: { x: 180, y: 590 }
        },
        // Enemy towers (atas)
        ENEMY: {
            LEFT: { x: 72, y: 120 },
            RIGHT: { x: 288, y: 120 },
            KING: { x: 180, y: 50 }
        }
    },

    // ========================================
    // TOWER STATS
    // ========================================
    TOWER_STATS: {
        PRINCESS: {
            hp: 1400,
            damage: 90,
            attackSpeed: 0.8,    // Attacks per second
            range: 120,
            size: 35
        },
        KING: {
            hp: 2400,
            damage: 110,
            attackSpeed: 1.0,
            range: 130,
            size: 45,
            activationRange: 150  // Range untuk aktivasi king tower
        }
    },

    // ========================================
    // ELIXIR SETTINGS
    // ========================================
    ELIXIR: {
        MAX: 10,
        START: 5,
        REGEN_RATE: 0.033,      // Elixir per frame (sekitar 2.8 detik per elixir)
        OVERTIME_REGEN_RATE: 0.066,  // 2x lebih cepat saat overtime
        DOUBLE_ELIXIR_REGEN: 0.066   // Double elixir rate
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
