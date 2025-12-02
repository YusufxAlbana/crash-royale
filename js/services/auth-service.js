/* ============================================
   AUTH SERVICE
   Handles authentication with username/password
   Uses localStorage for simple auth
   ============================================ */

const AuthService = {
    currentUser: null,
    userProfile: null,
    authStateListeners: [],
    USERS_KEY: 'battle_arena_users',
    CURRENT_USER_KEY: 'battle_arena_current_user',

    /**
     * Initialize auth service
     */
    init() {
        // Check for existing session
        const savedUser = localStorage.getItem(this.CURRENT_USER_KEY);
        if (savedUser) {
            try {
                this.userProfile = JSON.parse(savedUser);
                this.currentUser = { username: this.userProfile.username };
            } catch (e) {
                localStorage.removeItem(this.CURRENT_USER_KEY);
            }
        }
    },

    /**
     * Add auth state listener
     */
    onAuthStateChanged(callback) {
        this.authStateListeners.push(callback);
        
        // Immediately call with current state
        if (this.userProfile) {
            callback(this.currentUser, this.userProfile);
        } else {
            callback(null, null);
        }
    },

    /**
     * Get all registered users
     */
    getUsers() {
        const users = localStorage.getItem(this.USERS_KEY);
        return users ? JSON.parse(users) : {};
    },

    /**
     * Save users to localStorage
     */
    saveUsers(users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    },

    /**
     * Register new user
     */
    async register(username, password, confirmPassword) {
        // Validate
        if (!username || username.length < 3) {
            throw new Error('Username minimal 3 karakter');
        }
        if (!password || password.length < 4) {
            throw new Error('Password minimal 4 karakter');
        }
        if (password !== confirmPassword) {
            throw new Error('Password tidak cocok');
        }

        const users = this.getUsers();
        const userKey = username.toLowerCase();

        // Check if username exists
        if (users[userKey]) {
            throw new Error('Username sudah digunakan');
        }

        // Create user profile
        const profile = {
            odataId: 'user_' + Date.now(),
            username: username,
            password: this.hashPassword(password),
            level: 1,
            exp: 0,
            trophies: 0,
            gold: 1000,
            gems: 100,
            deck: [...DefaultDeck],
            unlockedCards: [...Object.keys(CardsData)],
            stats: {
                wins: 0,
                losses: 0,
                draws: 0,
                threeCrowns: 0
            },
            createdAt: Date.now(),
            lastLogin: Date.now()
        };

        // Save user
        users[userKey] = profile;
        this.saveUsers(users);

        // Set current user
        this.currentUser = { username: username };
        this.userProfile = profile;
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(profile));

        // Notify listeners
        this.authStateListeners.forEach(listener => listener(this.currentUser, this.userProfile));

        return { odataId: profile.odataId, username: profile.username, ...profile };
    },

    /**
     * Login with username/password
     */
    async login(username, password) {
        if (!username || !password) {
            throw new Error('Username dan password harus diisi');
        }

        const users = this.getUsers();
        const userKey = username.toLowerCase();
        const user = users[userKey];

        if (!user) {
            throw new Error('Username tidak ditemukan');
        }

        if (user.password !== this.hashPassword(password)) {
            throw new Error('Password salah');
        }

        // Update last login
        user.lastLogin = Date.now();
        users[userKey] = user;
        this.saveUsers(users);

        // Set current user
        this.currentUser = { username: user.username };
        this.userProfile = user;
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));

        // Notify listeners
        this.authStateListeners.forEach(listener => listener(this.currentUser, this.userProfile));

        return { odataId: user.odataId, username: user.username, ...user };
    },

    /**
     * Logout
     */
    async logout() {
        this.currentUser = null;
        this.userProfile = null;
        localStorage.removeItem(this.CURRENT_USER_KEY);

        // Notify listeners
        this.authStateListeners.forEach(listener => listener(null, null));
    },

    /**
     * Simple hash function for password
     */
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'hash_' + Math.abs(hash).toString(16);
    },

    /**
     * Get current user profile
     */
    getProfile() {
        return this.userProfile;
    },

    /**
     * Get current user ID
     */
    getUserId() {
        return this.userProfile ? this.userProfile.odataId : null;
    },

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return this.userProfile !== null;
    },

    /**
     * Update user profile
     */
    updateProfile(updates) {
        if (!this.userProfile) return;

        const users = this.getUsers();
        const userKey = this.userProfile.username.toLowerCase();

        if (users[userKey]) {
            Object.assign(users[userKey], updates);
            this.saveUsers(users);
            
            Object.assign(this.userProfile, updates);
            localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(this.userProfile));
        }
    },

    /**
     * Save deck
     */
    saveDeck(deck) {
        this.updateProfile({ deck: deck });
    },

    /**
     * Update trophies
     */
    updateTrophies(change) {
        if (!this.userProfile) return;
        
        const newTrophies = Math.max(0, (this.userProfile.trophies || 0) + change);
        this.updateProfile({ trophies: newTrophies });
        return newTrophies;
    },

    /**
     * Save match result
     */
    saveMatchResult(result) {
        if (!this.userProfile) return;

        // Get match history
        const historyKey = 'match_history_' + this.userProfile.odataId;
        const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
        
        // Add new match
        history.unshift({
            ...result,
            timestamp: Date.now()
        });

        // Keep only last 20
        localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 20)));

        // Update stats
        const stats = this.userProfile.stats || { wins: 0, losses: 0, draws: 0, threeCrowns: 0 };
        if (result.result === 'win') stats.wins++;
        else if (result.result === 'lose') stats.losses++;
        else stats.draws++;
        
        if (result.playerCrowns === 3) stats.threeCrowns++;

        this.updateProfile({ stats: stats });
    },

    /**
     * Get match history
     */
    getMatchHistory() {
        if (!this.userProfile) return [];
        
        const historyKey = 'match_history_' + this.userProfile.odataId;
        return JSON.parse(localStorage.getItem(historyKey) || '[]');
    }
};

// Export
window.AuthService = AuthService;
