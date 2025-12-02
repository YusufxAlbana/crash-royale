/* ============================================
   GAME ENGINE
   Core game loop and state management
   ============================================ */

class GameEngine {
    constructor() {
        // Singleton instance
        GameEngine.instance = this;
        
        // Canvas setup
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = GameConfig.ARENA.WIDTH;
        this.canvas.height = GameConfig.ARENA.HEIGHT;
        
        // Arena
        this.arena = new Arena(this.canvas);
        
        // Game state
        this.gameState = {
            isRunning: false,
            isPaused: false,
            isOvertime: false,
            isSuddenDeath: false,
            winner: null,
            
            // Timer
            timeRemaining: GameConfig.TIMER.BATTLE_DURATION,
            
            // Entities
            playerTroops: [],
            enemyTroops: [],
            playerTowers: [],
            enemyTowers: [],
            projectiles: [],
            
            // Effects
            damageNumbers: [],
            deathEffects: [],
            
            // Scores
            playerCrowns: 0,
            enemyCrowns: 0
        };
        
        // Player state
        this.playerState = {
            elixir: GameConfig.ELIXIR.START,
            deck: [...DefaultDeck],
            hand: [],
            nextCard: null,
            selectedCard: null
        };
        
        // Enemy state (for AI)
        this.enemyState = {
            elixir: GameConfig.ELIXIR.START,
            deck: [...DefaultDeck],
            hand: [],
            nextCard: null
        };
        
        // Timing
        this.lastTime = 0;
        this.deltaTime = 0;
        this.animationFrameId = null;
        
        // Input
        this.isDragging = false;
        this.dragCard = null;
        this.dragX = 0;
        this.dragY = 0;
        this.canvasScale = 1;
        
        // AI Opponent
        this.aiOpponent = null;
        this.isVsAI = true;
        
        // Messages
        this.messages = [];
        
        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
    }

    /**
     * Initialize game
     */
    init(playerDeck, isVsAI = true) {
        console.log('Initializing game...');
        
        this.isVsAI = isVsAI;
        
        // Reset game state
        this.resetGameState();
        
        // Set player deck
        this.playerState.deck = playerDeck ? [...playerDeck] : [...DefaultDeck];
        this.enemyState.deck = GameUtils.shuffle([...DefaultDeck]);
        
        // Initialize hands
        this.initializeHands();
        
        // Create towers
        this.createTowers();
        
        // Initialize AI
        if (this.isVsAI) {
            this.aiOpponent = new AIOpponent(this);
        }
        
        // Setup input
        this.setupInput();
        
        // Resize canvas
        this.canvasScale = this.arena.resize();
        
        console.log('Game initialized');
    }


    /**
     * Reset game state
     */
    resetGameState() {
        this.gameState = {
            isRunning: false,
            isPaused: false,
            isOvertime: false,
            isSuddenDeath: false,
            winner: null,
            timeRemaining: GameConfig.TIMER.BATTLE_DURATION,
            playerTroops: [],
            enemyTroops: [],
            playerTowers: [],
            enemyTowers: [],
            projectiles: [],
            damageNumbers: [],
            deathEffects: [],
            playerCrowns: 0,
            enemyCrowns: 0
        };
        
        this.playerState.elixir = GameConfig.ELIXIR.START;
        this.enemyState.elixir = GameConfig.ELIXIR.START;
        this.playerState.selectedCard = null;
        
        this.messages = [];
    }

    /**
     * Initialize card hands
     */
    initializeHands() {
        // Shuffle decks
        this.playerState.deck = GameUtils.shuffle(this.playerState.deck);
        this.enemyState.deck = GameUtils.shuffle(this.enemyState.deck);
        
        // Draw initial hand (4 cards)
        this.playerState.hand = this.playerState.deck.splice(0, 4);
        this.playerState.nextCard = this.playerState.deck.shift();
        
        this.enemyState.hand = this.enemyState.deck.splice(0, 4);
        this.enemyState.nextCard = this.enemyState.deck.shift();
    }

