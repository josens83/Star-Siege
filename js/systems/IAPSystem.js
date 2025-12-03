/**
 * Star Siege - 인앱 구매 시스템
 * 웹/모바일 앱 결제 처리
 */

/**
 * IAP 상품 목록
 */
export const IAP_PRODUCTS = {
    // 보석 패키지
    gems: {
        gems_tiny: {
            id: 'gems_tiny',
            name: '보석 소형 팩',
            description: '50 보석',
            gems: 50,
            price: 0.99,
            currency: 'USD',
            icon: '💎',
            popular: false
        },
        gems_small: {
            id: 'gems_small',
            name: '보석 중형 팩',
            description: '150 보석 (+20 보너스)',
            gems: 170,
            price: 2.99,
            currency: 'USD',
            icon: '💎',
            bonus: 20,
            popular: false
        },
        gems_medium: {
            id: 'gems_medium',
            name: '보석 대형 팩',
            description: '500 보석 (+100 보너스)',
            gems: 600,
            price: 9.99,
            currency: 'USD',
            icon: '💎',
            bonus: 100,
            popular: true
        },
        gems_large: {
            id: 'gems_large',
            name: '보석 특대 팩',
            description: '1200 보석 (+300 보너스)',
            gems: 1500,
            price: 19.99,
            currency: 'USD',
            icon: '💎',
            bonus: 300,
            popular: false
        },
        gems_mega: {
            id: 'gems_mega',
            name: '보석 메가 팩',
            description: '3000 보석 (+1000 보너스)',
            gems: 4000,
            price: 49.99,
            currency: 'USD',
            icon: '💎',
            bonus: 1000,
            popular: false
        }
    },

    // 스타터 팩 (1회 구매)
    starter_packs: {
        starter_pack: {
            id: 'starter_pack',
            name: '스타터 팩',
            description: '500 보석 + 5000 코인 + 모든 부스터 1개씩',
            gems: 500,
            coins: 5000,
            boosters: ['double_coins', 'double_xp', 'resource_boost'],
            price: 4.99,
            currency: 'USD',
            icon: '🎁',
            oneTime: true,
            popular: true
        },
        pro_pack: {
            id: 'pro_pack',
            name: '프로 팩',
            description: '1500 보석 + 15000 코인 + 골드 커맨더 스킨',
            gems: 1500,
            coins: 15000,
            skins: ['commander_gold'],
            price: 14.99,
            currency: 'USD',
            icon: '🏆',
            oneTime: true,
            popular: false
        },
        elite_pack: {
            id: 'elite_pack',
            name: '엘리트 팩',
            description: '5000 보석 + 50000 코인 + 모든 스킨',
            gems: 5000,
            coins: 50000,
            skins: ['commander_gold', 'elite_warriors', 'neon_effects'],
            price: 49.99,
            currency: 'USD',
            icon: '👑',
            oneTime: true,
            popular: false
        }
    },

    // 구독 (프리미엄 패스)
    subscriptions: {
        weekly_pass: {
            id: 'weekly_pass',
            name: '주간 프리미엄 패스',
            description: '매일 50 보석 + 500 코인 (7일간)',
            dailyGems: 50,
            dailyCoins: 500,
            duration: 7,
            price: 2.99,
            currency: 'USD',
            icon: '📅',
            popular: false
        },
        monthly_pass: {
            id: 'monthly_pass',
            name: '월간 프리미엄 패스',
            description: '매일 100 보석 + 1000 코인 (30일간)',
            dailyGems: 100,
            dailyCoins: 1000,
            duration: 30,
            price: 9.99,
            currency: 'USD',
            icon: '📅',
            popular: true,
            bestValue: true
        }
    },

    // 광고 제거
    remove_ads: {
        remove_ads: {
            id: 'remove_ads',
            name: '광고 제거',
            description: '모든 광고를 영구적으로 제거',
            price: 4.99,
            currency: 'USD',
            icon: '🚫',
            oneTime: true,
            popular: false
        }
    }
};

/**
 * IAP 시스템 클래스
 */
export class IAPSystem {
    constructor(game) {
        this.game = game;

        // 구매 이력
        this.purchases = new Map();
        this.subscriptions = new Map();

        // 1회성 구매 여부
        this.oneTimePurchased = new Set();

        // 광고 제거 여부
        this.adsRemoved = false;

        // 프리미엄 패스 상태
        this.activePass = null;
        this.passExpiresAt = null;
        this.lastPassClaimDate = null;

        // 결제 상태
        this.isPurchasing = false;

        // 데이터 로드
        this.load();
    }

