/* ============================================
   TOWER CLASS
   Represents defensive towers
   ============================================ */

class Tower extends Entity {
    constructor(x, y, team, type) {
        super(x, y, team);
        
        this.type = type; // 'princess' or 'king'
        this.name = type === 'king' ? 'King Tower' : 'Princess Tower';
        
        // Stats based on type
        const stats = type === 'king' ? GameConfig.TOWER_STATS.KING : GameConfig.TOWER_STATS.PRINCESS;
        this.hp = stats.hp;
        this.maxHp = stats.hp;
        this.damage = stats.damage;
        this.attackSpeed = stats.attackSpeed;
        this.range = stats.range;
        this.size = stats.size;
        
        // King tower specific
        this.isActivated = type !== 'king'; // Princess towers start active
        this.activationRange = stats.activationRange || 0;
        
        // Visual
        this.icon = type === 'king' ? '👑' : '🏰';
        this.color = team === 'player' ? GameConfig.COLORS.TOWER_PLAYER : GameConfig.COLORS.TOWER_ENEMY;
        
        // Attack state
        this.target = null;
        this.attackCooldown = 0;
        
        // Animation
        this.attackAnimation = 0;
        this.damageFlash = 0;
    }

    /**
     * Update tower
     */
    update(deltaTime, gameState) {
        if (this.isDead || !this.isActive) return;

        const currentTime = Date.now();
        
        // Update animations
        if (this.attackAnimation > 0) {
            this.attackAnimation -= deltaTime;
        }
        if (this.damageFlash > 0) {
            this.damageFlash -= deltaTime;
        }

        // King tower activation check
        if (this.type === 'king' && !this.isActivated) {
            this.checkActivation(gameState);
            return; // Don't attack if not activated
        }

        // Find target
        this.findTarget(gameState);

        // Attack if has target
        if (this.target && !this.target.isDead && this.isInRange(this.target)) {
            if (this.canAttack(currentTime)) {
                this.performAttack(this.target, currentTime, gameState);
            }
        }
    }

    /**
     * Check if king tower should be activated
     */
    checkActivation(gameState) {
        // Activate if any princess tower is destroyed
        const friendlyTowers = this.team === 'player' ? gameState.playerTowers : gameState.enemyTowers;
        for (const tower of friendlyTowers) {
            if (tower.type === 'princess' && tower.isDead) {
                this.activate();
                return;
            }
        }

        // Activate if king tower takes damage (handled in takeDamage)
    }

    /**
     * Activate king tower
     */
    activate() {
        if (this.isActivated) return;
        this.isActivated = true;
        console.log(`${this.team} King Tower activated!`);
        
        // Visual feedback
        if (window.GameEngine && window.GameEngine.instance) {
            window.GameEngine.instance.showMessage(`${this.team === 'player' ? 'Your' : 'Enemy'} King Tower Activated!`);
        }
    }

    /**
     * Find target for tower
     */
    findTarget(gameState) {
        const enemies = this.team === 'player' ? gameState.enemyTroops : gameState.playerTroops;
        
        let bestTarget = null;
        let bestDistance = Infinity;
        
        for (const enemy of enemies) {
            if (enemy.isDead) continue;
            
            const dist = this.distanceTo(enemy);
            if (dist <= this.range && dist < bestDistance) {
                bestDistance = dist;
                bestTarget = enemy;
            }
        }
        
        this.target = bestTarget;
    }

    /**
     * Perform attack
     */
    performAttack(target, currentTime, gameState) {
        this.lastAttackTime = currentTime;
        this.attackAnimation = 200;
        
        // Create projectile
        if (window.GameEngine && window.GameEngine.instance) {
            window.GameEngine.instance.createProjectile(this, target, this.damage);
        }
    }

    /**
     * Take damage (override to handle king activation)
     */
    takeDamage(amount, attacker) {
        if (this.isDead) return;

        // Activate king tower if it takes damage
        if (this.type === 'king' && !this.isActivated) {
            this.activate();
        }

        this.hp -= amount;
        this.damageFlash = 100;
        
        // Create damage number
        if (window.GameEngine && window.GameEngine.instance) {
            window.GameEngine.instance.createDamageNumber(this.x, this.y - this.size, amount);
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    }

    /**
     * Die (tower destroyed)
     */
    die() {
        this.isDead = true;
        this.isActive = false;
        
        console.log(`${this.team} ${this.name} destroyed!`);
        
        // Notify game engine
        if (window.GameEngine && window.GameEngine.instance) {
            window.GameEngine.instance.onTowerDestroyed(this);
        }
    }

    /**
     * Draw tower
     */
    draw(ctx) {
        if (!this.isActive && this.isDead) {
            // Draw destroyed tower
            this.drawDestroyed(ctx);
            return;
        }

        // Draw tower base
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Color based on state
        let fillColor = this.color;
        if (this.damageFlash > 0) {
            fillColor = '#fff';
        } else if (this.type === 'king' && !this.isActivated) {
            fillColor = '#666'; // Inactive king tower
        }
        
        // Gradient
        const gradient = ctx.createRadialGradient(
            this.x - this.size * 0.3, this.y - this.size * 0.3, 0,
            this.x, this.y, this.size
        );
        gradient.addColorStop(0, fillColor);
        gradient.addColorStop(1, this.team === 'player' ? '#1565c0' : '#c62828');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw tower icon
        ctx.fillStyle = '#fff';
        ctx.font = `${Math.floor(this.size * 1.2)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, this.x, this.y);

        // Draw attack animation
        if (this.attackAnimation > 0 && this.target) {
            this.drawAttackEffect(ctx);
        }

        // Draw range indicator (debug)
        // this.drawRange(ctx);

        // Draw health bar
        this.drawHealthBar(ctx);
        
        // Draw inactive indicator for king tower
        if (this.type === 'king' && !this.isActivated) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#888';
            ctx.font = '12px Arial';
            ctx.fillText('💤', this.x, this.y);
        }
    }

    /**
     * Draw destroyed tower
     */
    drawDestroyed(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = GameConfig.COLORS.TOWER_DESTROYED;
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Rubble icon
        ctx.fillStyle = '#888';
        ctx.font = `${Math.floor(this.size)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💥', this.x, this.y);
    }

    /**
     * Draw attack effect
     */
    drawAttackEffect(ctx) {
        if (!this.target) return;
        
        const progress = 1 - (this.attackAnimation / 200);
        const startX = this.x;
        const startY = this.y;
        const endX = this.target.x;
        const endY = this.target.y;
        
        // Draw line to target
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(
            startX + (endX - startX) * progress,
            startY + (endY - startY) * progress
        );
        ctx.strokeStyle = this.team === 'player' ? '#64b5f6' : '#ef5350';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    /**
     * Draw range indicator (for debugging)
     */
    drawRange(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    /**
     * Draw health bar (override for larger bar)
     */
    drawHealthBar(ctx) {
        const barWidth = this.size * 2;
        const barHeight = 8;
        const offsetY = -this.size - 15;
        
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
        
        // HP text
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.ceil(this.hp)}`, this.x, barY + barHeight + 10);
    }
}

// Export
window.Tower = Tower;
