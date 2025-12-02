/* ============================================
   AUTH SERVICE
   Handles authentication operations
   ============================================ */

const AuthService = {
    currentUser: null,
    userProfile: null,
    authStateListeners: [],

    /**
     * Initialize auth state listener
     */
    init() {
        if (FirebaseConfig.isOffline()) {
            console.log("Auth running in offline mode");
            return;
        }

        const auth = FirebaseConfig.getAuth();
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = user;
                this.userProfile = await FirebaseService.getUserProfile(user.uid);
                
                // Update last login
                if (this.userProfile) {
                    FirebaseService.updateUserProfile(user.uid, {});
                }
            } else {
                this.currentUser = null;
                this.userProfile = null;
            }

            // Notify listeners
            this.authStateListeners.forEach(listener => listener(user, this.userProfile));
        });
    },

    /**
     * Add auth state listener
     */
    onAuthStateChanged(callback) {
        this.authStateListeners.push(callback);
        
        // Immediately call with current state
        if (this.currentUser || FirebaseConfig.isOffline()) {
            callback(this.currentUser, this.userProfile);
        }
    },

    /**
     * Register new user
     */
    async register(email, password, username) {
        if (FirebaseConfig.isOffline()) {
            throw new Error("Cannot register in offline mode");
        }

        const auth = FirebaseConfig.getAuth();
        
        try {
            // Create auth user
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update display name
            await user.updateProfile({ displayName: username });

            // Create user profile in Firestore
            this.userProfile = await FirebaseService.createUserProfile(user.uid, username, email);
            this.currentUser = user;

            return { user, profile: this.userProfile };
        } catch (error) {
            console.error("Registration error:", error);
            throw this.parseAuthError(error);
        }
    },

    /**
     * Login with email/password
     */
    async login(email, password) {
        if (FirebaseConfig.isOffline()) {
            throw new Error("Cannot login in offline mode");
        }

        const auth = FirebaseConfig.getAuth();
        
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Get user profile
            this.userProfile = await FirebaseService.getUserProfile(user.uid);
            this.currentUser = user;

            // Create profile if doesn't exist (edge case)
            if (!this.userProfile) {
                this.userProfile = await FirebaseService.createUserProfile(
                    user.uid, 
                    user.displayName || 'Player', 
                    email
                );
            }

            return { user, profile: this.userProfile };
        } catch (error) {
            console.error("Login error:", error);
            throw this.parseAuthError(error);
        }
    },

    /**
     * Login as guest (offline mode)
     */
    async loginAsGuest() {
        this.currentUser = null;
        this.userProfile = FirebaseService.createOfflineProfile('Guest_' + Math.floor(Math.random() * 9999));
        
        // Save to localStorage
        localStorage.setItem('guest_profile', JSON.stringify(this.userProfile));
        
        // Notify listeners
        this.authStateListeners.forEach(listener => listener(null, this.userProfile));
        
        return { user: null, profile: this.userProfile };
    },

    /**
     * Logout
     */
    async logout() {
        if (!FirebaseConfig.isOffline() && this.currentUser) {
            const auth = FirebaseConfig.getAuth();
            await auth.signOut();
        }

        this.currentUser = null;
        this.userProfile = null;
        localStorage.removeItem('guest_profile');

        // Notify listeners
        this.authStateListeners.forEach(listener => listener(null, null));
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
        if (this.currentUser) {
            return this.currentUser.uid;
        }
        if (this.userProfile) {
            return this.userProfile.id;
        }
        return null;
    },

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return this.userProfile !== null;
    },

    /**
     * Check if user is guest
     */
    isGuest() {
        return this.userProfile !== null && this.currentUser === null;
    },

    /**
     * Update profile locally (for offline/guest mode)
     */
    updateLocalProfile(updates) {
        if (this.userProfile) {
            Object.assign(this.userProfile, updates);
            
            if (this.isGuest()) {
                localStorage.setItem('guest_profile', JSON.stringify(this.userProfile));
            }
        }
    },

    /**
     * Parse Firebase auth errors to user-friendly messages
     */
    parseAuthError(error) {
        const errorMessages = {
            'auth/email-already-in-use': 'Email sudah terdaftar',
            'auth/invalid-email': 'Format email tidak valid',
            'auth/operation-not-allowed': 'Operasi tidak diizinkan',
            'auth/weak-password': 'Password terlalu lemah (min 6 karakter)',
            'auth/user-disabled': 'Akun telah dinonaktifkan',
            'auth/user-not-found': 'Email tidak terdaftar',
            'auth/wrong-password': 'Password salah',
            'auth/too-many-requests': 'Terlalu banyak percobaan, coba lagi nanti',
            'auth/network-request-failed': 'Koneksi gagal, periksa internet Anda'
        };

        return new Error(errorMessages[error.code] || error.message);
    },

    /**
     * Load guest profile from localStorage
     */
    loadGuestProfile() {
        const saved = localStorage.getItem('guest_profile');
        if (saved) {
            this.userProfile = JSON.parse(saved);
            return this.userProfile;
        }
        return null;
    }
};

// Export
window.AuthService = AuthService;
