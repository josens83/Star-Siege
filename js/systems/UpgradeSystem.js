/**
 * UpgradeSystem - 업그레이드 시스템
 * 유닛/건물 업그레이드 관리
 */

import { EVENTS } from '../utils/Constants.js';

// 업그레이드 정의
export const UPGRADE_CONFIGS = {
    // 공통 업그레이드
    common: {
        attack_1: {
            id: 'attack_1',
            name: '공격력 강화 I',
            icon: '⚔️',
            description: '모든 유닛 공격력 +10%',
            cost: { crystal: 100, energy: 50 },
            researchTime: 30,
            effect: { type: 'damage', value: 0.1 },
            requires: []
        },
        attack_2: {
            id: 'attack_2',
            name: '공격력 강화 II',
            icon: '⚔️',
            description: '모든 유닛 공격력 +15%',
            cost: { crystal: 200, energy: 100 },
            researchTime: 45,
            effect: { type: 'damage', value: 0.15 },
            requires: ['attack_1']
        },
        attack_3: {
            id: 'attack_3',
            name: '공격력 강화 III',
            icon: '⚔️',
            description: '모든 유닛 공격력 +20%',
            cost: { crystal: 350, energy: 175 },
            researchTime: 60,
            effect: { type: 'damage', value: 0.2 },
            requires: ['attack_2']
        },
        armor_1: {
            id: 'armor_1',
            name: '방어력 강화 I',
            icon: '🛡️',
            description: '모든 유닛 방어력 +1',
            cost: { crystal: 100, energy: 50 },
            researchTime: 30,
            effect: { type: 'armor', value: 1 },
            requires: []
        },
        armor_2: {
            id: 'armor_2',
            name: '방어력 강화 II',
            icon: '🛡️',
            description: '모든 유닛 방어력 +1',
            cost: { crystal: 200, energy: 100 },
            researchTime: 45,
            effect: { type: 'armor', value: 1 },
            requires: ['armor_1']
        },
        armor_3: {
            id: 'armor_3',
            name: '방어력 강화 III',
            icon: '🛡️',
            description: '모든 유닛 방어력 +2',
            cost: { crystal: 350, energy: 175 },
            researchTime: 60,
            effect: { type: 'armor', value: 2 },
            requires: ['armor_2']
        },
        speed_1: {
            id: 'speed_1',
            name: '이동속도 강화',
            icon: '👟',
            description: '모든 유닛 이동속도 +15%',
            cost: { crystal: 150, energy: 75 },
            researchTime: 40,
            effect: { type: 'speed', value: 0.15 },
            requires: []
        },
        range_1: {
            id: 'range_1',
            name: '사거리 강화',
            icon: '🎯',
            description: '원거리 유닛 사거리 +20%',
            cost: { crystal: 150, energy: 100 },
            researchTime: 45,
            effect: { type: 'range', value: 0.2 },
            requires: []
        },
        gather_1: {
            id: 'gather_1',
            name: '수집 효율 I',
            icon: '⛏️',
            description: '자원 수집 속도 +25%',
            cost: { crystal: 100, energy: 50 },
            researchTime: 30,
            effect: { type: 'gather', value: 0.25 },
            requires: []
        },
        gather_2: {
            id: 'gather_2',
            name: '수집 효율 II',
            icon: '⛏️',
            description: '자원 수집 속도 +25%',
            cost: { crystal: 200, energy: 100 },
            researchTime: 45,
            effect: { type: 'gather', value: 0.25 },
            requires: ['gather_1']
        },
        building_hp: {
            id: 'building_hp',
            name: '건물 강화',
            icon: '🏰',
            description: '건물 체력 +25%',
            cost: { crystal: 200, energy: 100 },
            researchTime: 50,
            effect: { type: 'building_health', value: 0.25 },
            requires: []
        }
    },

    // 테라 연합 전용
    terra: {
        stim_pack: {
            id: 'stim_pack',
            name: '스팀팩',
            icon: '💉',
            description: '해병 공격속도 +50%, 체력 -10',
            cost: { crystal: 150, energy: 100 },
            researchTime: 40,
            effect: { type: 'stim_pack', attackSpeed: 0.5, healthCost: 10 },
            requires: [],
            unitType: 'marine'
        },
        siege_mode: {
            id: 'siege_mode',
            name: '시즈 모드',
            icon: '🎯',
            description: '전차 사거리 +50%, 스플래시 +30%',
            cost: { crystal: 200, energy: 150 },
            researchTime: 50,
            effect: { type: 'siege_mode', range: 0.5, splash: 0.3 },
            requires: [],
            unitType: 'tank'
        }
    },

    // 크리온 전용
    kryon: {
        shield_boost: {
            id: 'shield_boost',
            name: '쉴드 강화',
            icon: '🔷',
            description: '모든 유닛 쉴드 +30%',
            cost: { crystal: 150, energy: 100 },
            researchTime: 40,
            effect: { type: 'shield', value: 0.3 },
            requires: []
        },
        blink: {
            id: 'blink',
            name: '점멸',
            icon: '⚡',
            description: '추적자 순간이동 능력',
            cost: { crystal: 200, energy: 150 },
            researchTime: 50,
            effect: { type: 'blink', range: 200, cooldown: 10 },
            requires: [],
            unitType: 'stalker'
        },
        charge: {
            id: 'charge',
            name: '돌진',
            icon: '🏃',
            description: '광전사 돌진 능력',
            cost: { crystal: 150, energy: 100 },
            researchTime: 40,
            effect: { type: 'charge', speedBoost: 2, duration: 2 },
            requires: [],
            unitType: 'zealot'
        }
    },

    // 메카니쿠스 전용
    mechanicus: {
        heavy_armor: {
            id: 'heavy_armor',
            name: '중장갑',
            icon: '🛡️',
            description: '모든 기계 유닛 방어력 +2',
            cost: { crystal: 200, energy: 100 },
            researchTime: 45,
            effect: { type: 'armor', value: 2 },
            requires: []
        },
        overdrive: {
            id: 'overdrive',
            name: '오버드라이브',
            icon: '⚡',
            description: '분쇄기 공격력 +30%, 속도 +20%',
            cost: { crystal: 250, energy: 150 },
            researchTime: 55,
            effect: { type: 'overdrive', damage: 0.3, speed: 0.2 },
            requires: [],
            unitType: 'crusher'
        },
        repair_drone: {
            id: 'repair_drone',
            name: '수리 드론',
            icon: '🔧',
            description: '공작드론 자동 수리 능력',
            cost: { crystal: 150, energy: 100 },
            researchTime: 40,
            effect: { type: 'auto_repair', healRate: 5, range: 100 },
            requires: [],
            unitType: 'drone'
        }
    }
};

