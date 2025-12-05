/**
 * Star Siege - 통계 UI
 * 게임 통계, 기록, 리더보드 인터페이스
 */

/**
 * 탭 정보
 */
const TAB_INFO = {
    overview: { name: '개요', icon: '📊' },
    combat: { name: '전투', icon: '⚔️' },
    economy: { name: '경제', icon: '💰' },
    history: { name: '기록', icon: '📜' },
    leaderboard: { name: '리더보드', icon: '🏆' }
};

/**
 * 통계 UI 클래스
 */
export class StatisticsUI {
    constructor(game) {
        this.game = game;
        this.container = null;
        this.currentTab = 'overview';
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
        this.container.id = 'statistics-ui';
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

        requestAnimationFrame(() => {
            this.container.style.opacity = '1';
        });

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

        if (this.game && this.game.resume) {
            this.game.resume();
        }
    }

    /**
     * 클릭 처리
     */
    handleClick(e) {
        const target = e.target;

        if (target.classList.contains('close-btn') || target.classList.contains('modal-overlay')) {
            this.hide();
            return;
        }

        if (target.classList.contains('tab-btn')) {
            const tab = target.dataset.tab;
            if (tab) {
                this.switchTab(tab);
            }
            return;
        }

        if (target.classList.contains('share-btn')) {
            this.shareStats();
            return;
        }

        if (target.classList.contains('reset-btn')) {
            this.confirmReset();
            return;
        }
    }

    /**
     * 탭 전환
     */
    switchTab(tab) {
        this.currentTab = tab;
        this.render();
    }