    /**
     * 초기화
     */
    init() {
        // 패스 만료 체크
        this.checkPassExpiration();

        // 일일 패스 보상 체크
        this.checkPassDailyReward();
    }

    /**
     * 상품 정보 조회
     */
    getProduct(productId) {
        for (const category of Object.values(IAP_PRODUCTS)) {
            if (category[productId]) {
                return category[productId];
            }
        }
        return null;
    }

    /**
     * 카테고리별 상품 목록
     */
    getProductsByCategory(category) {
        return IAP_PRODUCTS[category] || {};
    }

    /**
     * 구매 가능 여부 확인
     */
    canPurchase(productId) {
        const product = this.getProduct(productId);
        if (!product) return { canPurchase: false, reason: '상품을 찾을 수 없습니다' };

        if (product.oneTime && this.oneTimePurchased.has(productId)) {
            return { canPurchase: false, reason: '이미 구매한 상품입니다' };
        }

        return { canPurchase: true };
    }

    /**
     * 구매 처리
     */
    async purchase(productId) {
        if (this.isPurchasing) {
            return { success: false, error: '결제가 진행 중입니다' };
        }

        const product = this.getProduct(productId);
        if (!product) {
            return { success: false, error: '상품을 찾을 수 없습니다' };
        }

        const canBuy = this.canPurchase(productId);
        if (!canBuy.canPurchase) {
            return { success: false, error: canBuy.reason };
        }

        this.isPurchasing = true;

        try {
            // 결제 처리 (실제 환경에서는 결제 API 연동)
            const result = await this.processPayment(product);

            if (result.success) {
                // 구매 완료 처리
                await this.completePurchase(product);

                this.isPurchasing = false;
                return { success: true, product };
            } else {
                this.isPurchasing = false;
                return { success: false, error: result.error };
            }
        } catch (error) {
            this.isPurchasing = false;
            console.error('구매 처리 오류:', error);
            return { success: false, error: '결제 처리 중 오류가 발생했습니다' };
        }
    }

    /**
     * 결제 처리 (시뮬레이션/테스트용)
     */
    async processPayment(product) {
        // 실제 환경에서는 여기서 결제 API 호출
        // - Web: Stripe, PayPal 등
        // - iOS: StoreKit
        // - Android: Google Play Billing

        // 개발/테스트용 시뮬레이션
        console.log(`💳 결제 처리 중: ${product.name} ($${product.price})`);

        // 결제 다이얼로그 시뮬레이션
        return new Promise((resolve) => {
            // 실제 환경에서는 결제 UI 표시
            const confirmed = confirm(`${product.name}을(를) $${product.price}에 구매하시겠습니까?`);

            if (confirmed) {
                resolve({ success: true });
            } else {
                resolve({ success: false, error: '사용자가 취소했습니다' });
            }
        });
    }

    /**
     * 구매 완료 처리
     */
    async completePurchase(product) {
        console.log(`✅ 구매 완료: ${product.name}`);

        // 구매 기록
        const purchaseRecord = {
            productId: product.id,
            purchaseDate: new Date().toISOString(),
            price: product.price,
            currency: product.currency
        };

        this.purchases.set(Date.now().toString(), purchaseRecord);

        // 1회성 구매 기록
        if (product.oneTime) {
            this.oneTimePurchased.add(product.id);
        }

        // 보상 지급
        await this.grantRewards(product);

        this.save();
    }

    /**
     * 보상 지급
     */
    async grantRewards(product) {
        const economy = this.game.economy;
        if (!economy) {
            console.error('경제 시스템을 찾을 수 없습니다');
            return;
        }

        // 보석 지급
        if (product.gems) {
            economy.addGems(product.gems, `iap_${product.id}`);
        }

        // 코인 지급
        if (product.coins) {
            economy.addCoins(product.coins, `iap_${product.id}`);
        }

        // 부스터 지급
        if (product.boosters) {
            for (const boosterId of product.boosters) {
                // 부스터를 바로 활성화하지 않고 인벤토리에 추가하는 방식으로도 가능
                // 여기서는 간단히 보석으로 환산
                economy.addGems(30, `iap_booster_${boosterId}`);
            }
        }

        // 스킨 지급
        if (product.skins) {
            for (const skinId of product.skins) {
                economy.purchasedSkins.add(skinId);
            }
        }

        // 광고 제거
        if (product.id === 'remove_ads') {
            this.adsRemoved = true;
        }

        // 프리미엄 패스 활성화
        if (product.duration) {
            this.activatePass(product);
        }
    }

