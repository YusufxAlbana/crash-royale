/* ============================================
   PROJECTILE CLASS
   Represents ranged attack projectiles
   ============================================ */

class Projectile {
    constructor(source, target, damage) {
        this.id = GameUtils.generateId();
        this.x = source.x;
        this.y = source.y;
        this.targetX = target.x;
        this.targetY = target.y;
        this.target = target;
        this.damage = damage;
        this.source = source;
        
        this.speed = 400; // Pixels per second
        this.size = 6;
        this.isActive = true;
        
        // Team color
        this.color = source.team === 'player' ? '#64b5f6' : '#ef5350';
        
        // Trail effect
        this.trail = [];
        this.maxTrailLength = 5;
    }

    /**
     * Update projectile
     */
    update(deltaTime) {
        if (!this.isActive) return;

        // Update target position (for moving targets)
        if (this.target && !this.target.isDead) {
            this.targetX = this.target.x;
            this.targetY = this.target.y;
        }

        // Calculate direction
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Add to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // Check if reached target
        if (dist < this.speed * (deltaTime / 1000) + 5) {
            this.hit();
            return;
        }

        // Move towards target
        const vx = (dx / dist) * this.speed;
        const vy = (dy / dist) * this.speed;
        
        this.x += vx * (deltaTime / 1000);
        this.y += vy * (deltaTime / 1000);

        // Check bounds
        if (this.x < 0 || this.x > GameConfig.ARENA.WIDTH ||
            this.y < 0 || this.y > GameConfig.ARENA.HEIGHT) {
            this.isActive = false;
        }
    }

    /**
     * Hit target
     */
    hit() {
        this.isActive = false;
        
        if (this.target && !this.target.isDead) {
            this.target.takeDamage(this.damage, this.source);
        }
    }

    /**
     * Draw projectile
     */
    draw(ctx) {
        if (!this.isActive) return;

        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            const alpha = (i + 1) / this.trail.length * 0.5;
            const size = this.size * (i + 1) / this.trail.length;
            
            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fillStyle = this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            ctx.fill();
        }

        // Draw projectile
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Gradient
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, this.color);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// Export
window.Projectile = Projectile;
