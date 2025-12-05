/**
 * Star Siege - 업적 UI
 * 업적 목록, 진행도, 보상 수령 인터페이스
 */

import { ACHIEVEMENTS } from '../systems/AchievementSystem.js';

/**
 * 카테고리 정보
 */
const CATEGORY_INFO = {
    combat: {
        name: '전투',
        icon: '⚔️',
        description: '적과의 전투에서 달성'
    },
    economy: {
        name: '경제',
        icon: '💰',
        description: '자원 수집 및 관리'
    },
    building: {
        name: '건설',
        icon: '🏗️',
        description: '건물 및 유닛 생산'
    },
    campaign: {
        name: '캠페인',
        icon: '🎖️',
        description: '스토리 미션 완료'
    },
    wave: {
        name: '웨이브',
        icon: '🌊',
        description: '웨이브 모드 도전'
    },
    misc: {
        name: '기타',
        icon: '🏆',
        description: '특별한 업적'
    }
};

/**
 * 희귀도 정보
 */
const RARITY_INFO = {
    common: { name: '일반', color: '#9e9e9e', bgColor: 'rgba(158, 158, 158, 0.2)' },
    uncommon: { name: '희귀', color: '#4caf50', bgColor: 'rgba(76, 175, 80, 0.2)' },
    rare: { name: '레어', color: '#2196f3', bgColor: 'rgba(33, 150, 243, 0.2)' },
    epic: { name: '에픽', color: '#9c27b0', bgColor: 'rgba(156, 39, 176, 0.2)' },
    legendary: { name: '전설', color: '#ff9800', bgColor: 'rgba(255, 152, 0, 0.2)' }
};

/**
 * 업적 UI 클래스
 */
