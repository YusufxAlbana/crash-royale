/* ============================================
   MATCHMAKING SERVICE
   Handles finding opponents
   ============================================ */

const MatchmakingService = {
    currentMatchId: null,
    matchListener: null,
    searchTimeout: null,
    onMatchFound: null,
    onMatchCancelled: null,

    /**
     * Start searching for opponent
     */
    async startSearch(onFound, onCancelled) {
        this.onMatchFound = onFound;
        this.onMatchCancelled = onCancelled;

        const profile = AuthService.getProfile();
        if (!profile) {
            console.error("No user profile for matchmaking");
            return false;
        }

        // Untuk mode offline atau guest, langsung match dengan AI
        if (FirebaseConfig.isOffline() || AuthService.isGuest()) {
            // Simulate search delay
            this.searchTimeout = setTimeout(() => {
                this.onMatchFound({
                    opponent: {
                        id: 'ai_opponent',
                        username: this.generateAIName(),
                        trophies: profile.trophies + Math.floor(Math.random() * 200) - 100
                    },
                    isAI: true
                });
            }, 1500 + Math.random() * 2000); // 1.5-3.5 detik
            
            return true;
        }

        try {
            // Join matchmaking queue
            const result = await FirebaseService.joinMatchmaking(
                AuthService.getUserId(),
                profile.username,
                profile.trophies
            );

            this.currentMatchId = result.matchId;

            if (result.isOffline) {
                // Fallback to AI
                this.searchTimeout = setTimeout(() => {
                    this.onMatchFound({
                        opponent: {
                            id: 'ai_opponent',
                            username: this.generateAIName(),
                            trophies: profile.trophies
                        },
                        isAI: true
                    });
                }, 2000);
                return true;
            }

            // Listen for match updates
            this.matchListener = FirebaseService.listenForMatch(this.currentMatchId, (matchData) => {
                if (matchData.status === 'matched') {
                    // Match found!
                    const isPlayer1 = matchData.player1.id === AuthService.getUserId();
                    const opponent = isPlayer1 ? matchData.player2 : matchData.player1;
                    
                    this.cleanup();
                    this.onMatchFound({
                        matchId: this.currentMatchId,
                        opponent: opponent,
                        isPlayer1: isPlayer1,
                        isAI: false
                    });
                }
            });

            // Timeout - match with AI after 10 seconds
            this.searchTimeout = setTimeout(() => {
                console.log("Matchmaking timeout, matching with AI");
                this.cleanup();
                
                this.onMatchFound({
                    opponent: {
                        id: 'ai_opponent',
                        username: this.generateAIName(),
                        trophies: profile.trophies
                    },
                    isAI: true
                });
            }, 10000);

            return true;
        } catch (error) {
            console.error("Matchmaking error:", error);
            this.cleanup();
            return false;
        }
    },

    /**
     * Cancel matchmaking search
     */
    async cancelSearch() {
        this.cleanup();
        
        if (this.currentMatchId) {
            await FirebaseService.leaveMatchmaking(this.currentMatchId);
            this.currentMatchId = null;
        }

        if (this.onMatchCancelled) {
            this.onMatchCancelled();
        }
    },

    /**
     * Cleanup listeners and timeouts
     */
    cleanup() {
        if (this.matchListener) {
            this.matchListener();
            this.matchListener = null;
        }

        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
        }
    },

    /**
     * Generate random AI opponent name
     */
    generateAIName() {
        const prefixes = ['Dark', 'Shadow', 'Storm', 'Fire', 'Ice', 'Thunder', 'Royal', 'Elite', 'Pro', 'Master'];
        const suffixes = ['Knight', 'Warrior', 'Slayer', 'Hunter', 'King', 'Lord', 'Champion', 'Legend', 'Crusher', 'Destroyer'];
        const numbers = ['', '', '', '99', '007', 'X', '2024', ''];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const number = numbers[Math.floor(Math.random() * numbers.length)];
        
        return prefix + suffix + number;
    }
};

// Export
window.MatchmakingService = MatchmakingService;
