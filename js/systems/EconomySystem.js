/**
 * Star Siege - 경제 시스템
 * 코인, 보석 (프리미엄 화폐) 관리
 */

/**
 * 상점 아이템 설정
 */
export const SHOP_ITEMS = {
    // 코인 번들 (보석으로 구매)
    coin_bundles: {
        coin_small: {
            id: 'coin_small',
            name: '코인 소형 팩',
            description: '1,000 코인',
            coins: 1000,
            gems: 50,
            icon: '💰'
        },
        coin_medium: {
            id: 'coin_medium',
            name: '코인 중형 팩',
            description: '5,500 코인 (10% 보너스)',
            coins: 5500,
            gems: 250,
            bonus: 10,
            icon: '💰'
        },
        coin_large: {
            id: 'coin_large',
            name: '코인 대형 팩',
            description: '12,000 코인 (20% 보너스)',
            coins: 12000,
            gems: 500,
            bonus: 20,
            icon: '💰'
        }
    },

    // 부스터
    boosters: {
        double_coins: {
            id: 'double_coins',
            name: '코인 2배 부스터',
            description: '30분간 획득 코인 2배',
            duration: 30 * 60 * 1000, // 30분
            multiplier: 2,
            gems: 30,
            icon: '⚡'
        },
        double_xp: {
            id: 'double_xp',
            name: '경험치 2배 부스터',
            description: '30분간 획득 경험치 2배',
            duration: 30 * 60 * 1000,
            multiplier: 2,
            gems: 30,
            icon: '⭐'
        },
        resource_boost: {
            id: 'resource_boost',
            name: '자원 부스터',
            description: '1시간 동안 자원 수집 50% 증가',
            duration: 60 * 60 * 1000,
            multiplier: 1.5,
            gems: 50,
            icon: '💎'
        }
    },

    // 스킨/커스터마이징
    skins: {
        commander_gold: {
            id: 'commander_gold',
            name: '골드 커맨더',
            description: '본부 건물 골드 스킨',
            type: 'building',
            target: 'command_center',
            gems: 200,
            icon: '🏆'
        },
        elite_warriors: {
            id: 'elite_warriors',
            name: '엘리트 전사들',
            description: '모든 유닛에 엘리트 이펙트',
            type: 'unit',
            target: 'all',
            gems: 300,
            icon: '⚔️'
        },
        neon_effects: {
            id: 'neon_effects',
            name: '네온 이펙트',
            description: '공격 이펙트가 네온 색상으로 변경',
            type: 'effect',
            target: 'attack',
            gems: 150,
            icon: '🌈'
        }
    },

    // 영구 업그레이드
    permanent_upgrades: {
        starting_resources: {
            id: 'starting_resources',
            name: '시작 자원 증가',
            description: '게임 시작 시 자원 +20%',
            levels: [
                { bonus: 0.1, coins: 1000 },
                { bonus: 0.2, coins: 2500 },
                { bonus: 0.3, coins: 5000 },
                { bonus: 0.4, coins: 10000 },
                { bonus: 0.5, coins: 20000 }
            ],
            maxLevel: 5,
            icon: '📦'
        },
        unit_training_speed: {
            id: 'unit_training_speed',
            name: '유닛 훈련 속도',
            description: '유닛 생산 시간 감소',
            levels: [
                { bonus: 0.05, coins: 800 },
                { bonus: 0.1, coins: 2000 },
                { bonus: 0.15, coins: 4000 },
                { bonus: 0.2, coins: 8000 },
                { bonus: 0.25, coins: 15000 }
            ],
            maxLevel: 5,
            icon: '🏃'
        },
        building_discount: {
            id: 'building_discount',
            name: '건물 비용 할인',
            description: '건물 건설 비용 감소',
            levels: [
                { bonus: 0.05, coins: 1000 },
                { bonus: 0.1, coins: 2500 },
                { bonus: 0.15, coins: 5000 },
                { bonus: 0.2, coins: 10000 }
            ],
            maxLevel: 4,
            icon: '🏗️'
        },
        daily_reward_bonus: {
            id: 'daily_reward_bonus',
            name: '일일 보상 증가',
            description: '일일 보상 코인 증가',
            levels: [
                { bonus: 0.1, coins: 500 },
                { bonus: 0.2, coins: 1500 },
                { bonus: 0.3, coins: 3000 },
                { bonus: 0.5, coins: 6000 }
            ],
            maxLevel: 4,
            icon: '🎁'
        }
    }
};

