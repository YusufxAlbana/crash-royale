/* ============================================
   DECK BUILDER
   UI for building and managing decks
   ============================================ */

const DeckBuilder = {
    currentDeck: [],
    maxDeckSize: 8,
    selectedSlot: null,
    draggedCard: null,
    draggedFromDeck: false,
    draggedIndex: -1,
    dragPreview: null,

    /**
     * Initialize deck builder
     */
    init() {
        this.loadDeck();
        this.render();
        this.setupEventListeners();
        this.createDragPreview();
    },

    /**
     * Create drag preview element
     */
    createDragPreview() {
        if (this.dragPreview) return;
        
        this.dragPreview = document.createElement('div');
        this.dragPreview.className = 'drag-preview-card';
        this.dragPreview.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(1.1);
            display: none;
        `;
        document.body.appendChild(this.dragPreview);
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Global mouse/touch move for drag
        document.addEventListener('mousemove', (e) => this.handleDragMove(e));
        document.addEventListener('touchmove', (e) => this.handleDragMove(e), { passive: false });
        
        // Global mouse/touch up for drop
        document.addEventListener('mouseup', (e) => this.handleDrop(e));
        document.addEventListener('touchend', (e) => this.handleDrop(e));
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

        // Add event handlers for deck cards
        container.querySelectorAll('.deck-card').forEach(cardEl => {
            const index = parseInt(cardEl.dataset.index);
            const cardId = cardEl.dataset.card;
            
            // Click handler (fallback for non-drag)
            cardEl.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-btn')) return;
                if (this.draggedCard) return; // Ignore if dragging
                this.selectSlot(index);
            });
            
            // Drag start - mouse
            cardEl.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('remove-btn')) return;
                if (!cardId) return; // Empty slot
                e.preventDefault();
                this.startDrag(cardId, true, index, e);
            });
            
            // Drag start - touch
            cardEl.addEventListener('touchstart', (e) => {
                if (e.target.classList.contains('remove-btn')) return;
                if (!cardId) return;
                this.startDrag(cardId, true, index, e);
            }, { passive: true });
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

        // Add event handlers for available cards
        container.querySelectorAll('.available-card').forEach(cardEl => {
            const cardId = cardEl.dataset.card;
            
            // Click handler (fallback)
            cardEl.addEventListener('click', () => {
                if (this.draggedCard) return;
                this.handleCardClick(cardId);
            });
            
            // Drag start - mouse
            cardEl.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.startDrag(cardId, false, -1, e);
            });
            
            // Drag start - touch
            cardEl.addEventListener('touchstart', (e) => {
                this.startDrag(cardId, false, -1, e);
            }, { passive: true });
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
    },

    /**
     * Start dragging a card
     */
    startDrag(cardId, fromDeck, index, e) {
        const card = getCardById(cardId);
        if (!card) return;
        
        this.draggedCard = cardId;
        this.draggedFromDeck = fromDeck;
        this.draggedIndex = index;
        
        // Show drag preview
        if (this.dragPreview) {
            this.dragPreview.innerHTML = `
                <div class="deck-card ${card.rarity}" style="width: 70px; pointer-events: none;">
                    <div class="card-rarity-bar ${card.rarity}"></div>
                    <div class="card-icon">${card.icon}</div>
                    <div class="card-cost">${card.elixirCost}</div>
                    <div class="card-name">${card.name}</div>
                </div>
            `;
            this.dragPreview.style.display = 'block';
            
            const pos = this.getEventPosition(e);
            this.dragPreview.style.left = pos.x + 'px';
            this.dragPreview.style.top = pos.y + 'px';
        }
        
        // Add dragging class to body
        document.body.classList.add('is-dragging');
        
        // Highlight drop zones
        this.highlightDropZones();
    },

    /**
     * Handle drag move
     */
    handleDragMove(e) {
        if (!this.draggedCard) return;
        
        if (e.type === 'touchmove') {
            e.preventDefault();
        }
        
        const pos = this.getEventPosition(e);
        
        if (this.dragPreview) {
            this.dragPreview.style.left = pos.x + 'px';
            this.dragPreview.style.top = pos.y + 'px';
        }
        
        // Highlight hovered drop zone
        this.updateDropZoneHighlight(pos);
    },

    /**
     * Handle drop
     */
    handleDrop(e) {
        if (!this.draggedCard) return;
        
        const pos = this.getEventPosition(e);
        const dropTarget = this.getDropTarget(pos);
        
        if (dropTarget) {
            if (dropTarget.type === 'deck-slot') {
                this.dropOnDeckSlot(dropTarget.index);
            } else if (dropTarget.type === 'available') {
                // Dropping on available cards area - remove from deck if from deck
                if (this.draggedFromDeck) {
                    this.removeFromDeck(this.draggedIndex);
                }
            }
        }
        
        // Clean up
        this.endDrag();
    },

    /**
     * Drop card on deck slot
     */
    dropOnDeckSlot(targetIndex) {
        const inDeck = this.currentDeck.includes(this.draggedCard);
        
        if (this.draggedFromDeck) {
            // Reordering within deck
            if (targetIndex !== this.draggedIndex) {
                const temp = this.currentDeck[targetIndex];
                this.currentDeck[targetIndex] = this.draggedCard;
                this.currentDeck[this.draggedIndex] = temp;
                this.saveDeck();
            }
        } else {
            // Adding from available cards
            if (inDeck) {
                // Card already in deck - swap positions
                const existingIndex = this.currentDeck.indexOf(this.draggedCard);
                const temp = this.currentDeck[targetIndex];
                this.currentDeck[targetIndex] = this.draggedCard;
                this.currentDeck[existingIndex] = temp;
            } else {
                // Replace card in slot
                this.currentDeck[targetIndex] = this.draggedCard;
            }
            this.saveDeck();
        }
        
        this.render();
    },

    /**
     * End drag operation
     */
    endDrag() {
        this.draggedCard = null;
        this.draggedFromDeck = false;
        this.draggedIndex = -1;
        
        if (this.dragPreview) {
            this.dragPreview.style.display = 'none';
        }
        
        document.body.classList.remove('is-dragging');
        
        // Remove highlights
        document.querySelectorAll('.drop-highlight').forEach(el => {
            el.classList.remove('drop-highlight');
        });
    },

    /**
     * Get event position (mouse or touch)
     */
    getEventPosition(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    },

    /**
     * Highlight drop zones
     */
    highlightDropZones() {
        document.querySelectorAll('.deck-card').forEach(el => {
            el.classList.add('drop-zone');
        });
    },

    /**
     * Update drop zone highlight based on position
     */
    updateDropZoneHighlight(pos) {
        document.querySelectorAll('.drop-highlight').forEach(el => {
            el.classList.remove('drop-highlight');
        });
        
        const target = this.getDropTarget(pos);
        if (target && target.element) {
            target.element.classList.add('drop-highlight');
        }
    },

    /**
     * Get drop target at position
     */
    getDropTarget(pos) {
        // Check deck slots
        const deckSlots = document.querySelectorAll('.deck-card');
        for (const slot of deckSlots) {
            const rect = slot.getBoundingClientRect();
            if (pos.x >= rect.left && pos.x <= rect.right &&
                pos.y >= rect.top && pos.y <= rect.bottom) {
                return {
                    type: 'deck-slot',
                    index: parseInt(slot.dataset.index),
                    element: slot
                };
            }
        }
        
        // Check if over available cards area (for removing)
        const availableArea = document.getElementById('available-cards');
        if (availableArea) {
            const rect = availableArea.getBoundingClientRect();
            if (pos.x >= rect.left && pos.x <= rect.right &&
                pos.y >= rect.top && pos.y <= rect.bottom) {
                return { type: 'available', element: availableArea };
            }
        }
        
        return null;
    }
};

// Export
window.DeckBuilder = DeckBuilder;