export class UpgradeSystem {
    constructor(game) {
        this.game = game;

        // 팀별 연구 완료된 업그레이드
        this.completedUpgrades = new Map();
        this.completedUpgrades.set(0, new Set()); // 플레이어
        this.completedUpgrades.set(1, new Set()); // 적

        // 현재 연구 중인 업그레이드
        this.currentResearch = new Map();
        this.currentResearch.set(0, null);
        this.currentResearch.set(1, null);

        // 연구 진행률
        this.researchProgress = new Map();
        this.researchProgress.set(0, 0);
        this.researchProgress.set(1, 0);

        // 적용된 보너스 캐시
        this.bonusCache = new Map();
    }

    /**
     * 업데이트
     */
    update(deltaTime) {
        // 각 팀의 연구 진행
        for (const [team, research] of this.currentResearch) {
            if (!research) continue;

            const progress = this.researchProgress.get(team) + (deltaTime / 1000);
            this.researchProgress.set(team, progress);

            if (progress >= research.researchTime) {
                this.completeResearch(team);
            }
        }
    }

    /**
     * 연구 시작
     */
    startResearch(team, upgradeId) {
        // 이미 연구 중인지 확인
        if (this.currentResearch.get(team)) {
            this.game.showToast('이미 연구 중입니다!', 'error');
            return false;
        }

        // 업그레이드 설정 찾기
        const upgrade = this.getUpgradeConfig(upgradeId, team);
        if (!upgrade) {
            console.error('업그레이드를 찾을 수 없음:', upgradeId);
            return false;
        }

        // 이미 연구했는지 확인
        if (this.hasUpgrade(team, upgradeId)) {
            this.game.showToast('이미 연구 완료되었습니다!', 'error');
            return false;
        }

        // 선행 연구 확인
        if (!this.hasRequirements(team, upgrade.requires)) {
            this.game.showToast('선행 연구가 필요합니다!', 'error');
            return false;
        }

        // 자원 확인
        const cost = upgrade.cost;
        if (!this.game.resourceSystem.canAfford(team, cost.crystal, cost.energy)) {
            this.game.showToast('자원이 부족합니다!', 'error');
            return false;
        }

        // 자원 차감
        this.game.resourceSystem.spend(team, cost.crystal, cost.energy);

        // 연구 시작
        this.currentResearch.set(team, upgrade);
        this.researchProgress.set(team, 0);

        if (team === this.game.playerTeam) {
            this.game.showToast(`${upgrade.name} 연구 시작!`, 'info');
        }

        return true;
    }

