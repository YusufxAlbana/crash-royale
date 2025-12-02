/* ============================================
   BASE ENTITY CLASS
   Parent class for all game entities
   ============================================ */

class Entity {
    constructor(x, y, team) {
        this.id = GameUtils.generateId();
        this.x = x;
        this.y = y;
        this.team = team; // 'player' or 'enemy'
        
        this.hp = 100;
        this.maxHp = 100;
        this.damage = 10;
        this.attackSpeed = 1.0;
        this.range = 50;
        this.size = 20;
        
        this.target = null;
        this.lastAttackTime = 0;
        this.isDead = false;
        this.isActive = true;
        
        // Visual
        this.icon = '?';
        this.color = team === 'player' ? GameConfig.COLORS.PLAYER_TEAM : GameConfig.COLORS.ENEMY_TEAM;
    }

    /**
     * Update entity (override in subclass)
     */
    update(deltaTime, gameState) {
        // Override in subclass
    }

    /**
     * Draw entity
     */
    draw(ctx) {
        if (!this.isActive) return;

        // Draw entity circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = this.team === 'player' ? '#2196F3' : '#f44336';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw icon
        ctx.fillStyle = '#fff';
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, this.x, this.y);

        // Draw health bar
        this.drawHealthBar(ctx);
    }

    /**
     * Draw health bar above entity
     */
    drawHealthBar(ctx) {
        const barWidth = GameConfig.VISUAL.HEALTH_BAR_WIDTH;
        const barHeight = GameConfig.VISUAL.HEALTH_BAR_HEIGHT;
        const offsetY = GameConfig.VISUAL.HEALTH_BAR_OFFSET_Y - this.size;
        
        const hpPercent = this.hp / this.maxHp;
        const barX = this.x - barWidth / 2;
        const barY = this.y + offsetY;

        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health fill
        let healthColor = GameConfig.COLORS.HEALTH_HIGH;
        if (hpPercent < 0.3) {
            healthColor = GameConfig.COLORS.HEALTH_LOW;
        } else if (hpPercent < 0.6) {
            healthColor = GameConfig.COLORS.HEALTH_MEDIUM;
        }

        ctx.fillStyle = healthColor;
        ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);

        // Border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    /**
     * Take damage
     */
    takeDamage(amount, attacker) {
        if (this.isDead) return;

        this.hp -= amount;
        
        // Create damage number effect
        if (window.GameEngine && window.GameEngine.instance) {
            window.GameEngine.instance.createDamageNumber(this.x, this.y - this.size, amount);
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    }

    /**
     * Die
     */
    die() {
        this.isDead = true;
        this.isActive = false;
        
        // Create death effect
        if (window.GameEngine && window.GameEngine.instance) {
            window.GameEngine.instance.createDeathEffect(this.x, this.y);
        }
    }

    /**
     * Check if can attack (cooldown)
     */
    canAttack(currentTime) {
        const cooldown = 1000 / this.attackSpeed;
        return currentTime - this.lastAttackTime >= cooldown;
    }

    /**
     * Perform attack
     */
    attack(target, currentTime) {
        if (!this.canAttack(currentTime)) return false;
        
        this.lastAttackTime = currentTime;
        target.takeDamage(this.damage, this);
        return true;
    }

    /**
     * Check if target is in range
     */
    isInRange(target) {
        const dist = GameUtils.distance(this.x, this.y, target.x, target.y);
        return dist <= this.range + target.size;
    }

    /**
     * Get distance to target
     */
    distanceTo(target) {
        return GameUtils.distance(this.x, this.y, target.x, target.y);
    }

    /**
     * Check if entity is enemy
     */
    isEnemy(other) {
        return this.team !== other.team;
    }
}

// Export
window.Entity = Entity;
