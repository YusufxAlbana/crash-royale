/* ============================================
   AI OPPONENT
   Simple AI for single player mode
   ============================================ */

class AIOpponent {
    constructor(gameEngine) {
        this.game = gameEngine;
        
        // AI settings
        this.difficulty = 'normal'; // 'easy', 'normal', 'hard'
        this.reactionTime = 1000;   // ms before AI reacts
        this.lastActionTime = 0;
        
        // Decision making
        this.minElixirToPlay = 4;
        this.aggressiveness = 0.5;  // 0-1, higher = more aggressive
        
        // Tracking
        this.lastPlayerTroopCount = 0;
        this.defendMode = false;
    }

    /**
     * Update AI
     */
    update(deltaTime) {
        const currentTime = Date.now();
        
        // Check reaction time
        if (currentTime - this.lastActionTime < this.reactionTime) {
            return;
        }
        
        const enemyState = this.game.getEnemyState();
        const gameState = this.game.getGameState();
        
        // Check if should defend
        this.checkDefendMode(gameState);
        
        // Try to play a card
        if (enemyState.elixir >= this.minElixirToPlay) {
            this.makeDecision(enemyState, gameState, currentTime);
        }
    }

    /**
     * Check if AI should be in defend mode
     */
    checkDefendMode(gameState) {
        // Count player troops in enemy territory
        const threateningTroops = gameState.playerTroops.filter(t => 
            t.y < GameConfig.ARENA.BRIDGE_Y + 50
        );
        
        this.defendMode = threateningTroops.length > 0;
    }

    /**
     * Make a decision
     */
    makeDecision(enemyState, gameState, currentTime) {
        // Get playable cards
        const playableCards = this.getPlayableCards(enemyState);
        if (playableCards.length === 0) return;
        
        // Choose card based on situation
        let chosenCard = null;
        let spawnPos = null;
        
        if (this.defendMode) {
            // Defensive play
            const result = this.chooseDefensiveCard(playableCards, gameState);
            chosenCard = result.card;
            spawnPos = result.position;
        } else {
            // Offensive play
            const result = this.chooseOffensiveCard(playableCards, gameState);
            chosenCard = result.card;
            spawnPos = result.position;
        }
        
        if (chosenCard && spawnPos) {
            this.playCard(chosenCard, spawnPos, enemyState);
            this.lastActionTime = currentTime;
        }
    }

    /**
     * Get playable cards
     */
    getPlayableCards(enemyState) {
        return enemyState.hand.filter(cardId => {
            const card = getCardById(cardId);
            return card && card.elixirCost <= enemyState.elixir;
        });
    }

    /**
     * Choose defensive card
     */
    chooseDefensiveCard(playableCards, gameState) {
        // Find threatening troops
        const threats = gameState.playerTroops.filter(t => 
            t.y < GameConfig.ARENA.BRIDGE_Y + 100
        );
        
        if (threats.length === 0) {
            return this.chooseOffensiveCard(playableCards, gameState);
        }
        
        // Find the biggest threat
        const biggestThreat = threats.reduce((a, b) => 
            (a.hp * a.damage) > (b.hp * b.damage) ? a : b
        );
        
        // Choose counter card
        let bestCard = null;
        let bestScore = -1;
        
        for (const cardId of playableCards) {
            const card = getCardById(cardId);
            const score = this.evaluateDefensiveCard(card, biggestThreat);
            if (score > bestScore) {
                bestScore = score;
                bestCard = cardId;
            }
        }
        
        // Spawn near the threat
        const spawnX = GameUtils.clamp(biggestThreat.x, 50, GameConfig.ARENA.WIDTH - 50);
        const spawnY = GameUtils.random(GameConfig.ARENA.ENEMY_SPAWN_MIN_Y + 20, GameConfig.ARENA.ENEMY_SPAWN_MAX_Y - 20);
        
        return {
            card: bestCard || playableCards[0],
            position: { x: spawnX, y: spawnY }
        };
    }

    /**
     * Evaluate defensive card
     */
    evaluateDefensiveCard(card, threat) {
        let score = 0;
        
        // Prefer ranged against melee
        if (threat.attackType === 'melee' && card.stats.attackType === 'ranged') {
            score += 20;
        }
        
        // Prefer splash against swarms
        if (card.stats.splashRadius > 0) {
            score += 15;
        }
        
        // Prefer high DPS
        const dps = card.stats.damage * card.stats.attackSpeed;
        score += dps / 50;
        
        // Prefer cheaper cards for defense
        score += (10 - card.elixirCost) * 5;
        
        return score;
    }