/**
 * 일일 보상 설정
 */
export const DAILY_REWARDS = [
    { day: 1, coins: 100, gems: 0, description: '1일차' },
    { day: 2, coins: 150, gems: 0, description: '2일차' },
    { day: 3, coins: 200, gems: 5, description: '3일차' },
    { day: 4, coins: 250, gems: 0, description: '4일차' },
    { day: 5, coins: 300, gems: 0, description: '5일차' },
    { day: 6, coins: 400, gems: 10, description: '6일차' },
    { day: 7, coins: 500, gems: 20, description: '7일차 보너스!' }
];

/**
 * 미션 보상 설정
 */
export const MISSION_REWARDS = {
    tutorial: { coins: 200, gems: 10 },
    campaign_easy: { coins: 150, gems: 5 },
    campaign_normal: { coins: 300, gems: 10 },
    campaign_hard: { coins: 500, gems: 20 },
    wave_5: { coins: 100, gems: 0 },
    wave_10: { coins: 300, gems: 15 },
    skirmish_win: { coins: 200, gems: 5 },
    first_win_of_day: { coins: 100, gems: 5 }
};

/**
 * 경제 시스템 클래스
 */
export class EconomySystem {
    constructor(game) {
        this.game = game;

        // 화폐
        this.coins = 0;
        this.gems = 0;

        // 플레이어 레벨 시스템
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = 100;

        // 활성 부스터
        this.activeBoosters = new Map();

        // 구매한 아이템
        this.purchasedSkins = new Set();
        this.permanentUpgradeLevels = new Map();

        // 일일 시스템
        this.dailyLoginStreak = 0;
        this.lastLoginDate = null;
        this.lastDailyRewardDate = null;
        this.firstWinOfDayCollected = false;
        this.lastFirstWinDate = null;

        // 통계
        this.totalCoinsEarned = 0;
        this.totalGemsEarned = 0;
        this.totalCoinsSpent = 0;
        this.totalGemsSpent = 0;

        // 데이터 로드
        this.load();
    }

    /**
     * 초기화
     */
    init() {
        this.checkDailyLogin();
        this.updateBoosterTimers();
    }

    /**
     * 업데이트 (부스터 타이머 체크)
     */
    update(deltaTime) {
        // 만료된 부스터 제거
        const now = Date.now();
        for (const [boosterId, booster] of this.activeBoosters) {
            if (now >= booster.expiresAt) {
                this.activeBoosters.delete(boosterId);
                this.onBoosterExpired(boosterId);
            }
        }
    }

    /**
     * 코인 추가
     */
    addCoins(amount, source = 'unknown') {
        // 코인 부스터 적용
        const booster = this.activeBoosters.get('double_coins');
        if (booster) {
            amount = Math.floor(amount * booster.multiplier);
        }

        this.coins += amount;
        this.totalCoinsEarned += amount;

        console.log(`💰 코인 획득: +${amount} (${source}), 총: ${this.coins}`);

        // UI 업데이트 이벤트
        this.notifyUpdate('coins', amount, source);

        this.save();
        return amount;
    }

    /**
     * 코인 사용
     */
    spendCoins(amount, purpose = 'unknown') {
        if (this.coins < amount) {
            console.log('코인 부족');
            return false;
        }

        this.coins -= amount;
        this.totalCoinsSpent += amount;

        console.log(`💰 코인 사용: -${amount} (${purpose}), 남은: ${this.coins}`);

        this.notifyUpdate('coins', -amount, purpose);
        this.save();
        return true;
    }

