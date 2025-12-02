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
        
        // Get player deck - prioritize AuthService data
        let playerDeck = [...DefaultDeck];
        
        if (window.AuthService && AuthService.userProfile && AuthService.userProfile.deck) {
            playerDeck = [...AuthService.userProfile.deck];
        } else if (window.currentUser && window.currentUser.deck) {
            playerDeck = [...window.currentUser.deck];
        }
        
        // Validate deck - ensure all cards exist
        playerDeck = playerDeck.filter(cardId => getCardById(cardId) !== null);
        
        // Ensure deck has at least 8 cards
        while (playerDeck.length < 8) {
            const allCards = Object.keys(CardsData);
            const available = allCards.filter(c => !playerDeck.includes(c));
            if (available.length > 0) {
                playerDeck.push(available[0]);
            } else {
                break;
            }
        }
        
        console.log('Starting game with deck:', playerDeck);
        
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
        const historyStats = document.getElementById('history-stats');
        if (!historyList) return;

        historyList.innerHTML = '<p class="loading">Loading...</p>';

        try {
            let matches = [];
            
            if (window.AuthService) {
                matches = AuthService.getMatchHistory();
            }

            // Update stats
            if (historyStats && window.currentUser && window.currentUser.stats) {
                const stats = window.currentUser.stats;
                const total = (stats.wins || 0) + (stats.losses || 0) + (stats.draws || 0);
                const winRate = total > 0 ? Math.round((stats.wins / total) * 100) : 0;
                historyStats.innerHTML = `${stats.wins || 0}W / ${stats.losses || 0}L (${winRate}%)`;
            }

            if (matches.length === 0) {
                historyList.innerHTML = `
                    <div class="empty-history">
                        <div class="empty-icon">📜</div>
                        <p>No matches yet</p>
                        <p class="empty-hint">Play a battle to see your history!</p>
                    </div>
                `;
                return;
            }

            historyList.innerHTML = matches.map((match, index) => {
                const date = new Date(match.timestamp);
                const timeAgo = this.getTimeAgo(date);
                const resultClass = match.result === 'win' ? 'victory' : (match.result === 'lose' ? 'defeat' : 'draw');
                const resultIcon = match.result === 'win' ? '🏆' : (match.result === 'lose' ? '💔' : '🤝');
                
                return `
                    <div class="history-item ${resultClass}" data-index="${index}">
                        <div class="history-left">
                            <div class="result-icon">${resultIcon}</div>
                            <div class="result-info">
                                <div class="result-text">${match.result.toUpperCase()}</div>
                                <div class="opponent-name">vs ${match.opponentName || 'AI Bot'}</div>
                            </div>
                        </div>
                        <div class="history-center">
                            <div class="crown-score">
                                <span class="player-crowns">${'⭐'.repeat(match.playerCrowns)}${'☆'.repeat(3 - match.playerCrowns)}</span>
                                <span class="score-divider">-</span>
                                <span class="enemy-crowns">${'⭐'.repeat(match.enemyCrowns)}${'☆'.repeat(3 - match.enemyCrowns)}</span>
                            </div>
                            <div class="match-time">${timeAgo}</div>
                        </div>
                        <div class="history-right">
                            <div class="trophy-change ${match.trophyChange >= 0 ? 'positive' : 'negative'}">
                                ${match.trophyChange > 0 ? '+' : ''}${match.trophyChange} 🏆
                            </div>
                            ${match.replay ? '<button class="replay-btn" data-index="' + index + '">▶️ Replay</button>' : ''}
                        </div>
                    </div>
                `;
            }).join('');

            // Add replay button handlers
            historyList.querySelectorAll('.replay-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(btn.dataset.index);
                    this.playReplay(matches[index]);
                });
            });

        } catch (error) {
            console.error('Error loading history:', error);
            historyList.innerHTML = '<p class="error">Failed to load history</p>';
        }
    },

    /**
     * Get time ago string
     */
    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    },

    /**
     * Play replay
     */
    playReplay(match) {
        if (!match.replay) {
            alert('Replay not available for this match');
            return;
        }
        
        // TODO: Implement replay system
        alert('Replay feature coming soon!');
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
