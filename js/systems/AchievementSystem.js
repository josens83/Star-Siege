/**
 * Star Siege - 업적 시스템
 * 게임 성취 및 보상 관리
 */

/**
 * 업적 카테고리
 */
export const ACHIEVEMENT_CATEGORIES = {
    COMBAT: 'combat',
    ECONOMY: 'economy',
    BUILDING: 'building',
    CAMPAIGN: 'campaign',
    WAVE: 'wave',
    MISC: 'misc'
};

/**
 * 업적 정의
 */
export const ACHIEVEMENTS = {
    // 전투 업적
    combat: {
        first_blood: {
            id: 'first_blood',
            name: '첫 번째 피',
            description: '첫 번째 적 유닛 처치',
            icon: '⚔️',
            category: ACHIEVEMENT_CATEGORIES.COMBAT,
            requirement: { type: 'kills', count: 1 },
            reward: { coins: 100, gems: 5 },
            hidden: false
        },
        warrior: {
            id: 'warrior',
            name: '전사',
            description: '적 유닛 50기 처치',
            icon: '🗡️',
            category: ACHIEVEMENT_CATEGORIES.COMBAT,
            requirement: { type: 'kills', count: 50 },
            reward: { coins: 300, gems: 10 },
            hidden: false
        },
        slayer: {
            id: 'slayer',
            name: '학살자',
            description: '적 유닛 200기 처치',
            icon: '💀',
            category: ACHIEVEMENT_CATEGORIES.COMBAT,
            requirement: { type: 'kills', count: 200 },
            reward: { coins: 500, gems: 20 },
            hidden: false
        },
        destroyer: {
            id: 'destroyer',
            name: '파괴자',
            description: '적 유닛 1000기 처치',
            icon: '☠️',
            category: ACHIEVEMENT_CATEGORIES.COMBAT,
            requirement: { type: 'kills', count: 1000 },
            reward: { coins: 1000, gems: 50 },
            hidden: false
        },
        building_crusher: {
            id: 'building_crusher',
            name: '건물 파괴자',
            description: '적 건물 10개 파괴',
            icon: '🏚️',
            category: ACHIEVEMENT_CATEGORIES.COMBAT,
            requirement: { type: 'buildings_destroyed', count: 10 },
            reward: { coins: 200, gems: 10 },
            hidden: false
        },
        base_raider: {
            id: 'base_raider',
            name: '기지 약탈자',
            description: '적 본부 파괴 5회',
            icon: '🏰',
            category: ACHIEVEMENT_CATEGORIES.COMBAT,
            requirement: { type: 'hq_destroyed', count: 5 },
            reward: { coins: 500, gems: 25 },
            hidden: false
        },
        no_casualties: {
            id: 'no_casualties',
            name: '무손실 승리',
            description: '유닛 손실 없이 게임 승리',
            icon: '🛡️',
            category: ACHIEVEMENT_CATEGORIES.COMBAT,
            requirement: { type: 'win_no_loss', count: 1 },
            reward: { coins: 300, gems: 15 },
            hidden: true
        },
        speed_demon: {
            id: 'speed_demon',
            name: '속전속결',
            description: '5분 안에 게임 승리',
            icon: '⚡',
            category: ACHIEVEMENT_CATEGORIES.COMBAT,
            requirement: { type: 'win_under_time', count: 300 },
            reward: { coins: 400, gems: 20 },
            hidden: true
        }
    },

    // 경제 업적
    economy: {
        gatherer: {
            id: 'gatherer',
            name: '수집가',
            description: '크리스탈 1000 수집',
            icon: '💎',
            category: ACHIEVEMENT_CATEGORIES.ECONOMY,
            requirement: { type: 'crystals_gathered', count: 1000 },
            reward: { coins: 200, gems: 5 },
            hidden: false
        },
        miner: {
            id: 'miner',
            name: '광부',
            description: '크리스탈 10000 수집',
            icon: '⛏️',
            category: ACHIEVEMENT_CATEGORIES.ECONOMY,
            requirement: { type: 'crystals_gathered', count: 10000 },
            reward: { coins: 500, gems: 20 },
            hidden: false
        },
        tycoon: {
            id: 'tycoon',
            name: '재벌',
            description: '크리스탈 100000 수집',
            icon: '🏦',
            category: ACHIEVEMENT_CATEGORIES.ECONOMY,
            requirement: { type: 'crystals_gathered', count: 100000 },
            reward: { coins: 1000, gems: 50 },
            hidden: false
        },
        power_plant: {
            id: 'power_plant',
            name: '발전소',
            description: '에너지 1000 생산',
            icon: '🔋',
            category: ACHIEVEMENT_CATEGORIES.ECONOMY,
            requirement: { type: 'energy_produced', count: 1000 },
            reward: { coins: 200, gems: 5 },
            hidden: false
        },
        energy_mogul: {
            id: 'energy_mogul',
            name: '에너지 재벌',
            description: '에너지 50000 생산',
            icon: '⚡',
            category: ACHIEVEMENT_CATEGORIES.ECONOMY,
            requirement: { type: 'energy_produced', count: 50000 },
            reward: { coins: 500, gems: 25 },
            hidden: false
        }
    },

    // 건설 업적
    building: {
        architect: {
            id: 'architect',
            name: '건축가',
            description: '건물 10개 건설',
            icon: '🏗️',
            category: ACHIEVEMENT_CATEGORIES.BUILDING,
            requirement: { type: 'buildings_built', count: 10 },
            reward: { coins: 150, gems: 5 },
            hidden: false
        },
        city_planner: {
            id: 'city_planner',
            name: '도시 계획가',
            description: '건물 50개 건설',
            icon: '🏙️',
            category: ACHIEVEMENT_CATEGORIES.BUILDING,
            requirement: { type: 'buildings_built', count: 50 },
            reward: { coins: 400, gems: 15 },
            hidden: false
        },
        mega_builder: {
            id: 'mega_builder',
            name: '메가 건설자',
            description: '건물 200개 건설',
            icon: '🌆',
            category: ACHIEVEMENT_CATEGORIES.BUILDING,
            requirement: { type: 'buildings_built', count: 200 },
            reward: { coins: 800, gems: 30 },
            hidden: false
        },
        unit_producer: {
            id: 'unit_producer',
            name: '유닛 생산자',
            description: '유닛 100기 생산',
            icon: '🏭',
            category: ACHIEVEMENT_CATEGORIES.BUILDING,
            requirement: { type: 'units_produced', count: 100 },
            reward: { coins: 300, gems: 10 },
            hidden: false
        },
        army_builder: {
            id: 'army_builder',
            name: '군대 건설자',
            description: '유닛 500기 생산',
            icon: '🎖️',
            category: ACHIEVEMENT_CATEGORIES.BUILDING,
            requirement: { type: 'units_produced', count: 500 },
            reward: { coins: 600, gems: 25 },
            hidden: false
        },
        warlord: {
            id: 'warlord',
            name: '군벌',
            description: '유닛 2000기 생산',
            icon: '👑',
            category: ACHIEVEMENT_CATEGORIES.BUILDING,
            requirement: { type: 'units_produced', count: 2000 },
            reward: { coins: 1200, gems: 50 },
            hidden: false
        }
    },

    // 캠페인 업적
    campaign: {
        tutorial_complete: {
            id: 'tutorial_complete',
            name: '훈련 완료',
            description: '튜토리얼 완료',
            icon: '📚',
            category: ACHIEVEMENT_CATEGORIES.CAMPAIGN,
            requirement: { type: 'tutorial', count: 1 },
            reward: { coins: 200, gems: 10 },
            hidden: false
        },
        campaign_started: {
            id: 'campaign_started',
            name: '캠페인 시작',
            description: '첫 캠페인 미션 완료',
            icon: '🚀',
            category: ACHIEVEMENT_CATEGORIES.CAMPAIGN,
            requirement: { type: 'campaign_missions', count: 1 },
            reward: { coins: 150, gems: 5 },
            hidden: false
        },
        campaign_hero: {
            id: 'campaign_hero',
            name: '캠페인 영웅',
            description: '캠페인 미션 10개 완료',
            icon: '🦸',
            category: ACHIEVEMENT_CATEGORIES.CAMPAIGN,
            requirement: { type: 'campaign_missions', count: 10 },
            reward: { coins: 500, gems: 25 },
            hidden: false
        },
        campaign_master: {
            id: 'campaign_master',
            name: '캠페인 마스터',
            description: '모든 캠페인 미션 완료',
            icon: '🏆',
            category: ACHIEVEMENT_CATEGORIES.CAMPAIGN,
            requirement: { type: 'campaign_complete', count: 1 },
            reward: { coins: 1000, gems: 50 },
            hidden: false
        },
        hard_mode_hero: {
            id: 'hard_mode_hero',
            name: '하드 모드 영웅',
            description: '하드 난이도로 캠페인 완료',
            icon: '💪',
            category: ACHIEVEMENT_CATEGORIES.CAMPAIGN,
            requirement: { type: 'campaign_hard', count: 1 },
            reward: { coins: 1500, gems: 75 },
            hidden: true
        },
        all_factions: {
            id: 'all_factions',
            name: '다재다능',
            description: '모든 팩션으로 승리',
            icon: '🎭',
            category: ACHIEVEMENT_CATEGORIES.CAMPAIGN,
            requirement: { type: 'factions_won', count: 3 },
            reward: { coins: 600, gems: 30 },
            hidden: false
        }
    },

    // 웨이브 업적
    wave: {
        wave_survivor: {
            id: 'wave_survivor',
            name: '웨이브 생존자',
            description: '웨이브 모드 5웨이브 생존',
            icon: '🌊',
            category: ACHIEVEMENT_CATEGORIES.WAVE,
            requirement: { type: 'waves_survived', count: 5 },
            reward: { coins: 200, gems: 10 },
            hidden: false
        },
        wave_champion: {
            id: 'wave_champion',
            name: '웨이브 챔피언',
            description: '웨이브 모드 완전 클리어 (10웨이브)',
            icon: '🏅',
            category: ACHIEVEMENT_CATEGORIES.WAVE,
            requirement: { type: 'wave_complete', count: 1 },
            reward: { coins: 500, gems: 25 },
            hidden: false
        },
        wave_master: {
            id: 'wave_master',
            name: '웨이브 마스터',
            description: '웨이브 모드 10회 완전 클리어',
            icon: '🎯',
            category: ACHIEVEMENT_CATEGORIES.WAVE,
            requirement: { type: 'wave_complete', count: 10 },
            reward: { coins: 1000, gems: 50 },
            hidden: false
        },
        perfect_wave: {
            id: 'perfect_wave',
            name: '완벽한 방어',
            description: '본부 피해 없이 웨이브 클리어',
            icon: '💯',
            category: ACHIEVEMENT_CATEGORIES.WAVE,
            requirement: { type: 'perfect_wave', count: 1 },
            reward: { coins: 300, gems: 15 },
            hidden: true
        }
    },

    // 기타 업적
    misc: {
        first_win: {
            id: 'first_win',
            name: '첫 승리',
            description: '첫 번째 게임 승리',
            icon: '🎉',
            category: ACHIEVEMENT_CATEGORIES.MISC,
            requirement: { type: 'wins', count: 1 },
            reward: { coins: 200, gems: 10 },
            hidden: false
        },
        ten_wins: {
            id: 'ten_wins',
            name: '연승 행진',
            description: '10회 승리',
            icon: '🔟',
            category: ACHIEVEMENT_CATEGORIES.MISC,
            requirement: { type: 'wins', count: 10 },
            reward: { coins: 400, gems: 20 },
            hidden: false
        },
        hundred_wins: {
            id: 'hundred_wins',
            name: '백전백승',
            description: '100회 승리',
            icon: '💯',
            category: ACHIEVEMENT_CATEGORIES.MISC,
            requirement: { type: 'wins', count: 100 },
            reward: { coins: 1000, gems: 50 },
            hidden: false
        },
        daily_player: {
            id: 'daily_player',
            name: '데일리 플레이어',
            description: '7일 연속 로그인',
            icon: '📅',
            category: ACHIEVEMENT_CATEGORIES.MISC,
            requirement: { type: 'login_streak', count: 7 },
            reward: { coins: 300, gems: 15 },
            hidden: false
        },
        dedicated_player: {
            id: 'dedicated_player',
            name: '헌신적인 플레이어',
            description: '30일 연속 로그인',
            icon: '🗓️',
            category: ACHIEVEMENT_CATEGORIES.MISC,
            requirement: { type: 'login_streak', count: 30 },
            reward: { coins: 800, gems: 40 },
            hidden: false
        },
        level_10: {
            id: 'level_10',
            name: '성장 중',
            description: '레벨 10 달성',
            icon: '📈',
            category: ACHIEVEMENT_CATEGORIES.MISC,
            requirement: { type: 'level', count: 10 },
            reward: { coins: 300, gems: 15 },
            hidden: false
        },
        level_25: {
            id: 'level_25',
            name: '베테랑',
            description: '레벨 25 달성',
            icon: '⭐',
            category: ACHIEVEMENT_CATEGORIES.MISC,
            requirement: { type: 'level', count: 25 },
            reward: { coins: 600, gems: 30 },
            hidden: false
        },
        level_50: {
            id: 'level_50',
            name: '전설',
            description: '레벨 50 달성',
            icon: '🌟',
            category: ACHIEVEMENT_CATEGORIES.MISC,
            requirement: { type: 'level', count: 50 },
            reward: { coins: 1200, gems: 60 },
            hidden: false
        },
        play_time_1h: {
            id: 'play_time_1h',
            name: '초보 지휘관',
            description: '총 플레이 시간 1시간',
            icon: '⏱️',
            category: ACHIEVEMENT_CATEGORIES.MISC,
            requirement: { type: 'play_time', count: 3600 },
            reward: { coins: 100, gems: 5 },
            hidden: false
        },
        play_time_10h: {
            id: 'play_time_10h',
            name: '숙련 지휘관',
            description: '총 플레이 시간 10시간',
            icon: '🕐',
            category: ACHIEVEMENT_CATEGORIES.MISC,
            requirement: { type: 'play_time', count: 36000 },
            reward: { coins: 400, gems: 20 },
            hidden: false
        },
        play_time_100h: {
            id: 'play_time_100h',
            name: '마스터 지휘관',
            description: '총 플레이 시간 100시간',
            icon: '⌛',
            category: ACHIEVEMENT_CATEGORIES.MISC,
            requirement: { type: 'play_time', count: 360000 },
            reward: { coins: 1000, gems: 50 },
            hidden: false
        }
    }
};

