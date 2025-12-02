/* ============================================
   ARENA CLASS
   Handles arena rendering
   ============================================ */

class Arena {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.width = GameConfig.ARENA.WIDTH;
        this.height = GameConfig.ARENA.HEIGHT;
        
        // Pre-render static elements
        this.backgroundCanvas = document.createElement('canvas');
        this.backgroundCanvas.width = this.width;
        this.backgroundCanvas.height = this.height;
        this.renderBackground();
    }

    /**
     * Pre-render background
     */
    renderBackground() {
        const ctx = this.backgroundCanvas.getContext('2d');
        const colors = GameConfig.COLORS;
        
        // Main grass
        ctx.fillStyle = colors.ARENA_GRASS;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Grass pattern
        this.drawGrassPattern(ctx);
        
        // River
        this.drawRiver(ctx);
        
        // Bridges
        this.drawBridges(ctx);
        
        // Lane divider
        this.drawLaneDivider(ctx);
        
        // Spawn zones (subtle indicators)
        this.drawSpawnZones(ctx);
    }

    /**
     * Draw grass pattern
     */
    drawGrassPattern(ctx) {
        const colors = GameConfig.COLORS;
        
        // Alternating grass tiles
        const tileSize = 40;
        for (let y = 0; y < this.height; y += tileSize) {
            for (let x = 0; x < this.width; x += tileSize) {
                if ((Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0) {
                    ctx.fillStyle = colors.ARENA_GRASS_DARK;
                    ctx.fillRect(x, y, tileSize, tileSize);
                }
            }
        }
    }

    /**
     * Draw river
     */
    drawRiver(ctx) {
        const bridgeY = GameConfig.ARENA.BRIDGE_Y;
        const riverHeight = GameConfig.ARENA.RIVER_HEIGHT;
        
        // River water
        const gradient = ctx.createLinearGradient(0, bridgeY - riverHeight/2, 0, bridgeY + riverHeight/2);
        gradient.addColorStop(0, '#2196F3');
        gradient.addColorStop(0.5, '#64B5F6');
        gradient.addColorStop(1, '#2196F3');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, bridgeY - riverHeight/2, this.width, riverHeight);
        
        // River banks
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(0, bridgeY - riverHeight/2 - 5, this.width, 5);
        ctx.fillRect(0, bridgeY + riverHeight/2, this.width, 5);
        
        // Water animation lines (static for now)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        for (let x = 0; x < this.width; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, bridgeY - 5);
            ctx.quadraticCurveTo(x + 15, bridgeY, x + 30, bridgeY + 5);
            ctx.stroke();
        }
    }

    /**
     * Draw bridges
     */
    drawBridges(ctx) {
        const bridgeY = GameConfig.ARENA.BRIDGE_Y;
        const riverHeight = GameConfig.ARENA.RIVER_HEIGHT;
        const bridgeWidth = 65;  // Diperbesar dari 50
        const bridgeLength = riverHeight + 25;
        
        // Left bridge
        this.drawBridge(ctx, this.width * 0.25, bridgeY, bridgeWidth, bridgeLength);
        
        // Right bridge
        this.drawBridge(ctx, this.width * 0.75, bridgeY, bridgeWidth, bridgeLength);
    }

    /**
     * Draw single bridge
     */
    drawBridge(ctx, x, y, width, length) {
        const colors = GameConfig.COLORS;
        
        // Bridge base
        ctx.fillStyle = colors.BRIDGE;
        ctx.fillRect(x - width/2, y - length/2, width, length);
        
        // Bridge planks
        ctx.strokeStyle = '#6D4C41';
        ctx.lineWidth = 2;
        for (let py = y - length/2 + 5; py < y + length/2; py += 10) {
            ctx.beginPath();
            ctx.moveTo(x - width/2, py);
            ctx.lineTo(x + width/2, py);
            ctx.stroke();
        }
        
        // Bridge rails
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(x - width/2 - 3, y - length/2, 6, length);
        ctx.fillRect(x + width/2 - 3, y - length/2, 6, length);
    }

    /**
     * Draw lane divider
     */
    drawLaneDivider(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(this.width / 2, GameConfig.ARENA.BRIDGE_Y - 30);
        ctx.moveTo(this.width / 2, GameConfig.ARENA.BRIDGE_Y + 30);
        ctx.lineTo(this.width / 2, this.height);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    /**
     * Draw spawn zone indicators
     */
    drawSpawnZones(ctx) {
        const arena = GameConfig.ARENA;
        
        // Player spawn zone (bottom)
        ctx.fillStyle = 'rgba(33, 150, 243, 0.1)';
        ctx.fillRect(10, arena.PLAYER_SPAWN_MIN_Y, this.width - 20, arena.PLAYER_SPAWN_MAX_Y - arena.PLAYER_SPAWN_MIN_Y);
        
        // Enemy spawn zone (top)
        ctx.fillStyle = 'rgba(244, 67, 54, 0.1)';
        ctx.fillRect(10, arena.ENEMY_SPAWN_MIN_Y, this.width - 20, arena.ENEMY_SPAWN_MAX_Y - arena.ENEMY_SPAWN_MIN_Y);
    }

    /**
     * Draw tower positions
     */
    drawTowerPositions(ctx) {
        const towers = GameConfig.TOWERS;
        
        // Player tower positions
        this.drawTowerBase(ctx, towers.PLAYER.LEFT.x, towers.PLAYER.LEFT.y, 'player');
        this.drawTowerBase(ctx, towers.PLAYER.RIGHT.x, towers.PLAYER.RIGHT.y, 'player');
        this.drawTowerBase(ctx, towers.PLAYER.KING.x, towers.PLAYER.KING.y, 'player', true);
        
        // Enemy tower positions
        this.drawTowerBase(ctx, towers.ENEMY.LEFT.x, towers.ENEMY.LEFT.y, 'enemy');
        this.drawTowerBase(ctx, towers.ENEMY.RIGHT.x, towers.ENEMY.RIGHT.y, 'enemy');
        this.drawTowerBase(ctx, towers.ENEMY.KING.x, towers.ENEMY.KING.y, 'enemy', true);
    }

    /**
     * Draw tower base platform
     */
    drawTowerBase(ctx, x, y, team, isKing = false) {
        const size = isKing ? 55 : 45;  // Diperbesar
        
        // Platform
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = team === 'player' ? 'rgba(33, 150, 243, 0.3)' : 'rgba(244, 67, 54, 0.3)';
        ctx.fill();
        ctx.strokeStyle = team === 'player' ? '#1976D2' : '#D32F2F';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    /**
     * Draw the arena
     */
    draw() {
        // Draw pre-rendered background
        this.ctx.drawImage(this.backgroundCanvas, 0, 0);
        
        // Draw tower bases
        this.drawTowerPositions(this.ctx);
    }

    /**
     * Draw spawn indicator
     */
    drawSpawnIndicator(x, y, isValid, notEnoughElixir = false) {
        const ctx = this.ctx;
        const colors = GameConfig.COLORS;
        
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        
        if (notEnoughElixir) {
            // Orange/yellow for not enough elixir
            ctx.fillStyle = 'rgba(255, 152, 0, 0.3)';
            ctx.strokeStyle = '#FF9800';
        } else if (isValid) {
            ctx.fillStyle = colors.SPAWN_VALID;
            ctx.strokeStyle = '#4CAF50';
        } else {
            ctx.fillStyle = colors.SPAWN_INVALID;
            ctx.strokeStyle = '#F44336';
        }
        
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    /**
     * Resize canvas
     */
    resize() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight - 160; // Account for card hand
        
        const scale = Math.min(
            containerWidth / this.width,
            containerHeight / this.height
        );
        
        this.canvas.style.width = `${this.width * scale}px`;
        this.canvas.style.height = `${this.height * scale}px`;
        
        return scale;
    }
}

// Export
window.Arena = Arena;
