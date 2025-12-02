/* ============================================
   DECK BUILDER
   UI for building and managing decks
   ============================================ */

const DeckBuilder = {
    currentDeck: [],
    maxDeckSize: 8,
    selectedSlot: null,

    /**
     * Initialize deck builder
     */
    init() {
        this.loadDeck();
        this.render();
        this.setupEventListeners();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Scroll sudah dihandle di CSS
    },

    /**
     * Load deck from user data or default
     */
    loadDeck() {
        // Try to get deck from AuthService first (most up-to-date)
        let userDeck = null;
        
        if (window.AuthService && AuthService.userProfile && AuthService.userProfile.deck) {
            userDeck = AuthService.userProfile.deck;
        } else if (window.currentUser && window.currentUser.deck) {
            userDeck = window.currentUser.deck;
        }
        
        if (userDeck && userDeck.length > 0) {
            // Validate that all cards exist
            this.currentDeck = userDeck.filter(cardId => getCardById(cardId) !== null);
        } else {
            this.currentDeck = [...DefaultDeck];
        }
        
        console.log('Loaded deck:', this.currentDeck);
        
        // Ensure deck has 8 cards
        while (this.currentDeck.length < this.maxDeckSize) {
            const allCards = Object.keys(CardsData);
            const available = allCards.filter(c => !this.currentDeck.includes(c));
            if (available.length > 0) {
                this.currentDeck.push(available[0]);
            } else {
                break;
            }
        }
        
        // Trim to max size
        if (this.currentDeck.length > this.maxDeckSize) {
            this.currentDeck = this.currentDeck.slice(0, this.maxDeckSize);
        }
        
        // Sync back to currentUser
        if (window.currentUser) {
            window.currentUser.deck = [...this.currentDeck];
        }
    },

    /**
     * Render deck builder
     */
    render() {
        this.renderDeckSlots();
        this.renderAvailableCards();
        this.updateAverageElixir();
    },

    /**
     * Refresh deck builder
     */
    refresh() {
        this.loadDeck();
        this.render();
    },

    /**
     * Render deck slots
     */
    renderDeckSlots() {
        const container = document.getElementById('deck-slots');
        if (!container) return;

        let html = '';
        for (let i = 0; i < this.maxDeckSize; i++) {
            const cardId = this.currentDeck[i];
            const card = cardId ? getCardById(cardId) : null;
            const isSelected = this.selectedSlot === i;
            
            if (card) {
                html += `
                    <div class="deck-card ${isSelected ? 'selected' : ''}" data-index="${i}" data-card="${cardId}">
                        <div class="card-rarity-bar ${card.rarity}"></div>
                        <div class="card-icon">${card.icon}</div>
                        <div class="card-cost">${card.elixirCost}</div>
                        <div class="card-name">${card.name}</div>
                        <button class="remove-btn" data-index="${i}">×</button>
                    </div>
                `;
            } else {
                html += `
                    <div class="deck-card empty ${isSelected ? 'selected' : ''}" data-index="${i}">
                        <div class="card-icon">+</div>
                        <div class="card-name">Empty</div>
                    </div>
                `;
            }
        }
        
        container.innerHTML = html;

        // Add click handlers for deck cards (to select for swap)
        container.querySelectorAll('.deck-card').forEach(cardEl => {
            cardEl.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-btn')) return;
                const index = parseInt(cardEl.dataset.index);
                this.selectSlot(index);
            });
        });

        // Add click handlers for remove buttons
        container.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                this.removeFromDeck(index);
            });
        });
    },

    /**
     * Render available cards
     */
    renderAvailableCards() {
        const container = document.getElementById('available-cards');
        if (!container) return;

        const allCards = getAllCards();
        
        // Sort by elixir cost
        allCards.sort((a, b) => a.elixirCost - b.elixirCost);
        
        container.innerHTML = allCards.map(card => {
            const inDeck = this.currentDeck.includes(card.id);
            const canSwap = this.selectedSlot !== null && !inDeck;
            
            return `
                <div class="available-card ${inDeck ? 'in-deck' : ''} ${canSwap ? 'can-swap' : ''} ${card.rarity}" 
                     data-card="${card.id}">
                    <div class="card-rarity-bar ${card.rarity}"></div>
                    <div class="card-icon">${card.icon}</div>
                    <div class="card-cost">${card.elixirCost}</div>
                    <div class="card-name">${card.name}</div>
                    ${inDeck ? '<div class="in-deck-badge">✓</div>' : ''}
                </div>
            `;
        }).join('');

        // Add click handlers
        container.querySelectorAll('.available-card').forEach(cardEl => {
            cardEl.addEventListener('click', () => {
                const cardId = cardEl.dataset.card;
                this.handleCardClick(cardId);
            });
        });
    },

    /**
     * Handle card click from available cards
     */
    handleCardClick(cardId) {
        const inDeck = this.currentDeck.includes(cardId);
        
        if (this.selectedSlot !== null) {
            // Swap mode - replace selected slot with this card
            if (!inDeck) {
                this.currentDeck[this.selectedSlot] = cardId;
                this.selectedSlot = null;
                this.saveDeck();
                this.render();
            } else {
                // Card already in deck, swap positions
                const existingIndex = this.currentDeck.indexOf(cardId);
                if (existingIndex !== this.selectedSlot) {
                    // Swap the two cards
                    const temp = this.currentDeck[this.selectedSlot];
                    this.currentDeck[this.selectedSlot] = cardId;
                    this.currentDeck[existingIndex] = temp;
                    this.selectedSlot = null;
                    this.saveDeck();
                    this.render();
                }
            }
        } else {
            // Normal mode
            if (inDeck) {
                // Show card info or select it
                this.showCardInfo(cardId);
            } else {
                // Add to deck if not full
                this.addToDeck(cardId);
            }
        }
    },

    /**
     * Select a deck slot for swapping
     */
    selectSlot(index) {
        if (this.selectedSlot === index) {
            // Deselect
            this.selectedSlot = null;
        } else {
            this.selectedSlot = index;
        }
        this.render();
    },

    /**
     * Show card info modal
     */
    showCardInfo(cardId) {
        const card = getCardById(cardId);
        if (!card) return;
        
        alert(`${card.icon} ${card.name}\n\nElixir: ${card.elixirCost}\nHP: ${card.stats.hp}\nDamage: ${card.stats.damage}\nSpeed: ${card.stats.moveSpeed}\nRange: ${card.stats.range}\n\n${card.description}`);
    },

    /**
     * Add card to deck
     */
    addToDeck(cardId) {
        if (this.currentDeck.includes(cardId)) {
            return;
        }

        // Find empty slot or replace if full
        const emptyIndex = this.currentDeck.findIndex(c => !c);
        if (emptyIndex !== -1) {
            this.currentDeck[emptyIndex] = cardId;
        } else if (this.currentDeck.length < this.maxDeckSize) {
            this.currentDeck.push(cardId);
        } else {
            // Deck full, ask to replace
            this.selectedSlot = 0; // Select first slot
            this.render();
            return;
        }

        this.saveDeck();
        this.render();
    },

    /**
     * Remove card from deck
     */
    removeFromDeck(index) {
        if (this.currentDeck.filter(c => c).length <= 1) {
            alert('Deck must have at least 1 card!');
            return;
        }

        this.currentDeck.splice(index, 1);
        this.selectedSlot = null;
        this.saveDeck();
        this.render();
    },

    /**
     * Save deck
     */
    async saveDeck() {
        // Filter out empty slots and ensure 8 cards
        const validDeck = this.currentDeck.filter(c => c);
        
        // Ensure deck has exactly 8 cards
        while (validDeck.length < this.maxDeckSize) {
            const allCards = Object.keys(CardsData);
            const available = allCards.filter(c => !validDeck.includes(c));
            if (available.length > 0) {
                validDeck.push(available[0]);
            } else {
                break;
            }
        }
        
        // Update local user immediately
        if (window.currentUser) {
            window.currentUser.deck = [...validDeck];
            console.log('Deck saved to currentUser:', window.currentUser.deck);
        }

        // Save via AuthService
        if (window.AuthService) {
            await AuthService.saveDeck(validDeck);
        }
    },

    /**
     * Update average elixir display
     */
    updateAverageElixir() {
        const avgEl = document.getElementById('avg-elixir');
        if (avgEl) {
            const validDeck = this.currentDeck.filter(c => c);
            avgEl.textContent = calculateAverageElixir(validDeck);
        }
    }
};

// Export
window.DeckBuilder = DeckBuilder;
