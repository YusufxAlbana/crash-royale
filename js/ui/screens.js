/* ============================================
   SCREEN MANAGER
   Handles screen transitions and UI
   ============================================ */

const ScreenManager = {
    currentScreen: null,
    screens: {},

    /**
     * Initialize screen manager
     */
    init() {
        // Get all screens
        this.screens = {
            loading: document.getElementById('loading-screen'),
            auth: document.getElementById('auth-screen'),
            menu: document.getElementById('menu-screen'),
            deck: document.getElementById('deck-screen'),
            history: document.getElementById('history-screen'),
            matchmaking: document.getElementById('matchmaking-screen'),
            game: document.getElementById('game-screen')
        };

        // Setup auth tabs
        this.setupAuthTabs();
        
        // Setup navigation
        this.setupNavigation();
    },

    /**
     * Show a screen
     */
    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            if (screen) screen.classList.remove('active');
        });

        // Show target screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
        }
    },

    /**
     * Setup auth tabs
     */
    setupAuthTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                if (tab.dataset.tab === 'login') {
                    loginForm.classList.add('active');
                    registerForm.classList.remove('active');
                } else {
                    loginForm.classList.remove('active');
                    registerForm.classList.add('active');
                }
            });
        });
    },

    /**
     * Setup navigation buttons
     */
    setupNavigation() {
        // Back buttons
        document.getElementById('deck-back')?.addEventListener('click', () => {
            this.showScreen('menu');
        });

        document.getElementById('history-back')?.addEventListener('click', () => {
            this.showScreen('menu');
        });

        // Menu buttons
        document.getElementById('battle-btn')?.addEventListener('click', () => {
            this.startMatchmaking();
        });

        document.getElementById('deck-btn')?.addEventListener('click', () => {
            this.showScreen('deck');
            if (window.DeckBuilder) {
                DeckBuilder.refresh();
            }
        });

        document.getElementById('cards-btn')?.addEventListener('click', () => {
            this.showScreen('deck');
            if (window.DeckBuilder) {
                DeckBuilder.refresh();
            }
        });

        document.getElementById('history-btn')?.addEventListener('click', () => {
            this.showScreen('history');
            this.loadMatchHistory();
        });

        // Cancel matchmaking
        document.getElementById('cancel-matchmaking')?.addEventListener('click', () => {
            this.cancelMatchmaking();
        });

        // Result modal
        document.getElementById('result-ok')?.addEventListener('click', () => {
            document.getElementById('result-modal').classList.remove('active');
            this.showScreen('menu');
        });

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            if (window.AuthService) {
                AuthService.logout();
            }
        });
    },

    /**
     * Start matchmaking
     */
    startMatchmaking() {
        this.showScreen('matchmaking');
        
        // Update player name
        const playerName = document.getElementById('mm-player-name');
        if (playerName && window.currentUser) {
            playerName.textContent = window.currentUser.username || 'You';
        }

        // Simulate finding opponent (for now, just start vs AI)
        setTimeout(() => {
            const opponentName = document.getElementById('mm-opponent-name');
            if (opponentName) {
                opponentName.textContent = 'AI Bot';
            }
            
            // Start game after short delay
            setTimeout(() => {
                this.startGame();
            }, 1500);
        }, 2000);
    },

    /**
     * Cancel matchmaking
     */
    cancelMatchmaking() {
        this.showScreen('menu');
    },

    /**
     * Start game
     */
    startGame() {
        this.showScreen('game');
        
        // Initialize game
        if (!window.gameEngine) {
            window.gameEngine = new GameEngine();
        }
        
        // Get player deck
        const playerDeck = window.currentUser?.deck || [...DefaultDeck];
        
        // Initialize and start
        window.gameEngine.init(playerDeck, true);
        
        // Setup card hand UI
        if (window.GameUI) {
            GameUI.init(window.gameEngine);
        }
        
        // Start game
        window.gameEngine.start();
    },

    /**
     * Load match history
     */
    async loadMatchHistory() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        historyList.innerHTML = '<p class="loading">Loading...</p>';

        try {
            let matches = [];
            
            if (window.FirebaseService && window.currentUser) {
                matches = await FirebaseService.getMatchHistory(window.currentUser.odataId, 10);
            }

            if (matches.length === 0) {
                historyList.innerHTML = '<p class="empty">No matches yet</p>';
                return;
            }

            historyList.innerHTML = matches.map(match => `
                <div class="history-item ${match.result}">
                    <div class="match-result">${match.result.toUpperCase()}</div>
                    <div class="match-score">${match.playerCrowns} - ${match.enemyCrowns}</div>
                    <div class="match-opponent">vs ${match.opponentName || 'Unknown'}</div>
                    <div class="match-trophies">${match.trophyChange > 0 ? '+' : ''}${match.trophyChange} 🏆</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading history:', error);
            historyList.innerHTML = '<p class="error">Failed to load history</p>';
        }
    },

    /**
     * Update player info in menu
     */
    updatePlayerInfo(user) {
        document.getElementById('player-name').textContent = user.username || 'Player';
        document.getElementById('player-level').textContent = `Level ${user.level || 1}`;
        document.getElementById('player-trophies').textContent = user.trophies || 0;
        document.getElementById('player-gold').textContent = user.gold || 0;
    }
};

// Export
window.ScreenManager = ScreenManager;