/**
 * 업적 시스템 클래스
 */
export class AchievementSystem {
    constructor(game) {
        this.game = game;

        // 달성한 업적
        this.unlockedAchievements = new Set();

        // 업적 진행 상황
        this.progress = new Map();

        // 미수령 보상
        this.pendingRewards = [];

        // 통계 (업적 조건 체크용)
        this.stats = {
            kills: 0,
            buildings_destroyed: 0,
            hq_destroyed: 0,
            crystals_gathered: 0,
            energy_produced: 0,
            buildings_built: 0,
            units_produced: 0,
            wins: 0,
            losses: 0,
            campaign_missions: 0,
            wave_complete: 0,
            waves_survived: 0,
            play_time: 0,
            factions_won: new Set()
        };

        // 데이터 로드
        this.load();
    }

    /**
     * 초기화
     */
    init() {
        // 진행 상황 초기화
        this.initProgress();
    }

    /**
     * 진행 상황 초기화
     */
    initProgress() {
        for (const category of Object.values(ACHIEVEMENTS)) {
            for (const achievement of Object.values(category)) {
                if (!this.progress.has(achievement.id)) {
                    this.progress.set(achievement.id, 0);
                }
            }
        }
    }

    /**
     * 업데이트 (플레이 시간 추적)
     */
    update(deltaTime) {
        if (this.game && this.game.state === 'playing') {
            this.stats.play_time += deltaTime;

            // 1분마다 저장
            if (Math.floor(this.stats.play_time) % 60 === 0) {
                this.checkAchievement('play_time_1h');
                this.checkAchievement('play_time_10h');
                this.checkAchievement('play_time_100h');
            }
        }
    }

