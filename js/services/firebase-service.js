/* ============================================
   FIREBASE SERVICE
   Handles all Firebase database operations
   ============================================ */

const FirebaseService = {
    initialized: false,

    /**
     * Initialize Firebase Service
     */
    init() {
        if (this.initialized) return true;
        
        const result = FirebaseConfig.init();
        this.initialized = true;
        return result;
    },

    // ========================================
    // USER DATA
    // ========================================
    
    /**
     * Create new user profile in Firestore
     */
    async createUserProfile(userId, username, email) {
        if (FirebaseConfig.isOffline()) {
            return this.createOfflineProfile(username);
        }

        const db = FirebaseConfig.getDb();
        const userRef = db.collection('users').doc(userId);
        
        const userData = {
            username: username,
            email: email,
            level: 1,
            exp: 0,
            trophies: 0,
            gold: 1000,
            gems: 100,
            deck: [...DefaultDeck],
            unlockedCards: [...Object.keys(CardsData)],
            cardLevels: this.initializeCardLevels(),
            stats: {
                wins: 0,
                losses: 0,
                draws: 0,
                threeCrowns: 0
            },
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        };

        await userRef.set(userData);
        return userData;
    },

    /**
     * Create offline profile for guest mode
     */
    createOfflineProfile(username = 'Guest') {
        return {
            id: 'offline_' + Date.now(),
            username: username,
            level: 1,
            exp: 0,
            trophies: 0,
            gold: 1000,
            gems: 100,
            deck: [...DefaultDeck],
            unlockedCards: [...Object.keys(CardsData)],
            cardLevels: this.initializeCardLevels(),
            stats: {
                wins: 0,
                losses: 0,
                draws: 0,
                threeCrowns: 0
            }
        };
    },

    /**
     * Initialize card levels (semua level 1)
     */
    initializeCardLevels() {
        const levels = {};
        Object.keys(CardsData).forEach(cardId => {
            levels[cardId] = 1;
        });
        return levels;
    },

    /**
     * Get user profile from Firestore
     */
    async getUserProfile(userId) {
        if (FirebaseConfig.isOffline()) {
            return null;
        }

        const db = FirebaseConfig.getDb();
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (userDoc.exists) {
            return { id: userDoc.id, ...userDoc.data() };
        }
        return null;
    },

    /**
     * Update user profile
     */
    async updateUserProfile(userId, updates) {
        if (FirebaseConfig.isOffline()) {
            return true;
        }

        const db = FirebaseConfig.getDb();
        await db.collection('users').doc(userId).update({
            ...updates,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    },

    // ========================================
    // DECK MANAGEMENT
    // ========================================

    /**
     * Save user deck
     */
    async saveDeck(userId, deck) {
        if (FirebaseConfig.isOffline()) {
            // Save to localStorage for offline mode
            localStorage.setItem('offline_deck', JSON.stringify(deck));
            return true;
        }

        const db = FirebaseConfig.getDb();
        await db.collection('users').doc(userId).update({
            deck: deck
        });
        return true;
    },

    /**
     * Get user deck
     */
    async getDeck(userId) {
        if (FirebaseConfig.isOffline()) {
            const saved = localStorage.getItem('offline_deck');
            return saved ? JSON.parse(saved) : [...DefaultDeck];
        }

        const profile = await this.getUserProfile(userId);
        return profile ? profile.deck : [...DefaultDeck];
    },

    // ========================================
    // MATCH HISTORY
    // ========================================

    /**
     * Save match result
     */
    async saveMatchResult(userId, matchData) {
        if (FirebaseConfig.isOffline()) {
            // Save to localStorage
            const history = JSON.parse(localStorage.getItem('offline_history') || '[]');
            history.unshift({
                ...matchData,
                timestamp: Date.now()
            });
            // Keep only last 20 matches
            localStorage.setItem('offline_history', JSON.stringify(history.slice(0, 20)));
            return true;
        }

        const db = FirebaseConfig.getDb();
        
        // Add to match history collection
        await db.collection('users').doc(userId).collection('matchHistory').add({
            ...matchData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update user stats
        const statsUpdate = {
            [`stats.${matchData.result === 'win' ? 'wins' : matchData.result === 'lose' ? 'losses' : 'draws'}`]: 
                firebase.firestore.FieldValue.increment(1)
        };

        if (matchData.crowns === 3) {
            statsUpdate['stats.threeCrowns'] = firebase.firestore.FieldValue.increment(1);
        }

        // Update trophies
        statsUpdate.trophies = firebase.firestore.FieldValue.increment(matchData.trophyChange);

        await db.collection('users').doc(userId).update(statsUpdate);
        
        return true;
    },

    /**
     * Get match history
     */
    async getMatchHistory(userId, limit = 20) {
        if (FirebaseConfig.isOffline()) {
            const history = JSON.parse(localStorage.getItem('offline_history') || '[]');
            return history.slice(0, limit);
        }

        const db = FirebaseConfig.getDb();
        const snapshot = await db.collection('users').doc(userId)
            .collection('matchHistory')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    },

    // ========================================
    // MATCHMAKING
    // ========================================

    /**
     * Join matchmaking queue
     */
    async joinMatchmaking(userId, username, trophies) {
        if (FirebaseConfig.isOffline()) {
            return { matchId: null, isOffline: true };
        }

        const db = FirebaseConfig.getDb();
        
        // Check for existing match in queue
        const queueRef = db.collection('matchmaking');
        const availableMatch = await queueRef
            .where('status', '==', 'waiting')
            .where('trophyRange.min', '<=', trophies + 200)
            .where('trophyRange.max', '>=', trophies - 200)
            .limit(1)
            .get();

        if (!availableMatch.empty) {
            // Join existing match
            const matchDoc = availableMatch.docs[0];
            await matchDoc.ref.update({
                player2: {
                    id: userId,
                    username: username,
                    trophies: trophies
                },
                status: 'matched'
            });
            return { matchId: matchDoc.id, isPlayer1: false };
        }

        // Create new match in queue
        const newMatch = await queueRef.add({
            player1: {
                id: userId,
                username: username,
                trophies: trophies
            },
            player2: null,
            status: 'waiting',
            trophyRange: {
                min: trophies - 200,
                max: trophies + 200
            },
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        return { matchId: newMatch.id, isPlayer1: true };
    },

    /**
     * Leave matchmaking queue
     */
    async leaveMatchmaking(matchId) {
        if (FirebaseConfig.isOffline() || !matchId) return;

        const db = FirebaseConfig.getDb();
        await db.collection('matchmaking').doc(matchId).delete();
    },

    /**
     * Listen for match updates
     */
    listenForMatch(matchId, callback) {
        if (FirebaseConfig.isOffline() || !matchId) return () => {};

        const db = FirebaseConfig.getDb();
        return db.collection('matchmaking').doc(matchId).onSnapshot(snapshot => {
            if (snapshot.exists) {
                callback(snapshot.data());
            }
        });
    },

    /**
     * Get user data by ID
     */
    async getUserData(userId) {
        return this.getUserProfile(userId);
    },

    /**
     * Update user deck
     */
    async updateUserDeck(userId, deck) {
        return this.saveDeck(userId, deck);
    },

    /**
     * Update user stats
     */
    async updateUserStats(userId, stats) {
        return this.updateUserProfile(userId, stats);
    }
};

// Export
window.FirebaseService = FirebaseService;