    /**
     * 보석 추가
     */
    addGems(amount, source = 'unknown') {
        this.gems += amount;
        this.totalGemsEarned += amount;

        console.log(`💎 보석 획득: +${amount} (${source}), 총: ${this.gems}`);

        this.notifyUpdate('gems', amount, source);
        this.save();
        return amount;
    }

    /**
     * 보석 사용
     */
    spendGems(amount, purpose = 'unknown') {
        if (this.gems < amount) {
            console.log('보석 부족');
            return false;
        }

        this.gems -= amount;
        this.totalGemsSpent += amount;

        console.log(`💎 보석 사용: -${amount} (${purpose}), 남은: ${this.gems}`);

        this.notifyUpdate('gems', -amount, purpose);
        this.save();
        return true;
    }

    /**
     * 경험치 추가
     */
    addExperience(amount, source = 'unknown') {
        // 경험치 부스터 적용
        const booster = this.activeBoosters.get('double_xp');
        if (booster) {
            amount = Math.floor(amount * booster.multiplier);
        }

        this.experience += amount;

        // 레벨업 체크
        while (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
        }

        console.log(`⭐ 경험치 획득: +${amount} (${source}), 총: ${this.experience}/${this.experienceToNextLevel}`);

        this.notifyUpdate('experience', amount, source);
        this.save();
    }

    /**
     * 레벨업
     */
    levelUp() {
        this.experience -= this.experienceToNextLevel;
        this.level++;

        // 다음 레벨에 필요한 경험치 계산 (점진적 증가)
        this.experienceToNextLevel = Math.floor(100 * Math.pow(1.2, this.level - 1));

        // 레벨업 보상
        const coinsReward = this.level * 50;
        const gemsReward = this.level >= 5 && this.level % 5 === 0 ? 10 : 0;

        this.coins += coinsReward;
        if (gemsReward > 0) {
            this.gems += gemsReward;
        }

        console.log(`🎉 레벨업! Lv.${this.level} (+${coinsReward} 코인${gemsReward > 0 ? `, +${gemsReward} 보석` : ''})`);

        // 레벨업 이펙트
        if (this.game && this.game.effects) {
            this.game.effects.showLevelUp(this.level);
        }

        this.notifyUpdate('levelUp', this.level);
    }

    /**
     * 일일 로그인 체크
     */
    checkDailyLogin() {
        const today = new Date().toDateString();

        if (this.lastLoginDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (this.lastLoginDate === yesterday.toDateString()) {
                // 연속 로그인
                this.dailyLoginStreak++;
                if (this.dailyLoginStreak > 7) {
                    this.dailyLoginStreak = 1; // 7일 후 리셋
                }
            } else {
                // 연속 끊김
                this.dailyLoginStreak = 1;
            }

            this.lastLoginDate = today;
            this.firstWinOfDayCollected = false;

            this.save();
        }
    }

    /**
     * 일일 보상 수령 가능 여부
     */
    canClaimDailyReward() {
        const today = new Date().toDateString();
        return this.lastDailyRewardDate !== today;
    }

    /**
     * 일일 보상 수령
     */
    claimDailyReward() {
        if (!this.canClaimDailyReward()) {
            return null;
        }

        const today = new Date().toDateString();
        this.lastDailyRewardDate = today;

        // 보상 결정
        const rewardIndex = Math.min(this.dailyLoginStreak - 1, DAILY_REWARDS.length - 1);
        const reward = DAILY_REWARDS[rewardIndex];

        // 일일 보상 보너스 적용
        const bonusLevel = this.getPermanentUpgradeLevel('daily_reward_bonus');
        const bonusMultiplier = bonusLevel > 0
            ? 1 + SHOP_ITEMS.permanent_upgrades.daily_reward_bonus.levels[bonusLevel - 1].bonus
            : 1;

        const finalCoins = Math.floor(reward.coins * bonusMultiplier);

        this.addCoins(finalCoins, 'daily_reward');
        if (reward.gems > 0) {
            this.addGems(reward.gems, 'daily_reward');
        }

        this.save();

        return {
            day: this.dailyLoginStreak,
            coins: finalCoins,
            gems: reward.gems,
            streak: this.dailyLoginStreak
        };
    }