    /**
     * 통계 업데이트
     */
    updateStat(statType, value = 1, checkImmediate = true) {
        if (statType === 'factions_won') {
            this.stats.factions_won.add(value);
            this.progress.set('all_factions', this.stats.factions_won.size);
        } else if (this.stats.hasOwnProperty(statType)) {
            this.stats[statType] += value;
        }

        if (checkImmediate) {
            this.checkRelatedAchievements(statType);
        }

        this.save();
    }

    /**
     * 관련 업적 체크
     */
    checkRelatedAchievements(statType) {
        const achievementsToCheck = [];

        for (const category of Object.values(ACHIEVEMENTS)) {
            for (const achievement of Object.values(category)) {
                if (achievement.requirement.type === statType) {
                    achievementsToCheck.push(achievement.id);
                }
            }
        }

        for (const achievementId of achievementsToCheck) {
            this.checkAchievement(achievementId);
        }
    }

    /**
     * 업적 달성 체크
     */
    checkAchievement(achievementId) {
        if (this.unlockedAchievements.has(achievementId)) {
            return false; // 이미 달성함
        }

        const achievement = this.getAchievement(achievementId);
        if (!achievement) return false;

        const { requirement } = achievement;
        let currentValue = 0;

        switch (requirement.type) {
            case 'kills':
                currentValue = this.stats.kills;
                break;
            case 'buildings_destroyed':
                currentValue = this.stats.buildings_destroyed;
                break;
            case 'hq_destroyed':
                currentValue = this.stats.hq_destroyed;
                break;
            case 'crystals_gathered':
                currentValue = this.stats.crystals_gathered;
                break;
            case 'energy_produced':
                currentValue = this.stats.energy_produced;
                break;
            case 'buildings_built':
                currentValue = this.stats.buildings_built;
                break;
            case 'units_produced':
                currentValue = this.stats.units_produced;
                break;
            case 'wins':
                currentValue = this.stats.wins;
                break;
            case 'campaign_missions':
                currentValue = this.stats.campaign_missions;
                break;
            case 'campaign_complete':
            case 'campaign_hard':
                currentValue = this.progress.get(achievementId) || 0;
                break;
            case 'wave_complete':
                currentValue = this.stats.wave_complete;
                break;
            case 'waves_survived':
                currentValue = this.stats.waves_survived;
                break;
            case 'tutorial':
                currentValue = this.progress.get(achievementId) || 0;
                break;
            case 'win_no_loss':
            case 'win_under_time':
            case 'perfect_wave':
                currentValue = this.progress.get(achievementId) || 0;
                break;
            case 'factions_won':
                currentValue = this.stats.factions_won.size;
                break;
            case 'login_streak':
                currentValue = this.game?.economy?.dailyLoginStreak || 0;
                break;
            case 'level':
                currentValue = this.game?.economy?.level || 1;
                break;
            case 'play_time':
                currentValue = this.stats.play_time;
                break;
            default:
                currentValue = this.progress.get(achievementId) || 0;
        }

        // 진행 상황 업데이트
        this.progress.set(achievementId, currentValue);

        // 달성 체크
        if (currentValue >= requirement.count) {
            this.unlockAchievement(achievementId);
            return true;
        }

        return false;
    }