    /**
     * Create towers
     */
    createTowers() {
        const towers = GameConfig.TOWERS;
        
        // Player towers
        this.gameState.playerTowers = [
            new Tower(towers.PLAYER.LEFT.x, towers.PLAYER.LEFT.y, 'player', 'princess'),
            new Tower(towers.PLAYER.RIGHT.x, towers.PLAYER.RIGHT.y, 'player', 'princess'),
            new Tower(towers.PLAYER.KING.x, towers.PLAYER.KING.y, 'player', 'king')
        ];
        
        // Enemy towers
        this.gameState.enemyTowers = [
            new Tower(towers.ENEMY.LEFT.x, towers.ENEMY.LEFT.y, 'enemy', 'princess'),
            new Tower(towers.ENEMY.RIGHT.x, towers.ENEMY.RIGHT.y, 'enemy', 'princess'),
            new Tower(towers.ENEMY.KING.x, towers.ENEMY.KING.y, 'enemy', 'king')
        ];
    }

    /**
     * Setup input handlers
     */
    setupInput() {
        // Remove old listeners
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        
        // Add new listeners
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    }

    /**
     * Start game
     */
    start() {
        console.log('Starting game...');
        this.gameState.isRunning = true;
        this.lastTime = performance.now();
        this.showMessage('Battle Start!');
        this.gameLoop();
    }