    /**
     * 연구 완료
     */
    completeResearch(team) {
        const upgrade = this.currentResearch.get(team);
        if (!upgrade) return;

        // 완료된 업그레이드에 추가
        this.completedUpgrades.get(team).add(upgrade.id);

        // 보너스 캐시 무효화
        this.invalidateBonusCache(team);

        // 연구 상태 초기화
        this.currentResearch.set(team, null);
        this.researchProgress.set(team, 0);

        if (team === this.game.playerTeam) {
            this.game.showToast(`${upgrade.name} 연구 완료!`, 'success');
            this.game.audioManager.playSound('upgradeComplete');
        }

        // 이벤트 발생
        this.game.emit(EVENTS.UPGRADE_COMPLETE, { team, upgrade });
    }

    /**
     * 연구 취소
     */
    cancelResearch(team) {
        const upgrade = this.currentResearch.get(team);
        if (!upgrade) return;

        // 자원 50% 환불
        const cost = upgrade.cost;
        this.game.resourceSystem.addResources(
            team,
            Math.floor(cost.crystal * 0.5),
            Math.floor(cost.energy * 0.5)
        );

        this.currentResearch.set(team, null);
        this.researchProgress.set(team, 0);

        if (team === this.game.playerTeam) {
            this.game.showToast('연구 취소됨', 'info');
        }
    }

    /**
     * 업그레이드 설정 가져오기
     */
    getUpgradeConfig(upgradeId, team) {
        // 공통 업그레이드에서 찾기
        if (UPGRADE_CONFIGS.common[upgradeId]) {
            return UPGRADE_CONFIGS.common[upgradeId];
        }

        // 진영별 업그레이드에서 찾기
        const faction = team === this.game.playerTeam
            ? this.game.playerFaction
            : this.game.enemyFaction;

        if (faction && UPGRADE_CONFIGS[faction.id]?.[upgradeId]) {
            return UPGRADE_CONFIGS[faction.id][upgradeId];
        }

        return null;
    }

    /**
     * 업그레이드 보유 여부
     */
    hasUpgrade(team, upgradeId) {
        return this.completedUpgrades.get(team)?.has(upgradeId) || false;
    }

    /**
     * 선행 연구 충족 여부
     */
    hasRequirements(team, requires) {
        if (!requires || requires.length === 0) return true;
        return requires.every(req => this.hasUpgrade(team, req));
    }

    /**
     * 보너스 캐시 무효화
     */
    invalidateBonusCache(team) {
        this.bonusCache.delete(team);
    }

    /**
     * 팀의 총 보너스 계산
     */
    getTeamBonuses(team) {
        // 캐시 확인
        if (this.bonusCache.has(team)) {
            return this.bonusCache.get(team);
        }

        const bonuses = {
            damage: 0,
            armor: 0,
            speed: 0,
            range: 0,
            gather: 0,
            shield: 0,
            building_health: 0
        };

        const completed = this.completedUpgrades.get(team);
        if (!completed) return bonuses;

        for (const upgradeId of completed) {
            const upgrade = this.getUpgradeConfig(upgradeId, team);
            if (!upgrade || !upgrade.effect) continue;

            const effect = upgrade.effect;
            switch (effect.type) {
                case 'damage':
                    bonuses.damage += effect.value;
                    break;
                case 'armor':
                    bonuses.armor += effect.value;
                    break;
                case 'speed':
                    bonuses.speed += effect.value;
                    break;
                case 'range':
                    bonuses.range += effect.value;
                    break;
                case 'gather':
                    bonuses.gather += effect.value;
                    break;
                case 'shield':
                    bonuses.shield += effect.value;
                    break;
                case 'building_health':
                    bonuses.building_health += effect.value;
                    break;
            }
        }

        // 캐시에 저장
        this.bonusCache.set(team, bonuses);

        return bonuses;
    }