    /**
     * 첫 승리 보상 수령
     */
    claimFirstWinOfDay() {
        const today = new Date().toDateString();

        if (this.lastFirstWinDate === today) {
            return null;
        }

        this.lastFirstWinDate = today;
        this.firstWinOfDayCollected = true;

        const reward = MISSION_REWARDS.first_win_of_day;
        this.addCoins(reward.coins, 'first_win_of_day');
        this.addGems(reward.gems, 'first_win_of_day');

        this.save();

        return reward;
    }

    /**
     * 미션 완료 보상
     */
    claimMissionReward(missionType, difficulty = null) {
        let rewardKey = missionType;
        if (difficulty) {
            rewardKey = `${missionType}_${difficulty}`;
        }

        const reward = MISSION_REWARDS[rewardKey];
        if (!reward) {
            console.warn('알 수 없는 미션 타입:', rewardKey);
            return null;
        }

        this.addCoins(reward.coins, `mission_${rewardKey}`);
        if (reward.gems > 0) {
            this.addGems(reward.gems, `mission_${rewardKey}`);
        }

        // 경험치도 추가
        const expAmount = reward.coins / 2;
        this.addExperience(expAmount, `mission_${rewardKey}`);

        return reward;
    }

    /**
     * 코인 번들 구매
     */
    purchaseCoinBundle(bundleId) {
        const bundle = SHOP_ITEMS.coin_bundles[bundleId];
        if (!bundle) {
            return { success: false, error: '존재하지 않는 번들' };
        }

        if (!this.spendGems(bundle.gems, `coin_bundle_${bundleId}`)) {
            return { success: false, error: '보석 부족' };
        }

        this.addCoins(bundle.coins, `bundle_${bundleId}`);

        return { success: true, coins: bundle.coins };
    }

    /**
     * 부스터 구매 및 활성화
     */
    purchaseBooster(boosterId) {
        const booster = SHOP_ITEMS.boosters[boosterId];
        if (!booster) {
            return { success: false, error: '존재하지 않는 부스터' };
        }

        if (!this.spendGems(booster.gems, `booster_${boosterId}`)) {
            return { success: false, error: '보석 부족' };
        }

        // 부스터 활성화
        const expiresAt = Date.now() + booster.duration;
        this.activeBoosters.set(boosterId, {
            ...booster,
            activatedAt: Date.now(),
            expiresAt: expiresAt
        });

        console.log(`🚀 부스터 활성화: ${booster.name} (${booster.duration / 60000}분)`);

        this.save();

        return { success: true, expiresAt };
    }

    /**
     * 스킨 구매
     */
    purchaseSkin(skinId) {
        const skin = SHOP_ITEMS.skins[skinId];
        if (!skin) {
            return { success: false, error: '존재하지 않는 스킨' };
        }

        if (this.purchasedSkins.has(skinId)) {
            return { success: false, error: '이미 보유한 스킨' };
        }

        if (!this.spendGems(skin.gems, `skin_${skinId}`)) {
            return { success: false, error: '보석 부족' };
        }

        this.purchasedSkins.add(skinId);
        this.save();

        return { success: true, skin };
    }

    /**
     * 영구 업그레이드 구매
     */
    purchasePermanentUpgrade(upgradeId) {
        const upgrade = SHOP_ITEMS.permanent_upgrades[upgradeId];
        if (!upgrade) {
            return { success: false, error: '존재하지 않는 업그레이드' };
        }

        const currentLevel = this.getPermanentUpgradeLevel(upgradeId);
        if (currentLevel >= upgrade.maxLevel) {
            return { success: false, error: '최대 레벨 도달' };
        }

        const nextLevel = upgrade.levels[currentLevel];
        if (!this.spendCoins(nextLevel.coins, `upgrade_${upgradeId}`)) {
            return { success: false, error: '코인 부족' };
        }

        this.permanentUpgradeLevels.set(upgradeId, currentLevel + 1);
        this.save();

        return {
            success: true,
            newLevel: currentLevel + 1,
            bonus: nextLevel.bonus
        };
    }

