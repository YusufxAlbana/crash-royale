/* ============================================
   MAIN APPLICATION
   Entry point and initialization
   ============================================ */

// Global state
window.currentUser = null;
window.gameEngine = null;

/**
 * Initialize application
 */
async function initApp() {
    console.log('Initializing Battle Arena...');
    
    // Initialize screen manager
    ScreenManager.init();
    
    // Initialize Auth
    const authReady = initAuth();
    
    // Setup auth forms
    setupAuthForms();
    
    // Check for existing session with timeout
    checkAuthState();
    
    // Safety timeout - if still on loading after 3 seconds, force check
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && loadingScreen.classList.contains('active')) {
            console.log('Loading timeout - forcing auth check');
            forceAuthCheck();
        }
    }, 3000);
}

/**
 * Force auth check if loading takes too long
 */
function forceAuthCheck() {
    if (window.AuthService && AuthService.isLoggedIn()) {
        const profile = AuthService.getProfile();
        if (profile) {
            console.log('Force login with existing profile');
            handleUserLogin(profile);
            return;
        }
    }
    // No valid session, show auth screen
    ScreenManager.showScreen('auth');
}

/**
 * Initialize Firebase first, then Auth
 */
function initAuth() {
    // Initialize Firebase first
    if (window.FirebaseConfig) {
        FirebaseConfig.init();
    }
    
    // Then initialize Auth
    if (window.AuthService) {
        AuthService.init();
        return true;
    }
    return false;
}

/**
 * Check authentication state
 */
function checkAuthState() {
    if (window.AuthService) {
        // Check if already logged in from restored session
        if (AuthService.isLoggedIn()) {
            const profile = AuthService.getProfile();
            if (profile) {
                console.log('Already logged in, going to menu');
                handleUserLogin(profile);
                return;
            }
        }
        
        // Listen for auth state changes
        AuthService.onAuthStateChanged((user, profile) => {
            if (profile) {
                handleUserLogin(profile);
            } else {
                ScreenManager.showScreen('auth');
            }
        });
    } else {
        console.warn('AuthService not available');
        ScreenManager.showScreen('auth');
    }
}

/**
 * Setup authentication forms
 */
function setupAuthForms() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;
            const errorEl = document.getElementById('login-error');
            
            try {
                errorEl.textContent = '';
                
                if (window.AuthService) {
                    const user = await AuthService.login(username, password);
                    handleUserLogin(user);
                } else {
                    errorEl.textContent = 'Auth service not available';
                }
            } catch (error) {
                errorEl.textContent = error.message;
            }
        });
    }

    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('register-username').value.trim();
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm').value;
            const errorEl = document.getElementById('register-error');
            
            try {
                errorEl.textContent = '';
                
                if (window.AuthService) {
                    const user = await AuthService.register(username, password, confirmPassword);
                    handleUserLogin(user);
                } else {
                    errorEl.textContent = 'Auth service not available';
                }
            } catch (error) {
                errorEl.textContent = error.message;
            }
        });
    }
}

/**
 * Handle user login
 */
async function handleUserLogin(user) {
    console.log('User logged in:', user);
    
    try {
        // Set current user
        window.currentUser = {
            odataId: user.odataId || 'user_' + Date.now(),
            username: user.username || 'Player',
            trophies: user.trophies || 0,
            level: user.level || 1,
            gold: user.gold || 100,
            gems: user.gems || 50,
            deck: user.deck || (typeof DefaultDeck !== 'undefined' ? [...DefaultDeck] : []),
            stats: user.stats || { wins: 0, losses: 0, draws: 0, threeCrowns: 0 },
            createdAt: user.createdAt || Date.now(),
            lastLogin: user.lastLogin || Date.now()
        };
        
        // Update UI
        if (window.ScreenManager) {
            ScreenManager.updatePlayerInfo(window.currentUser);
        }
        
        // Initialize deck builder
        if (window.DeckBuilder) {
            DeckBuilder.init();
        }
        
        // Initialize friends service
        if (window.FriendsService) {
            FriendsService.init();
        }
        
        // Initialize home screen content
        initHomeScreen();
        
        // Show menu
        if (window.ScreenManager) {
            ScreenManager.showScreen('menu');
        }
    } catch (error) {
        console.error('Error in handleUserLogin:', error);
        // Still try to show menu even if there's an error
        if (window.ScreenManager) {
            ScreenManager.showScreen('menu');
        }
    }
}

/**
 * Initialize home screen dynamic content
 */
function initHomeScreen() {
    try { updateQuickStats(); } catch (e) { console.warn('updateQuickStats error:', e); }
    try { updateDeckPreview(); } catch (e) { console.warn('updateDeckPreview error:', e); }
    try { updateArenaInfo(); } catch (e) { console.warn('updateArenaInfo error:', e); }
    try { updateOnlineCount(); } catch (e) { console.warn('updateOnlineCount error:', e); }
    try { updateDailyTip(); } catch (e) { console.warn('updateDailyTip error:', e); }
    try { setupHomeEventListeners(); } catch (e) { console.warn('setupHomeEventListeners error:', e); }
}

/**
 * Update quick stats bar
 */
function updateQuickStats() {
    const stats = window.currentUser?.stats || {};
    const wins = stats.wins || 0;
    const losses = stats.losses || 0;
    const total = wins + losses + (stats.draws || 0);
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    
    // Update stat boxes
    const winsEl = document.getElementById('stat-wins');
    const lossesEl = document.getElementById('stat-losses');
    const winrateEl = document.getElementById('stat-winrate');
    const crownsEl = document.getElementById('stat-crowns');
    
    if (winsEl) winsEl.textContent = wins;
    if (lossesEl) lossesEl.textContent = losses;
    if (winrateEl) winrateEl.textContent = winRate + '%';
    if (crownsEl) crownsEl.textContent = stats.threeCrowns || 0;
}



