/* ============================================
   TROOP CLASS
   Represents spawnable units
   ============================================ */

class Troop extends Entity {
    constructor(x, y, team, cardData) {
        super(x, y, team);
        
        this.cardId = cardData.id;
        this.name = cardData.name;
        this.icon = cardData.icon;
        
        // Stats from card data
        const stats = cardData.stats;
        this.hp = stats.hp;
        this.maxHp = stats.hp;
        this.damage = stats.damage;
        this.attackSpeed = stats.attackSpeed;
        this.moveSpeed = stats.moveSpeed;
        this.range = stats.range;
        this.size = stats.size;
        
        // Attack properties
        this.attackType = stats.attackType; // 'melee' or 'ranged'
        this.targetType = stats.targetType; // 'ground', 'air', 'both'
        this.targets = stats.targets; // 'all' or 'buildings'
        this.splashRadius = stats.splashRadius || 0;
        
        // Special abilities
        this.canJumpRiver = stats.canJumpRiver || false;
        this.chargeSpeed = stats.chargeSpeed || 0;
        this.chargeDistance = stats.chargeDistance || 0;
        this.chargeDamageMultiplier = stats.chargeDamageMultiplier || 1;
        
        // State
        this.state = 'moving'; // 'moving', 'attacking', 'charging'
        this.target = null;
        this.path = [];
        this.isCharging = false;
        this.chargeTarget = null;
        
        // Movement
        this.vx = 0;
        this.vy = 0;
        this.targetX = x;
        this.targetY = y;
        
        // Retarget cooldown
        this.lastRetargetTime = 0;
        
        // Animation
        this.animationFrame = 0;
        this.animationTimer = 0;
    }

    /**
     * Update troop
     */
    update(deltaTime, gameState) {
        if (this.isDead || !this.isActive) return;

        const currentTime = Date.now();
        
        // Update animation
        this.animationTimer += deltaTime;
        if (this.animationTimer > 100) {
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTimer = 0;
        }

        // HANYA cari target baru jika tidak punya target atau target sudah mati
        // Ini memastikan troop tetap fokus pada satu target
        if (!this.target || this.target.isDead || !this.target.isActive) {
            this.target = null; // Reset target
            this.findTarget(gameState);
        }

        // Update based on state
        if (this.target && !this.target.isDead) {
            const dist = this.distanceTo(this.target);
            
            // Check for charge ability
            if (this.chargeDistance > 0 && !this.isCharging && dist <= this.chargeDistance && dist > this.range) {
                this.startCharge();
            }
            
            if (this.isInRange(this.target)) {
                // Attack - tetap serang target yang sama
                this.state = 'attacking';
                this.attack(this.target, currentTime);
            } else {
                // Move towards target
                this.state = this.isCharging ? 'charging' : 'moving';
                this.moveTowards(this.target, deltaTime);
            }
        } else {
            // Tidak ada target, bergerak ke base musuh
            this.state = 'moving';
            this.moveTowardsBase(deltaTime, gameState);
        }

        // Handle collisions with other troops
        this.handleCollisions(gameState);
    }