    /**
     * Choose offensive card
     */
    chooseOffensiveCard(playableCards, gameState) {
        // Determine lane to attack
        const lane = this.chooseLane(gameState);
        
        // Choose card based on strategy
        let bestCard = null;
        let bestScore = -1;
        
        for (const cardId of playableCards) {
            const card = getCardById(cardId);
            const score = this.evaluateOffensiveCard(card, gameState);
            if (score > bestScore) {
                bestScore = score;
                bestCard = cardId;
            }
        }
        
        // Calculate spawn position
        const laneX = lane === 0 ? GameConfig.ARENA.WIDTH * 0.25 : GameConfig.ARENA.WIDTH * 0.75;
        const spawnX = laneX + GameUtils.random(-30, 30);
        const spawnY = GameUtils.random(GameConfig.ARENA.ENEMY_SPAWN_MIN_Y + 20, GameConfig.ARENA.ENEMY_SPAWN_MAX_Y - 20);
        
        return {
            card: bestCard || playableCards[0],
            position: { x: spawnX, y: spawnY }
        };
    }

    /**
     * Choose which lane to attack
     */
    chooseLane(gameState) {
        // Check tower health
        const leftTower = gameState.playerTowers.find(t => 
            t.type === 'princess' && t.x < GameConfig.ARENA.WIDTH / 2
        );
        const rightTower = gameState.playerTowers.find(t => 
            t.type === 'princess' && t.x > GameConfig.ARENA.WIDTH / 2
        );
        
        // Attack weaker tower
        if (leftTower && rightTower) {
            if (leftTower.isDead) return 1;
            if (rightTower.isDead) return 0;
            return leftTower.hp < rightTower.hp ? 0 : 1;
        }
        
        // Random if both destroyed
        return Math.random() < 0.5 ? 0 : 1;
    }

    /**
     * Evaluate offensive card
     */
    evaluateOffensiveCard(card, gameState) {
        let score = 0;
        
        // Prefer tanks for pushing
        if (card.stats.hp > 500) {
            score += 20;
        }
        
        // Prefer building targeters
        if (card.stats.targets === 'buildings') {
            score += 25;
        }
        
        // Consider elixir efficiency
        const value = (card.stats.hp + card.stats.damage * 10) / card.elixirCost;
        score += value / 10;
        
        // Add some randomness
        score += GameUtils.random(0, 15);
        
        return score;
    }

    /**
     * Play a card
     */
    playCard(cardId, position, enemyState) {
        const cardData = getCardById(cardId);
        if (!cardData) return;
        
        // Check elixir
        if (enemyState.elixir < cardData.elixirCost) return;
        
        // Deduct elixir
        enemyState.elixir -= cardData.elixirCost;
        
        // Spawn troop
        this.game.spawnTroop(cardId, position.x, position.y, 'enemy');
        
        // Rotate card
        this.rotateCard(enemyState, cardId);
    }

    /**
     * Rotate enemy card
     */
    rotateCard(enemyState, playedCardId) {
        // Find and remove played card
        const index = enemyState.hand.indexOf(playedCardId);
        if (index > -1) {
            enemyState.hand.splice(index, 1);
        }
        
        // Add next card
        if (enemyState.nextCard) {
            enemyState.hand.push(enemyState.nextCard);
        }
        
        // Draw new next card
        if (enemyState.deck.length > 0) {
            enemyState.nextCard = enemyState.deck.shift();
        } else {
            // Reshuffle
            enemyState.deck = GameUtils.shuffle([...DefaultDeck]);
            enemyState.nextCard = enemyState.deck.shift();
        }
    }

    /**
     * Set difficulty
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        
        switch (difficulty) {
            case 'easy':
                this.reactionTime = 2000;
                this.minElixirToPlay = 6;
                this.aggressiveness = 0.3;
                break;
            case 'normal':
                this.reactionTime = 1000;
                this.minElixirToPlay = 4;
                this.aggressiveness = 0.5;
                break;
            case 'hard':
                this.reactionTime = 500;
                this.minElixirToPlay = 3;
                this.aggressiveness = 0.7;
                break;
        }
    }
}

// Export
window.AIOpponent = AIOpponent;