/**
 * Update deck preview in menu
 */
function updateDeckPreview() {
    const container = document.getElementById('menu-deck-preview');
    const avgElixir = document.getElementById('menu-avg-elixir');
    if (!container) return;
    
    const deck = window.currentUser?.deck || DefaultDeck;
    
    container.innerHTML = deck.map(cardId => {
        const card = getCardById(cardId);
        return `<div class="deck-preview-card">${card ? card.icon : '?'}</div>`;
    }).join('');
    
    if (avgElixir) {
        avgElixir.textContent = calculateAverageElixir(deck);
    }
}

/**
 * Update arena info based on trophies
 */
function updateArenaInfo() {
    const trophies = window.currentUser?.trophies || 0;
    const arenaName = document.getElementById('current-arena');
    const arenaSubtitle = document.querySelector('.arena-subtitle');
    const progressFill = document.getElementById('arena-progress-fill');
    const progressText = document.querySelector('.arena-progress-text');
    
    // Arena thresholds
    const arenas = [
        { name: 'Arena 1', subtitle: 'Training Camp', min: 0, max: 400 },
        { name: 'Arena 2', subtitle: 'Bone Pit', min: 400, max: 800 },
        { name: 'Arena 3', subtitle: 'Barbarian Bowl', min: 800, max: 1100 },
        { name: 'Arena 4', subtitle: 'P.E.K.K.A Playhouse', min: 1100, max: 1400 },
        { name: 'Arena 5', subtitle: 'Spell Valley', min: 1400, max: 1700 },
        { name: 'Arena 6', subtitle: 'Builder Workshop', min: 1700, max: 2000 },
        { name: 'Arena 7', subtitle: 'Royal Arena', min: 2000, max: 2300 },
        { name: 'Arena 8', subtitle: 'Frozen Peak', min: 2300, max: 2600 },
        { name: 'Arena 9', subtitle: 'Jungle Arena', min: 2600, max: 3000 },
        { name: 'Arena 10', subtitle: 'Legendary Arena', min: 3000, max: 99999 }
    ];
    
    const currentArena = arenas.find(a => trophies >= a.min && trophies < a.max) || arenas[0];
    const progress = ((trophies - currentArena.min) / (currentArena.max - currentArena.min)) * 100;
    
    if (arenaName) arenaName.textContent = currentArena.name;
    if (arenaSubtitle) arenaSubtitle.textContent = currentArena.subtitle;
    if (progressFill) progressFill.style.width = Math.min(progress, 100) + '%';
    if (progressText) progressText.textContent = `${trophies} / ${currentArena.max} 🏆`;
    
    // Update leaderboard preview
    const lbTrophies = document.getElementById('lb-your-trophies');
    if (lbTrophies) lbTrophies.textContent = trophies;
}

/**
 * Update online count - removed, now using friends system
 */
function updateOnlineCount() {
    // No longer needed - friends panel shows online friends
}

/**
 * Update daily tip
 */
function updateDailyTip() {
    const tips = [
        "Place troops behind your King Tower for a stronger push!",
        "Save elixir for counter-attacks when your opponent overcommits.",
        "Use splash damage troops to counter swarms effectively.",
        "Don't ignore one lane completely - balance your defense!",
        "Wait for your opponent to play first to gain elixir advantage.",
        "Protect your ranged troops with tanks in front.",
        "Learn card cycle to predict your opponent's next move.",
        "Use the river to your advantage - some troops can't cross!",
        "Building targeting troops are great for tower damage.",
        "Don't panic deploy - sometimes it's better to take damage."
    ];
    
    const tipEl = document.getElementById('daily-tip');
    if (tipEl) {
        // Use date to get consistent daily tip
        const dayIndex = new Date().getDate() % tips.length;
        tipEl.textContent = tips[dayIndex];
    }
}

/**
 * Setup home screen event listeners
 */
function setupHomeEventListeners() {
    // Battle mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const mode = btn.dataset.mode;
            if (mode === '2v2' || mode === 'challenge') {
                alert('Coming soon! 🚧');
                document.querySelector('.mode-btn[data-mode="1v1"]').classList.add('active');
                btn.classList.remove('active');
            }
        });
    });
    
    // Chest slots
    document.querySelectorAll('.chest-slot.ready').forEach(slot => {
        slot.addEventListener('click', () => {
            alert('🎁 Chest opened! You got:\n💰 100 Gold\n🎴 3 Cards');
            slot.classList.remove('ready');
            slot.classList.add('empty');
            const iconEl = slot.querySelector('.chest-icon');
            const statusEl = slot.querySelector('.chest-status');
            if (iconEl) iconEl.textContent = '➕';
            if (statusEl) statusEl.textContent = 'Win to earn';
        });
    });
    
    // Shop button
    const shopBtn = document.getElementById('shop-btn');
    if (shopBtn) {
        shopBtn.addEventListener('click', () => {
            alert('Shop coming soon! 🛒');
        });
    }
    
    // Leaderboard button
    const lbBtn = document.getElementById('leaderboard-btn');
    if (lbBtn) {
        lbBtn.addEventListener('click', () => {
            alert('Leaderboard coming soon! 🏆');
        });
    }
}

/**
 * Handle window resize
 */
function handleResize() {
    if (window.gameEngine && window.gameEngine.arena) {
        window.gameEngine.canvasScale = window.gameEngine.arena.resize();
    }
}

// Event listeners
window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', handleResize);

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
