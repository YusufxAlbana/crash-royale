/* ============================================
   FRIENDS SERVICE
   Handles friend list, requests, and chat
   Data stored in Firebase
   ============================================ */

const FriendsService = {
    friends: [],
    friendRequests: [],
    chats: {},
    currentChatFriend: null,
    isOnline: false,
    friendCode: null,
    unsubscribers: [],

    /**
     * Initialize friends service
     */
    async init() {
        this.isOnline = window.FirebaseConfig && !FirebaseConfig.isOffline();
        
        await this.loadFriends();
        this.setupEventListeners();
        await this.generateFriendCode();
        this.renderFriendsList();
        this.renderChatList();
        
        // Listen for real-time updates if online
        if (this.isOnline) {
            this.setupRealtimeListeners();
            this.setupBattleInviteListener();
        }
    },

    /**
     * Generate unique friend code and save to Firebase
     */
    async generateFriendCode() {
        const user = window.currentUser;
        if (!user) return;
        
        // Check if user already has a friend code
        if (this.isOnline) {
            try {
                const db = FirebaseConfig.getDb();
                const userDoc = await db.collection('users').doc(user.username.toLowerCase()).get();
                
                if (userDoc.exists && userDoc.data().friendCode) {
                    this.friendCode = userDoc.data().friendCode;
                } else {
                    // Generate new code
                    this.friendCode = '#' + user.username.substring(0, 3).toUpperCase() + 
                                     Math.random().toString(36).substring(2, 5).toUpperCase();
                    
                    // Save to Firebase
                    await db.collection('users').doc(user.username.toLowerCase()).update({
                        friendCode: this.friendCode
                    });
                }
            } catch (e) {
                console.error('Error with friend code:', e);
                this.friendCode = '#' + user.username.substring(0, 3).toUpperCase() + 
                                 Math.random().toString(36).substring(2, 5).toUpperCase();
            }
        } else {
            this.friendCode = '#' + user.username.substring(0, 3).toUpperCase() + 
                             Math.random().toString(36).substring(2, 5).toUpperCase();
        }
        
        const codeEl = document.getElementById('my-friend-code');
        if (codeEl) codeEl.textContent = this.friendCode;
        
        return this.friendCode;
    },

    /**
     * Load friends from Firebase or localStorage
     */
    async loadFriends() {
        const user = window.currentUser;
        if (!user) return;
        
        if (this.isOnline) {
            try {
                const db = FirebaseConfig.getDb();
                const userKey = user.username.toLowerCase();
                
                // Load friends list
                const friendsDoc = await db.collection('friends').doc(userKey).get();
                if (friendsDoc.exists) {
                    const data = friendsDoc.data();
                    this.friends = data.friends || [];
                    this.friendRequests = data.requests || [];
                }
                
                // Load chats
                const chatsSnapshot = await db.collection('chats')
                    .where('participants', 'array-contains', userKey)
                    .get();
                
                chatsSnapshot.forEach(doc => {
                    const chatData = doc.data();
                    const friendId = chatData.participants.find(p => p !== userKey);
                    this.chats[friendId] = {
                        messages: chatData.messages || [],
                        unread: chatData.unread?.[userKey] || 0
                    };
                });
                
                // Update online status
                await this.updateOnlineStatus(true);
                
                console.log('Friends loaded from Firebase');
            } catch (e) {
                console.error('Error loading friends from Firebase:', e);
                this.loadFromLocalStorage();
            }
        } else {
            this.loadFromLocalStorage();
        }
        
        // No demo friends - only real players from Firebase
    },

    /**
     * Load from localStorage (offline fallback)
     */
    loadFromLocalStorage() {
        const saved = localStorage.getItem('battle_arena_friends_' + window.currentUser?.username);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.friends = data.friends || [];
                this.friendRequests = data.requests || [];
                this.chats = data.chats || {};
            } catch (e) {
                console.error('Error loading friends from localStorage:', e);
            }
        }
    },

    /**
     * Save friends to Firebase and localStorage
     */
    async saveFriends() {
        const user = window.currentUser;
        if (!user) return;
        
        const data = {
            friends: this.friends,
            requests: this.friendRequests
        };
        
        // Always save to localStorage as backup
        localStorage.setItem('battle_arena_friends_' + user.username, JSON.stringify({
            ...data,
            chats: this.chats
        }));
        
        // Save to Firebase if online
        if (this.isOnline) {
            try {
                const db = FirebaseConfig.getDb();
                const userKey = user.username.toLowerCase();
                
                await db.collection('friends').doc(userKey).set(data, { merge: true });
                console.log('Friends saved to Firebase');
            } catch (e) {
                console.error('Error saving friends to Firebase:', e);
            }
        }
    },

    /**
     * Update user's online status
     */
    async updateOnlineStatus(isOnline) {
        if (!this.isOnline || !window.currentUser) return;
        
        try {
            const db = FirebaseConfig.getDb();
            const userKey = window.currentUser.username.toLowerCase();
            
            await db.collection('users').doc(userKey).update({
                online: isOnline,
                lastSeen: Date.now()
            });
        } catch (e) {
            console.error('Error updating online status:', e);
        }
    },

    /**
     * Setup real-time listeners for Firebase
     */
    setupRealtimeListeners() {
        if (!this.isOnline || !window.currentUser) return;
        
        const db = FirebaseConfig.getDb();
        const userKey = window.currentUser.username.toLowerCase();
        
        // Listen for friend requests
        const unsubRequests = db.collection('friends').doc(userKey)
            .onSnapshot(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    this.friendRequests = data.requests || [];
                    this.friends = data.friends || [];
                    this.renderFriendsList();
                    this.updateRequestBadge();
                }
            });
        
        this.unsubscribers.push(unsubRequests);
        
        // Listen for new messages
        const unsubChats = db.collection('chats')
            .where('participants', 'array-contains', userKey)
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'modified' || change.type === 'added') {
                        const chatData = change.doc.data();
                        const friendId = chatData.participants.find(p => p !== userKey);
                        
                        this.chats[friendId] = {
                            messages: chatData.messages || [],
                            unread: chatData.unread?.[userKey] || 0
                        };
                        
                        // Update UI if in chat
                        if (this.currentChatFriend?.id === friendId || 
                            this.currentChatFriend?.username?.toLowerCase() === friendId) {
                            this.renderMessages(friendId);
                        }
                        
                        this.renderChatList();
                    }
                });
            });
        
        this.unsubscribers.push(unsubChats);
        
        // Update offline status when leaving
        window.addEventListener('beforeunload', () => {
            this.updateOnlineStatus(false);
        });
    },

    /**
     * Update request badge count
     */
    updateRequestBadge() {
        const badge = document.getElementById('request-count');
        const tabBadge = document.getElementById('tab-request-count');
        
        if (badge) badge.textContent = this.friendRequests.length;
        if (tabBadge) tabBadge.textContent = this.friendRequests.length;
    },

    /**
     * Cleanup listeners
     */
    cleanup() {
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];
        this.updateOnlineStatus(false);
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Add friend button (home)
        document.getElementById('add-friend-btn')?.addEventListener('click', () => {
            this.showAddFriendModal();
        });
        
        // Add friend button (header)
        document.getElementById('add-friend-header-btn')?.addEventListener('click', () => {
            this.showAddFriendModal();
        });
        
        // Friend requests button
        document.getElementById('friend-requests-btn')?.addEventListener('click', () => {
            this.showFriendsScreen('requests');
        });
        
        // Open chat button
        document.getElementById('open-chat-btn')?.addEventListener('click', () => {
            if (this.friends.length > 0) {
                this.openChat(this.friends[0]);
            } else {
                alert('Add friends to start chatting!');
            }
        });
        
        // Modal buttons
        document.getElementById('cancel-add-friend')?.addEventListener('click', () => {
            this.hideAddFriendModal();
        });
        
        // Search player button
        document.getElementById('search-player-btn')?.addEventListener('click', () => {
            this.searchPlayers();
        });
        
        // Search on Enter key
        document.getElementById('add-friend-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchPlayers();
        });
        
        // Copy friend code
        document.getElementById('copy-friend-code')?.addEventListener('click', () => {
            const code = document.getElementById('my-friend-code')?.textContent;
            if (code) {
                navigator.clipboard.writeText(code).then(() => {
                    alert('Friend code copied!');
                });
            }
        });
        
        // Friends screen tabs
        document.querySelectorAll('.friends-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.friends-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderFullFriendsList(tab.dataset.tab);
            });
        });
        
        // Friends screen back
        document.getElementById('friends-back')?.addEventListener('click', () => {
            ScreenManager.showScreen('menu');
        });
        
        // Chat back
        document.getElementById('chat-back')?.addEventListener('click', () => {
            ScreenManager.showScreen('menu');
        });
        
        // Send message
        document.getElementById('send-message-btn')?.addEventListener('click', () => {
            this.sendMessage();
        });
        
        document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        // Battle friend from chat
        document.getElementById('battle-friend-btn')?.addEventListener('click', () => {
            if (this.currentChatFriend) {
                this.battleFriend(this.currentChatFriend);
            }
        });
        
        // Search friends
        document.getElementById('friend-search')?.addEventListener('input', (e) => {
            this.filterFriends(e.target.value);
        });
    },

    /**
     * Show add friend modal
     */
    showAddFriendModal() {
        const modal = document.getElementById('add-friend-modal');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('add-friend-input').value = '';
            document.getElementById('add-friend-error').textContent = '';
            document.getElementById('search-results').innerHTML = `
                <div class="search-placeholder">
                    <span>🔍</span>
                    <p>Search for players to add as friends</p>
                </div>
            `;
        }
    },

    /**
     * Hide add friend modal
     */
    hideAddFriendModal() {
        const modal = document.getElementById('add-friend-modal');
        if (modal) modal.classList.remove('active');
    },

    /**
     * Search players from Firebase
     */
    async searchPlayers() {
        const input = document.getElementById('add-friend-input');
        const resultsContainer = document.getElementById('search-results');
        const errorEl = document.getElementById('add-friend-error');
        const searchBtn = document.getElementById('search-player-btn');
        
        const query = input?.value.trim();
        
        if (!query) {
            errorEl.textContent = 'Please enter a username or friend code';
            return;
        }
        
        if (query.length < 2) {
            errorEl.textContent = 'Enter at least 2 characters';
            return;
        }
        
        errorEl.textContent = '';
        
        // Show loading
        resultsContainer.innerHTML = `
            <div class="search-loading">
                <div class="loading-spinner"></div>
                <p>Searching...</p>
            </div>
        `;
        searchBtn.disabled = true;
        
        try {
            const results = await this.searchPlayersInFirebase(query);
            this.renderSearchResults(results);
        } catch (e) {
            console.error('Search error:', e);
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <span>❌</span>
                    <p>Error searching. Please try again.</p>
                </div>
            `;
        }
        
        searchBtn.disabled = false;
    },

    /**
     * Search players in Firebase by username or friend code
     */
    async searchPlayersInFirebase(query) {
        if (!this.isOnline) {
            return [];
        }
        
        const db = FirebaseConfig.getDb();
        const results = [];
        const currentUsername = window.currentUser?.username.toLowerCase();
        const searchLower = query.toLowerCase().replace('#', '');
        
        try {
            // Search by exact username match
            const exactMatch = await db.collection('users').doc(searchLower).get();
            if (exactMatch.exists && exactMatch.id !== currentUsername) {
                results.push({ id: exactMatch.id, ...exactMatch.data() });
            }
            
            // Search by friend code (exact match)
            const friendCodeUpper = '#' + query.replace('#', '').toUpperCase();
            const codeQuery = await db.collection('users')
                .where('friendCode', '==', friendCodeUpper)
                .limit(10)
                .get();
            
            codeQuery.forEach(doc => {
                if (doc.id !== currentUsername && !results.some(r => r.id === doc.id)) {
                    results.push({ id: doc.id, ...doc.data() });
                }
            });
            
            // Search by username prefix (for partial matches)
            // Note: Firestore doesn't support LIKE queries, so we use range query
            const prefixQuery = await db.collection('users')
                .orderBy('username')
                .startAt(query)
                .endAt(query + '\uf8ff')
                .limit(10)
                .get();
            
            prefixQuery.forEach(doc => {
                if (doc.id !== currentUsername && !results.some(r => r.id === doc.id)) {
                    results.push({ id: doc.id, ...doc.data() });
                }
            });
            
        } catch (e) {
            console.error('Firebase search error:', e);
        }
        
        return results;
    },

    /**
     * Render search results
     */
    renderSearchResults(results) {
        const container = document.getElementById('search-results');
        if (!container) return;
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <span>😕</span>
                    <p>No players found</p>
                    <p style="font-size: 0.75rem; opacity: 0.7;">Try a different username or friend code</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = results.map(player => {
            const isFriend = this.friends.some(f => f.id === player.id || f.username?.toLowerCase() === player.id);
            const isPending = this.friends.some(f => (f.id === player.id || f.username?.toLowerCase() === player.id) && f.pending);
            
            let btnText = '➕ Add';
            let btnClass = '';
            
            if (isFriend && !isPending) {
                btnText = '✓ Friends';
                btnClass = 'added';
            } else if (isPending) {
                btnText = '⏳ Pending';
                btnClass = 'pending';
            }
            
            return `
                <div class="search-result-item" data-player-id="${player.id}">
                    <div class="search-result-avatar">👤</div>
                    <div class="search-result-info">
                        <span class="search-result-name">${player.username || player.id}</span>
                        <div class="search-result-details">
                            <span>🏆 ${player.trophies || 0}</span>
                            <span>Lv.${player.level || 1}</span>
                            ${player.friendCode ? `<span class="search-result-code">${player.friendCode}</span>` : ''}
                        </div>
                    </div>
                    <button class="search-result-btn ${btnClass}" 
                            data-player-id="${player.id}"
                            data-player-name="${player.username || player.id}"
                            data-player-trophies="${player.trophies || 0}"
                            ${isFriend ? 'disabled' : ''}>
                        ${btnText}
                    </button>
                </div>
            `;
        }).join('');
        
        // Add click handlers
        container.querySelectorAll('.search-result-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => {
                this.addFriendFromSearch(btn);
            });
        });
    },

    /**
     * Add friend from search results
     */
    async addFriendFromSearch(btn) {
        const playerId = btn.dataset.playerId;
        const playerName = btn.dataset.playerName;
        const playerTrophies = parseInt(btn.dataset.playerTrophies) || 0;
        
        btn.disabled = true;
        btn.textContent = '...';
        
        try {
            await this.sendFriendRequestTo(playerId, playerName, playerTrophies);
            
            btn.textContent = '⏳ Pending';
            btn.classList.add('pending');
            
        } catch (e) {
            console.error('Error adding friend:', e);
            btn.disabled = false;
            btn.textContent = '➕ Add';
            document.getElementById('add-friend-error').textContent = 'Error sending request';
        }
    },

    /**
     * Send friend request to specific player
     */
    async sendFriendRequestTo(playerId, playerName, playerTrophies) {
        if (!this.isOnline) {
            throw new Error('Offline mode');
        }
        
        const db = FirebaseConfig.getDb();
        const userKey = window.currentUser.username.toLowerCase();
        
        // Add friend request to target user's requests
        const targetFriendsRef = db.collection('friends').doc(playerId);
        const targetFriendsDoc = await targetFriendsRef.get();
        
        const currentRequests = targetFriendsDoc.exists ? 
            (targetFriendsDoc.data().requests || []) : [];
        
        // Check if request already sent
        if (currentRequests.some(r => r.id === userKey)) {
            throw new Error('Request already sent');
        }
        
        // Add request to target
        currentRequests.push({
            id: userKey,
            username: window.currentUser.username,
            trophies: window.currentUser.trophies || 0,
            timestamp: Date.now()
        });
        
        await targetFriendsRef.set({ requests: currentRequests }, { merge: true });
        
        // Add to local friends list as pending
        const newFriend = {
            id: playerId,
            username: playerName,
            trophies: playerTrophies,
            online: false,
            lastSeen: Date.now(),
            pending: true
        };
        
        this.friends.push(newFriend);
        await this.saveFriends();
        this.renderFriendsList();
    },



    /**
     * Render friends list (home panel)
     */
    renderFriendsList() {
        const container = document.getElementById('friends-list');
        const countEl = document.getElementById('friend-count');
        const requestCountEl = document.getElementById('request-count');
        
        if (countEl) countEl.textContent = this.friends.length;
        if (requestCountEl) requestCountEl.textContent = this.friendRequests.length;
        
        if (!container) return;
        
        if (this.friends.length === 0) {
            container.innerHTML = `
                <div class="empty-friends">
                    <span class="empty-icon">👥</span>
                    <p>No friends yet</p>
                    <p class="empty-hint">Add friends to battle together!</p>
                </div>
            `;
            return;
        }
        
        // Show first 4 friends
        const displayFriends = this.friends.slice(0, 4);
        
        container.innerHTML = displayFriends.map(friend => `
            <div class="friend-item" data-friend-id="${friend.id}">
                <div class="friend-avatar">
                    👤
                    <span class="${friend.online ? 'online-dot' : 'offline-dot'}"></span>
                </div>
                <div class="friend-info">
                    <span class="friend-name">${friend.username}</span>
                    <span class="friend-status ${friend.online ? 'online' : ''}">${friend.online ? 'Online' : 'Offline'}</span>
                </div>
                <div class="friend-actions-mini">
                    <button class="friend-btn chat-btn" data-friend-id="${friend.id}">💬</button>
                    <button class="friend-btn battle ${!friend.online ? 'disabled' : ''}" data-friend-id="${friend.id}" ${!friend.online ? 'disabled' : ''}>⚔️</button>
                </div>
            </div>
        `).join('');
        
        if (this.friends.length > 4) {
            container.innerHTML += `
                <button class="panel-btn" id="view-all-friends">View All (${this.friends.length})</button>
            `;
            document.getElementById('view-all-friends')?.addEventListener('click', () => {
                this.showFriendsScreen('all');
            });
        }
        
        // Add click handlers
        container.querySelectorAll('.chat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const friendId = btn.dataset.friendId;
                const friend = this.friends.find(f => f.id === friendId);
                if (friend) this.openChat(friend);
            });
        });
        
        container.querySelectorAll('.friend-btn.battle:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const friendId = btn.dataset.friendId;
                const friend = this.friends.find(f => f.id === friendId);
                if (friend) this.battleFriend(friend);
            });
        });
    },

    /**
     * Show friends screen
     */
    showFriendsScreen(tab = 'all') {
        ScreenManager.showScreen('friends');
        
        // Set active tab
        document.querySelectorAll('.friends-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        
        this.renderFullFriendsList(tab);
    },

    /**
     * Render full friends list
     */
    renderFullFriendsList(tab = 'all') {
        const container = document.getElementById('friends-full-list');
        if (!container) return;
        
        let list = [];
        
        if (tab === 'all') {
            list = this.friends;
        } else if (tab === 'online') {
            list = this.friends.filter(f => f.online);
        } else if (tab === 'requests') {
            list = this.friendRequests;
        }
        
        if (list.length === 0) {
            container.innerHTML = `
                <div class="empty-friends" style="padding: 3rem;">
                    <span class="empty-icon">${tab === 'requests' ? '📩' : '👥'}</span>
                    <p>${tab === 'requests' ? 'No pending requests' : 'No friends found'}</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = list.map(friend => `
            <div class="friend-item-full" data-friend-id="${friend.id}">
                <div class="friend-avatar-full">
                    👤
                    <span class="${friend.online ? 'online-dot' : 'offline-dot'}"></span>
                </div>
                <div class="friend-info-full">
                    <span class="friend-name-full">${friend.username}</span>
                    <div class="friend-details">
                        <span>🏆 ${friend.trophies}</span>
                        <span>${friend.online ? '🟢 Online' : '⚫ ' + this.getLastSeen(friend.lastSeen)}</span>
                    </div>
                </div>
                <div class="friend-actions-full">
                    ${tab === 'requests' ? `
                        <button class="friend-btn-full accept" data-friend-id="${friend.id}">✓ Accept</button>
                        <button class="friend-btn-full decline" data-friend-id="${friend.id}">✕</button>
                    ` : `
                        <button class="friend-btn-full chat" data-friend-id="${friend.id}">💬 Chat</button>
                        <button class="friend-btn-full battle" data-friend-id="${friend.id}" ${!friend.online ? 'disabled style="opacity:0.5"' : ''}>⚔️ Battle</button>
                    `}
                </div>
            </div>
        `).join('');
        
        // Add event handlers
        container.querySelectorAll('.friend-btn-full.chat').forEach(btn => {
            btn.addEventListener('click', () => {
                const friend = this.friends.find(f => f.id === btn.dataset.friendId);
                if (friend) this.openChat(friend);
            });
        });
        
        container.querySelectorAll('.friend-btn-full.battle:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => {
                const friend = this.friends.find(f => f.id === btn.dataset.friendId);
                if (friend) this.battleFriend(friend);
            });
        });
        
        // Accept/Decline handlers for requests
        container.querySelectorAll('.friend-btn-full.accept').forEach(btn => {
            btn.addEventListener('click', () => {
                this.acceptFriendRequest(btn.dataset.friendId);
            });
        });
        
        container.querySelectorAll('.friend-btn-full.decline').forEach(btn => {
            btn.addEventListener('click', () => {
                this.declineFriendRequest(btn.dataset.friendId);
            });
        });
    },

    /**
     * Get last seen text
     */
    getLastSeen(timestamp) {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    },

    /**
     * Render chat list (home panel)
     */
    renderChatList() {
        const container = document.getElementById('chat-list');
        const unreadEl = document.getElementById('unread-count');
        
        // Count unread
        let unread = 0;
        Object.values(this.chats).forEach(chat => {
            unread += chat.unread || 0;
        });
        
        if (unreadEl) unreadEl.textContent = unread;
        if (!container) return;
        
        // Get recent chats
        const recentChats = this.friends
            .filter(f => this.chats[f.id]?.messages?.length > 0)
            .slice(0, 3);
        
        if (recentChats.length === 0) {
            container.innerHTML = `
                <div class="empty-chat">
                    <span class="empty-icon">💬</span>
                    <p>No messages</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = recentChats.map(friend => {
            const chat = this.chats[friend.id];
            const lastMsg = chat.messages[chat.messages.length - 1];
            return `
                <div class="chat-preview-item" data-friend-id="${friend.id}">
                    <span class="chat-preview-avatar">👤</span>
                    <div class="chat-preview-info">
                        <span class="chat-preview-name">${friend.username}</span>
                        <span class="chat-preview-msg">${lastMsg?.text || ''}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        container.querySelectorAll('.chat-preview-item').forEach(item => {
            item.addEventListener('click', () => {
                const friend = this.friends.find(f => f.id === item.dataset.friendId);
                if (friend) this.openChat(friend);
            });
        });
    },

    /**
     * Open chat with friend
     */
    openChat(friend) {
        this.currentChatFriend = friend;
        
        // Update header
        document.getElementById('chat-friend-name').textContent = friend.username;
        document.getElementById('chat-friend-status').textContent = friend.online ? 'Online' : 'Offline';
        document.getElementById('chat-avatar').textContent = '👤';
        
        // Initialize chat if needed
        if (!this.chats[friend.id]) {
            this.chats[friend.id] = { messages: [], unread: 0 };
        }
        
        // Mark as read
        this.chats[friend.id].unread = 0;
        this.saveFriends();
        
        // Render messages
        this.renderMessages(friend.id);
        
        // Show screen
        ScreenManager.showScreen('chat');
    },

    /**
     * Render chat messages
     */
    renderMessages(friendId) {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        
        const chat = this.chats[friendId];
        if (!chat || chat.messages.length === 0) {
            container.innerHTML = `
                <div class="empty-chat" style="flex:1; display:flex; flex-direction:column; justify-content:center;">
                    <span class="empty-icon">💬</span>
                    <p>No messages yet</p>
                    <p style="font-size:0.75rem; opacity:0.7;">Say hello!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = chat.messages.map(msg => `
            <div class="message ${msg.sent ? 'sent' : 'received'}">
                ${msg.text}
                <div class="message-time">${this.formatTime(msg.timestamp)}</div>
            </div>
        `).join('');
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    },

    /**
     * Send message
     */
    async sendMessage() {
        const input = document.getElementById('chat-input');
        const text = input?.value.trim();
        
        if (!text || !this.currentChatFriend) return;
        
        const friendId = this.currentChatFriend.id || this.currentChatFriend.username?.toLowerCase();
        const userKey = window.currentUser?.username.toLowerCase();
        
        if (!this.chats[friendId]) {
            this.chats[friendId] = { messages: [], unread: 0 };
        }
        
        const newMessage = {
            text,
            sender: userKey,
            sent: true,
            timestamp: Date.now()
        };
        
        // Add message locally
        this.chats[friendId].messages.push(newMessage);
        
        // Clear input
        input.value = '';
        
        // Render immediately
        this.renderMessages(friendId);
        this.renderChatList();
        
        // Save to Firebase
        if (this.isOnline) {
            try {
                const db = FirebaseConfig.getDb();
                const chatId = [userKey, friendId].sort().join('_');
                
                const chatRef = db.collection('chats').doc(chatId);
                const chatDoc = await chatRef.get();
                
                const messages = chatDoc.exists ? (chatDoc.data().messages || []) : [];
                messages.push({
                    text,
                    sender: userKey,
                    timestamp: Date.now()
                });
                
                await chatRef.set({
                    participants: [userKey, friendId],
                    messages: messages,
                    lastMessage: text,
                    lastMessageTime: Date.now(),
                    unread: {
                        [friendId]: (chatDoc.data()?.unread?.[friendId] || 0) + 1,
                        [userKey]: 0
                    }
                }, { merge: true });
                
            } catch (e) {
                console.error('Error sending message to Firebase:', e);
            }
        }
        
        // Save locally
        await this.saveFriends();
        
        // Simulate reply for demo friends (offline mode)
        if (!this.isOnline && this.currentChatFriend.online) {
            setTimeout(() => {
                this.receiveMessage(friendId);
            }, 1000 + Math.random() * 2000);
        }
    },

    /**
     * Simulate receiving message (for demo/offline)
     */
    async receiveMessage(friendId) {
        const replies = [
            'Hey! 👋',
            'Want to battle? ⚔️',
            'Nice! 🎉',
            'GG!',
            'Let\'s go!',
            '😄',
            'Sure!',
            'Ready when you are!'
        ];
        
        const reply = replies[Math.floor(Math.random() * replies.length)];
        
        if (!this.chats[friendId]) {
            this.chats[friendId] = { messages: [], unread: 0 };
        }
        
        this.chats[friendId].messages.push({
            text: reply,
            sent: false,
            timestamp: Date.now()
        });
        
        await this.saveFriends();
        
        // Only render if still in chat
        if (this.currentChatFriend?.id === friendId) {
            this.renderMessages(friendId);
        } else {
            this.chats[friendId].unread = (this.chats[friendId].unread || 0) + 1;
            this.renderChatList();
        }
    },

    /**
     * Format timestamp
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    /**
     * Battle friend - send battle invite
     */
    async battleFriend(friend) {
        if (!friend.online) {
            alert(`${friend.username} is offline`);
            return;
        }
        
        if (!this.isOnline) {
            alert('Friend battles require online mode');
            return;
        }
        
        // Show waiting modal
        this.showBattleInviteWaiting(friend);
        
        try {
            const db = FirebaseConfig.getDb();
            const userKey = window.currentUser.username.toLowerCase();
            const friendKey = friend.id || friend.username.toLowerCase();
            
            // Create battle invite in Firebase
            const inviteId = `${userKey}_${friendKey}_${Date.now()}`;
            
            await db.collection('battleInvites').doc(inviteId).set({
                from: userKey,
                fromUsername: window.currentUser.username,
                fromTrophies: window.currentUser.trophies || 0,
                to: friendKey,
                toUsername: friend.username,
                status: 'pending',
                timestamp: Date.now()
            });
            
            // Store current invite ID
            this.currentBattleInvite = inviteId;
            this.isWaitingForBattleResponse = true;
            
            // Listen for response
            this.battleInviteListener = db.collection('battleInvites').doc(inviteId)
                .onSnapshot(doc => {
                    if (!doc.exists) {
                        // Invite was deleted (cancelled or expired)
                        this.cancelBattleInvite(true);
                        return;
                    }
                    
                    const data = doc.data();
                    
                    if (data.status === 'accepted') {
                        // Friend accepted! Start the battle
                        this.startFriendBattle(friend, inviteId, true);
                    } else if (data.status === 'declined') {
                        // Friend declined
                        this.hideBattleInviteWaiting();
                        alert(`${friend.username} declined your battle invite`);
                        this.cleanupBattleInvite();
                    }
                });
            
            // Setup navigation protection - cancel invite if player leaves
            this.setupBattleInviteProtection();
            
            // Auto-cancel after 60 seconds
            this.battleInviteTimeout = setTimeout(() => {
                if (this.isWaitingForBattleResponse) {
                    this.cancelBattleInvite();
                    alert('Battle invite expired');
                }
            }, 60000);
            
        } catch (e) {
            console.error('Error sending battle invite:', e);
            this.hideBattleInviteWaiting();
            alert('Failed to send battle invite');
        }
    },
    
    /**
     * Setup protection to cancel invite if player navigates away
     */
    setupBattleInviteProtection() {
        // Store original screen change handler
        this.originalShowScreen = ScreenManager.showScreen.bind(ScreenManager);
        
        // Override showScreen to detect navigation
        ScreenManager.showScreen = (screenName) => {
            if (this.isWaitingForBattleResponse && screenName !== 'game') {
                // Player is trying to navigate away while waiting
                this.cancelBattleInvite();
            }
            this.originalShowScreen(screenName);
        };
        
        // Also handle page unload
        this.battleInviteUnloadHandler = () => {
            if (this.isWaitingForBattleResponse) {
                this.cancelBattleInvite();
            }
        };
        window.addEventListener('beforeunload', this.battleInviteUnloadHandler);
    },
    
    /**
     * Remove battle invite protection
     */
    removeBattleInviteProtection() {
        if (this.originalShowScreen) {
            ScreenManager.showScreen = this.originalShowScreen;
            this.originalShowScreen = null;
        }
        
        if (this.battleInviteUnloadHandler) {
            window.removeEventListener('beforeunload', this.battleInviteUnloadHandler);
            this.battleInviteUnloadHandler = null;
        }
    },
    
    /**
     * Show waiting for battle response modal
     */
    showBattleInviteWaiting(friend) {
        let modal = document.getElementById('battle-invite-waiting-modal');
        
        if (!modal) {
            // Create modal if doesn't exist
            modal = document.createElement('div');
            modal.id = 'battle-invite-waiting-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content battle-invite-content">
                    <h2>⚔️ Battle Invite Sent</h2>
                    <p>Waiting for <span id="invite-friend-name"></span> to respond...</p>
                    <div class="loading-spinner"></div>
                    <p class="invite-warning">⚠️ Don't leave this page or the invite will be cancelled!</p>
                    <button id="cancel-battle-invite" class="btn-secondary">Cancel</button>
                </div>
            `;
            document.body.appendChild(modal);
            
            document.getElementById('cancel-battle-invite').addEventListener('click', () => {
                this.cancelBattleInvite();
            });
        }
        
        document.getElementById('invite-friend-name').textContent = friend.username;
        modal.classList.add('active');
    },
    
    /**
     * Hide waiting modal
     */
    hideBattleInviteWaiting() {
        const modal = document.getElementById('battle-invite-waiting-modal');
        if (modal) modal.classList.remove('active');
    },
    
    /**
     * Cancel battle invite
     */
    async cancelBattleInvite(silent = false) {
        this.hideBattleInviteWaiting();
        this.removeBattleInviteProtection();
        
        if (this.battleInviteTimeout) {
            clearTimeout(this.battleInviteTimeout);
            this.battleInviteTimeout = null;
        }
        
        if (this.battleInviteListener) {
            this.battleInviteListener();
            this.battleInviteListener = null;
        }
        
        // Delete invite from Firebase
        if (this.currentBattleInvite && this.isOnline) {
            try {
                const db = FirebaseConfig.getDb();
                await db.collection('battleInvites').doc(this.currentBattleInvite).delete();
            } catch (e) {
                console.error('Error deleting battle invite:', e);
            }
        }
        
        this.currentBattleInvite = null;
        this.isWaitingForBattleResponse = false;
        
        if (!silent) {
            // Invite was cancelled by user action
        }
    },
    
    /**
     * Cleanup battle invite state
     */
    cleanupBattleInvite() {
        this.hideBattleInviteWaiting();
        this.removeBattleInviteProtection();
        
        if (this.battleInviteTimeout) {
            clearTimeout(this.battleInviteTimeout);
            this.battleInviteTimeout = null;
        }
        
        if (this.battleInviteListener) {
            this.battleInviteListener();
            this.battleInviteListener = null;
        }
        
        this.currentBattleInvite = null;
        this.isWaitingForBattleResponse = false;
    },
    
    /**
     * Listen for incoming battle invites
     */
    setupBattleInviteListener() {
        if (!this.isOnline || !window.currentUser) return;
        
        const db = FirebaseConfig.getDb();
        const userKey = window.currentUser.username.toLowerCase();
        
        // Listen for invites sent to this user
        const unsubInvites = db.collection('battleInvites')
            .where('to', '==', userKey)
            .where('status', '==', 'pending')
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const invite = { id: change.doc.id, ...change.doc.data() };
                        this.showIncomingBattleInvite(invite);
                    } else if (change.type === 'removed') {
                        // Invite was cancelled
                        this.hideIncomingBattleInvite();
                    }
                });
            });
        
        this.unsubscribers.push(unsubInvites);
    },
    
    /**
     * Show incoming battle invite modal
     */
    showIncomingBattleInvite(invite) {
        this.currentIncomingInvite = invite;
        
        let modal = document.getElementById('incoming-battle-invite-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'incoming-battle-invite-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content battle-invite-content">
                    <h2>⚔️ Battle Invite!</h2>
                    <div class="invite-from">
                        <div class="invite-avatar">👤</div>
                        <div class="invite-info">
                            <span class="invite-name" id="incoming-invite-name"></span>
                            <span class="invite-trophies" id="incoming-invite-trophies"></span>
                        </div>
                    </div>
                    <p>wants to battle you!</p>
                    <div class="modal-buttons">
                        <button id="accept-battle-invite" class="btn-primary">⚔️ Accept</button>
                        <button id="decline-battle-invite" class="btn-secondary">Decline</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            document.getElementById('accept-battle-invite').addEventListener('click', () => {
                this.acceptBattleInvite();
            });
            
            document.getElementById('decline-battle-invite').addEventListener('click', () => {
                this.declineBattleInvite();
            });
        }
        
        document.getElementById('incoming-invite-name').textContent = invite.fromUsername;
        document.getElementById('incoming-invite-trophies').textContent = `🏆 ${invite.fromTrophies}`;
        modal.classList.add('active');
        
        // Play sound or vibrate
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    },
    
    /**
     * Hide incoming battle invite modal
     */
    hideIncomingBattleInvite() {
        const modal = document.getElementById('incoming-battle-invite-modal');
        if (modal) modal.classList.remove('active');
        this.currentIncomingInvite = null;
    },
    
    /**
     * Accept incoming battle invite
     */
    async acceptBattleInvite() {
        if (!this.currentIncomingInvite) return;
        
        const invite = this.currentIncomingInvite;
        this.hideIncomingBattleInvite();
        
        try {
            const db = FirebaseConfig.getDb();
            
            // Update invite status to accepted
            await db.collection('battleInvites').doc(invite.id).update({
                status: 'accepted'
            });
            
            // Start battle as player 2
            const friend = {
                id: invite.from,
                username: invite.fromUsername,
                trophies: invite.fromTrophies
            };
            
            this.startFriendBattle(friend, invite.id, false);
            
        } catch (e) {
            console.error('Error accepting battle invite:', e);
            alert('Failed to accept battle invite');
        }
    },
    
    /**
     * Decline incoming battle invite
     */
    async declineBattleInvite() {
        if (!this.currentIncomingInvite) return;
        
        const invite = this.currentIncomingInvite;
        this.hideIncomingBattleInvite();
        
        try {
            const db = FirebaseConfig.getDb();
            
            // Update invite status to declined
            await db.collection('battleInvites').doc(invite.id).update({
                status: 'declined'
            });
            
        } catch (e) {
            console.error('Error declining battle invite:', e);
        }
    },
    
    /**
     * Start friend battle
     */
    startFriendBattle(friend, inviteId, isHost) {
        this.cleanupBattleInvite();
        this.hideIncomingBattleInvite();
        
        console.log(`Starting friend battle with ${friend.username}, isHost: ${isHost}`);
        
        // Store battle info
        window.currentFriendBattle = {
            inviteId: inviteId,
            opponent: friend,
            isHost: isHost
        };
        
        // Update enemy name in game UI
        const enemyNameEl = document.getElementById('enemy-name');
        if (enemyNameEl) enemyNameEl.textContent = friend.username;
        
        // Start the game
        if (window.ScreenManager) {
            ScreenManager.startFriendBattle(friend, isHost);
        }
    },

    /**
     * Accept friend request
     */
    async acceptFriendRequest(requesterId) {
        const request = this.friendRequests.find(r => r.id === requesterId);
        if (!request) return;
        
        // Remove from requests
        this.friendRequests = this.friendRequests.filter(r => r.id !== requesterId);
        
        // Add to friends
        const newFriend = {
            id: request.id,
            username: request.username,
            trophies: request.trophies || 0,
            online: false,
            lastSeen: Date.now()
        };
        this.friends.push(newFriend);
        
        if (this.isOnline) {
            try {
                const db = FirebaseConfig.getDb();
                const userKey = window.currentUser.username.toLowerCase();
                
                // Update own friends list
                await db.collection('friends').doc(userKey).set({
                    friends: this.friends,
                    requests: this.friendRequests
                }, { merge: true });
                
                // Add self to requester's friends list
                const requesterFriendsRef = db.collection('friends').doc(requesterId);
                const requesterDoc = await requesterFriendsRef.get();
                const requesterFriends = requesterDoc.exists ? (requesterDoc.data().friends || []) : [];
                
                requesterFriends.push({
                    id: userKey,
                    username: window.currentUser.username,
                    trophies: window.currentUser.trophies || 0,
                    online: true,
                    lastSeen: Date.now()
                });
                
                await requesterFriendsRef.set({ friends: requesterFriends }, { merge: true });
                
            } catch (e) {
                console.error('Error accepting friend request:', e);
            }
        }
        
        await this.saveFriends();
        this.renderFriendsList();
        this.renderFullFriendsList('requests');
        this.updateRequestBadge();
        
        alert(`You are now friends with ${request.username}!`);
    },

    /**
     * Decline friend request
     */
    async declineFriendRequest(requesterId) {
        this.friendRequests = this.friendRequests.filter(r => r.id !== requesterId);
        
        await this.saveFriends();
        this.renderFullFriendsList('requests');
        this.updateRequestBadge();
    },

    /**
     * Remove friend
     */
    async removeFriend(friendId) {
        if (!confirm('Remove this friend?')) return;
        
        this.friends = this.friends.filter(f => f.id !== friendId);
        delete this.chats[friendId];
        
        if (this.isOnline) {
            try {
                const db = FirebaseConfig.getDb();
                const userKey = window.currentUser.username.toLowerCase();
                
                await db.collection('friends').doc(userKey).set({
                    friends: this.friends
                }, { merge: true });
                
            } catch (e) {
                console.error('Error removing friend:', e);
            }
        }
        
        await this.saveFriends();
        this.renderFriendsList();
        this.renderFullFriendsList('all');
    },

    /**
     * Filter friends by search
     */
    filterFriends(query) {
        const container = document.getElementById('friends-full-list');
        if (!container) return;
        
        const filtered = this.friends.filter(f => 
            f.username.toLowerCase().includes(query.toLowerCase())
        );
        
        // Re-render with filtered list
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-friends" style="padding: 3rem;">
                    <span class="empty-icon">🔍</span>
                    <p>No friends found</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filtered.map(friend => `
            <div class="friend-item-full" data-friend-id="${friend.id}">
                <div class="friend-avatar-full">
                    👤
                    <span class="${friend.online ? 'online-dot' : 'offline-dot'}"></span>
                </div>
                <div class="friend-info-full">
                    <span class="friend-name-full">${friend.username}</span>
                    <div class="friend-details">
                        <span>🏆 ${friend.trophies}</span>
                        <span>${friend.online ? '🟢 Online' : '⚫ Offline'}</span>
                    </div>
                </div>
                <div class="friend-actions-full">
                    <button class="friend-btn-full chat" data-friend-id="${friend.id}">💬 Chat</button>
                    <button class="friend-btn-full battle" data-friend-id="${friend.id}">⚔️ Battle</button>
                </div>
            </div>
        `).join('');
    }
};

// Export
window.FriendsService = FriendsService;
