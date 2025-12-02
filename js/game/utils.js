/* ============================================
   GAME UTILITIES
   Helper functions for game calculations
   ============================================ */

const GameUtils = {
    /**
     * Calculate distance between two points
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Calculate angle between two points (in radians)
     */
    angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    /**
     * Normalize a vector
     */
    normalize(x, y) {
        const len = Math.sqrt(x * x + y * y);
        if (len === 0) return { x: 0, y: 0 };
        return { x: x / len, y: y / len };
    },

    /**
     * Check if two circles collide
     */
    circleCollision(x1, y1, r1, x2, y2, r2) {
        return this.distance(x1, y1, x2, y2) < r1 + r2;
    },

    /**
     * Check if point is inside rectangle
     */
    pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    },

    /**
     * Check if point is in player's spawn area
     */
    isValidPlayerSpawn(x, y) {
        const arena = GameConfig.ARENA;
        return y >= arena.PLAYER_SPAWN_MIN_Y && 
               y <= arena.PLAYER_SPAWN_MAX_Y &&
               x >= 20 && x <= arena.WIDTH - 20;
    },

    /**
     * Check if point is in enemy's spawn area
     */
    isValidEnemySpawn(x, y) {
        const arena = GameConfig.ARENA;
        return y >= arena.ENEMY_SPAWN_MIN_Y && 
               y <= arena.ENEMY_SPAWN_MAX_Y &&
               x >= 20 && x <= arena.WIDTH - 20;
    },

    /**
     * Clamp value between min and max
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Linear interpolation
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    /**
     * Random number between min and max
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Random integer between min and max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Format time as MM:SS
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Get lane from x position (0 = left, 1 = right)
     */
    getLane(x) {
        return x < GameConfig.ARENA.WIDTH / 2 ? 0 : 1;
    },

    /**
     * Get center x of lane
     */
    getLaneCenter(lane) {
        const arena = GameConfig.ARENA;
        return lane === 0 ? arena.WIDTH * 0.25 : arena.WIDTH * 0.75;
    },

    /**
     * Check if position is on bridge
     */
    isOnBridge(x, y) {
        const arena = GameConfig.ARENA;
        const bridgeY = arena.BRIDGE_Y;
        const riverHeight = arena.RIVER_HEIGHT;
        
        // Check if in river area
        if (y < bridgeY - riverHeight/2 || y > bridgeY + riverHeight/2) {
            return false;
        }
        
        // Check if on left or right bridge (disesuaikan dengan arena lebih besar)
        const leftBridgeX = arena.WIDTH * 0.25;
        const rightBridgeX = arena.WIDTH * 0.75;
        const bridgeWidth = 65; // Diperbesar dari 50
        
        return (Math.abs(x - leftBridgeX) < bridgeWidth/2) || 
               (Math.abs(x - rightBridgeX) < bridgeWidth/2);
    },

    /**
     * Get nearest bridge position
     */
    getNearestBridge(x, y, targetY) {
        const arena = GameConfig.ARENA;
        const leftBridgeX = arena.WIDTH * 0.25;
        const rightBridgeX = arena.WIDTH * 0.75;
        
        // Choose nearest bridge
        const bridgeX = Math.abs(x - leftBridgeX) < Math.abs(x - rightBridgeX) 
            ? leftBridgeX : rightBridgeX;
        
        return { x: bridgeX, y: arena.BRIDGE_Y };
    },

    /**
     * Check if can cross river (on bridge or has jump ability)
     */
    canCrossRiver(x, y, canJump = false) {
        if (canJump) return true;
        return this.isOnBridge(x, y);
    },

    /**
     * Ease out quad
     */
    easeOutQuad(t) {
        return t * (2 - t);
    },

    /**
     * Ease in out quad
     */
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },

    /**
     * Deep clone object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Shuffle array
     */
    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
};

// Export
window.GameUtils = GameUtils;