    /**
     * 유닛에 업그레이드 보너스 적용
     */
    applyUnitBonuses(unit) {
        const bonuses = this.getTeamBonuses(unit.team);

        // 기본 스탯에 보너스 적용
        unit.attackDamage = unit.config.damage * (1 + bonuses.damage);
        unit.armor = (unit.config.armor || 0) + bonuses.armor;
        unit.speed = unit.config.speed * (1 + bonuses.speed);

        if (unit.attackRange > 50) {
            unit.attackRange = unit.config.range * (1 + bonuses.range);
        }

        if (unit.isWorker) {
            unit.gatherRate = unit.config.gatherRate * (1 + bonuses.gather);
        }

        if (unit.maxShield > 0) {
            unit.maxShield = unit.config.shield * (1 + bonuses.shield);
        }
    }

    /**
     * 건물에 업그레이드 보너스 적용
     */
    applyBuildingBonuses(building) {
        const bonuses = this.getTeamBonuses(building.team);

        building.maxHealth = building.config.health * (1 + bonuses.building_health);
    }

    /**
     * 사용 가능한 업그레이드 목록
     */
    getAvailableUpgrades(team) {
        const faction = team === this.game.playerTeam
            ? this.game.playerFaction
            : this.game.enemyFaction;

        const available = [];

        // 공통 업그레이드
        for (const [id, upgrade] of Object.entries(UPGRADE_CONFIGS.common)) {
            if (!this.hasUpgrade(team, id) && this.hasRequirements(team, upgrade.requires)) {
                available.push({ ...upgrade, category: 'common' });
            }
        }

        // 진영별 업그레이드
        if (faction && UPGRADE_CONFIGS[faction.id]) {
            for (const [id, upgrade] of Object.entries(UPGRADE_CONFIGS[faction.id])) {
                if (!this.hasUpgrade(team, id) && this.hasRequirements(team, upgrade.requires)) {
                    available.push({ ...upgrade, category: faction.id });
                }
            }
        }

        return available;
    }

    /**
     * 현재 연구 정보 반환
     */
    getCurrentResearch(team) {
        const research = this.currentResearch.get(team);
        if (!research) return null;

        return {
            upgrade: research,
            progress: this.researchProgress.get(team),
            total: research.researchTime,
            percent: (this.researchProgress.get(team) / research.researchTime) * 100
        };
    }

    /**
     * 리셋
     */
    reset() {
        this.completedUpgrades.set(0, new Set());
        this.completedUpgrades.set(1, new Set());
        this.currentResearch.set(0, null);
        this.currentResearch.set(1, null);
        this.researchProgress.set(0, 0);
        this.researchProgress.set(1, 0);
        this.bonusCache.clear();
    }

    /**
     * 직렬화
     */
    serialize() {
        return {
            completed: {
                0: Array.from(this.completedUpgrades.get(0) || []),
                1: Array.from(this.completedUpgrades.get(1) || [])
            },
            current: {
                0: this.currentResearch.get(0)?.id || null,
                1: this.currentResearch.get(1)?.id || null
            },
            progress: {
                0: this.researchProgress.get(0),
                1: this.researchProgress.get(1)
            }
        };
    }

    /**
     * 역직렬화
     */
    deserialize(data) {
        if (data.completed) {
            this.completedUpgrades.set(0, new Set(data.completed[0] || []));
            this.completedUpgrades.set(1, new Set(data.completed[1] || []));
        }

        if (data.current) {
            if (data.current[0]) {
                this.currentResearch.set(0, this.getUpgradeConfig(data.current[0], 0));
            }
            if (data.current[1]) {
                this.currentResearch.set(1, this.getUpgradeConfig(data.current[1], 1));
            }
        }

        if (data.progress) {
            this.researchProgress.set(0, data.progress[0] || 0);
            this.researchProgress.set(1, data.progress[1] || 0);
        }

        this.bonusCache.clear();
    }
}
