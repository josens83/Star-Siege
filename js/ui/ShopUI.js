/**
 * Star Siege - 상점 UI
 * 코인, 보석, 아이템 구매 인터페이스
 */

import { SHOP_ITEMS } from '../systems/EconomySystem.js';
import { IAP_PRODUCTS } from '../systems/IAPSystem.js';

export class ShopUI {
    constructor(game) {
        this.game = game;
        this.currentTab = 'gems';
        this.isVisible = false;

        this.container = null;
        this.init();
    }

    /**
     * 초기화
     */
    init() {
        this.createContainer();
        this.setupEventListeners();
    }

    /**
     * 컨테이너 생성
     */
    createContainer() {
        // 기존 컨테이너 제거
        const existing = document.getElementById('shop-overlay');
        if (existing) existing.remove();

        this.container = document.createElement('div');
        this.container.id = 'shop-overlay';
        this.container.className = 'overlay';
        this.container.innerHTML = this.getHTML();
        this.container.style.display = 'none';

        document.body.appendChild(this.container);
    }

    /**
     * HTML 생성
     */
    getHTML() {
        return `
            <div class="shop-panel overlay-panel">
                <div class="shop-header">
                    <h2>상점</h2>
                    <div class="currency-display">
                        <span class="coins-display">
                            <span class="icon">💰</span>
                            <span id="shop-coins">0</span>
                        </span>
                        <span class="gems-display">
                            <span class="icon">💎</span>
                            <span id="shop-gems">0</span>
                        </span>
                    </div>
                    <button class="close-btn" id="shop-close-btn">&times;</button>
                </div>

                <div class="shop-tabs">
                    <button class="shop-tab active" data-tab="gems">보석</button>
                    <button class="shop-tab" data-tab="coins">코인</button>
                    <button class="shop-tab" data-tab="boosters">부스터</button>
                    <button class="shop-tab" data-tab="skins">스킨</button>
                    <button class="shop-tab" data-tab="upgrades">업그레이드</button>
                    <button class="shop-tab" data-tab="packs">패키지</button>
                </div>

                <div class="shop-content" id="shop-content">
                    <!-- 탭 컨텐츠가 여기에 렌더링됨 -->
                </div>

                <div class="shop-footer">
                    <p class="shop-notice">실제 결제는 앱스토어를 통해 진행됩니다.</p>
                </div>
            </div>
        `;
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 닫기 버튼
        this.container.querySelector('#shop-close-btn').addEventListener('click', () => {
            this.hide();
        });

        // 탭 버튼들
        this.container.querySelectorAll('.shop-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 배경 클릭 시 닫기
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.hide();
            }
        });
    }

    /**
     * 표시
     */
    show() {
        this.isVisible = true;
        this.container.style.display = 'flex';
        this.updateCurrencyDisplay();
        this.renderTab(this.currentTab);

        // 오디오
        if (this.game.audioManager) {
            this.game.audioManager.playSound('ui_click');
        }
    }

    /**
     * 숨기기
     */
    hide() {
        this.isVisible = false;
        this.container.style.display = 'none';

        if (this.game.audioManager) {
            this.game.audioManager.playSound('ui_click');
        }
    }

    /**
     * 탭 전환
     */
    switchTab(tabId) {
        this.currentTab = tabId;

        // 탭 버튼 활성화 상태 업데이트
        this.container.querySelectorAll('.shop-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });

        this.renderTab(tabId);

        if (this.game.audioManager) {
            this.game.audioManager.playSound('ui_hover');
        }
    }

    /**
     * 탭 렌더링
     */
    renderTab(tabId) {
        const content = this.container.querySelector('#shop-content');

        switch (tabId) {
            case 'gems':
                content.innerHTML = this.renderGemsTab();
                break;
            case 'coins':
                content.innerHTML = this.renderCoinsTab();
                break;
            case 'boosters':
                content.innerHTML = this.renderBoostersTab();
                break;
            case 'skins':
                content.innerHTML = this.renderSkinsTab();
                break;
            case 'upgrades':
                content.innerHTML = this.renderUpgradesTab();
                break;
            case 'packs':
                content.innerHTML = this.renderPacksTab();
                break;
        }

        this.attachItemListeners();
    }

    /**
     * 보석 탭 렌더링
     */
    renderGemsTab() {
        const gems = IAP_PRODUCTS.gems;
        let html = '<div class="shop-items gems-items">';

        for (const [id, product] of Object.entries(gems)) {
            html += this.renderIAPItem(product);
        }

        html += '</div>';
        return html;
    }

    /**
     * 코인 탭 렌더링
     */
    renderCoinsTab() {
        const coins = SHOP_ITEMS.coin_bundles;
        let html = '<div class="shop-items coin-items">';

        for (const [id, item] of Object.entries(coins)) {
            html += this.renderCoinItem(item);
        }

        html += '</div>';
        return html;
    }

    /**
     * 부스터 탭 렌더링
     */
    renderBoostersTab() {
        const boosters = SHOP_ITEMS.boosters;
        let html = '<div class="shop-items booster-items">';

        for (const [id, item] of Object.entries(boosters)) {
            const isActive = this.game.economy?.isBoosterActive(id);
            html += this.renderBoosterItem(item, isActive);
        }

        html += '</div>';
        return html;
    }

    /**
     * 스킨 탭 렌더링
     */
    renderSkinsTab() {
        const skins = SHOP_ITEMS.skins;
        let html = '<div class="shop-items skin-items">';

        for (const [id, item] of Object.entries(skins)) {
            const owned = this.game.economy?.hasSkin(id);
            html += this.renderSkinItem(item, owned);
        }

        html += '</div>';
        return html;
    }

    /**
     * 업그레이드 탭 렌더링
     */
    renderUpgradesTab() {
        const upgrades = SHOP_ITEMS.permanent_upgrades;
        let html = '<div class="shop-items upgrade-items">';

        for (const [id, item] of Object.entries(upgrades)) {
            const level = this.game.economy?.getPermanentUpgradeLevel(id) || 0;
            html += this.renderUpgradeItem(item, level);
        }

        html += '</div>';
        return html;
    }

    /**
     * 패키지 탭 렌더링
     */
    renderPacksTab() {
        const starterPacks = IAP_PRODUCTS.starter_packs;
        const subscriptions = IAP_PRODUCTS.subscriptions;

        let html = '<div class="shop-section"><h3>스타터 패키지</h3><div class="shop-items pack-items">';

        for (const [id, product] of Object.entries(starterPacks)) {
            const purchased = this.game.iap?.oneTimePurchased.has(id);
            html += this.renderPackItem(product, purchased);
        }

        html += '</div></div>';

        html += '<div class="shop-section"><h3>프리미엄 패스</h3><div class="shop-items subscription-items">';

        for (const [id, product] of Object.entries(subscriptions)) {
            const active = this.game.iap?.activePass === id;
            html += this.renderSubscriptionItem(product, active);
        }

        html += '</div></div>';

        return html;
    }

    /**
     * IAP 아이템 렌더링
     */
    renderIAPItem(product) {
        const popularBadge = product.popular ? '<span class="badge popular">인기</span>' : '';
        const bonusText = product.bonus ? `<span class="bonus">+${product.bonus} 보너스!</span>` : '';

        return `
            <div class="shop-item iap-item" data-product-id="${product.id}" data-type="iap">
                ${popularBadge}
                <div class="item-icon">${product.icon}</div>
                <div class="item-info">
                    <div class="item-name">${product.name}</div>
                    <div class="item-description">${product.description}</div>
                    ${bonusText}
                </div>
                <button class="buy-btn price-btn">$${product.price.toFixed(2)}</button>
            </div>
        `;
    }

    /**
     * 코인 아이템 렌더링
     */
    renderCoinItem(item) {
        const bonusText = item.bonus ? `<span class="bonus">+${item.bonus}% 보너스!</span>` : '';

        return `
            <div class="shop-item coin-item" data-item-id="${item.id}" data-type="coin_bundle">
                <div class="item-icon">${item.icon}</div>
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-description">${item.description}</div>
                    ${bonusText}
                </div>
                <button class="buy-btn gems-price">
                    <span class="icon">💎</span> ${item.gems}
                </button>
            </div>
        `;
    }

    /**
     * 부스터 아이템 렌더링
     */
    renderBoosterItem(item, isActive) {
        const statusClass = isActive ? 'active' : '';
        const statusText = isActive ? '활성화됨' : '';
        const duration = item.duration / 60000;

        return `
            <div class="shop-item booster-item ${statusClass}" data-item-id="${item.id}" data-type="booster">
                <div class="item-icon">${item.icon}</div>
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-description">${item.description}</div>
                    <div class="item-duration">${duration}분 지속</div>
                    ${statusText ? `<div class="item-status">${statusText}</div>` : ''}
                </div>
                <button class="buy-btn gems-price" ${isActive ? 'disabled' : ''}>
                    <span class="icon">💎</span> ${item.gems}
                </button>
            </div>
        `;
    }

    /**
     * 스킨 아이템 렌더링
     */
    renderSkinItem(item, owned) {
        const statusClass = owned ? 'owned' : '';
        const buttonText = owned ? '보유중' : `<span class="icon">💎</span> ${item.gems}`;

        return `
            <div class="shop-item skin-item ${statusClass}" data-item-id="${item.id}" data-type="skin">
                <div class="item-icon">${item.icon}</div>
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-description">${item.description}</div>
                </div>
                <button class="buy-btn gems-price" ${owned ? 'disabled' : ''}>
                    ${buttonText}
                </button>
            </div>
        `;
    }

    /**
     * 업그레이드 아이템 렌더링
     */
    renderUpgradeItem(item, currentLevel) {
        const maxed = currentLevel >= item.maxLevel;
        const nextLevel = item.levels[currentLevel];
        const levelDisplay = `Lv.${currentLevel}/${item.maxLevel}`;

        let buttonContent;
        if (maxed) {
            buttonContent = '최대 레벨';
        } else {
            buttonContent = `<span class="icon">💰</span> ${nextLevel.coins}`;
        }

        // 진행 바
        const progressPercent = (currentLevel / item.maxLevel) * 100;

        return `
            <div class="shop-item upgrade-item ${maxed ? 'maxed' : ''}" data-item-id="${item.id}" data-type="upgrade">
                <div class="item-icon">${item.icon}</div>
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-description">${item.description}</div>
                    <div class="item-level">${levelDisplay}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    ${!maxed ? `<div class="next-bonus">다음: +${(nextLevel.bonus * 100).toFixed(0)}%</div>` : ''}
                </div>
                <button class="buy-btn coins-price" ${maxed ? 'disabled' : ''}>
                    ${buttonContent}
                </button>
            </div>
        `;
    }

    /**
     * 패키지 아이템 렌더링
     */
    renderPackItem(product, purchased) {
        const popularBadge = product.popular ? '<span class="badge popular">인기</span>' : '';

        return `
            <div class="shop-item pack-item ${purchased ? 'purchased' : ''}" data-product-id="${product.id}" data-type="pack">
                ${popularBadge}
                <div class="item-icon">${product.icon}</div>
                <div class="item-info">
                    <div class="item-name">${product.name}</div>
                    <div class="item-description">${product.description}</div>
                    ${product.oneTime ? '<div class="one-time">1회 구매</div>' : ''}
                </div>
                <button class="buy-btn price-btn" ${purchased ? 'disabled' : ''}>
                    ${purchased ? '구매완료' : `$${product.price.toFixed(2)}`}
                </button>
            </div>
        `;
    }

    /**
     * 구독 아이템 렌더링
     */
    renderSubscriptionItem(product, active) {
        const bestValue = product.bestValue ? '<span class="badge best-value">최고 가성비</span>' : '';
        const remainingDays = active ? this.game.iap?.getPassRemainingDays() : 0;

        return `
            <div class="shop-item subscription-item ${active ? 'active' : ''}" data-product-id="${product.id}" data-type="subscription">
                ${bestValue}
                <div class="item-icon">${product.icon}</div>
                <div class="item-info">
                    <div class="item-name">${product.name}</div>
                    <div class="item-description">${product.description}</div>
                    <div class="item-duration">${product.duration}일간</div>
                    ${active ? `<div class="remaining">남은 기간: ${remainingDays}일</div>` : ''}
                </div>
                <button class="buy-btn price-btn" ${active ? 'disabled' : ''}>
                    ${active ? '활성화됨' : `$${product.price.toFixed(2)}`}
                </button>
            </div>
        `;
    }

    /**
     * 아이템 클릭 리스너 연결
     */
    attachItemListeners() {
        this.container.querySelectorAll('.shop-item').forEach(item => {
            const buyBtn = item.querySelector('.buy-btn');
            if (buyBtn && !buyBtn.disabled) {
                buyBtn.addEventListener('click', () => this.handlePurchase(item));
            }
        });
    }

    /**
     * 구매 처리
     */
    async handlePurchase(itemElement) {
        const type = itemElement.dataset.type;
        const itemId = itemElement.dataset.itemId || itemElement.dataset.productId;

        if (this.game.audioManager) {
            this.game.audioManager.playSound('ui_click');
        }

        let result;

        switch (type) {
            case 'iap':
            case 'pack':
            case 'subscription':
                result = await this.game.iap?.purchase(itemId);
                break;

            case 'coin_bundle':
                result = this.game.economy?.purchaseCoinBundle(itemId);
                break;

            case 'booster':
                result = this.game.economy?.purchaseBooster(itemId);
                break;

            case 'skin':
                result = this.game.economy?.purchaseSkin(itemId);
                break;

            case 'upgrade':
                result = this.game.economy?.purchasePermanentUpgrade(itemId);
                break;
        }

        if (result?.success) {
            this.showPurchaseSuccess(itemId);
            this.updateCurrencyDisplay();
            this.renderTab(this.currentTab);
        } else {
            this.showPurchaseError(result?.error || '구매 실패');
        }
    }

    /**
     * 구매 성공 표시
     */
    showPurchaseSuccess(itemId) {
        if (this.game.audioManager) {
            this.game.audioManager.playSound('buildComplete');
        }

        if (this.game.uiManager) {
            this.game.uiManager.showToast('구매 완료!', 'success');
        }
    }

    /**
     * 구매 실패 표시
     */
    showPurchaseError(message) {
        if (this.game.audioManager) {
            this.game.audioManager.playSound('error');
        }

        if (this.game.uiManager) {
            this.game.uiManager.showToast(message, 'error');
        }
    }

    /**
     * 화폐 표시 업데이트
     */
    updateCurrencyDisplay() {
        const coinsEl = this.container.querySelector('#shop-coins');
        const gemsEl = this.container.querySelector('#shop-gems');

        if (coinsEl && this.game.economy) {
            coinsEl.textContent = this.formatNumber(this.game.economy.coins);
        }
        if (gemsEl && this.game.economy) {
            gemsEl.textContent = this.formatNumber(this.game.economy.gems);
        }
    }

    /**
     * 숫자 포맷팅
     */
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}
