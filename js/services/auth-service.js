/* ============================================
   AUTH SERVICE
   Handles authentication with username/password
   Data disimpan ke Firebase jika online, localStorage jika offline
   ============================================ */

const AuthService = {
    currentUser: null,
    userProfile: null,
    authStateListeners: [],
    isOnline: false,
    USERS_KEY: 'battle_arena_users',
    CURRENT_USER_KEY: 'battle_arena_current_user',

    /**
     * Initialize auth service
     */
    init() {
        // Check if Firebase is available
        this.isOnline = !FirebaseConfig.isOffline();
        console.log('Auth mode:', this.isOnline ? 'ONLINE (Firebase)' : 'OFFLINE (localStorage)');
        
        // Check for existing session
        const savedUser = localStorage.getItem(this.CURRENT_USER_KEY);
        if (savedUser) {
            try {
                this.userProfile = JSON.parse(savedUser);
                this.currentUser = { username: this.userProfile.username };
                
                // Sync with Firebase if online
                if (this.isOnline) {
                    this.syncFromFirebase(this.userProfile.username);
                }
            } catch (e) {
                localStorage.removeItem(this.CURRENT_USER_KEY);
            }
        }
    },

    /**
     * Sync user data from Firebase
     */
    async syncFromFirebase(username) {
        if (!this.isOnline) return;
        
        try {
            const db = FirebaseConfig.getDb();
            const userDoc = await db.collection('users').doc(username.toLowerCase()).get();
            
            if (userDoc.exists) {
                const firebaseData = userDoc.data();
                this.userProfile = { ...this.userProfile, ...firebaseData };
                localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(this.userProfile));
                console.log('Synced from Firebase');
            }
        } catch (error) {
            console.error('Error syncing from Firebase:', error);
        }
    },

    /**
     * Add auth state listener
     */
    onAuthStateChanged(callback) {
        this.authStateListeners.push(callback);
        
        if (this.userProfile) {
            callback(this.currentUser, this.userProfile);
        } else {
            callback(null, null);
        }
    },

    /**
     * Get all registered users (localStorage fallback)
     */
    getLocalUsers() {
        const users = localStorage.getItem(this.USERS_KEY);
        return users ? JSON.parse(users) : {};
    },

    /**
     * Save users to localStorage
     */
    saveLocalUsers(users) {
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

        const userKey = username.toLowerCase();
        const hashedPassword = this.hashPassword(password);

        // Check if username exists
        if (this.isOnline) {
            // Check in Firebase
            const db = FirebaseConfig.getDb();
            const userDoc = await db.collection('users').doc(userKey).get();
            if (userDoc.exists) {
                throw new Error('Username sudah digunakan');
            }
        } else {
            // Check in localStorage
            const users = this.getLocalUsers();
            if (users[userKey]) {
                throw new Error('Username sudah digunakan');
            }
        }

        // Create user profile
        const profile = {
            odataId: 'user_' + Date.now(),
            username: username,
            password: hashedPassword,
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
            matchHistory: [],
            createdAt: Date.now(),
            lastLogin: Date.now()
        };

        // Save user
        if (this.isOnline) {
            // Save to Firebase
            const db = FirebaseConfig.getDb();
            await db.collection('users').doc(userKey).set(profile);
            console.log('User saved to Firebase');
        } else {
            // Save to localStorage
            const users = this.getLocalUsers();
            users[userKey] = profile;
            this.saveLocalUsers(users);
        }

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

        const userKey = username.toLowerCase();
        const hashedPassword = this.hashPassword(password);
        let user = null;

        if (this.isOnline) {
            // Check in Firebase
            const db = FirebaseConfig.getDb();
            const userDoc = await db.collection('users').doc(userKey).get();
            
            if (!userDoc.exists) {
                throw new Error('Username tidak ditemukan');
            }
            
            user = userDoc.data();
        } else {
            // Check in localStorage
            const users = this.getLocalUsers();
            user = users[userKey];
            
            if (!user) {
                throw new Error('Username tidak ditemukan');
            }
        }

        if (user.password !== hashedPassword) {
            throw new Error('Password salah');
        }

        // Update last login
        user.lastLogin = Date.now();
        
        if (this.isOnline) {
            const db = FirebaseConfig.getDb();
            await db.collection('users').doc(userKey).update({ lastLogin: Date.now() });
        } else {
            const users = this.getLocalUsers();
            users[userKey] = user;
            this.saveLocalUsers(users);
        }

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
    async updateProfile(updates) {
        if (!this.userProfile) return;

        const userKey = this.userProfile.username.toLowerCase();

        // Update local
        Object.assign(this.userProfile, updates);
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(this.userProfile));

        // Update Firebase if online
        if (this.isOnline) {
            try {
                const db = FirebaseConfig.getDb();
                await db.collection('users').doc(userKey).update(updates);
                console.log('Profile updated in Firebase');
            } catch (error) {
                console.error('Error updating Firebase:', error);
            }
        } else {
            // Update localStorage
            const users = this.getLocalUsers();
            if (users[userKey]) {
                Object.assign(users[userKey], updates);
                this.saveLocalUsers(users);
            }
        }
    },

    /**
     * Save deck
     */
    async saveDeck(deck) {
        await this.updateProfile({ deck: deck });
    },

    /**
     * Update trophies
     */
    async updateTrophies(change) {
        if (!this.userProfile) return 0;
        
        const newTrophies = Math.max(0, (this.userProfile.trophies || 0) + change);
        await this.updateProfile({ trophies: newTrophies });
        return newTrophies;
    },

    /**
     * Save match result
     */
    async saveMatchResult(result) {
        if (!this.userProfile) return;

        const userKey = this.userProfile.username.toLowerCase();
        
        // Get current match history
        let history = this.userProfile.matchHistory || [];
        
        // Add new match
        history.unshift({
            ...result,
            timestamp: Date.now()
        });

        // Keep only last 20
        history = history.slice(0, 20);

        // Update stats
        const stats = this.userProfile.stats || { wins: 0, losses: 0, draws: 0, threeCrowns: 0 };
        if (result.result === 'win') stats.wins++;
        else if (result.result === 'lose') stats.losses++;
        else stats.draws++;
        
        if (result.playerCrowns === 3) stats.threeCrowns++;

        // Save
        await this.updateProfile({ 
            matchHistory: history,
            stats: stats 
        });
    },

    /**
     * Get match history
     */
    getMatchHistory() {
        if (!this.userProfile) return [];
        return this.userProfile.matchHistory || [];
    }
};

// Export
window.AuthService = AuthService;