    /**
     * Stop game
     */
    stop() {
        this.gameState.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Main game loop
     */
    gameLoop(currentTime = performance.now()) {
        if (!this.gameState.isRunning) return;
        
        // Calculate delta time
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Cap delta time
        if (this.deltaTime > 100) this.deltaTime = 100;
        
        // Update
        if (!this.gameState.isPaused) {
            this.update(this.deltaTime);
        }
        
        // Render
        this.render();
        
        // Next frame
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    /**
     * Update game state
     */
    update(deltaTime) {
        // Update timer
        this.updateTimer(deltaTime);
        
        // Update elixir
        this.updateElixir(deltaTime);
        
        // Update AI
        if (this.isVsAI && this.aiOpponent) {
            this.aiOpponent.update(deltaTime);
        }
        
        // Update entities
        this.updateEntities(deltaTime);
        
        // Update projectiles
        this.updateProjectiles(deltaTime);
        
        // Update effects
        this.updateEffects(deltaTime);
        
        // Check win condition
        this.checkWinCondition();
        
        // Update UI
        this.updateUI();
    }


    /**
     * Update timer
     */
    updateTimer(deltaTime) {
        this.gameState.timeRemaining -= deltaTime / 1000;
        
        if (this.gameState.timeRemaining <= 0) {
            if (!this.gameState.isOvertime) {
                // Check if tied
                if (this.gameState.playerCrowns === this.gameState.enemyCrowns) {
                    // Start overtime
                    this.gameState.isOvertime = true;
                    this.gameState.timeRemaining = GameConfig.TIMER.OVERTIME_DURATION;
                    this.showMessage('OVERTIME!');
                } else {
                    // End game
                    this.endGame();
                }
            } else {
                // Overtime ended
                this.endGame();
            }
        }
    }

    /**
     * Update elixir
     */
    updateElixir(deltaTime) {
        const regenRate = this.gameState.isOvertime 
            ? GameConfig.ELIXIR.OVERTIME_REGEN_RATE 
            : GameConfig.ELIXIR.REGEN_RATE;
        
        // Player elixir
        this.playerState.elixir += regenRate * (deltaTime / 16.67);
        if (this.playerState.elixir > GameConfig.ELIXIR.MAX) {
            this.playerState.elixir = GameConfig.ELIXIR.MAX;
        }
        
        // Enemy elixir
        this.enemyState.elixir += regenRate * (deltaTime / 16.67);
        if (this.enemyState.elixir > GameConfig.ELIXIR.MAX) {
            this.enemyState.elixir = GameConfig.ELIXIR.MAX;
        }
    }

    /**
     * Update all entities
     */
    updateEntities(deltaTime) {
        // Update player troops
        for (const troop of this.gameState.playerTroops) {
            troop.update(deltaTime, this.gameState);
        }
        
        // Update enemy troops
        for (const troop of this.gameState.enemyTroops) {
            troop.update(deltaTime, this.gameState);
        }
        
        // Update towers
        for (const tower of this.gameState.playerTowers) {
            tower.update(deltaTime, this.gameState);
        }
        for (const tower of this.gameState.enemyTowers) {
            tower.update(deltaTime, this.gameState);
        }
        
        // Remove dead troops
        this.gameState.playerTroops = this.gameState.playerTroops.filter(t => !t.isDead);
        this.gameState.enemyTroops = this.gameState.enemyTroops.filter(t => !t.isDead);
    }

    /**
     * Update projectiles
     */
    updateProjectiles(deltaTime) {
        for (const projectile of this.gameState.projectiles) {
            projectile.update(deltaTime);
        }
        
        // Remove inactive projectiles
        this.gameState.projectiles = this.gameState.projectiles.filter(p => p.isActive);
    }

    /**
     * Update visual effects
     */
    updateEffects(deltaTime) {
        // Update damage numbers
        for (const dmg of this.gameState.damageNumbers) {
            dmg.y -= 1;
            dmg.alpha -= deltaTime / GameConfig.VISUAL.DAMAGE_NUMBER_DURATION;
        }
        this.gameState.damageNumbers = this.gameState.damageNumbers.filter(d => d.alpha > 0);
        
        // Update death effects
        for (const effect of this.gameState.deathEffects) {
            effect.progress += deltaTime / GameConfig.VISUAL.DEATH_EFFECT_DURATION;
        }
        this.gameState.deathEffects = this.gameState.deathEffects.filter(e => e.progress < 1);
        
        // Update messages
        for (const msg of this.messages) {
            msg.timer -= deltaTime;
        }
        this.messages = this.messages.filter(m => m.timer > 0);
    }

    /**
     * Check win condition
     */
    checkWinCondition() {
        // Check if king tower destroyed
        const playerKing = this.gameState.playerTowers.find(t => t.type === 'king');
        const enemyKing = this.gameState.enemyTowers.find(t => t.type === 'king');
        
        if (playerKing && playerKing.isDead) {
            this.gameState.winner = 'enemy';
            this.endGame();
        } else if (enemyKing && enemyKing.isDead) {
            this.gameState.winner = 'player';
            this.endGame();
        }
    }

    /**
     * End game
     */
    endGame() {
        this.gameState.isRunning = false;
        
        // Determine winner if not already set
        if (!this.gameState.winner) {
            if (this.gameState.playerCrowns > this.gameState.enemyCrowns) {
                this.gameState.winner = 'player';
            } else if (this.gameState.enemyCrowns > this.gameState.playerCrowns) {
                this.gameState.winner = 'enemy';
            } else {
                this.gameState.winner = 'draw';
            }
        }
        
        console.log('Game ended. Winner:', this.gameState.winner);
        
        // Trigger game end callback
        if (window.onGameEnd) {
            window.onGameEnd(this.gameState);
        }
    }

    /**
     * Update UI elements
     */
    updateUI() {
        // Update timer display
        const timerEl = document.getElementById('game-timer');
        if (timerEl) {
            timerEl.textContent = GameUtils.formatTime(Math.max(0, this.gameState.timeRemaining));
            if (this.gameState.isOvertime) {
                timerEl.classList.add('overtime');
            }
        }
        
        // Update elixir display
        const elixirFill = document.getElementById('elixir-fill');
        const elixirCount = document.getElementById('elixir-count');
        if (elixirFill && elixirCount) {
            const percent = (this.playerState.elixir / GameConfig.ELIXIR.MAX) * 100;
            elixirFill.style.width = `${percent}%`;
            elixirCount.textContent = Math.floor(this.playerState.elixir);
        }
    }


    /**
     * Render game
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw arena
        this.arena.draw();
        
        // Draw towers
        for (const tower of this.gameState.playerTowers) {
            tower.draw(this.ctx);
        }
        for (const tower of this.gameState.enemyTowers) {
            tower.draw(this.ctx);
        }
        
        // Draw troops
        for (const troop of this.gameState.playerTroops) {
            troop.draw(this.ctx);
        }
        for (const troop of this.gameState.enemyTroops) {
            troop.draw(this.ctx);
        }
        
        // Draw projectiles
        for (const projectile of this.gameState.projectiles) {
            projectile.draw(this.ctx);
        }
        
        // Draw effects
        this.renderEffects();
        
        // Draw drag indicator
        if (this.isDragging && this.dragCard) {
            this.renderDragIndicator();
        }
        
        // Draw messages
        this.renderMessages();
    }

    /**
     * Render visual effects
     */
    renderEffects() {
        // Damage numbers
        for (const dmg of this.gameState.damageNumbers) {
            this.ctx.fillStyle = `rgba(255, 255, 0, ${dmg.alpha})`;
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`-${dmg.amount}`, dmg.x, dmg.y);
        }
        
        // Death effects
        for (const effect of this.gameState.deathEffects) {
            const alpha = 1 - effect.progress;
            const radius = 20 + effect.progress * 30;
            
            this.ctx.beginPath();
            this.ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 200, 100, ${alpha * 0.5})`;
            this.ctx.fill();
        }
    }

    /**
     * Render drag indicator
     */
    renderDragIndicator() {
        const isValid = GameUtils.isValidPlayerSpawn(this.dragX, this.dragY);
        this.arena.drawSpawnIndicator(this.dragX, this.dragY, isValid);
        
        // Draw card icon at drag position
        const cardData = getCardById(this.dragCard);
        if (cardData) {
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(cardData.icon, this.dragX, this.dragY);
        }
    }

    /**
     * Render messages
     */
    renderMessages() {
        for (let i = 0; i < this.messages.length; i++) {
            const msg = this.messages[i];
            const alpha = Math.min(1, msg.timer / 500);
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
            this.ctx.lineWidth = 3;
            this.ctx.strokeText(msg.text, this.canvas.width / 2, 200 + i * 30);
            this.ctx.fillText(msg.text, this.canvas.width / 2, 200 + i * 30);
        }
    }

    /**
     * Spawn troop
     */
    spawnTroop(cardId, x, y, team) {
        const cardData = getCardById(cardId);
        if (!cardData) return null;
        
        const troops = [];
        const count = cardData.stats.count || 1;
        const spread = cardData.stats.spawnSpread || 0;
        
        for (let i = 0; i < count; i++) {
            // Calculate spawn position with spread
            let spawnX = x;
            let spawnY = y;
            
            if (count > 1 && spread > 0) {
                const angle = (i / count) * Math.PI * 2;
                spawnX = x + Math.cos(angle) * spread;
                spawnY = y + Math.sin(angle) * spread;
            }
            
            const troop = new Troop(spawnX, spawnY, team, cardData);
            troops.push(troop);
            
            if (team === 'player') {
                this.gameState.playerTroops.push(troop);
            } else {
                this.gameState.enemyTroops.push(troop);
            }
        }
        
        return troops;
    }

    /**
     * Play card (player)
     */
    playCard(cardIndex, x, y) {
        const cardId = this.playerState.hand[cardIndex];
        if (!cardId) return false;
        
        const cardData = getCardById(cardId);
        if (!cardData) return false;
        
        // Check elixir
        if (this.playerState.elixir < cardData.elixirCost) {
            this.showMessage('Not enough elixir!');
            return false;
        }
        
        // Check spawn position
        if (!GameUtils.isValidPlayerSpawn(x, y)) {
            this.showMessage('Invalid spawn position!');
            return false;
        }
        
        // Deduct elixir
        this.playerState.elixir -= cardData.elixirCost;
        
        // Spawn troop
        this.spawnTroop(cardId, x, y, 'player');
        
        // Rotate cards
        this.rotatePlayerCard(cardIndex);
        
        return true;
    }

    /**
     * Rotate player card
     */
    rotatePlayerCard(cardIndex) {
        // Remove played card
        this.playerState.hand.splice(cardIndex, 1);
        
        // Add next card to hand
        if (this.playerState.nextCard) {
            this.playerState.hand.push(this.playerState.nextCard);
        }
        
        // Draw new next card
        if (this.playerState.deck.length > 0) {
            this.playerState.nextCard = this.playerState.deck.shift();
        } else {
            // Reshuffle played cards
            this.playerState.deck = GameUtils.shuffle([...DefaultDeck]);
            this.playerState.nextCard = this.playerState.deck.shift();
        }
        
        // Update UI
        if (window.updateCardHand) {
            window.updateCardHand(this.playerState.hand, this.playerState.nextCard);
        }
    }


    /**
     * Create projectile
     */
    createProjectile(source, target, damage) {
        const projectile = new Projectile(source, target, damage);
        this.gameState.projectiles.push(projectile);
        return projectile;
    }

    /**
     * Create damage number effect
     */
    createDamageNumber(x, y, amount) {
        this.gameState.damageNumbers.push({
            x: x + GameUtils.random(-10, 10),
            y: y,
            amount: Math.round(amount),
            alpha: 1
        });
    }

    /**
     * Create death effect
     */
    createDeathEffect(x, y) {
        this.gameState.deathEffects.push({
            x: x,
            y: y,
            progress: 0
        });
    }

    /**
     * Show message
     */
    showMessage(text) {
        this.messages.push({
            text: text,
            timer: 2000
        });
    }

    /**
     * Tower destroyed callback
     */
    onTowerDestroyed(tower) {
        if (tower.team === 'player') {
            this.gameState.enemyCrowns++;
            if (tower.type === 'king') {
                this.gameState.enemyCrowns = 3;
            }
        } else {
            this.gameState.playerCrowns++;
            if (tower.type === 'king') {
                this.gameState.playerCrowns = 3;
            }
        }
        
        // Update tower display
        this.updateTowerDisplay();
        
        // Show message
        const msg = tower.team === 'player' ? 'Tower Lost!' : 'Tower Destroyed!';
        this.showMessage(msg);
    }

    /**
     * Update tower display
     */
    updateTowerDisplay() {
        const yourTowers = document.getElementById('your-towers');
        const enemyTowers = document.getElementById('enemy-towers');
        
        if (yourTowers) {
            const alive = this.gameState.playerTowers.filter(t => !t.isDead).length;
            yourTowers.textContent = '🏰'.repeat(alive) + '💥'.repeat(3 - alive);
        }
        
        if (enemyTowers) {
            const alive = this.gameState.enemyTowers.filter(t => !t.isDead).length;
            enemyTowers.textContent = '🏰'.repeat(alive) + '💥'.repeat(3 - alive);
        }
    }

    /**
     * Get game state (for AI and other systems)
     */
    getGameState() {
        return this.gameState;
    }

    /**
     * Get player state
     */
    getPlayerState() {
        return this.playerState;
    }

    /**
     * Get enemy state
     */
    getEnemyState() {
        return this.enemyState;
    }

    // ========================================
    // INPUT HANDLERS
    // ========================================

    /**
     * Get canvas coordinates from event
     */
    getCanvasCoords(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (clientX - rect.left) / this.canvasScale,
            y: (clientY - rect.top) / this.canvasScale
        };
    }

    /**
     * Handle mouse down
     */
    handleMouseDown(e) {
        if (!this.gameState.isRunning) return;
        
        const coords = this.getCanvasCoords(e.clientX, e.clientY);
        this.startDrag(coords.x, coords.y);
    }

    /**
     * Handle mouse move
     */
    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const coords = this.getCanvasCoords(e.clientX, e.clientY);
        this.updateDrag(coords.x, coords.y);
    }

    /**
     * Handle mouse up
     */
    handleMouseUp(e) {
        if (!this.isDragging) return;
        
        const coords = this.getCanvasCoords(e.clientX, e.clientY);
        this.endDrag(coords.x, coords.y);
    }

    /**
     * Handle touch start
     */
    handleTouchStart(e) {
        e.preventDefault();
        if (!this.gameState.isRunning) return;
        
        const touch = e.touches[0];
        const coords = this.getCanvasCoords(touch.clientX, touch.clientY);
        this.startDrag(coords.x, coords.y);
    }

    /**
     * Handle touch move
     */
    handleTouchMove(e) {
        e.preventDefault();
        if (!this.isDragging) return;
        
        const touch = e.touches[0];
        const coords = this.getCanvasCoords(touch.clientX, touch.clientY);
        this.updateDrag(coords.x, coords.y);
    }

    /**
     * Handle touch end
     */
    handleTouchEnd(e) {
        e.preventDefault();
        if (!this.isDragging) return;
        
        this.endDrag(this.dragX, this.dragY);
    }

    /**
     * Start drag
     */
    startDrag(x, y) {
        // Check if clicking on spawn area
        if (GameUtils.isValidPlayerSpawn(x, y) && this.playerState.selectedCard !== null) {
            this.isDragging = true;
            this.dragCard = this.playerState.hand[this.playerState.selectedCard];
            this.dragX = x;
            this.dragY = y;
        }
    }

    /**
     * Update drag
     */
    updateDrag(x, y) {
        this.dragX = x;
        this.dragY = y;
    }

    /**
     * End drag
     */
    endDrag(x, y) {
        if (this.dragCard && this.playerState.selectedCard !== null) {
            this.playCard(this.playerState.selectedCard, x, y);
        }
        
        this.isDragging = false;
        this.dragCard = null;
        this.playerState.selectedCard = null;
    }

    /**
     * Select card
     */
    selectCard(index) {
        if (index >= 0 && index < this.playerState.hand.length) {
            this.playerState.selectedCard = index;
        }
    }

    /**
     * Deselect card
     */
    deselectCard() {
        this.playerState.selectedCard = null;
    }
}

// Export
window.GameEngine = GameEngine;
