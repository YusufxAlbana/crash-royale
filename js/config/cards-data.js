/* ============================================
   CARDS DATA
   Definisi semua kartu dalam game
   Kecepatan troop diperlambat untuk gameplay lebih strategis
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
            attackSpeed: 1.2,
            moveSpeed: 35,         // Diperlambat dari 60
            range: 25,
            size: 18,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'all',
            count: 1
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
            moveSpeed: 35,         // Diperlambat dari 60
            range: 120,
            size: 14,
            attackType: 'ranged',
            targetType: 'ground',
            targets: 'all',
            count: 2,
            spawnSpread: 25
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
            moveSpeed: 22,         // Diperlambat dari 40
            range: 25,
            size: 26,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'buildings',
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
            moveSpeed: 32,         // Diperlambat dari 55
            range: 140,
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
            attackSpeed: 1.8,
            moveSpeed: 45,         // Diperlambat dari 75
            range: 25,
            size: 17,
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
            moveSpeed: 32,         // Diperlambat dari 55
            range: 30,
            size: 18,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'all',
            count: 1,
            splashRadius: 45
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
            moveSpeed: 32,         // Diperlambat dari 55
            range: 100,
            size: 14,
            attackType: 'ranged',
            targetType: 'ground',
            targets: 'all',
            count: 1,
            splashRadius: 40
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
            moveSpeed: 42,         // Diperlambat dari 70
            range: 20,
            size: 10,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'all',
            count: 12,
            spawnSpread: 35
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
            moveSpeed: 32,         // Diperlambat dari 55
            range: 120,
            size: 15,
            attackType: 'ranged',
            targetType: 'ground',
            targets: 'all',
            count: 1,
            splashRadius: 45
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
            moveSpeed: 52,         // Diperlambat dari 85
            range: 20,
            size: 12,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'all',
            count: 3,
            spawnSpread: 18
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
            moveSpeed: 32,         // Diperlambat dari 55
            chargeSpeed: 65,       // Diperlambat dari 110
            range: 25,
            size: 22,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'all',
            count: 1,
            chargeDistance: 120,
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
            moveSpeed: 58,         // Diperlambat dari 95
            range: 25,
            size: 20,
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

function getCardById(cardId) {
    return CardsData[cardId] || null;
}

function getAllCards() {
    return Object.values(CardsData);
}

function getCardsByRarity(rarity) {
    return Object.values(CardsData).filter(card => card.rarity === rarity);
}

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