    /**
     * 업적 달성
     */
    unlockAchievement(achievementId) {
        if (this.unlockedAchievements.has(achievementId)) {
            return;
        }

        const achievement = this.getAchievement(achievementId);
        if (!achievement) return;

        this.unlockedAchievements.add(achievementId);

        console.log(`🏆 업적 달성: ${achievement.name}`);

        // 보상 대기열에 추가
        this.pendingRewards.push({
            achievementId,
            ...achievement.reward
        });

        // 알림 표시
        this.showAchievementNotification(achievement);

        this.save();
    }

    /**
     * 업적 알림 표시
     */
    showAchievementNotification(achievement) {
        if (this.game && this.game.ui) {
            this.game.ui.showAchievementPopup(achievement);
        }

        // 이펙트 표시
        if (this.game && this.game.effects) {
            this.game.effects.showAchievementUnlock(achievement);
        }
    }

    /**
     * 보상 수령
     */
    claimReward(achievementId) {
        const rewardIndex = this.pendingRewards.findIndex(r => r.achievementId === achievementId);
        if (rewardIndex === -1) {
            return { success: false, error: '수령할 보상이 없습니다' };
        }

        const reward = this.pendingRewards[rewardIndex];
        this.pendingRewards.splice(rewardIndex, 1);

        // 보상 지급
        const economy = this.game.economy;
        if (economy) {
            if (reward.coins) {
                economy.addCoins(reward.coins, `achievement_${achievementId}`);
            }
            if (reward.gems) {
                economy.addGems(reward.gems, `achievement_${achievementId}`);
            }
        }

        this.save();

        return { success: true, reward };
    }