    /**
     * 프리미엄 패스 활성화
     */
    activatePass(product) {
        const now = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(now.getDate() + product.duration);

        this.activePass = product.id;
        this.passExpiresAt = expiresAt.toISOString();
        this.lastPassClaimDate = null; // 리셋하여 오늘 보상 받을 수 있게

        this.subscriptions.set(product.id, {
            activatedAt: now.toISOString(),
            expiresAt: this.passExpiresAt,
            dailyGems: product.dailyGems,
            dailyCoins: product.dailyCoins
        });

        console.log(`📅 프리미엄 패스 활성화: ${product.name} (${product.duration}일)`);

        this.save();
    }

    /**
     * 패스 만료 체크
     */
    checkPassExpiration() {
        if (!this.passExpiresAt) return;

        const now = new Date();
        const expiresAt = new Date(this.passExpiresAt);

        if (now >= expiresAt) {
            console.log('📅 프리미엄 패스 만료');
            this.activePass = null;
            this.passExpiresAt = null;
            this.save();
        }
    }

    /**
     * 패스 일일 보상 체크
     */
    checkPassDailyReward() {
        if (!this.activePass) return null;

        const today = new Date().toDateString();
        if (this.lastPassClaimDate === today) {
            return null; // 이미 오늘 수령함
        }

        return this.activePass; // 수령 가능한 패스 ID 반환
    }

    /**
     * 패스 일일 보상 수령
     */
    claimPassDailyReward() {
        if (!this.activePass) {
            return { success: false, error: '활성화된 패스가 없습니다' };
        }

        const today = new Date().toDateString();
        if (this.lastPassClaimDate === today) {
            return { success: false, error: '오늘 이미 수령했습니다' };
        }

        const subscription = this.subscriptions.get(this.activePass);
        if (!subscription) {
            return { success: false, error: '패스 정보를 찾을 수 없습니다' };
        }

        this.lastPassClaimDate = today;

        const economy = this.game.economy;
        if (economy) {
            economy.addGems(subscription.dailyGems, 'pass_daily');
            economy.addCoins(subscription.dailyCoins, 'pass_daily');
        }

        this.save();

        return {
            success: true,
            gems: subscription.dailyGems,
            coins: subscription.dailyCoins
        };
    }

