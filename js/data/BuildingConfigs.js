/**
 * BuildingConfigs - 건물 설정 데이터
 */

export const BUILDING_CONFIGS = {
    // 테라 연합 건물
    terra: {
        command_center: {
            name: '사령부',
            icon: '🏛️',
            type: 'command',
            size: 80,
            health: 1500,
            armor: 2,
            cost: { crystal: 0, energy: 0 },
            buildTime: 0,
            isStarting: true,
            canProduce: true,
            units: ['worker'],
            visionRange: 350
        },
        collector: {
            name: '수집기',
            icon: '⛏️',
            type: 'resource',
            size: 48,
            health: 400,
            armor: 0,
            cost: { crystal: 75, energy: 0 },
            buildTime: 20,
            isCollector: true,
            gatherRate: 3,
            visionRange: 200
        },
        power_plant: {
            name: '발전소',
            icon: '⚡',
            type: 'resource',
            size: 56,
            health: 500,
            armor: 0,
            cost: { crystal: 100, energy: 0 },
            buildTime: 25,
            isGenerator: true,
            energyRate: 2,
            visionRange: 200
        },
        barracks: {
            name: '병영',
            icon: '🎖️',
            type: 'production',
            size: 64,
            health: 800,
            armor: 1,
            cost: { crystal: 150, energy: 50 },
            buildTime: 30,
            canProduce: true,
            units: ['marine', 'medic', 'scout'],
            visionRange: 250
        },
        factory: {
            name: '공장',
            icon: '🏭',
            type: 'production',
            size: 72,
            health: 1000,
            armor: 2,
            cost: { crystal: 200, energy: 100 },
            buildTime: 45,
            canProduce: true,
            units: ['tank'],
            visionRange: 250
        },
        turret: {
            name: '방어포탑',
            icon: '🗼',
            type: 'defense',
            size: 40,
            health: 500,
            armor: 1,
            cost: { crystal: 100, energy: 25 },
            buildTime: 20,
            canAttack: true,
            damage: 20,
            range: 250,
            attackSpeed: 1.5,
            visionRange: 300
        },
        supply_depot: {
            name: '보급소',
            icon: '📦',
            type: 'supply',
            size: 48,
            health: 350,
            armor: 0,
            cost: { crystal: 100, energy: 0 },
            buildTime: 25,
            providesSupply: 5,
            visionRange: 150
        }
    },

    // 크리온 건물
    kryon: {
        nexus: {
            name: '넥서스',
            icon: '💠',
            type: 'command',
            size: 80,
            health: 1200,
            shield: 500,
            shieldRegenRate: 3,
            armor: 1,
            cost: { crystal: 0, energy: 0 },
            buildTime: 0,
            isStarting: true,
            canProduce: true,
            units: ['probe'],
            visionRange: 350
        },
        extractor: {
            name: '추출기',
            icon: '🔮',
            type: 'resource',
            size: 44,
            health: 300,
            shield: 100,
            shieldRegenRate: 2,
            armor: 0,
            cost: { crystal: 60, energy: 0 },
            buildTime: 18,
            isCollector: true,
            gatherRate: 4,
            visionRange: 200
        },
        pylon: {
            name: '수정탑',
            icon: '🔷',
            type: 'supply',
            size: 40,
            health: 300,
            shield: 200,
            shieldRegenRate: 2,
            armor: 0,
            cost: { crystal: 80, energy: 0 },
            buildTime: 15,
            isGenerator: true,
            energyRate: 1.5,
            providesSupply: 5,
            visionRange: 200
        },
        gateway: {
            name: '관문',
            icon: '🌀',
            type: 'production',
            size: 64,
            health: 600,
            shield: 300,
            shieldRegenRate: 2,
            armor: 1,
            cost: { crystal: 150, energy: 50 },
            buildTime: 35,
            canProduce: true,
            units: ['zealot', 'stalker', 'ranger'],
            visionRange: 250
        },
        photon_cannon: {
            name: '광자포',
            icon: '💫',
            type: 'defense',
            size: 40,
            health: 300,
            shield: 200,
            shieldRegenRate: 2,
            armor: 0,
            cost: { crystal: 100, energy: 25 },
            buildTime: 20,
            canAttack: true,
            damage: 25,
            range: 280,
            attackSpeed: 1.2,
            visionRange: 300
        }
    },

    // 메카니쿠스 건물
    mechanicus: {
        core: {
            name: '중앙 코어',
            icon: '⚙️',
            type: 'command',
            size: 88,
            health: 2000,
            armor: 4,
            cost: { crystal: 0, energy: 0 },
            buildTime: 0,
            isStarting: true,
            canProduce: true,
            units: ['drone'],
            visionRange: 350
        },
        harvester: {
            name: '수확기',
            icon: '🔩',
            type: 'resource',
            size: 52,
            health: 500,
            armor: 1,
            cost: { crystal: 90, energy: 0 },
            buildTime: 25,
            isCollector: true,
            gatherRate: 2.5,
            visionRange: 200
        },
        reactor: {
            name: '원자로',
            icon: '☢️',
            type: 'resource',
            size: 60,
            health: 600,
            armor: 1,
            cost: { crystal: 125, energy: 0 },
            buildTime: 35,
            isGenerator: true,
            energyRate: 4,
            visionRange: 200
        },
        foundry: {
            name: '주조소',
            icon: '🔨',
            type: 'production',
            size: 72,
            health: 1200,
            armor: 3,
            cost: { crystal: 175, energy: 75 },
            buildTime: 50,
            canProduce: true,
            units: ['sentinel', 'crusher', 'flak'],
            visionRange: 250
        },
        bunker: {
            name: '벙커',
            icon: '🏰',
            type: 'defense',
            size: 48,
            health: 800,
            armor: 3,
            cost: { crystal: 125, energy: 25 },
            buildTime: 25,
            canAttack: true,
            damage: 30,
            range: 220,
            attackSpeed: 0.8,
            visionRange: 300
        },
        depot: {
            name: '저장소',
            icon: '🗃️',
            type: 'supply',
            size: 56,
            health: 500,
            armor: 2,
            cost: { crystal: 100, energy: 0 },
            buildTime: 30,
            providesSupply: 6,
            visionRange: 150
        }
    }
};