    /**
     * 모든 보상 수령
     */
    claimAllRewards() {
        const rewards = [...this.pendingRewards];
        let totalCoins = 0;
        let totalGems = 0;

        for (const reward of rewards) {
            totalCoins += reward.coins || 0;
            totalGems += reward.gems || 0;
        }

        this.pendingRewards = [];

        const economy = this.game.economy;
        if (economy) {
            if (totalCoins > 0) {
                economy.addCoins(totalCoins, 'achievements_bulk');
            }
            if (totalGems > 0) {
                economy.addGems(totalGems, 'achievements_bulk');
            }
        }

        this.save();

        return { coins: totalCoins, gems: totalGems, count: rewards.length };
    }

    /**
     * 업적 정보 조회
     */
    getAchievement(achievementId) {
        for (const category of Object.values(ACHIEVEMENTS)) {
            if (category[achievementId]) {
                return category[achievementId];
            }
        }
        return null;
    }

    /**
     * 카테고리별 업적 목록
     */
    getAchievementsByCategory(categoryId) {
        const category = Object.keys(ACHIEVEMENTS).find(key =>
            ACHIEVEMENTS[key][Object.keys(ACHIEVEMENTS[key])[0]]?.category === categoryId
        );

        if (!category) return [];

        return Object.values(ACHIEVEMENTS[category]);
    }

