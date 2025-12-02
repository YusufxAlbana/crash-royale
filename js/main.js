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
    initAuth();
    
    // Setup auth forms
    setupAuthForms();
    
    // Check for existing session
    checkAuthState();
}

/**
 * Initialize Auth
 */
function initAuth() {
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
        AuthService.onAuthStateChanged((user, profile) => {
            if (profile) {
                handleUserLogin(profile);
            } else {
                ScreenManager.showScreen('auth');
            }
        });
    } else {
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
    
    // Set current user
    window.currentUser = {
        odataId: user.odataId || 'user_' + Date.now(),
        username: user.username || 'Player',
        trophies: user.trophies || 0,
        level: user.level || 1,
        gold: user.gold || 100,
        deck: user.deck || [...DefaultDeck],
        stats: user.stats || { wins: 0, losses: 0, draws: 0 }
    };
    
    // Update UI
    ScreenManager.updatePlayerInfo(window.currentUser);
    
    // Initialize deck builder
    DeckBuilder.init();
    
    // Show menu
    ScreenManager.showScreen('menu');
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
