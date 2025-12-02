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

        // Add click handlers
        activeCards.querySelectorAll('.card-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                this.selectCard(parseInt(slot.dataset.index));
            });

            // Touch handlers for drag
            slot.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.selectCard(parseInt(slot.dataset.index));
            });
        });
    },

    /**
     * Update card hand display
     */
    updateCardHand(hand, nextCard) {
        const activeCards = document.getElementById('active-cards');
        const nextCardEl = document.getElementById('next-card');
        
        if (!activeCards) return;

        // Update active cards
        const slots = activeCards.querySelectorAll('.card-slot');
        slots.forEach((slot, index) => {
            const cardId = hand[index];
            const card = cardId ? getCardById(cardId) : null;
            
            if (card) {
                slot.innerHTML = `
                    <div class="card-content" data-card="${cardId}">
                        <div class="card-icon">${card.icon}</div>
                        <div class="card-cost">${card.elixirCost}</div>
                    </div>
                `;
                slot.classList.remove('empty');
                
                // Check if affordable
                const playerElixir = this.gameEngine?.getPlayerState()?.elixir || 0;
                if (playerElixir >= card.elixirCost) {
                    slot.classList.remove('unaffordable');
                } else {
                    slot.classList.add('unaffordable');
                }
            } else {
                slot.innerHTML = '<div class="card-content empty"></div>';
                slot.classList.add('empty');
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
        
        // Deselect all
        slots.forEach(s => s.classList.remove('selected'));
        
        // Select new card
        if (this.selectedCardIndex === index) {
            // Deselect if clicking same card
            this.selectedCardIndex = null;
            if (this.gameEngine) {
                this.gameEngine.deselectCard();
            }
        } else {
            this.selectedCardIndex = index;
            slots[index]?.classList.add('selected');
            
            if (this.gameEngine) {
                this.gameEngine.selectCard(index);
            }
        }
    },

    /**
     * Handle game end
     */
    onGameEnd(gameState) {
        const modal = document.getElementById('result-modal');
        if (!modal) return;

        // Determine result
        const isWin = gameState.winner === 'player';
        const isDraw = gameState.winner === 'draw';

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

        // Update local
        window.currentUser.trophies = Math.max(0, (window.currentUser.trophies || 0) + trophyChange);

        // Update menu display
        const trophyEl = document.getElementById('player-trophies');
        if (trophyEl) {
            trophyEl.textContent = window.currentUser.trophies;
        }

        // Save to Firebase
        if (window.FirebaseService && window.currentUser.odataId) {
            try {
                await FirebaseService.updateUserStats(window.currentUser.odataId, {
                    trophies: window.currentUser.trophies
                });

                // Save match result
                await FirebaseService.saveMatchResult(window.currentUser.odataId, {
                    result: gameState.winner === 'player' ? 'win' : (gameState.winner === 'draw' ? 'draw' : 'lose'),
                    playerCrowns: gameState.playerCrowns,
                    enemyCrowns: gameState.enemyCrowns,
                    trophyChange: trophyChange,
                    opponentName: 'AI Bot',
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('Error saving match result:', error);
            }
        }
    }
};

// Export
window.GameUI = GameUI;