    /**
     * 영구 업그레이드 레벨 조회
     */
    getPermanentUpgradeLevel(upgradeId) {
        return this.permanentUpgradeLevels.get(upgradeId) || 0;
    }

    /**
     * 영구 업그레이드 보너스 조회
     */
    getPermanentUpgradeBonus(upgradeId) {
        const upgrade = SHOP_ITEMS.permanent_upgrades[upgradeId];
        if (!upgrade) return 0;

        const level = this.getPermanentUpgradeLevel(upgradeId);
        if (level === 0) return 0;

        return upgrade.levels[level - 1].bonus;
    }

    /**
     * 스킨 보유 여부
     */
    hasSkin(skinId) {
        return this.purchasedSkins.has(skinId);
    }

    /**
     * 부스터 활성 여부
     */
    isBoosterActive(boosterId) {
        return this.activeBoosters.has(boosterId);
    }

    /**
     * 부스터 남은 시간 (밀리초)
     */
    getBoosterRemainingTime(boosterId) {
        const booster = this.activeBoosters.get(boosterId);
        if (!booster) return 0;

        return Math.max(0, booster.expiresAt - Date.now());
    }

    /**
     * 자원 배율 (자원 부스터)
     */
    getResourceMultiplier() {
        const booster = this.activeBoosters.get('resource_boost');
        return booster ? booster.multiplier : 1;
    }

    /**
     * 부스터 만료 처리
     */
    onBoosterExpired(boosterId) {
        console.log(`⏰ 부스터 만료: ${boosterId}`);
        this.notifyUpdate('boosterExpired', boosterId);
    }

    /**
     * 부스터 타이머 업데이트
     */
    updateBoosterTimers() {
        const now = Date.now();
        for (const [boosterId, booster] of this.activeBoosters) {
            if (now >= booster.expiresAt) {
                this.activeBoosters.delete(boosterId);
            }
        }
    }

    /**
     * UI 업데이트 알림
     */
    notifyUpdate(type, value, source = null) {
        if (this.game && this.game.ui) {
            this.game.ui.onEconomyUpdate(type, value, source);
        }
    }

    /**
     * 저장
     */
    save() {
        const data = {
            coins: this.coins,
            gems: this.gems,
            level: this.level,
            experience: this.experience,
            experienceToNextLevel: this.experienceToNextLevel,
            activeBoosters: Array.from(this.activeBoosters.entries()),
            purchasedSkins: Array.from(this.purchasedSkins),
            permanentUpgradeLevels: Array.from(this.permanentUpgradeLevels.entries()),
            dailyLoginStreak: this.dailyLoginStreak,
            lastLoginDate: this.lastLoginDate,
            lastDailyRewardDate: this.lastDailyRewardDate,
            firstWinOfDayCollected: this.firstWinOfDayCollected,
            lastFirstWinDate: this.lastFirstWinDate,
            totalCoinsEarned: this.totalCoinsEarned,
            totalGemsEarned: this.totalGemsEarned,
            totalCoinsSpent: this.totalCoinsSpent,
            totalGemsSpent: this.totalGemsSpent
        };

        try {
            localStorage.setItem('starsiege_economy', JSON.stringify(data));
        } catch (e) {
            console.error('경제 데이터 저장 실패:', e);
        }
    }

