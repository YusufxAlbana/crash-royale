/* ============================================
   GAME UI
   In-game UI management
   ============================================ */

const GameUI = {
    gameEngine: null,
    selectedCardIndex: null,

    /**
     * Initialize game UI
     */
    init(gameEngine) {
        this.gameEngine = gameEngine;
        this.selectedCardIndex = null;
        
        // Setup card hand
        this.setupCardHand();
        
        // Update initial state
        this.updateCardHand(
            gameEngine.getPlayerState().hand,
            gameEngine.getPlayerState().nextCard
        );
        
        // Setup game end callback
        window.onGameEnd = this.onGameEnd.bind(this);
        
        // Setup global update function
        window.updateCardHand = this.updateCardHand.bind(this);
    },

    /**
     * Setup card hand UI
     */
    setupCardHand() {
        const activeCards = document.getElementById('active-cards');
        if (!activeCards) return;

        // Create 4 card slots
        activeCards.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            const slot = document.createElement('div');
            slot.className = 'card-slot';
            slot.dataset.index = i;
            slot.innerHTML = `
                <div class="card-content">
                    <div class="card-icon"></div>
                    <div class="card-cost"></div>
                </div>
            `;
            activeCards.appendChild(slot);
        }

        // Use event delegation on parent container
        activeCards.onclick = (e) => {
            const slot = e.target.closest('.card-slot');
            if (slot) {
                const index = parseInt(slot.dataset.index);
                console.log('Card clicked:', index);
                this.selectCard(index);
            }
        };

        // Touch handler with event delegation
        activeCards.ontouchstart = (e) => {
            const slot = e.target.closest('.card-slot');
            if (slot) {
                e.preventDefault();
                const index = parseInt(slot.dataset.index);
                console.log('Card touched:', index);
                this.selectCard(index);
            }
        };
    },

    /**
     * Update card hand display
     */
    updateCardHand(hand, nextCard) {
        const activeCards = document.getElementById('active-cards');
        const nextCardEl = document.getElementById('next-card');
        
        if (!activeCards || !hand) return;

        // Update active cards
        const slots = activeCards.querySelectorAll('.card-slot');
        const playerElixir = this.gameEngine?.getPlayerState()?.elixir || 0;
        
        slots.forEach((slot, index) => {
            const cardId = hand[index];
            const card = cardId ? getCardById(cardId) : null;
            
            if (card) {
                const isAffordable = playerElixir >= card.elixirCost;
                const isSelected = this.selectedCardIndex === index;
                
                slot.innerHTML = `
                    <div class="card-content" data-card="${cardId}">
                        <div class="card-cost">${card.elixirCost}</div>
                        <div class="card-icon">${card.icon}</div>
                        <div class="card-name">${card.name}</div>
                    </div>
                `;
                slot.classList.remove('empty');
                slot.classList.toggle('unaffordable', !isAffordable);
                slot.classList.toggle('selected', isSelected);
            } else {
                slot.innerHTML = '<div class="card-content empty"></div>';
                slot.classList.add('empty');
                slot.classList.remove('unaffordable', 'selected');
            }
        });

        // Update next card
        if (nextCardEl && nextCard) {
            const card = getCardById(nextCard);
            if (card) {
                nextCardEl.innerHTML = `
                    <span class="card-label">Next</span>
                    <div class="card-icon">${card.icon}</div>
                `;
            }
        }
    },

    /**
     * Select a card
     */
    selectCard(index) {
        const activeCards = document.getElementById('active-cards');
        if (!activeCards) return;

        const slots = activeCards.querySelectorAll('.card-slot');
        const slot = slots[index];
        
        if (!slot) return;
        
        // Check if card is affordable
        const isUnaffordable = slot.classList.contains('unaffordable');
        
        if (isUnaffordable) {
            // Show red flash effect to indicate not enough elixir
            slot.classList.add('not-enough-elixir');
            setTimeout(() => slot.classList.remove('not-enough-elixir'), 500);
            
            // Still allow selection for preview, but mark as unaffordable
            // User can see where they want to place it
        }
        
        // Deselect all
        slots.forEach(s => s.classList.remove('selected'));
        
        // Select new card
        if (this.selectedCardIndex === index) {
            // Deselect if clicking same card
            this.selectedCardIndex = null;
            if (this.gameEngine) {
                this.gameEngine.deselectCard();
                this.gameEngine.dragCard = null;
            }
        } else {
            this.selectedCardIndex = index;
            slots[index]?.classList.add('selected');
            
            if (this.gameEngine) {
                this.gameEngine.selectCard(index);
                // Set drag card for preview
                this.gameEngine.dragCard = this.gameEngine.playerState.hand[index];
            }
        }
    },
    
    /**
     * Deselect current card
     */
    deselectCard() {
        this.selectedCardIndex = null;
        const activeCards = document.getElementById('active-cards');
        if (activeCards) {
            activeCards.querySelectorAll('.card-slot').forEach(s => s.classList.remove('selected'));
        }
    },

    /**
     * Handle game end
     */
    onGameEnd(gameState) {
        // Disable leave protection since game is over
        if (window.ScreenManager && window.ScreenManager.disableBattleLeaveProtection) {
            window.ScreenManager.disableBattleLeaveProtection();
        }
        
        const modal = document.getElementById('result-modal');
        if (!modal) return;

        // Determine result
        const isWin = gameState.winner === 'player';
        const isDraw = gameState.winner === 'draw';
        const isSurrender = gameState.surrendered === true;

        // Update modal content
        const title = document.getElementById('result-title');
        const yourCrowns = document.getElementById('your-crowns');
        const enemyCrowns = document.getElementById('enemy-crowns');
        const trophyChange = document.getElementById('trophy-change');

        if (title) {
            if (isDraw) {
                title.textContent = 'Draw!';
                title.className = 'draw';
            } else if (isWin) {
                title.textContent = 'Victory!';
                title.className = 'victory';
            } else if (isSurrender) {
                title.textContent = 'Surrendered';
                title.className = 'defeat';
            } else {
                title.textContent = 'Defeat';
                title.className = 'defeat';
            }
        }

        if (yourCrowns) {
            yourCrowns.textContent = '⭐'.repeat(gameState.playerCrowns) + '☆'.repeat(3 - gameState.playerCrowns);
        }

        if (enemyCrowns) {
            enemyCrowns.textContent = '⭐'.repeat(gameState.enemyCrowns) + '☆'.repeat(3 - gameState.enemyCrowns);
        }

        // Calculate trophy change
        let trophies = 0;
        if (isWin) {
            trophies = GameConfig.TROPHIES.WIN;
            if (gameState.playerCrowns === 3) {
                trophies += GameConfig.TROPHIES.THREE_CROWN_BONUS;
            }
        } else if (!isDraw) {
            trophies = GameConfig.TROPHIES.LOSE;
        }

        if (trophyChange) {
            trophyChange.textContent = `${trophies > 0 ? '+' : ''}${trophies} 🏆`;
            trophyChange.className = trophies >= 0 ? 'positive' : 'negative';
        }

        // Update user trophies
        this.updateUserTrophies(trophies, gameState);

        // Show modal
        modal.classList.add('active');
    },

    /**
     * Update user trophies after match
     */
    async updateUserTrophies(trophyChange, gameState) {
        if (!window.currentUser) return;

        // Get replay data from game engine
        let replayData = null;
        if (this.gameEngine && this.gameEngine.getReplayData) {
            replayData = this.gameEngine.getReplayData();
        }

        // Update trophies via AuthService
        if (window.AuthService) {
            window.currentUser.trophies = await AuthService.updateTrophies(trophyChange);
            
            // Save match result with replay
            await AuthService.saveMatchResult({
                result: gameState.winner === 'player' ? 'win' : (gameState.winner === 'draw' ? 'draw' : 'lose'),
                playerCrowns: gameState.playerCrowns,
                enemyCrowns: gameState.enemyCrowns,
                trophyChange: trophyChange,
                opponentName: 'AI Bot',
                replay: replayData
            });
        } else {
            // Fallback
            window.currentUser.trophies = Math.max(0, (window.currentUser.trophies || 0) + trophyChange);
        }

        // Update menu display
        const trophyEl = document.getElementById('player-trophies');
        if (trophyEl) {
            trophyEl.textContent = window.currentUser.trophies;
        }
    }
};

// Export
window.GameUI = GameUI;