    /**
     * 모든 업적 목록 (숨김 업적 처리)
     */
    getAllAchievements(includeHidden = false) {
        const all = [];

        for (const category of Object.values(ACHIEVEMENTS)) {
            for (const achievement of Object.values(category)) {
                if (includeHidden || !achievement.hidden || this.unlockedAchievements.has(achievement.id)) {
                    all.push({
                        ...achievement,
                        unlocked: this.unlockedAchievements.has(achievement.id),
                        progress: this.progress.get(achievement.id) || 0
                    });
                }
            }
        }

        return all;
    }

    /**
     * 달성률 계산
     */
    getCompletionRate() {
        let total = 0;
        let unlocked = 0;

        for (const category of Object.values(ACHIEVEMENTS)) {
            for (const achievement of Object.values(category)) {
                total++;
                if (this.unlockedAchievements.has(achievement.id)) {
                    unlocked++;
                }
            }
        }

        return {
            unlocked,
            total,
            percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0
        };
    }

    /**
     * 게임 종료 시 업적 체크
     */
    onGameEnd(result) {
        if (result.victory) {
            this.updateStat('wins', 1);

            // 팩션 승리 기록
            if (result.faction) {
                this.updateStat('factions_won', result.faction);
            }

            // 무손실 승리 체크
            if (result.unitsLost === 0) {
                this.progress.set('no_casualties', 1);
                this.checkAchievement('no_casualties');
            }

            // 속전속결 체크
            if (result.gameTime && result.gameTime <= 300) {
                this.progress.set('speed_demon', 1);
                this.checkAchievement('speed_demon');
            }
        } else {
            this.stats.losses++;
        }

        // 킬/파괴 기록
        if (result.kills) {
            this.updateStat('kills', result.kills);
        }
        if (result.buildingsDestroyed) {
            this.updateStat('buildings_destroyed', result.buildingsDestroyed);
        }
        if (result.hqDestroyed) {
            this.updateStat('hq_destroyed', 1);
        }

        this.save();
    }

