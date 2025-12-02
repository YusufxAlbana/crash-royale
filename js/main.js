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
    
    // Initialize Firebase
    const firebaseReady = await initFirebase();
    
    // Setup auth forms
    setupAuthForms();
    
    // Check for existing session
    if (firebaseReady) {
        checkAuthState();
    } else {
        // Firebase not configured, allow guest play
        console.log('Firebase not configured, guest mode only');
        ScreenManager.showScreen('auth');
    }
}

/**
 * Initialize Firebase
 */
async function initFirebase() {
    try {
        if (window.FirebaseService) {
            const initialized = FirebaseService.init();
            if (initialized) {
                console.log('Firebase initialized');
                return true;
            }
        }
    } catch (error) {
        console.error('Firebase init error:', error);
    }
    return false;
}

/**
 * Check authentication state
 */
function checkAuthState() {
    if (window.AuthService) {
        AuthService.onAuthStateChanged((user) => {
            if (user) {
                handleUserLogin(user);
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
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorEl = document.getElementById('login-error');
            
            try {
                errorEl.textContent = '';
                
                if (window.AuthService) {
                    const user = await AuthService.login(email, password);
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
            
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const errorEl = document.getElementById('register-error');
            
            try {
                errorEl.textContent = '';
                
                if (window.AuthService) {
                    const user = await AuthService.register(email, password, username);
                    handleUserLogin(user);
                } else {
                    errorEl.textContent = 'Auth service not available';
                }
            } catch (error) {
                errorEl.textContent = error.message;
            }
        });
    }

    // Guest login
    const guestBtn = document.getElementById('guest-login');
    if (guestBtn) {
        guestBtn.addEventListener('click', () => {
            handleGuestLogin();
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
        odataId: user.odataId || user.odataId || 'guest',
        email: user.email || '',
        username: user.username || user.displayName || 'Player',
        trophies: user.trophies || 0,
        level: user.level || 1,
        gold: user.gold || 100,
        deck: user.deck || [...DefaultDeck]
    };
    
    // Load user data from Firestore
    if (window.FirebaseService && user.odataId) {
        try {
            const userData = await FirebaseService.getUserData(user.odataId);
            if (userData) {
                window.currentUser = { ...window.currentUser, ...userData };
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
    
    // Update UI
    ScreenManager.updatePlayerInfo(window.currentUser);
    
    // Initialize deck builder
    DeckBuilder.init();
    
    // Show menu
    ScreenManager.showScreen('menu');
}

/**
 * Handle guest login
 */
function handleGuestLogin() {
    console.log('Guest login');
    
    window.currentUser = {
        odataId: 'guest_' + Date.now(),
        email: '',
        username: 'Guest',
        trophies: 0,
        level: 1,
        gold: 100,
        deck: [...DefaultDeck]
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