    /**
     * 통계 공유
     */
    shareStats() {
        const stats = this.game?.statistics;
        if (!stats) return;

        const lifetime = stats.lifetime;
        const text = `🎮 Star Siege 전적\n` +
            `🏆 최고 웨이브: ${lifetime.highestWave}\n` +
            `⚔️ 총 킬: ${lifetime.totalKills.toLocaleString()}\n` +
            `🎯 승률: ${this.calculateWinRate()}%\n` +
            `⏱️ 플레이 시간: ${this.formatPlayTime(lifetime.totalPlayTime)}\n` +
            `#StarSiege`;

        if (navigator.share) {
            navigator.share({
                title: 'Star Siege 통계',
                text: text
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(text)
                .then(() => alert('클립보드에 복사되었습니다!'))
                .catch(() => alert('공유 기능을 사용할 수 없습니다.'));
        }
    }

    /**
     * 통계 초기화 확인
     */
    confirmReset() {
        if (confirm('정말로 모든 통계를 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
            if (this.game?.statistics) {
                this.game.statistics.resetAllStats();
                this.render();
            }
        }
    }

    /**
     * 렌더링
     */
    render() {
        const stats = this.game?.statistics;
        if (!stats) {
            this.container.innerHTML = '<div style="color: white; text-align: center; padding: 40px;">통계 시스템을 불러오는 중...</div>';
            return;
        }

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
                ${this.renderHeader()}
                ${this.renderTabs()}
                ${this.renderContent()}
            </div>
        `;
    }

    /**
     * 헤더 렌더링
     */
    renderHeader() {
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
                    <h2 style="margin: 0; color: #00bcd4; font-size: 20px;">📊 통계</h2>
                    <div style="color: #888; font-size: 12px; margin-top: 4px;">
                        게임 기록 및 성과
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="share-btn" style="
                        background: #4caf50;
                        border: none;
                        border-radius: 8px;
                        padding: 8px 12px;
                        color: #fff;
                        font-size: 14px;
                        cursor: pointer;
                    ">📤 공유</button>
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
        `;
    }

    /**
     * 탭 렌더링
     */
    renderTabs() {
        return `
            <div style="
                display: flex;
                overflow-x: auto;
                padding: 8px 12px;
                gap: 8px;
                background: #1a1a2e;
                border-bottom: 1px solid #333;
            ">
                ${Object.entries(TAB_INFO).map(([id, info]) => {
                    const isActive = this.currentTab === id;
                    return `
                        <button class="tab-btn" data-tab="${id}" style="
                            flex-shrink: 0;
                            padding: 8px 16px;
                            border-radius: 8px;
                            border: 1px solid ${isActive ? '#00bcd4' : '#333'};
                            background: ${isActive ? 'rgba(0, 188, 212, 0.2)' : 'transparent'};
                            color: ${isActive ? '#00bcd4' : '#888'};
                            font-size: 13px;
                            cursor: pointer;
                            white-space: nowrap;
                        ">
                            ${info.icon} ${info.name}
                        </button>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * 콘텐츠 렌더링
     */
    renderContent() {
        switch (this.currentTab) {
            case 'overview':
                return this.renderOverview();
            case 'combat':
                return this.renderCombat();
            case 'economy':
                return this.renderEconomy();
            case 'history':
                return this.renderHistory();
            case 'leaderboard':
                return this.renderLeaderboard();
            default:
                return '';
        }
    }

    /**
     * 개요 탭 렌더링
     */
    renderOverview() {
        const stats = this.game.statistics;
        const lifetime = stats.lifetime;

        const overviewStats = [
            { label: '총 게임 수', value: lifetime.gamesPlayed, icon: '🎮' },
            { label: '승리', value: lifetime.wins, icon: '🏆' },
            { label: '패배', value: lifetime.losses, icon: '💀' },
            { label: '승률', value: `${this.calculateWinRate()}%`, icon: '📈' },
            { label: '최고 웨이브', value: lifetime.highestWave, icon: '🌊' },
            { label: '총 플레이 시간', value: this.formatPlayTime(lifetime.totalPlayTime), icon: '⏱️' },
            { label: '최장 생존 시간', value: this.formatTime(lifetime.longestSurvivalTime), icon: '⏳' },
            { label: '연속 승리', value: lifetime.winStreak, icon: '🔥' }
        ];

        return `
            <div style="flex: 1; overflow-y: auto; padding: 16px;">
                <!-- 하이라이트 카드 -->
                <div style="
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    margin-bottom: 20px;
                ">
                    ${overviewStats.map(stat => `
                        <div style="
                            background: rgba(0, 188, 212, 0.1);
                            border: 1px solid #333;
                            border-radius: 12px;
                            padding: 16px;
                            text-align: center;
                        ">
                            <div style="font-size: 24px; margin-bottom: 8px;">${stat.icon}</div>
                            <div style="color: #00bcd4; font-size: 20px; font-weight: bold;">${stat.value}</div>
                            <div style="color: #888; font-size: 12px; margin-top: 4px;">${stat.label}</div>
                        </div>
                    `).join('')}
                </div>

                <!-- 팩션 통계 -->
                <div style="
                    background: rgba(30, 30, 50, 0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                ">
                    <h3 style="color: #fff; margin: 0 0 12px 0; font-size: 14px;">팩션별 성적</h3>
                    ${this.renderFactionStats()}
                </div>
            </div>
        `;
    }

    /**
     * 팩션 통계 렌더링
     */
    renderFactionStats() {
        const stats = this.game.statistics;
        const factionStats = stats.lifetime.factionStats;

        const factions = [
            { id: 'terra', name: '테라 연합', color: '#4caf50', icon: '🌍' },
            { id: 'kryon', name: '크라이온', color: '#9c27b0', icon: '👽' },
            { id: 'mechanicus', name: '메카니쿠스', color: '#ff5722', icon: '🤖' }
        ];

        return factions.map(faction => {
            const data = factionStats[faction.id] || { games: 0, wins: 0 };
            const winRate = data.games > 0 ? Math.round((data.wins / data.games) * 100) : 0;

            return `
                <div style="
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    border-radius: 8px;
                    background: rgba(0,0,0,0.3);
                    margin-bottom: 8px;
                ">
                    <div style="font-size: 24px; margin-right: 12px;">${faction.icon}</div>
                    <div style="flex: 1;">
                        <div style="color: ${faction.color}; font-weight: bold; font-size: 13px;">${faction.name}</div>
                        <div style="color: #888; font-size: 11px;">${data.games}게임 / ${data.wins}승</div>
                    </div>
                    <div style="
                        background: ${faction.color}33;
                        color: ${faction.color};
                        padding: 4px 10px;
                        border-radius: 12px;
                        font-size: 13px;
                        font-weight: bold;
                    ">${winRate}%</div>
                </div>
            `;
        }).join('');
    }

    /**
     * 전투 탭 렌더링
     */
    renderCombat() {
        const stats = this.game.statistics;
        const lifetime = stats.lifetime;

        const combatStats = [
            { category: '킬 통계', items: [
                { label: '총 킬', value: lifetime.totalKills.toLocaleString(), icon: '💀' },
                { label: '보스 킬', value: lifetime.bossKills.toLocaleString(), icon: '👹' },
                { label: '최다 킬 (단일 게임)', value: lifetime.mostKillsInGame.toLocaleString(), icon: '🎯' }
            ]},
            { category: '데미지 통계', items: [
                { label: '총 데미지', value: this.formatNumber(lifetime.totalDamageDealt), icon: '⚔️' },
                { label: '받은 데미지', value: this.formatNumber(lifetime.totalDamageTaken), icon: '🛡️' },
                { label: 'K/D 비율', value: stats.getKDRatio().toFixed(2), icon: '📊' }
            ]},
            { category: '유닛 통계', items: [
                { label: '생산한 유닛', value: lifetime.unitsProduced.toLocaleString(), icon: '🏭' },
                { label: '잃은 유닛', value: lifetime.unitsLost.toLocaleString(), icon: '💔' },
                { label: '건설한 건물', value: lifetime.buildingsBuilt.toLocaleString(), icon: '🏗️' }
            ]}
        ];

        return `
            <div style="flex: 1; overflow-y: auto; padding: 16px;">
                ${combatStats.map(section => `
                    <div style="
                        background: rgba(30, 30, 50, 0.8);
                        border: 1px solid #333;
                        border-radius: 12px;
                        padding: 16px;
                        margin-bottom: 12px;
                    ">
                        <h3 style="color: #ff5722; margin: 0 0 12px 0; font-size: 14px;">${section.category}</h3>
                        ${section.items.map(item => `
                            <div style="
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                padding: 8px 0;
                                border-bottom: 1px solid #222;
                            ">
                                <span style="color: #888; font-size: 13px;">
                                    ${item.icon} ${item.label}
                                </span>
                                <span style="color: #fff; font-size: 14px; font-weight: bold;">
                                    ${item.value}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * 경제 탭 렌더링
     */
    renderEconomy() {
        const stats = this.game.statistics;
        const lifetime = stats.lifetime;
        const economy = this.game.economy;

        const economyStats = [
            { category: '자원 수집', items: [
                { label: '총 미네랄 수집', value: this.formatNumber(lifetime.totalMinerals), icon: '💎' },
                { label: '총 가스 수집', value: this.formatNumber(lifetime.totalGas), icon: '⛽' },
                { label: '최대 자원 보유', value: this.formatNumber(lifetime.maxResourcesHeld), icon: '📦' }
            ]},
            { category: '화폐', items: [
                { label: '보유 코인', value: economy?.coins?.toLocaleString() || '0', icon: '💰' },
                { label: '보유 젬', value: economy?.gems?.toLocaleString() || '0', icon: '💎' },
                { label: '총 획득 코인', value: this.formatNumber(lifetime.totalCoinsEarned || 0), icon: '🪙' }
            ]},
            { category: '소비', items: [
                { label: '구매한 유닛 비용', value: this.formatNumber(lifetime.totalSpentOnUnits || 0), icon: '🎖️' },
                { label: '구매한 건물 비용', value: this.formatNumber(lifetime.totalSpentOnBuildings || 0), icon: '🏠' },
                { label: '업그레이드 비용', value: this.formatNumber(lifetime.totalSpentOnUpgrades || 0), icon: '⬆️' }
            ]}
        ];

        return `
            <div style="flex: 1; overflow-y: auto; padding: 16px;">
                ${economyStats.map(section => `
                    <div style="
                        background: rgba(30, 30, 50, 0.8);
                        border: 1px solid #333;
                        border-radius: 12px;
                        padding: 16px;
                        margin-bottom: 12px;
                    ">
                        <h3 style="color: #ffc107; margin: 0 0 12px 0; font-size: 14px;">${section.category}</h3>
                        ${section.items.map(item => `
                            <div style="
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                padding: 8px 0;
                                border-bottom: 1px solid #222;
                            ">
                                <span style="color: #888; font-size: 13px;">
                                    ${item.icon} ${item.label}
                                </span>
                                <span style="color: #fff; font-size: 14px; font-weight: bold;">
                                    ${item.value}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * 기록 탭 렌더링
     */
    renderHistory() {
        const stats = this.game.statistics;
        const history = stats.gameHistory || [];

        if (history.length === 0) {
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
                        <div style="font-size: 48px; margin-bottom: 12px;">📜</div>
                        <div>게임 기록이 없습니다</div>
                        <div style="font-size: 12px; margin-top: 8px;">게임을 플레이하면 기록이 저장됩니다</div>
                    </div>
                </div>
            `;
        }

        return `
            <div style="flex: 1; overflow-y: auto; padding: 16px;">
                <div style="color: #888; font-size: 12px; margin-bottom: 12px;">
                    최근 ${history.length}개 게임 기록
                </div>
                ${history.slice().reverse().map((game, index) => this.renderGameRecord(game, index)).join('')}
            </div>
        `;
    }

    /**
     * 게임 기록 렌더링
     */
    renderGameRecord(game, index) {
        const isWin = game.result === 'win';
        const date = new Date(game.timestamp);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;

        const factionIcons = {
            terra: '🌍',
            kryon: '👽',
            mechanicus: '🤖'
        };

        return `
            <div style="
                background: ${isWin ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'};
                border: 1px solid ${isWin ? '#4caf50' : '#f44336'};
                border-radius: 12px;
                padding: 14px;
                margin-bottom: 10px;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="
                            background: ${isWin ? '#4caf50' : '#f44336'};
                            color: #fff;
                            padding: 2px 8px;
                            border-radius: 4px;
                            font-size: 12px;
                            font-weight: bold;
                        ">${isWin ? '승리' : '패배'}</span>
                        <span style="color: #888; font-size: 12px;">${dateStr}</span>
                    </div>
                    <span style="font-size: 18px;">${factionIcons[game.faction] || '🎮'}</span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 12px;">
                    <div>
                        <div style="color: #888;">웨이브</div>
                        <div style="color: #fff; font-weight: bold;">🌊 ${game.wave}</div>
                    </div>
                    <div>
                        <div style="color: #888;">킬</div>
                        <div style="color: #fff; font-weight: bold;">💀 ${game.kills}</div>
                    </div>
                    <div>
                        <div style="color: #888;">점수</div>
                        <div style="color: #fff; font-weight: bold;">⭐ ${(game.score || 0).toLocaleString()}</div>
                    </div>
                    <div>
                        <div style="color: #888;">시간</div>
                        <div style="color: #fff; font-weight: bold;">⏱️ ${this.formatTime(game.duration)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 리더보드 탭 렌더링
     */
    renderLeaderboard() {
        const stats = this.game.statistics;
        const leaderboard = stats.localLeaderboard || [];

        if (leaderboard.length === 0) {
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
                        <div style="font-size: 48px; margin-bottom: 12px;">🏆</div>
                        <div>리더보드 기록이 없습니다</div>
                        <div style="font-size: 12px; margin-top: 8px;">게임을 플레이하여 기록을 남겨보세요</div>
                    </div>
                </div>
            `;
        }

        const medalIcons = ['🥇', '🥈', '🥉'];

        return `
            <div style="flex: 1; overflow-y: auto; padding: 16px;">
                <div style="color: #888; font-size: 12px; margin-bottom: 12px;">
                    🏆 최고 기록 TOP ${leaderboard.length}
                </div>

                ${leaderboard.map((record, index) => {
                    const medal = medalIcons[index] || `${index + 1}`;
                    const date = new Date(record.timestamp);
                    const dateStr = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;

                    return `
                        <div style="
                            background: ${index < 3 ? 'rgba(255, 215, 0, 0.1)' : 'rgba(30, 30, 50, 0.8)'};
                            border: 1px solid ${index < 3 ? '#ffd700' : '#333'};
                            border-radius: 12px;
                            padding: 14px;
                            margin-bottom: 10px;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        ">
                            <div style="
                                font-size: ${index < 3 ? '28px' : '16px'};
                                width: 40px;
                                text-align: center;
                                ${index >= 3 ? 'color: #666;' : ''}
                            ">${medal}</div>

                            <div style="flex: 1;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #ffd700; font-size: 18px; font-weight: bold;">
                                        ${(record.score || 0).toLocaleString()}점
                                    </span>
                                    <span style="color: #888; font-size: 11px;">${dateStr}</span>
                                </div>
                                <div style="display: flex; gap: 12px; margin-top: 6px; font-size: 12px; color: #888;">
                                    <span>🌊 웨이브 ${record.wave}</span>
                                    <span>💀 ${record.kills} 킬</span>
                                    <span>⏱️ ${this.formatTime(record.duration)}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}

                <!-- 통계 초기화 버튼 -->
                <div style="text-align: center; margin-top: 20px;">
                    <button class="reset-btn" style="
                        background: transparent;
                        border: 1px solid #f44336;
                        border-radius: 8px;
                        padding: 8px 16px;
                        color: #f44336;
                        font-size: 12px;
                        cursor: pointer;
                    ">🗑️ 통계 초기화</button>
                </div>
            </div>
        `;
    }

    /**
     * 승률 계산
     */
    calculateWinRate() {
        const stats = this.game?.statistics;
        if (!stats) return 0;
        return Math.round(stats.getWinRate() * 100);
    }

    /**
     * 시간 포맷팅 (초 -> mm:ss)
     */
    formatTime(seconds) {
        if (!seconds || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    }

    /**
     * 플레이 시간 포맷팅 (초 -> Xh Xm)
     */
    formatPlayTime(seconds) {
        if (!seconds || seconds < 0) return '0분';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}시간 ${mins}분`;
        }
        return `${mins}분`;
    }

    /**
     * 큰 숫자 포맷팅
     */
    formatNumber(num) {
        if (!num) return '0';
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString();
    }

    /**
     * 데이터 직렬화
     */
    serialize() {
        return {
            currentTab: this.currentTab
        };
    }

    /**
     * 데이터 역직렬화
     */
    deserialize(data) {
        if (!data) return;
        this.currentTab = data.currentTab || 'overview';
    }
}