    /**
     * 웨이브 완료 시
     */
    onWaveComplete(waveNumber, perfectDefense) {
        this.updateStat('waves_survived', waveNumber);

        if (waveNumber >= 10) {
            this.updateStat('wave_complete', 1);
        }

        if (perfectDefense) {
            this.progress.set('perfect_wave', 1);
            this.checkAchievement('perfect_wave');
        }
    }

    /**
     * 캠페인 미션 완료 시
     */
    onCampaignMissionComplete(missionId, difficulty) {
        this.updateStat('campaign_missions', 1);

        // 전체 완료 체크 (미션 시스템과 연동 필요)
        // this.checkAchievement('campaign_master');

        if (difficulty === 'hard') {
            // 하드 모드 카운트
            const hardCount = (this.progress.get('campaign_hard') || 0) + 1;
            this.progress.set('campaign_hard', hardCount);
        }
    }

    /**
     * 튜토리얼 완료 시
     */
    onTutorialComplete() {
        this.progress.set('tutorial_complete', 1);
        this.checkAchievement('tutorial_complete');
    }

    /**
     * 저장
     */
    save() {
        const data = {
            unlockedAchievements: Array.from(this.unlockedAchievements),
            progress: Array.from(this.progress.entries()),
            pendingRewards: this.pendingRewards,
            stats: {
                ...this.stats,
                factions_won: Array.from(this.stats.factions_won)
            }
        };

        try {
            localStorage.setItem('starsiege_achievements', JSON.stringify(data));
        } catch (e) {
            console.error('업적 데이터 저장 실패:', e);
        }
    }

    /**
     * 로드
     */
    load() {
        try {
            const saved = localStorage.getItem('starsiege_achievements');
            if (!saved) return;

            const data = JSON.parse(saved);

            this.unlockedAchievements = new Set(data.unlockedAchievements || []);
            this.progress = new Map(data.progress || []);
            this.pendingRewards = data.pendingRewards || [];

            if (data.stats) {
                this.stats = {
                    ...this.stats,
                    ...data.stats,
                    factions_won: new Set(data.stats.factions_won || [])
                };
            }

            console.log(`🏆 업적 데이터 로드: ${this.unlockedAchievements.size} 달성`);

        } catch (e) {
            console.error('업적 데이터 로드 실패:', e);
        }
    }

    /**
     * 데이터 내보내기
     */
    serialize() {
        return {
            unlockedAchievements: Array.from(this.unlockedAchievements),
            progress: Array.from(this.progress.entries()),
            pendingRewards: this.pendingRewards,
            stats: {
                ...this.stats,
                factions_won: Array.from(this.stats.factions_won)
            }
        };
    }

    /**
     * 데이터 가져오기
     */
    deserialize(data) {
        if (!data) return;

        if (data.unlockedAchievements) {
            this.unlockedAchievements = new Set(data.unlockedAchievements);
        }
        if (data.progress) {
            this.progress = new Map(data.progress);
        }
        if (data.pendingRewards) {
            this.pendingRewards = data.pendingRewards;
        }
        if (data.stats) {
            this.stats = {
                ...this.stats,
                ...data.stats,
                factions_won: new Set(data.stats.factions_won || [])
            };
        }

        this.save();
    }

    /**
     * 리셋 (디버그용)
     */
    reset() {
        localStorage.removeItem('starsiege_achievements');
        this.unlockedAchievements.clear();
        this.progress.clear();
        this.pendingRewards = [];
        this.stats = {
            kills: 0,
            buildings_destroyed: 0,
            hq_destroyed: 0,
            crystals_gathered: 0,
            energy_produced: 0,
            buildings_built: 0,
            units_produced: 0,
            wins: 0,
            losses: 0,
            campaign_missions: 0,
            wave_complete: 0,
            waves_survived: 0,
            play_time: 0,
            factions_won: new Set()
        };
        this.initProgress();
    }
}