    /**
     * Find a target - LOCK ON sampai target mati
     */
    findTarget(gameState) {
        // Jika sudah punya target yang masih hidup, jangan ganti
        if (this.target && !this.target.isDead && this.target.isActive) {
            return;
        }
        
        let bestTarget = null;
        let bestDistance = Infinity;
        
        // Get potential targets based on targeting type
        const enemies = this.team === 'player' ? gameState.enemyTroops : gameState.playerTroops;
        const enemyTowers = this.team === 'player' ? gameState.enemyTowers : gameState.playerTowers;
        
        // If targets buildings only, prioritize towers
        if (this.targets === 'buildings') {
            // Cari tower terdekat yang masih hidup
            for (const tower of enemyTowers) {
                if (tower.isDead || !tower.isActive) continue;
                const dist = this.distanceTo(tower);
                if (dist < bestDistance) {
                    bestDistance = dist;
                    bestTarget = tower;
                }
            }
        } else {
            // Cari musuh terdekat dalam aggro range
            for (const enemy of enemies) {
                if (enemy.isDead || !enemy.isActive) continue;
                const dist = this.distanceTo(enemy);
                if (dist <= GameConfig.GAMEPLAY.AGGRO_RANGE && dist < bestDistance) {
                    bestDistance = dist;
                    bestTarget = enemy;
                }
            }
            
            // Jika tidak ada troop musuh dalam range, cari tower
            if (!bestTarget) {
                for (const tower of enemyTowers) {
                    if (tower.isDead || !tower.isActive) continue;
                    const dist = this.distanceTo(tower);
                    if (dist < bestDistance) {
                        bestDistance = dist;
                        bestTarget = tower;
                    }
                }
            }
        }
        
        // Set target baru (akan di-lock sampai mati)
        if (bestTarget) {
            this.target = bestTarget;
            this.lastRetargetTime = Date.now();
        }
    }

