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
            damage: 50,            // Dikurangi dari 75
            attackSpeed: 1.5,      // Diperlambat dari 1.2
            moveSpeed: 35,
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
            damage: 28,            // Dikurangi dari 42
            attackSpeed: 1.5,      // Diperlambat dari 1.2
            moveSpeed: 35,
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
            damage: 80,            // Dikurangi dari 126
            attackSpeed: 1.8,      // Diperlambat dari 1.5
            moveSpeed: 22,
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
            damage: 65,            // Dikurangi dari 100
            attackSpeed: 1.4,      // Diperlambat dari 1.1
            moveSpeed: 32,
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
            damage: 200,           // Dikurangi dari 325
            attackSpeed: 2.0,      // Diperlambat dari 1.8
            moveSpeed: 45,
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
            damage: 75,            // Dikurangi dari 120
            attackSpeed: 1.8,      // Diperlambat dari 1.5
            moveSpeed: 32,
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
            damage: 80,            // Dikurangi dari 128
            attackSpeed: 2.2,      // Diperlambat dari 1.9
            moveSpeed: 32,
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
            damage: 20,            // Dikurangi dari 32
            attackSpeed: 1.2,      // Diperlambat dari 1.0
            moveSpeed: 42,
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
            damage: 85,            // Dikurangi dari 130
            attackSpeed: 1.7,      // Diperlambat dari 1.4
            moveSpeed: 32,
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
            damage: 32,            // Dikurangi dari 50
            attackSpeed: 1.3,      // Diperlambat dari 1.1
            moveSpeed: 52,
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
            damage: 160,           // Dikurangi dari 245
            attackSpeed: 1.8,      // Diperlambat dari 1.5
            moveSpeed: 32,
            chargeSpeed: 65,
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
            damage: 100,
            attackSpeed: 1.8,
            moveSpeed: 58,
            range: 25,
            size: 20,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'buildings',
            count: 1,
            canJumpRiver: true
        }
    },

    // ========================================
    // MORE TROOPS
    // ========================================

    // BABY DRAGON - Flying splash
    babyDragon: {
        id: 'babyDragon',
        name: 'Baby Dragon',
        type: 'troop',
        rarity: 'epic',
        elixirCost: 4,
        icon: '🐉',
        description: 'Flying unit that deals splash damage with fire breath.',
        stats: {
            hp: 800,
            damage: 75,
            attackSpeed: 1.8,
            moveSpeed: 35,
            range: 100,
            size: 18,
            attackType: 'ranged',
            targetType: 'air',
            targets: 'all',
            count: 1,
            splashRadius: 40,
            isFlying: true
        }
    },

    // WITCH - Spawns skeletons
    witch: {
        id: 'witch',
        name: 'Witch',
        type: 'troop',
        rarity: 'epic',
        elixirCost: 5,
        icon: '🧹',
        description: 'Summons skeletons and deals splash damage.',
        stats: {
            hp: 440,
            damage: 55,
            attackSpeed: 1.0,
            moveSpeed: 28,
            range: 120,
            size: 16,
            attackType: 'ranged',
            targetType: 'ground',
            targets: 'all',
            count: 1,
            splashRadius: 35,
            spawnsUnit: 'skeleton',
            spawnCount: 3,
            spawnInterval: 7
        }
    },

    // PEKKA - Heavy tank
    pekka: {
        id: 'pekka',
        name: 'P.E.K.K.A',
        type: 'troop',
        rarity: 'epic',
        elixirCost: 7,
        icon: '🦾',
        description: 'Slow but extremely powerful armored robot.',
        stats: {
            hp: 2900,
            damage: 380,
            attackSpeed: 2.0,
            moveSpeed: 22,
            range: 25,
            size: 28,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'all',
            count: 1
        }
    },

    // MINIONS - Flying swarm
    minions: {
        id: 'minions',
        name: 'Minions',
        type: 'troop',
        rarity: 'common',
        elixirCost: 3,
        icon: '👿',
        description: 'Three fast flying attackers.',
        stats: {
            hp: 90,
            damage: 40,
            attackSpeed: 1.2,
            moveSpeed: 50,
            range: 60,
            size: 12,
            attackType: 'ranged',
            targetType: 'air',
            targets: 'all',
            count: 3,
            spawnSpread: 20,
            isFlying: true
        }
    },

    // MINION HORDE - More minions
    minionHorde: {
        id: 'minionHorde',
        name: 'Minion Horde',
        type: 'troop',
        rarity: 'common',
        elixirCost: 5,
        icon: '😈',
        description: 'Six flying attackers that swarm enemies.',
        stats: {
            hp: 90,
            damage: 40,
            attackSpeed: 1.2,
            moveSpeed: 50,
            range: 60,
            size: 12,
            attackType: 'ranged',
            targetType: 'air',
            targets: 'all',
            count: 6,
            spawnSpread: 30,
            isFlying: true
        }
    },

    // BALLOON - Flying building targeter
    balloon: {
        id: 'balloon',
        name: 'Balloon',
        type: 'troop',
        rarity: 'epic',
        elixirCost: 5,
        icon: '🎈',
        description: 'Flying unit that drops bombs on buildings.',
        stats: {
            hp: 1050,
            damage: 200,
            attackSpeed: 3.0,
            moveSpeed: 28,
            range: 30,
            size: 22,
            attackType: 'ranged',
            targetType: 'air',
            targets: 'buildings',
            count: 1,
            splashRadius: 35,
            isFlying: true,
            deathDamage: 100,
            deathRadius: 50
        }
    },

    // BARBARIANS - Tanky swarm
    barbarians: {
        id: 'barbarians',
        name: 'Barbarians',
        type: 'troop',
        rarity: 'common',
        elixirCost: 5,
        icon: '🪓',
        description: 'Four angry barbarians with axes.',
        stats: {
            hp: 300,
            damage: 55,
            attackSpeed: 1.5,
            moveSpeed: 32,
            range: 20,
            size: 16,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'all',
            count: 4,
            spawnSpread: 25
        }
    },

    // GOLEM - Super tank that splits
    golem: {
        id: 'golem',
        name: 'Golem',
        type: 'troop',
        rarity: 'legendary',
        elixirCost: 8,
        icon: '🗿',
        description: 'Massive tank that splits into Golemites on death.',
        stats: {
            hp: 4250,
            damage: 120,
            attackSpeed: 2.5,
            moveSpeed: 18,
            range: 25,
            size: 32,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'buildings',
            count: 1,
            deathDamage: 150,
            deathRadius: 50,
            spawnsOnDeath: 'golemite',
            spawnOnDeathCount: 2
        }
    },

    // ELECTRO WIZARD - Stun attack
    electroWizard: {
        id: 'electroWizard',
        name: 'Electro Wizard',
        type: 'troop',
        rarity: 'legendary',
        elixirCost: 4,
        icon: '⚡',
        description: 'Zaps enemies with electricity, stunning them briefly.',
        stats: {
            hp: 500,
            damage: 80,
            attackSpeed: 1.8,
            moveSpeed: 32,
            range: 110,
            size: 15,
            attackType: 'ranged',
            targetType: 'ground',
            targets: 'all',
            count: 1,
            stunDuration: 0.5,
            hitsTwoTargets: true,
            spawnDamage: 100,
            spawnRadius: 50
        }
    },

    // LUMBERJACK - Fast rage dropper
    lumberjack: {
        id: 'lumberjack',
        name: 'Lumberjack',
        type: 'troop',
        rarity: 'legendary',
        elixirCost: 4,
        icon: '🪵',
        description: 'Fast melee attacker that drops Rage on death.',
        stats: {
            hp: 700,
            damage: 120,
            attackSpeed: 0.8,
            moveSpeed: 55,
            range: 20,
            size: 16,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'all',
            count: 1,
            dropsRageOnDeath: true
        }
    },

    // MEGA KNIGHT - Jump attack
    megaKnight: {
        id: 'megaKnight',
        name: 'Mega Knight',
        type: 'troop',
        rarity: 'legendary',
        elixirCost: 7,
        icon: '👑',
        description: 'Jumps on enemies dealing splash damage on landing.',
        stats: {
            hp: 3300,
            damage: 160,
            attackSpeed: 1.8,
            moveSpeed: 28,
            range: 25,
            size: 28,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'all',
            count: 1,
            splashRadius: 50,
            jumpDamage: 350,
            jumpRadius: 60,
            spawnDamage: 350,
            spawnRadius: 60
        }
    },

    // SPARKY - Slow but devastating
    sparky: {
        id: 'sparky',
        name: 'Sparky',
        type: 'troop',
        rarity: 'legendary',
        elixirCost: 6,
        icon: '🔋',
        description: 'Charges up and releases devastating electric blast.',
        stats: {
            hp: 1200,
            damage: 650,
            attackSpeed: 5.0,
            moveSpeed: 22,
            range: 100,
            size: 22,
            attackType: 'ranged',
            targetType: 'ground',
            targets: 'all',
            count: 1,
            splashRadius: 50
        }
    },

    // ROYAL GIANT - Long range building attacker
    royalGiant: {
        id: 'royalGiant',
        name: 'Royal Giant',
        type: 'troop',
        rarity: 'common',
        elixirCost: 6,
        icon: '🏰',
        description: 'Long range giant that targets buildings.',
        stats: {
            hp: 2000,
            damage: 85,
            attackSpeed: 1.7,
            moveSpeed: 22,
            range: 150,
            size: 26,
            attackType: 'ranged',
            targetType: 'ground',
            targets: 'buildings',
            count: 1
        }
    },

    // DARK PRINCE - Shield + splash
    darkPrince: {
        id: 'darkPrince',
        name: 'Dark Prince',
        type: 'troop',
        rarity: 'epic',
        elixirCost: 4,
        icon: '🛡️',
        description: 'Charges with shield, deals splash damage.',
        stats: {
            hp: 700,
            shieldHp: 200,
            damage: 100,
            attackSpeed: 1.5,
            moveSpeed: 32,
            chargeSpeed: 60,
            range: 25,
            size: 20,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'all',
            count: 1,
            splashRadius: 40,
            chargeDistance: 100,
            chargeDamageMultiplier: 2
        }
    },

    // GUARDS - Shielded skeletons
    guards: {
        id: 'guards',
        name: 'Guards',
        type: 'troop',
        rarity: 'epic',
        elixirCost: 3,
        icon: '⚔️',
        description: 'Three skeleton guards with shields.',
        stats: {
            hp: 65,
            shieldHp: 150,
            damage: 45,
            attackSpeed: 1.2,
            moveSpeed: 38,
            range: 20,
            size: 12,
            attackType: 'melee',
            targetType: 'ground',
            targets: 'all',
            count: 3,
            spawnSpread: 20
        }
    },

    // ========================================
    // SPELL CARDS
    // ========================================

    // FIREBALL - Area damage spell
    fireball: {
        id: 'fireball',
        name: 'Fireball',
        type: 'spell',
        rarity: 'rare',
        elixirCost: 4,
        icon: '🔥',
        description: 'Deals area damage where it lands.',
        stats: {
            damage: 325,
            radius: 70,
            towerDamage: 110
        }
    },

    // ARROWS - Wide area spell
    arrows: {
        id: 'arrows',
        name: 'Arrows',
        type: 'spell',
        rarity: 'common',
        elixirCost: 3,
        icon: '🏹',
        description: 'Arrows rain down on a large area.',
        stats: {
            damage: 115,
            radius: 100,
            towerDamage: 40
        }
    },

    // ZAP - Instant stun spell
    zap: {
        id: 'zap',
        name: 'Zap',
        type: 'spell',
        rarity: 'common',
        elixirCost: 2,
        icon: '⚡',
        description: 'Instant damage and stun to all enemies in area.',
        stats: {
            damage: 75,
            radius: 70,
            towerDamage: 25,
            stunDuration: 0.5
        }
    },

    // ROCKET - High damage small area
    rocket: {
        id: 'rocket',
        name: 'Rocket',
        type: 'spell',
        rarity: 'rare',
        elixirCost: 6,
        icon: '🚀',
        description: 'Massive damage to a small area.',
        stats: {
            damage: 700,
            radius: 50,
            towerDamage: 240
        }
    },

    // LIGHTNING - Hits 3 targets
    lightning: {
        id: 'lightning',
        name: 'Lightning',
        type: 'spell',
        rarity: 'epic',
        elixirCost: 6,
        icon: '🌩️',
        description: 'Strikes the 3 enemies with most HP in area.',
        stats: {
            damage: 450,
            radius: 100,
            towerDamage: 150,
            maxTargets: 3,
            stunDuration: 0.5
        }
    },

    // FREEZE - Freezes enemies
    freeze: {
        id: 'freeze',
        name: 'Freeze',
        type: 'spell',
        rarity: 'epic',
        elixirCost: 4,
        icon: '❄️',
        description: 'Freezes all enemies in area.',
        stats: {
            damage: 70,
            radius: 80,
            freezeDuration: 4.0
        }
    },

    // POISON - Damage over time
    poison: {
        id: 'poison',
        name: 'Poison',
        type: 'spell',
        rarity: 'epic',
        elixirCost: 4,
        icon: '☠️',
        description: 'Creates poison cloud dealing damage over time.',
        stats: {
            damagePerSecond: 50,
            duration: 8,
            radius: 80,
            slowPercent: 15
        }
    },

    // RAGE - Speed boost
    rage: {
        id: 'rage',
        name: 'Rage',
        type: 'spell',
        rarity: 'epic',
        elixirCost: 2,
        icon: '😤',
        description: 'Boosts movement and attack speed of troops.',
        stats: {
            duration: 6,
            radius: 100,
            speedBoost: 35,
            attackSpeedBoost: 35
        }
    },

    // TORNADO - Pulls enemies
    tornado: {
        id: 'tornado',
        name: 'Tornado',
        type: 'spell',
        rarity: 'epic',
        elixirCost: 3,
        icon: '🌪️',
        description: 'Pulls enemies to center while dealing damage.',
        stats: {
            damagePerSecond: 35,
            duration: 2,
            radius: 90,
            pullStrength: 100
        }
    },

    // LOG - Rolling log
    log: {
        id: 'log',
        name: 'The Log',
        type: 'spell',
        rarity: 'legendary',
        elixirCost: 2,
        icon: '🪵',
        description: 'Rolling log that pushes back ground troops.',
        stats: {
            damage: 180,
            width: 80,
            range: 400,
            towerDamage: 60,
            knockback: true
        }
    },

    // ========================================
    // BUILDING CARDS
    // ========================================

    // CANNON - Defensive building
    cannon: {
        id: 'cannon',
        name: 'Cannon',
        type: 'building',
        rarity: 'common',
        elixirCost: 3,
        icon: '🔫',
        description: 'Defensive building that shoots cannonballs.',
        stats: {
            hp: 450,
            damage: 80,
            attackSpeed: 1.0,
            range: 120,
            lifetime: 30,
            size: 24,
            targetType: 'ground',
            targets: 'all'
        }
    },

    // TESLA - Hidden defense
    tesla: {
        id: 'tesla',
        name: 'Tesla',
        type: 'building',
        rarity: 'common',
        elixirCost: 4,
        icon: '⚡',
        description: 'Hidden defense that pops up to attack.',
        stats: {
            hp: 450,
            damage: 90,
            attackSpeed: 1.1,
            range: 110,
            lifetime: 35,
            size: 22,
            targetType: 'ground',
            targets: 'all',
            isHidden: true
        }
    },

    // INFERNO TOWER - Increasing damage
    infernoTower: {
        id: 'infernoTower',
        name: 'Inferno Tower',
        type: 'building',
        rarity: 'rare',
        elixirCost: 5,
        icon: '🔥',
        description: 'Damage increases over time on same target.',
        stats: {
            hp: 800,
            damageMin: 20,
            damageMax: 400,
            attackSpeed: 0.4,
            range: 120,
            lifetime: 40,
            size: 24,
            targetType: 'ground',
            targets: 'all',
            rampUpTime: 4
        }
    },

    // BOMB TOWER - Splash defense
    bombTower: {
        id: 'bombTower',
        name: 'Bomb Tower',
        type: 'building',
        rarity: 'rare',
        elixirCost: 4,
        icon: '💣',
        description: 'Throws bombs dealing splash damage.',
        stats: {
            hp: 700,
            damage: 100,
            attackSpeed: 1.6,
            range: 100,
            lifetime: 35,
            size: 24,
            targetType: 'ground',
            targets: 'all',
            splashRadius: 45,
            deathDamage: 100,
            deathRadius: 50
        }
    },

    // GOBLIN HUT - Spawns goblins
    goblinHut: {
        id: 'goblinHut',
        name: 'Goblin Hut',
        type: 'building',
        rarity: 'rare',
        elixirCost: 5,
        icon: '🏠',
        description: 'Spawns Spear Goblins over time.',
        stats: {
            hp: 500,
            lifetime: 40,
            size: 26,
            spawnsUnit: 'spearGoblin',
            spawnInterval: 5,
            spawnCount: 1
        }
    },

    // TOMBSTONE - Spawns skeletons
    tombstone: {
        id: 'tombstone',
        name: 'Tombstone',
        type: 'building',
        rarity: 'rare',
        elixirCost: 3,
        icon: '🪦',
        description: 'Spawns Skeletons, releases more on death.',
        stats: {
            hp: 250,
            lifetime: 40,
            size: 22,
            spawnsUnit: 'skeleton',
            spawnInterval: 3,
            spawnCount: 1,
            deathSpawnCount: 4
        }
    },

    // XBOW - Long range siege
    xbow: {
        id: 'xbow',
        name: 'X-Bow',
        type: 'building',
        rarity: 'epic',
        elixirCost: 6,
        icon: '🏹',
        description: 'Long range siege weapon that targets buildings.',
        stats: {
            hp: 850,
            damage: 25,
            attackSpeed: 0.3,
            range: 350,
            lifetime: 40,
            size: 26,
            targetType: 'ground',
            targets: 'all',
            deployTime: 3.5
        }
    },

    // MORTAR - Very long range splash
    mortar: {
        id: 'mortar',
        name: 'Mortar',
        type: 'building',
        rarity: 'common',
        elixirCost: 4,
        icon: '💥',
        description: 'Long range splash damage, has blind spot.',
        stats: {
            hp: 600,
            damage: 90,
            attackSpeed: 5.0,
            range: 350,
            minRange: 80,
            lifetime: 30,
            size: 24,
            targetType: 'ground',
            targets: 'all',
            splashRadius: 50
        }
    },

    // ELIXIR COLLECTOR - Generates elixir
    elixirCollector: {
        id: 'elixirCollector',
        name: 'Elixir Collector',
        type: 'building',
        rarity: 'rare',
        elixirCost: 6,
        icon: '💧',
        description: 'Generates Elixir over time.',
        stats: {
            hp: 500,
            lifetime: 70,
            size: 24,
            elixirGenerated: 8,
            elixirInterval: 8.5
        }
    }
};

// ========================================
// DEFAULT DECK
// ========================================
const DefaultDeck = [
    'knight',
    'archer',
    'fireball',
    'musketeer',
    'miniPekka',
    'zap',
    'hogRider',
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
