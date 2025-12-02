/* ============================================
   DECK BUILDER
   UI for building and managing decks
   ============================================ */

const DeckBuilder = {
    currentDeck: [],
    maxDeckSize: 8,

    /**
     * Initialize deck builder
     */
    init() {
        this.loadDeck();
        this.render();
    },

    /**
     * Load deck from user data or default
     */
    loadDeck() {
        if (window.currentUser && window.currentUser.deck) {
            this.currentDeck = [...window.currentUser.deck];
        } else {
            this.currentDeck = [...DefaultDeck];
        }
        
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

        container.innerHTML = this.currentDeck.map((cardId, index) => {
            const card = getCardById(cardId);
            if (!card) return '';
            
            return `
                <div class="deck-card" data-index="${index}" data-card="${cardId}">
                    <div class="card-icon">${card.icon}</div>
                    <div class="card-cost">${card.elixirCost}</div>
                    <div class="card-name">${card.name}</div>
                    <button class="remove-btn" data-index="${index}">×</button>
                </div>
            `;
        }).join('');

        // Add click handlers
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
        
        container.innerHTML = allCards.map(card => {
            const inDeck = this.currentDeck.includes(card.id);
            
            return `
                <div class="available-card ${inDeck ? 'in-deck' : ''}" 
                     data-card="${card.id}"
                     ${inDeck ? 'disabled' : ''}>
                    <div class="card-rarity ${card.rarity}"></div>
                    <div class="card-icon">${card.icon}</div>
                    <div class="card-cost">${card.elixirCost}</div>
                    <div class="card-name">${card.name}</div>
                    <div class="card-stats">
                        <span>❤️ ${card.stats.hp}</span>
                        <span>⚔️ ${card.stats.damage}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers
        container.querySelectorAll('.available-card:not(.in-deck)').forEach(cardEl => {
            cardEl.addEventListener('click', () => {
                const cardId = cardEl.dataset.card;
                this.addToDeck(cardId);
            });
        });
    },

    /**
     * Add card to deck
     */
    addToDeck(cardId) {
        if (this.currentDeck.length >= this.maxDeckSize) {
            alert('Deck is full! Remove a card first.');
            return;
        }

        if (this.currentDeck.includes(cardId)) {
            return;
        }

        this.currentDeck.push(cardId);
        this.saveDeck();
        this.render();
    },

    /**
     * Remove card from deck
     */
    removeFromDeck(index) {
        if (this.currentDeck.length <= 1) {
            alert('Deck must have at least 1 card!');
            return;
        }

        this.currentDeck.splice(index, 1);
        this.saveDeck();
        this.render();
    },

    /**
     * Save deck
     */
    async saveDeck() {
        // Update local user
        if (window.currentUser) {
            window.currentUser.deck = [...this.currentDeck];
        }

        // Save to Firebase
        if (window.FirebaseService && window.currentUser && window.currentUser.odataId) {
            try {
                await FirebaseService.updateUserDeck(window.currentUser.odataId, this.currentDeck);
            } catch (error) {
                console.error('Error saving deck:', error);
            }
        }
    },

    /**
     * Update average elixir display
     */
    updateAverageElixir() {
        const avgEl = document.getElementById('avg-elixir');
        if (avgEl) {
            avgEl.textContent = calculateAverageElixir(this.currentDeck);
        }
    }
};

// Export
window.DeckBuilder = DeckBuilder;