export class AchievementsUI {
    constructor(game) {
        this.game = game;
        this.container = null;
        this.currentCategory = 'all';
        this.currentFilter = 'all'; // all, completed, inProgress, locked
        this.sortBy = 'progress'; // progress, rarity, name
        this.visible = false;
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
        this.container = document.createElement('div');
        this.container.id = 'achievements-ui';
        this.container.className = 'game-modal';
        this.container.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 2000;
            overflow: hidden;
        `;

        document.body.appendChild(this.container);
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 터치/클릭 이벤트 위임
        this.container.addEventListener('click', (e) => this.handleClick(e));
        this.container.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleClick(e);
        });
    }

    /**
     * UI 표시
     */
    show() {
        this.visible = true;
        this.container.style.display = 'block';
        this.render();

        // 애니메이션
        requestAnimationFrame(() => {
            this.container.style.opacity = '1';
        });

        // 게임 일시정지
        if (this.game && this.game.pause) {
            this.game.pause();
        }
    }

    /**
     * UI 숨김
     */
    hide() {
        this.visible = false;
        this.container.style.opacity = '0';

        setTimeout(() => {
            this.container.style.display = 'none';
        }, 300);

        // 게임 재개
        if (this.game && this.game.resume) {
            this.game.resume();
        }
    }

    /**
     * 클릭 처리
     */
    handleClick(e) {
        const target = e.target;

        // 닫기 버튼
        if (target.classList.contains('close-btn') || target.classList.contains('modal-overlay')) {
            this.hide();
            return;
        }

        // 카테고리 탭
        if (target.classList.contains('category-tab')) {
            const category = target.dataset.category;
            if (category) {
                this.switchCategory(category);
            }
            return;
        }

        // 필터 버튼
        if (target.classList.contains('filter-btn')) {
            const filter = target.dataset.filter;
            if (filter) {
                this.switchFilter(filter);
            }
            return;
        }

        // 정렬 버튼
        if (target.classList.contains('sort-btn')) {
            const sort = target.dataset.sort;
            if (sort) {
                this.switchSort(sort);
            }
            return;
        }

        // 보상 수령
        if (target.classList.contains('claim-btn')) {
            const achievementId = target.dataset.id;
            if (achievementId) {
                this.claimReward(achievementId);
            }
            return;
        }

        // 모든 보상 수령
        if (target.classList.contains('claim-all-btn')) {
            this.claimAllRewards();
            return;
        }
    }

    /**
     * 카테고리 전환
     */
    switchCategory(category) {
        this.currentCategory = category;
        this.render();
    }

    /**
     * 필터 전환
     */
    switchFilter(filter) {
        this.currentFilter = filter;
        this.render();
    }

    /**
     * 정렬 전환
     */
    switchSort(sort) {
        this.sortBy = sort;
        this.render();
    }

    /**
     * 보상 수령
     */
    claimReward(achievementId) {
        if (!this.game || !this.game.achievements) return;

        const reward = this.game.achievements.claimReward(achievementId);
        if (reward) {
            this.showRewardAnimation(reward);
            this.render();
        }
    }

    /**
     * 모든 보상 수령
     */
    claimAllRewards() {
        if (!this.game || !this.game.achievements) return;

        const claimable = this.game.achievements.getClaimableAchievements();
        let totalCoins = 0;
        let totalGems = 0;

        for (const achievement of claimable) {
            const reward = this.game.achievements.claimReward(achievement.id);
            if (reward) {
                totalCoins += reward.coins || 0;
                totalGems += reward.gems || 0;
            }
        }

        if (totalCoins > 0 || totalGems > 0) {
            this.showRewardAnimation({ coins: totalCoins, gems: totalGems });
        }

        this.render();
    }

    /**
     * 보상 애니메이션
     */
    showRewardAnimation(reward) {
        const popup = document.createElement('div');
        popup.className = 'reward-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 2px solid #ffd700;
            border-radius: 16px;
            padding: 24px 40px;
            text-align: center;
            z-index: 3000;
            animation: popIn 0.3s ease forwards;
        `;

        let rewardText = '<div style="font-size: 24px; color: #ffd700; margin-bottom: 12px;">🎉 보상 획득!</div>';

        if (reward.coins) {
            rewardText += `<div style="color: #ffeb3b; font-size: 20px;">💰 ${reward.coins.toLocaleString()} 코인</div>`;
        }
        if (reward.gems) {
            rewardText += `<div style="color: #e040fb; font-size: 20px;">💎 ${reward.gems.toLocaleString()} 젬</div>`;
        }

        popup.innerHTML = rewardText;

        // 애니메이션 스타일 추가
        if (!document.getElementById('achievement-animations')) {
            const style = document.createElement('style');
            style.id = 'achievement-animations';
            style.textContent = `
                @keyframes popIn {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    70% { transform: translate(-50%, -50%) scale(1.1); }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                @keyframes popOut {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(popup);

        // 자동 제거
        setTimeout(() => {
            popup.style.animation = 'popOut 0.3s ease forwards';
            setTimeout(() => popup.remove(), 300);
        }, 1500);
    }

    /**
     * 렌더링
     */
    render() {
        const achievements = this.game?.achievements;
        if (!achievements) {
            this.container.innerHTML = '<div style="color: white; text-align: center; padding: 40px;">업적 시스템을 불러오는 중...</div>';
            return;
        }

        const stats = this.getStats();
        const filteredAchievements = this.getFilteredAchievements();
        const claimableCount = achievements.getClaimableAchievements().length;

        this.container.innerHTML = `
            <div class="modal-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>
            <div class="modal-content" style="
                position: relative;
                width: 95%;
                max-width: 600px;
                max-height: 90vh;
                margin: 20px auto;
                background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
                border-radius: 16px;
                border: 1px solid #333;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            ">
                ${this.renderHeader(stats, claimableCount)}
                ${this.renderCategoryTabs()}
                ${this.renderFilters()}
                ${this.renderAchievementList(filteredAchievements)}
            </div>
        `;
    }

    /**
     * 헤더 렌더링
     */
    renderHeader(stats, claimableCount) {
        return `
            <div style="
                padding: 16px 20px;
                background: linear-gradient(90deg, #2a2a4e 0%, #1a1a3e 100%);
                border-bottom: 1px solid #333;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div>
                    <h2 style="margin: 0; color: #ffd700; font-size: 20px;">🏆 업적</h2>
                    <div style="color: #888; font-size: 12px; margin-top: 4px;">
                        ${stats.completed}/${stats.total} 완료 (${stats.percentage}%)
                    </div>
                </div>
                <div style="display: flex; gap: 12px; align-items: center;">
                    ${claimableCount > 0 ? `
                        <button class="claim-all-btn" style="
                            background: linear-gradient(180deg, #ffd700 0%, #ff9800 100%);
                            border: none;
                            border-radius: 8px;
                            padding: 8px 16px;
                            color: #000;
                            font-weight: bold;
                            font-size: 14px;
                            cursor: pointer;
                        ">
                            모두 수령 (${claimableCount})
                        </button>
                    ` : ''}
                    <button class="close-btn" style="
                        background: #333;
                        border: none;
                        border-radius: 8px;
                        width: 36px;
                        height: 36px;
                        color: #fff;
                        font-size: 20px;
                        cursor: pointer;
                    ">✕</button>
                </div>
            </div>

            <!-- 진행도 바 -->
            <div style="padding: 12px 20px; background: #151525;">
                <div style="
                    height: 8px;
                    background: #333;
                    border-radius: 4px;
                    overflow: hidden;
                ">
                    <div style="
                        width: ${stats.percentage}%;
                        height: 100%;
                        background: linear-gradient(90deg, #4caf50 0%, #8bc34a 100%);
                        transition: width 0.3s ease;
                    "></div>
                </div>
                <div style="
                    display: flex;
                    justify-content: space-between;
                    margin-top: 8px;
                    font-size: 11px;
                    color: #666;
                ">
                    <span>총 보상: 💰 ${stats.totalCoins.toLocaleString()} / 💎 ${stats.totalGems.toLocaleString()}</span>
                    <span>획득: 💰 ${stats.earnedCoins.toLocaleString()} / 💎 ${stats.earnedGems.toLocaleString()}</span>
                </div>
            </div>
        `;
    }

    /**
     * 카테고리 탭 렌더링
     */
    renderCategoryTabs() {
        const categories = ['all', ...Object.keys(CATEGORY_INFO)];

        return `
            <div style="
                display: flex;
                overflow-x: auto;
                padding: 8px 12px;
                gap: 8px;
                background: #1a1a2e;
                border-bottom: 1px solid #333;
            ">
                ${categories.map(cat => {
                    const isActive = this.currentCategory === cat;
                    const info = cat === 'all' ? { name: '전체', icon: '📋' } : CATEGORY_INFO[cat];
                    const count = this.getCategoryCount(cat);

                    return `
                        <button class="category-tab" data-category="${cat}" style="
                            flex-shrink: 0;
                            padding: 8px 14px;
                            border-radius: 8px;
                            border: 1px solid ${isActive ? '#4caf50' : '#333'};
                            background: ${isActive ? 'rgba(76, 175, 80, 0.2)' : 'transparent'};
                            color: ${isActive ? '#4caf50' : '#888'};
                            font-size: 13px;
                            cursor: pointer;
                            white-space: nowrap;
                        ">
                            ${info.icon} ${info.name} (${count})
                        </button>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * 필터 렌더링
     */
    renderFilters() {
        const filters = [
            { id: 'all', name: '전체' },
            { id: 'inProgress', name: '진행중' },
            { id: 'completed', name: '완료' },
            { id: 'locked', name: '미달성' }
        ];

        const sorts = [
            { id: 'progress', name: '진행도순' },
            { id: 'rarity', name: '희귀도순' },
            { id: 'name', name: '이름순' }
        ];

        return `
            <div style="
                display: flex;
                justify-content: space-between;
                padding: 8px 16px;
                background: #151525;
                border-bottom: 1px solid #222;
            ">
                <div style="display: flex; gap: 6px;">
                    ${filters.map(f => `
                        <button class="filter-btn" data-filter="${f.id}" style="
                            padding: 4px 10px;
                            border-radius: 12px;
                            border: none;
                            background: ${this.currentFilter === f.id ? '#4caf50' : '#333'};
                            color: ${this.currentFilter === f.id ? '#fff' : '#888'};
                            font-size: 11px;
                            cursor: pointer;
                        ">${f.name}</button>
                    `).join('')}
                </div>
                <div style="display: flex; gap: 6px;">
                    ${sorts.map(s => `
                        <button class="sort-btn" data-sort="${s.id}" style="
                            padding: 4px 10px;
                            border-radius: 12px;
                            border: none;
                            background: ${this.sortBy === s.id ? '#2196f3' : '#333'};
                            color: ${this.sortBy === s.id ? '#fff' : '#888'};
                            font-size: 11px;
                            cursor: pointer;
                        ">${s.name}</button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 업적 목록 렌더링
     */
    renderAchievementList(achievements) {
        if (achievements.length === 0) {
            return `
                <div style="
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #666;
                    padding: 40px;
                    text-align: center;
                ">
                    <div>
                        <div style="font-size: 48px; margin-bottom: 12px;">🔍</div>
                        <div>해당하는 업적이 없습니다</div>
                    </div>
                </div>
            `;
        }

        return `
            <div style="
                flex: 1;
                overflow-y: auto;
                padding: 12px;
            ">
                ${achievements.map(a => this.renderAchievementCard(a)).join('')}
            </div>
        `;
    }

    /**
     * 업적 카드 렌더링
     */
    renderAchievementCard(achievement) {
        const progress = this.game.achievements.getProgress(achievement.id);
        const isCompleted = progress.completed;
        const isClaimed = progress.claimed;
        const isClaimable = isCompleted && !isClaimed;
        const percentage = Math.min(100, Math.round((progress.current / progress.target) * 100));
        const rarity = RARITY_INFO[achievement.rarity] || RARITY_INFO.common;
        const category = CATEGORY_INFO[achievement.category];

        return `
            <div class="achievement-card" style="
                background: ${isCompleted ? rarity.bgColor : 'rgba(30, 30, 50, 0.8)'};
                border: 1px solid ${isCompleted ? rarity.color : '#333'};
                border-radius: 12px;
                padding: 14px;
                margin-bottom: 10px;
                opacity: ${isClaimed ? '0.6' : '1'};
            ">
                <div style="display: flex; gap: 12px;">
                    <!-- 아이콘 -->
                    <div style="
                        width: 56px;
                        height: 56px;
                        border-radius: 12px;
                        background: ${isCompleted ? `linear-gradient(135deg, ${rarity.color}33, ${rarity.color}11)` : '#222'};
                        border: 2px solid ${isCompleted ? rarity.color : '#444'};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 28px;
                        flex-shrink: 0;
                        ${!isCompleted ? 'filter: grayscale(1);' : ''}
                    ">
                        ${achievement.icon}
                    </div>

                    <!-- 정보 -->
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                            <div>
                                <span style="
                                    color: ${isCompleted ? rarity.color : '#fff'};
                                    font-weight: bold;
                                    font-size: 14px;
                                ">${achievement.name}</span>
                                ${isClaimed ? '<span style="color: #4caf50; font-size: 11px; margin-left: 6px;">✓ 수령완료</span>' : ''}
                            </div>
                            <span style="
                                font-size: 10px;
                                padding: 2px 6px;
                                border-radius: 4px;
                                background: ${rarity.bgColor};
                                color: ${rarity.color};
                            ">${rarity.name}</span>
                        </div>

                        <div style="color: #888; font-size: 12px; margin-bottom: 8px;">
                            ${achievement.description}
                        </div>

                        <!-- 진행도 바 -->
                        <div style="
                            height: 6px;
                            background: #222;
                            border-radius: 3px;
                            overflow: hidden;
                            margin-bottom: 6px;
                        ">
                            <div style="
                                width: ${percentage}%;
                                height: 100%;
                                background: ${isCompleted ? rarity.color : 'linear-gradient(90deg, #666 0%, #888 100%)'};
                                transition: width 0.3s ease;
                            "></div>
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <span style="color: #666; font-size: 11px;">
                                    ${category?.icon || ''} ${category?.name || ''}
                                </span>
                                <span style="color: ${isCompleted ? '#4caf50' : '#888'}; font-size: 12px;">
                                    ${progress.current.toLocaleString()}/${progress.target.toLocaleString()}
                                </span>
                            </div>

                            <div style="display: flex; gap: 8px; align-items: center;">
                                <!-- 보상 표시 -->
                                <div style="display: flex; gap: 6px; font-size: 12px;">
                                    ${achievement.reward.coins ? `<span style="color: #ffeb3b;">💰${achievement.reward.coins}</span>` : ''}
                                    ${achievement.reward.gems ? `<span style="color: #e040fb;">💎${achievement.reward.gems}</span>` : ''}
                                </div>

                                <!-- 수령 버튼 -->
                                ${isClaimable ? `
                                    <button class="claim-btn" data-id="${achievement.id}" style="
                                        background: linear-gradient(180deg, #ffd700 0%, #ff9800 100%);
                                        border: none;
                                        border-radius: 6px;
                                        padding: 6px 12px;
                                        color: #000;
                                        font-weight: bold;
                                        font-size: 12px;
                                        cursor: pointer;
                                    ">수령</button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 통계 계산
     */
    getStats() {
        const achievements = this.game?.achievements;
        if (!achievements) {
            return { completed: 0, total: 0, percentage: 0, totalCoins: 0, totalGems: 0, earnedCoins: 0, earnedGems: 0 };
        }

        const allAchievements = Object.values(ACHIEVEMENTS);
        let completed = 0;
        let totalCoins = 0;
        let totalGems = 0;
        let earnedCoins = 0;
        let earnedGems = 0;

        for (const achievement of allAchievements) {
            const progress = achievements.getProgress(achievement.id);
            totalCoins += achievement.reward.coins || 0;
            totalGems += achievement.reward.gems || 0;

            if (progress.completed) {
                completed++;
                if (progress.claimed) {
                    earnedCoins += achievement.reward.coins || 0;
                    earnedGems += achievement.reward.gems || 0;
                }
            }
        }

        return {
            completed,
            total: allAchievements.length,
            percentage: Math.round((completed / allAchievements.length) * 100),
            totalCoins,
            totalGems,
            earnedCoins,
            earnedGems
        };
    }

    /**
     * 카테고리별 업적 수
     */
    getCategoryCount(category) {
        const allAchievements = Object.values(ACHIEVEMENTS);
        if (category === 'all') return allAchievements.length;
        return allAchievements.filter(a => a.category === category).length;
    }

    /**
     * 필터링된 업적 목록
     */
    getFilteredAchievements() {
        const achievements = this.game?.achievements;
        if (!achievements) return [];

        let filtered = Object.values(ACHIEVEMENTS);

        // 카테고리 필터
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(a => a.category === this.currentCategory);
        }

        // 상태 필터
        filtered = filtered.filter(a => {
            const progress = achievements.getProgress(a.id);
            switch (this.currentFilter) {
                case 'completed':
                    return progress.completed;
                case 'inProgress':
                    return !progress.completed && progress.current > 0;
                case 'locked':
                    return !progress.completed && progress.current === 0;
                default:
                    return true;
            }
        });

        // 정렬
        filtered.sort((a, b) => {
            const progressA = achievements.getProgress(a.id);
            const progressB = achievements.getProgress(b.id);

            switch (this.sortBy) {
                case 'progress':
                    // 수령 가능 > 진행중 > 완료 > 미달성
                    const scoreA = this.getSortScore(progressA);
                    const scoreB = this.getSortScore(progressB);
                    if (scoreA !== scoreB) return scoreB - scoreA;
                    // 같은 그룹 내에서는 진행률로 정렬
                    const percentA = progressA.current / progressA.target;
                    const percentB = progressB.current / progressB.target;
                    return percentB - percentA;

                case 'rarity':
                    const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
                    return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);

                case 'name':
                    return a.name.localeCompare(b.name, 'ko');

                default:
                    return 0;
            }
        });

        return filtered;
    }

    /**
     * 정렬 점수 계산
     */
    getSortScore(progress) {
        if (progress.completed && !progress.claimed) return 4; // 수령 가능
        if (!progress.completed && progress.current > 0) return 3; // 진행중
        if (progress.completed && progress.claimed) return 1; // 완료
        return 2; // 미달성
    }

    /**
     * 데이터 내보내기
     */
    serialize() {
        return {
            currentCategory: this.currentCategory,
            currentFilter: this.currentFilter,
            sortBy: this.sortBy
        };
    }

    /**
     * 데이터 가져오기
     */
    deserialize(data) {
        if (!data) return;
        this.currentCategory = data.currentCategory || 'all';
        this.currentFilter = data.currentFilter || 'all';
        this.sortBy = data.sortBy || 'progress';
    }
}