    /**
     * 로드
     */
    load() {
        try {
            const saved = localStorage.getItem('starsiege_economy');
            if (!saved) {
                // 신규 플레이어 초기 보너스
                this.coins = 500;
                this.gems = 50;
                return;
            }

            const data = JSON.parse(saved);

            this.coins = data.coins || 0;
            this.gems = data.gems || 0;
            this.level = data.level || 1;
            this.experience = data.experience || 0;
            this.experienceToNextLevel = data.experienceToNextLevel || 100;

            this.activeBoosters = new Map(data.activeBoosters || []);
            this.purchasedSkins = new Set(data.purchasedSkins || []);
            this.permanentUpgradeLevels = new Map(data.permanentUpgradeLevels || []);

            this.dailyLoginStreak = data.dailyLoginStreak || 0;
            this.lastLoginDate = data.lastLoginDate || null;
            this.lastDailyRewardDate = data.lastDailyRewardDate || null;
            this.firstWinOfDayCollected = data.firstWinOfDayCollected || false;
            this.lastFirstWinDate = data.lastFirstWinDate || null;

            this.totalCoinsEarned = data.totalCoinsEarned || 0;
            this.totalGemsEarned = data.totalGemsEarned || 0;
            this.totalCoinsSpent = data.totalCoinsSpent || 0;
            this.totalGemsSpent = data.totalGemsSpent || 0;

            console.log(`💰 경제 데이터 로드: ${this.coins} 코인, ${this.gems} 보석, Lv.${this.level}`);

        } catch (e) {
            console.error('경제 데이터 로드 실패:', e);
            this.coins = 500;
            this.gems = 50;
        }
    }

    /**
     * 데이터 내보내기
     */
    serialize() {
        return {
            coins: this.coins,
            gems: this.gems,
            level: this.level,
            experience: this.experience,
            experienceToNextLevel: this.experienceToNextLevel,
            activeBoosters: Array.from(this.activeBoosters.entries()),
            purchasedSkins: Array.from(this.purchasedSkins),
            permanentUpgradeLevels: Array.from(this.permanentUpgradeLevels.entries()),
            dailyLoginStreak: this.dailyLoginStreak,
            lastLoginDate: this.lastLoginDate,
            lastDailyRewardDate: this.lastDailyRewardDate,
            totalCoinsEarned: this.totalCoinsEarned,
            totalGemsEarned: this.totalGemsEarned,
            totalCoinsSpent: this.totalCoinsSpent,
            totalGemsSpent: this.totalGemsSpent
        };
    }

    /**
     * 데이터 가져오기
     */
    deserialize(data) {
        if (!data) return;

        this.coins = data.coins ?? this.coins;
        this.gems = data.gems ?? this.gems;
        this.level = data.level ?? this.level;
        this.experience = data.experience ?? this.experience;
        this.experienceToNextLevel = data.experienceToNextLevel ?? this.experienceToNextLevel;

        if (data.activeBoosters) {
            this.activeBoosters = new Map(data.activeBoosters);
        }
        if (data.purchasedSkins) {
            this.purchasedSkins = new Set(data.purchasedSkins);
        }
        if (data.permanentUpgradeLevels) {
            this.permanentUpgradeLevels = new Map(data.permanentUpgradeLevels);
        }

        this.dailyLoginStreak = data.dailyLoginStreak ?? this.dailyLoginStreak;
        this.lastLoginDate = data.lastLoginDate ?? this.lastLoginDate;
        this.lastDailyRewardDate = data.lastDailyRewardDate ?? this.lastDailyRewardDate;
        this.totalCoinsEarned = data.totalCoinsEarned ?? this.totalCoinsEarned;
        this.totalGemsEarned = data.totalGemsEarned ?? this.totalGemsEarned;
        this.totalCoinsSpent = data.totalCoinsSpent ?? this.totalCoinsSpent;
        this.totalGemsSpent = data.totalGemsSpent ?? this.totalGemsSpent;

        this.save();
    }

    /**
     * 리셋 (디버그용)
     */
    reset() {
        localStorage.removeItem('starsiege_economy');
        this.coins = 500;
        this.gems = 50;
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = 100;
        this.activeBoosters.clear();
        this.purchasedSkins.clear();
        this.permanentUpgradeLevels.clear();
        this.dailyLoginStreak = 0;
        this.lastLoginDate = null;
        this.lastDailyRewardDate = null;
        this.firstWinOfDayCollected = false;
        this.lastFirstWinDate = null;
        this.totalCoinsEarned = 0;
        this.totalGemsEarned = 0;
        this.totalCoinsSpent = 0;
        this.totalGemsSpent = 0;
    }
}