    /**
     * Move towards a target
     */
    moveTowards(target, deltaTime) {
        const speed = this.isCharging ? this.chargeSpeed : this.moveSpeed;
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            // Check river crossing
            const nextY = this.y + (dy / dist) * speed * (deltaTime / 1000);
            if (!this.canCrossAtPosition(this.x, nextY)) {
                // Navigate to bridge
                this.navigateToBridge(deltaTime);
                return;
            }
            
            this.vx = (dx / dist) * speed;
            this.vy = (dy / dist) * speed;
            
            this.x += this.vx * (deltaTime / 1000);
            this.y += this.vy * (deltaTime / 1000);
        }
    }

    /**
     * Move towards enemy base - sambil cari target
     */
    moveTowardsBase(deltaTime, gameState) {
        // Coba cari target saat bergerak
        if (gameState) {
            this.findTarget(gameState);
            if (this.target && !this.target.isDead) {
                return; // Ada target, akan di-handle di update()
            }
        }
        
        const targetY = this.team === 'player' ? 60 : GameConfig.ARENA.HEIGHT - 60;
        const dy = targetY - this.y;
        const dist = Math.abs(dy);
        
        if (dist > 5) {
            // Check river crossing
            const nextY = this.y + Math.sign(dy) * this.moveSpeed * (deltaTime / 1000);
            if (!this.canCrossAtPosition(this.x, nextY)) {
                this.navigateToBridge(deltaTime);
                return;
            }
            
            this.vy = Math.sign(dy) * this.moveSpeed;
            this.y += this.vy * (deltaTime / 1000);
        }
    }

    /**
     * Check if can cross river at position
     */
    canCrossAtPosition(x, y) {
        const arena = GameConfig.ARENA;
        const bridgeY = arena.BRIDGE_Y;
        const riverHalf = arena.RIVER_HEIGHT / 2;
        
        // Not in river area
        if (y < bridgeY - riverHalf || y > bridgeY + riverHalf) {
            return true;
        }
        
        // Can jump river
        if (this.canJumpRiver) {
            return true;
        }
        
        // Check if on bridge
        return GameUtils.isOnBridge(x, y);
    }

    /**
     * Navigate to nearest bridge
     */
    navigateToBridge(deltaTime) {
        const bridge = GameUtils.getNearestBridge(this.x, this.y, this.team === 'player' ? 0 : 640);
        
        const dx = bridge.x - this.x;
        const dy = bridge.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 5) {
            this.vx = (dx / dist) * this.moveSpeed;
            this.vy = (dy / dist) * this.moveSpeed;
            
            this.x += this.vx * (deltaTime / 1000);
            this.y += this.vy * (deltaTime / 1000);
        }
    }

    /**
     * Start charge attack
     */
    startCharge() {
        this.isCharging = true;
        this.chargeTarget = this.target;
    }

    /**
     * Perform attack
     */
    attack(target, currentTime) {
        if (!this.canAttack(currentTime)) return false;
        
        this.lastAttackTime = currentTime;
        
        // Calculate damage
        let damage = this.damage;
        if (this.isCharging && this.chargeTarget === target) {
            damage *= this.chargeDamageMultiplier;
            this.isCharging = false;
            this.chargeTarget = null;
        }
        
        // Splash damage
        if (this.splashRadius > 0) {
            this.dealSplashDamage(target, damage, currentTime);
        } else {
            target.takeDamage(damage, this);
        }
        
        // Create projectile for ranged attacks
        if (this.attackType === 'ranged' && window.GameEngine && window.GameEngine.instance) {
            window.GameEngine.instance.createProjectile(this, target, damage);
        }
        
        return true;
    }

    /**
     * Deal splash damage
     */
    dealSplashDamage(mainTarget, damage, currentTime) {
        const gameState = window.GameEngine.instance.getGameState();
        const enemies = this.team === 'player' ? gameState.enemyTroops : gameState.playerTroops;
        
        // Damage main target
        mainTarget.takeDamage(damage, this);
        
        // Damage nearby enemies
        for (const enemy of enemies) {
            if (enemy === mainTarget || enemy.isDead) continue;
            const dist = GameUtils.distance(mainTarget.x, mainTarget.y, enemy.x, enemy.y);
            if (dist <= this.splashRadius) {
                enemy.takeDamage(damage * 0.5, this); // 50% splash damage
            }
        }
    }

    /**
     * Handle collisions with other troops
     */
    handleCollisions(gameState) {
        const allTroops = [...gameState.playerTroops, ...gameState.enemyTroops];
        
        for (const other of allTroops) {
            if (other === this || other.isDead) continue;
            
            const dist = this.distanceTo(other);
            const minDist = this.size + other.size;
            
            if (dist < minDist && dist > 0) {
                // Push apart
                const overlap = minDist - dist;
                const dx = (other.x - this.x) / dist;
                const dy = (other.y - this.y) / dist;
                
                const pushForce = GameConfig.GAMEPLAY.COLLISION_PUSH_FORCE;
                this.x -= dx * overlap * pushForce;
                this.y -= dy * overlap * pushForce;
            }
        }
        
        // Keep in bounds
        this.x = GameUtils.clamp(this.x, this.size, GameConfig.ARENA.WIDTH - this.size);
        this.y = GameUtils.clamp(this.y, this.size, GameConfig.ARENA.HEIGHT - this.size);
    }

    /**
     * Draw troop
     */
    draw(ctx) {
        if (!this.isActive) return;

        // Draw line to target (jika sedang menyerang)
        if (this.target && !this.target.isDead && this.state === 'attacking') {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.target.x, this.target.y);
            ctx.strokeStyle = this.team === 'player' ? 'rgba(33, 150, 243, 0.3)' : 'rgba(244, 67, 54, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw shadow
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + this.size * 0.8, this.size * 0.8, this.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();

        // Draw body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Team color gradient
        const gradient = ctx.createRadialGradient(
            this.x - this.size * 0.3, this.y - this.size * 0.3, 0,
            this.x, this.y, this.size
        );
        gradient.addColorStop(0, this.team === 'player' ? '#64b5f6' : '#ef5350');
        gradient.addColorStop(1, this.team === 'player' ? '#1976d2' : '#c62828');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Border - lebih tebal jika sedang menyerang
        ctx.strokeStyle = this.team === 'player' ? '#0d47a1' : '#b71c1c';
        ctx.lineWidth = this.state === 'attacking' ? 3 : 2;
        ctx.stroke();

        // Draw icon
        ctx.fillStyle = '#fff';
        ctx.font = `${Math.floor(this.size * 1.2)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, this.x, this.y);

        // Draw health bar
        this.drawHealthBar(ctx);
        
        // Draw charge indicator
        if (this.isCharging) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + 5, 0, Math.PI * 2);
            ctx.strokeStyle = '#ffeb3b';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }
}

// Export
window.Troop = Troop;