    /**
     * 패스 남은 일수
     */
    getPassRemainingDays() {
        if (!this.passExpiresAt) return 0;

        const now = new Date();
        const expiresAt = new Date(this.passExpiresAt);
        const diff = expiresAt - now;

        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    /**
     * 광고 시청 보상 (보상형 광고)
     */
    async watchAdForReward(rewardType = 'gems') {
        if (this.adsRemoved) {
            // 광고 제거 구매자에게는 무료 보상 제공
            return this.grantAdReward(rewardType, true);
        }

        // 실제 환경에서는 광고 SDK 연동
        console.log('📺 광고 시청 중...');

        // 광고 시뮬레이션
        return new Promise((resolve) => {
            // 실제 광고 시청 시뮬레이션 (3초)
            setTimeout(() => {
                const result = this.grantAdReward(rewardType, false);
                resolve(result);
            }, 1000);
        });
    }

    /**
     * 광고 보상 지급
     */
    grantAdReward(rewardType, isPremium) {
        const economy = this.game.economy;
        if (!economy) {
            return { success: false, error: '경제 시스템 오류' };
        }

        let reward = {};

        switch (rewardType) {
            case 'gems':
                const gems = isPremium ? 10 : 5;
                economy.addGems(gems, 'ad_reward');
                reward = { gems };
                break;

            case 'coins':
                const coins = isPremium ? 200 : 100;
                economy.addCoins(coins, 'ad_reward');
                reward = { coins };
                break;

            case 'booster':
                // 15분 부스터
                const boosterDuration = isPremium ? 30 : 15;
                // 임시 부스터 적용 (간소화)
                reward = { boosterMinutes: boosterDuration };
                break;

            case 'continue':
                // 게임 이어하기 (패배 후)
                reward = { continue: true };
                break;

            default:
                return { success: false, error: '알 수 없는 보상 타입' };
        }

        console.log(`🎁 광고 보상 지급:`, reward);

        return { success: true, reward, isPremium };
    }

    /**
     * 구매 복원 (iOS)
     */
    async restorePurchases() {
        console.log('🔄 구매 복원 중...');

        // 실제 환경에서는 스토어 API를 통해 구매 이력 조회
        // 여기서는 로컬 저장소에서 복원

        try {
            const saved = localStorage.getItem('starsiege_iap');
            if (saved) {
                const data = JSON.parse(saved);

                if (data.oneTimePurchased) {
                    this.oneTimePurchased = new Set(data.oneTimePurchased);
                }
                if (data.adsRemoved) {
                    this.adsRemoved = true;
                }

                console.log('✅ 구매 복원 완료');
                return { success: true, restored: this.oneTimePurchased.size };
            }

            return { success: true, restored: 0 };
        } catch (error) {
            console.error('구매 복원 오류:', error);
            return { success: false, error: '복원 중 오류가 발생했습니다' };
        }
    }

    /**
     * 영수증 검증 (서버 사이드)
     */
    async verifyReceipt(receipt, platform) {
        // 실제 환경에서는 서버를 통해 영수증 검증
        // - iOS: Apple 서버에 영수증 검증 요청
        // - Android: Google Play Developer API로 검증

        console.log(`🔐 영수증 검증 중... (${platform})`);

        // 시뮬레이션: 항상 성공
        return { valid: true };
    }

    /**
     * 저장
     */
    save() {
        const data = {
            purchases: Array.from(this.purchases.entries()),
            subscriptions: Array.from(this.subscriptions.entries()),
            oneTimePurchased: Array.from(this.oneTimePurchased),
            adsRemoved: this.adsRemoved,
            activePass: this.activePass,
            passExpiresAt: this.passExpiresAt,
            lastPassClaimDate: this.lastPassClaimDate
        };

        try {
            localStorage.setItem('starsiege_iap', JSON.stringify(data));
        } catch (e) {
            console.error('IAP 데이터 저장 실패:', e);
        }
    }

    /**
     * 로드
     */
    load() {
        try {
            const saved = localStorage.getItem('starsiege_iap');
            if (!saved) return;

            const data = JSON.parse(saved);

            this.purchases = new Map(data.purchases || []);
            this.subscriptions = new Map(data.subscriptions || []);
            this.oneTimePurchased = new Set(data.oneTimePurchased || []);
            this.adsRemoved = data.adsRemoved || false;
            this.activePass = data.activePass || null;
            this.passExpiresAt = data.passExpiresAt || null;
            this.lastPassClaimDate = data.lastPassClaimDate || null;

            console.log(`💳 IAP 데이터 로드: ${this.purchases.size} 구매 기록`);

        } catch (e) {
            console.error('IAP 데이터 로드 실패:', e);
        }
    }

    /**
     * 데이터 내보내기
     */
    serialize() {
        return {
            purchases: Array.from(this.purchases.entries()),
            subscriptions: Array.from(this.subscriptions.entries()),
            oneTimePurchased: Array.from(this.oneTimePurchased),
            adsRemoved: this.adsRemoved,
            activePass: this.activePass,
            passExpiresAt: this.passExpiresAt,
            lastPassClaimDate: this.lastPassClaimDate
        };
    }

    /**
     * 데이터 가져오기
     */
    deserialize(data) {
        if (!data) return;

        if (data.purchases) {
            this.purchases = new Map(data.purchases);
        }
        if (data.subscriptions) {
            this.subscriptions = new Map(data.subscriptions);
        }
        if (data.oneTimePurchased) {
            this.oneTimePurchased = new Set(data.oneTimePurchased);
        }

        this.adsRemoved = data.adsRemoved ?? this.adsRemoved;
        this.activePass = data.activePass ?? this.activePass;
        this.passExpiresAt = data.passExpiresAt ?? this.passExpiresAt;
        this.lastPassClaimDate = data.lastPassClaimDate ?? this.lastPassClaimDate;

        this.save();
    }

    /**
     * 리셋 (디버그용)
     */
    reset() {
        localStorage.removeItem('starsiege_iap');
        this.purchases.clear();
        this.subscriptions.clear();
        this.oneTimePurchased.clear();
        this.adsRemoved = false;
        this.activePass = null;
        this.passExpiresAt = null;
        this.lastPassClaimDate = null;
    }
}
