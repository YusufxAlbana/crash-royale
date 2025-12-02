/* ============================================
   FRIENDS SERVICE
   Handles friend list, requests, and chat
   ============================================ */

const FriendsService = {
    friends: [],
    friendRequests: [],
    chats: {},
    currentChatFriend: null,

    /**
     * Initialize friends service
     */
    init() {
        this.loadFriends();
        this.setupEventListeners();
        this.generateFriendCode();
        this.renderFriendsList();
        this.renderChatList();
    },

    /**
     * Generate unique friend code
     */
    generateFriendCode() {
        const user = window.currentUser;
        if (!user) return;
        
        // Generate code from username
        const code = '#' + user.username.substring(0, 3).toUpperCase() + 
                     Math.random().toString(36).substring(2, 5).toUpperCase();
        
        const codeEl = document.getElementById('my-friend-code');
        if (codeEl) codeEl.textContent = code;
        
        return code;
    },

    /**
     * Load friends from storage
     */
    loadFriends() {
        const saved = localStorage.getItem('battle_arena_friends');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.friends = data.friends || [];
                this.friendRequests = data.requests || [];
                this.chats = data.chats || {};
            } catch (e) {
                console.error('Error loading friends:', e);
            }
        }
        
        // Add some demo friends if empty
        if (this.friends.length === 0) {
            this.friends = [
                { id: 'demo1', username: 'ProGamer', trophies: 2500, online: true, lastSeen: Date.now() },
                { id: 'demo2', username: 'BattleKing', trophies: 1800, online: false, lastSeen: Date.now() - 3600000 },
                { id: 'demo3', username: 'ArenaChamp', trophies: 3200, online: true, lastSeen: Date.now() }
            ];
            this.saveFriends();
        }
    },

    /**
     * Save friends to storage
     */
    saveFriends() {
        localStorage.setItem('battle_arena_friends', JSON.stringify({
            friends: this.friends,
            requests: this.friendRequests,
            chats: this.chats
        }));
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
        
        document.getElementById('confirm-add-friend')?.addEventListener('click', () => {
            this.sendFriendRequest();
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
     * Send friend request
     */
    sendFriendRequest() {
        const input = document.getElementById('add-friend-input');
        const errorEl = document.getElementById('add-friend-error');
        const value = input?.value.trim();
        
        if (!value) {
            errorEl.textContent = 'Please enter a username or friend code';
            return;
        }
        
        // Check if already friends
        if (this.friends.some(f => f.username.toLowerCase() === value.toLowerCase())) {
            errorEl.textContent = 'Already friends with this player';
            return;
        }
        
        // Simulate sending request
        const newFriend = {
            id: 'friend_' + Date.now(),
            username: value.replace('#', ''),
            trophies: Math.floor(Math.random() * 3000),
            online: Math.random() > 0.5,
            lastSeen: Date.now()
        };
        
        this.friends.push(newFriend);
        this.saveFriends();
        this.renderFriendsList();
        this.hideAddFriendModal();
        
        alert(`Friend request sent to ${newFriend.username}!`);
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
    sendMessage() {
        const input = document.getElementById('chat-input');
        const text = input?.value.trim();
        
        if (!text || !this.currentChatFriend) return;
        
        const friendId = this.currentChatFriend.id;
        
        if (!this.chats[friendId]) {
            this.chats[friendId] = { messages: [], unread: 0 };
        }
        
        // Add message
        this.chats[friendId].messages.push({
            text,
            sent: true,
            timestamp: Date.now()
        });
        
        // Clear input
        input.value = '';
        
        // Save and render
        this.saveFriends();
        this.renderMessages(friendId);
        this.renderChatList();
        
        // Simulate reply after delay
        if (this.currentChatFriend.online) {
            setTimeout(() => {
                this.receiveMessage(friendId);
            }, 1000 + Math.random() * 2000);
        }
    },

    /**
     * Simulate receiving message
     */
    receiveMessage(friendId) {
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
        
        this.chats[friendId].messages.push({
            text: reply,
            sent: false,
            timestamp: Date.now()
        });
        
        this.saveFriends();
        
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
     * Battle friend
     */
    battleFriend(friend) {
        if (!friend.online) {
            alert(`${friend.username} is offline`);
            return;
        }
        
        // Send battle invite in chat
        if (!this.chats[friend.id]) {
            this.chats[friend.id] = { messages: [], unread: 0 };
        }
        
        alert(`Battle invite sent to ${friend.username}!\n\n(Friend battles coming soon)`);
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
