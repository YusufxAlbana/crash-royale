/* ============================================
   CARDS DATA
   Definisi semua kartu dalam game
   ============================================ */

const CardsData = {
    // ========================================
    // TROOP CARDS
    // ========================================
    
    // KNIGHT - Melee tank dengan HP sedang
    knight: {
        id: 'knight',
        name: 'Knight',
        type: 'troop',
        rarity: 'common',
        elixirCost: 3,
        icon: '🗡️',
        description: 'A tough melee fighter with good HP and damage.',
        stats: {
            hp: 660,
            damage: 75,
            attackSpeed: 1.2,      // Hits per second
            moveSpeed: 60,         // Pixels per second
            range: 25,             // Melee range
            size: 18,              // Collision radius
            attackType: 'melee',
            targetType: 'ground',  // Can only target ground
            targets: 'all',        // Targets troops and buildings
            count: 1               // Spawn count
        }
    },

    // ARCHER - Ranged DPS
    archer: {
        id: 'archer',
        name: 'Archer',
        type: 'troop',
        rarity: 'common',
        elixirCost: 3,
        icon: '🏹',
        description: 'Ranged attacker that deals consistent damage from distance.',
        stats: {
            hp: 125,
            damage: 42,
            attackSpeed: 1.2,
            moveSpeed: 60,
            range: 100,            // Ranged
            size: 14,
            attackType: 'ranged',
            targetType: 'ground',
            targets: 'all',
            count: 2,              // Spawns 2 archers
            spawnSpread: 20        // Jarak antar spawn
        }
    },

    // GIANT - High HP tank, hanya menyerang building
    giant: {
        id: 'giant',
        name: 'Giant',
        type: 'troop',
        rarity: 'rare',
        elixirCost: 5,
        icon: '👹',
        description: 'Slow but powerful tank that only targets buildings.',
        stats: {
            hp: 2000,
            damage: 126,
            attackSpeed: 1.5,
            moveSpeed: 40,         // Slow
            range: 25,
            size: 24,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'buildings',  // Only targets buildings
            count: 1
        }
    },

    // MUSKETEER - High damage ranged
    musketeer: {
        id: 'musketeer',
        name: 'Musketeer',
        type: 'troop',
        rarity: 'rare',
        elixirCost: 4,
        icon: '🔫',
        description: 'Long range shooter with high damage per shot.',
        stats: {
            hp: 340,
            damage: 100,
            attackSpeed: 1.1,
            moveSpeed: 55,
            range: 120,
            size: 15,
            attackType: 'ranged',
            targetType: 'ground',
            targets: 'all',
            count: 1
        }
    },

    // MINI PEKKA - High damage melee
    miniPekka: {
        id: 'miniPekka',
        name: 'Mini P.E.K.K.A',
        type: 'troop',
        rarity: 'rare',
        elixirCost: 4,
        icon: '🤖',
        description: 'Fast and deadly robot that deals massive damage.',
        stats: {
            hp: 600,
            damage: 325,
            attackSpeed: 1.8,      // Slow attack
            moveSpeed: 75,         // Fast
            range: 25,
            size: 16,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'all',
            count: 1
        }
    },

    // VALKYRIE - Area damage melee
    valkyrie: {
        id: 'valkyrie',
        name: 'Valkyrie',
        type: 'troop',
        rarity: 'rare',
        elixirCost: 4,
        icon: '⚔️',
        description: 'Spins and deals area damage to all nearby enemies.',
        stats: {
            hp: 880,
            damage: 120,
            attackSpeed: 1.5,
            moveSpeed: 55,
            range: 30,
            size: 18,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'all',
            count: 1,
            splashRadius: 40       // Area damage
        }
    },

    // BOMBER - Ranged splash damage
    bomber: {
        id: 'bomber',
        name: 'Bomber',
        type: 'troop',
        rarity: 'common',
        elixirCost: 2,
        icon: '💣',
        description: 'Throws bombs that deal area damage.',
        stats: {
            hp: 150,
            damage: 128,
            attackSpeed: 1.9,
            moveSpeed: 55,
            range: 80,
            size: 14,
            attackType: 'ranged',
            targetType: 'ground',
            targets: 'all',
            count: 1,
            splashRadius: 35
        }
    },

    // SKELETON ARMY - Swarm unit
    skeletonArmy: {
        id: 'skeletonArmy',
        name: 'Skeleton Army',
        type: 'troop',
        rarity: 'epic',
        elixirCost: 3,
        icon: '💀',
        description: 'Summons a horde of skeletons to overwhelm enemies.',
        stats: {
            hp: 32,
            damage: 32,
            attackSpeed: 1.0,
            moveSpeed: 70,
            range: 20,
            size: 10,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'all',
            count: 12,             // Banyak skeleton
            spawnSpread: 30
        }
    },

    // WIZARD - Ranged splash magic
    wizard: {
        id: 'wizard',
        name: 'Wizard',
        type: 'troop',
        rarity: 'rare',
        elixirCost: 5,
        icon: '🧙',
        description: 'Powerful mage that shoots fireballs dealing splash damage.',
        stats: {
            hp: 340,
            damage: 130,
            attackSpeed: 1.4,
            moveSpeed: 55,
            range: 100,
            size: 15,
            attackType: 'ranged',
            targetType: 'ground',
            targets: 'all',
            count: 1,
            splashRadius: 40
        }
    },

    // GOBLIN - Fast cheap unit
    goblin: {
        id: 'goblin',
        name: 'Goblins',
        type: 'troop',
        rarity: 'common',
        elixirCost: 2,
        icon: '👺',
        description: 'Fast and cheap melee attackers.',
        stats: {
            hp: 80,
            damage: 50,
            attackSpeed: 1.1,
            moveSpeed: 85,         // Very fast
            range: 20,
            size: 12,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'all',
            count: 3,
            spawnSpread: 15
        }
    },

    // PRINCE - Charge attack
    prince: {
        id: 'prince',
        name: 'Prince',
        type: 'troop',
        rarity: 'epic',
        elixirCost: 5,
        icon: '🐴',
        description: 'Charges at enemies dealing double damage on impact.',
        stats: {
            hp: 1000,
            damage: 245,
            attackSpeed: 1.5,
            moveSpeed: 55,
            chargeSpeed: 110,      // Speed saat charge
            range: 25,
            size: 20,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'all',
            count: 1,
            chargeDistance: 100,   // Jarak untuk mulai charge
            chargeDamageMultiplier: 2
        }
    },

    // HOG RIDER - Fast building targeter
    hogRider: {
        id: 'hogRider',
        name: 'Hog Rider',
        type: 'troop',
        rarity: 'rare',
        elixirCost: 4,
        icon: '🐗',
        description: 'Fast troop that jumps the river and targets buildings.',
        stats: {
            hp: 800,
            damage: 150,
            attackSpeed: 1.6,
            moveSpeed: 95,         // Very fast
            range: 25,
            size: 18,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'buildings',
            count: 1,
            canJumpRiver: true
        }
    }
};

// ========================================
// DEFAULT DECK
// ========================================
const DefaultDeck = [
    'knight',
    'archer',
    'giant',
    'musketeer',
    'miniPekka',
    'valkyrie',
    'bomber',
    'goblin'
];

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get card data by ID
 */
function getCardById(cardId) {
    return CardsData[cardId] || null;
}

/**
 * Get all cards as array
 */
function getAllCards() {
    return Object.values(CardsData);
}

/**
 * Get cards by rarity
 */
function getCardsByRarity(rarity) {
    return Object.values(CardsData).filter(card => card.rarity === rarity);
}

/**
 * Calculate average elixir cost of a deck
 */
function calculateAverageElixir(deckIds) {
    if (!deckIds || deckIds.length === 0) return 0;
    const total = deckIds.reduce((sum, id) => {
        const card = getCardById(id);
        return sum + (card ? card.elixirCost : 0);
    }, 0);
    return (total / deckIds.length).toFixed(1);
}

// Export
window.CardsData = CardsData;
window.DefaultDeck = DefaultDeck;
window.getCardById = getCardById;
window.getAllCards = getAllCards;
window.getCardsByRarity = getCardsByRarity;
window.calculateAverageElixir = calculateAverageElixir;
