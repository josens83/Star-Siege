/**
 * UIManager - UI 관리자
 */

import { GAME_STATES, GAME_MODES } from '../utils/Constants.js';
import { BUILDING_CONFIGS } from '../data/BuildingConfigs.js';
import { UNIT_CONFIGS } from '../data/UnitConfigs.js';

export class UIManager {
    constructor(game) {
        this.game = game;

        // UI 요소 캐시
        this.elements = {
            menuOverlay: document.getElementById('menu-overlay'),
            mainMenu: document.getElementById('main-menu'),
            gameModeSelect: document.getElementById('game-mode-select'),
            factionSelect: document.getElementById('faction-select'),
            difficultySelect: document.getElementById('difficulty-select'),
            settingsMenu: document.getElementById('settings-menu'),
            pauseMenu: document.getElementById('pause-menu'),
            gameOverScreen: document.getElementById('game-over-screen'),
            buildMenu: document.getElementById('build-menu'),
            buildingsTab: document.getElementById('buildings-tab'),
            unitsTab: document.getElementById('units-tab'),
            commandPanel: document.getElementById('command-panel'),
            toastContainer: document.getElementById('toast-container')
        };

        // 선택된 설정
        this.selectedMode = null;
        this.selectedFaction = null;
        this.selectedDifficulty = null;

        // 이벤트 바인딩
        this.bindEvents();
    }

    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        // 메인 메뉴 버튼
        document.getElementById('btn-new-game')?.addEventListener('click', () => this.showGameModeSelect());
        document.getElementById('btn-continue')?.addEventListener('click', () => this.loadGame());
        document.getElementById('btn-tutorial')?.addEventListener('click', () => this.startTutorial());
        document.getElementById('btn-settings')?.addEventListener('click', () => this.showSettings());

        // 게임 모드 선택
        document.querySelectorAll('#game-mode-select [data-mode]').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectGameMode(e.target.dataset.mode));
        });

        // 진영 선택
        document.querySelectorAll('.faction-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const factionCard = e.target.closest('.faction-card');
                this.selectFaction(factionCard.dataset.faction);
            });
        });

        // 난이도 선택
        document.querySelectorAll('#difficulty-select [data-difficulty]').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectDifficulty(e.target.dataset.difficulty));
        });

        // 뒤로 가기 버튼
        document.getElementById('btn-back-main')?.addEventListener('click', () => this.showMainMenu());
        document.getElementById('btn-back-mode')?.addEventListener('click', () => this.showGameModeSelect());
        document.getElementById('btn-back-faction')?.addEventListener('click', () => this.showFactionSelect());
        document.getElementById('btn-back-settings')?.addEventListener('click', () => this.showMainMenu());

        // 설정 슬라이더
        document.getElementById('bgm-volume')?.addEventListener('input', (e) => {
            document.getElementById('bgm-value').textContent = `${e.target.value}%`;
            this.game.audioManager?.setBGMVolume(e.target.value / 100);
        });

        document.getElementById('sfx-volume')?.addEventListener('input', (e) => {
            document.getElementById('sfx-value').textContent = `${e.target.value}%`;
            this.game.audioManager?.setSFXVolume(e.target.value / 100);
        });

        // 일시정지 메뉴
        document.getElementById('btn-resume')?.addEventListener('click', () => this.game.resume());
        document.getElementById('btn-save')?.addEventListener('click', () => this.saveGame());
        document.getElementById('btn-load')?.addEventListener('click', () => this.loadGame());
        document.getElementById('btn-quit')?.addEventListener('click', () => this.quitToMain());

        // 게임 오버 화면
        document.getElementById('btn-play-again')?.addEventListener('click', () => this.playAgain());
        document.getElementById('btn-to-main')?.addEventListener('click', () => this.quitToMain());

        // 메뉴 버튼
        document.getElementById('menu-button')?.addEventListener('click', () => this.game.pause());

        // 건설 메뉴
        document.getElementById('build-button')?.addEventListener('click', () => this.toggleBuildMenu());
        document.getElementById('build-menu-close')?.addEventListener('click', () => this.hideBuildMenu());

        // 탭 버튼
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // 명령 버튼
        document.getElementById('cmd-move')?.addEventListener('click', () => this.issueCommand('move'));
        document.getElementById('cmd-attack')?.addEventListener('click', () => this.issueCommand('attack'));
        document.getElementById('cmd-stop')?.addEventListener('click', () => this.issueCommand('stop'));
        document.getElementById('cmd-hold')?.addEventListener('click', () => this.issueCommand('hold'));
    }

    /**
     * 메뉴 섹션 숨기기
     */
    hideAllMenuSections() {
        this.elements.mainMenu?.classList.add('hidden');
        this.elements.gameModeSelect?.classList.add('hidden');
        this.elements.factionSelect?.classList.add('hidden');
        this.elements.difficultySelect?.classList.add('hidden');
        this.elements.settingsMenu?.classList.add('hidden');
        this.elements.pauseMenu?.classList.add('hidden');
        this.elements.gameOverScreen?.classList.add('hidden');
    }

    /**
     * 메인 메뉴 표시
     */
    showMainMenu() {
        this.hideAllMenuSections();
        this.elements.menuOverlay?.classList.remove('hidden');
        this.elements.mainMenu?.classList.remove('hidden');
    }

    /**
     * 게임 모드 선택 표시
     */
    showGameModeSelect() {
        this.hideAllMenuSections();
        this.elements.gameModeSelect?.classList.remove('hidden');
    }

    /**
     * 진영 선택 표시
     */
    showFactionSelect() {
        this.hideAllMenuSections();
        this.elements.factionSelect?.classList.remove('hidden');
    }

    /**
     * 난이도 선택 표시
     */
    showDifficultySelect() {
        this.hideAllMenuSections();
        this.elements.difficultySelect?.classList.remove('hidden');
    }

    /**
     * 설정 표시
     */
    showSettings() {
        this.hideAllMenuSections();
        this.elements.settingsMenu?.classList.remove('hidden');
    }

    /**
     * 일시정지 메뉴 표시
     */
    showPauseMenu() {
        this.hideAllMenuSections();
        this.elements.menuOverlay?.classList.remove('hidden');
        this.elements.pauseMenu?.classList.remove('hidden');
    }

    /**
     * 일시정지 메뉴 숨기기
     */
    hidePauseMenu() {
        this.elements.pauseMenu?.classList.add('hidden');
        this.elements.menuOverlay?.classList.add('hidden');
    }

    /**
     * 게임 모드 선택
     */
    selectGameMode(mode) {
        this.selectedMode = mode;
        this.showFactionSelect();
    }

    /**
     * 진영 선택
     */
    selectFaction(faction) {
        this.selectedFaction = faction;

        // 선택 표시
        document.querySelectorAll('.faction-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.faction === faction);
        });

        this.showDifficultySelect();
    }

    /**
     * 난이도 선택 및 게임 시작
     */
    selectDifficulty(difficulty) {
        this.selectedDifficulty = difficulty;
        this.game.startNewGame(this.selectedMode, this.selectedFaction, difficulty);
    }

    /**
     * 튜토리얼 시작
     */
    startTutorial() {
        this.game.startTutorial();
    }

    /**
     * 게임 저장
     */
    saveGame() {
        if (this.game.saveSystem.save()) {
            this.showToast('게임이 저장되었습니다!', 'success');
        }
    }

    /**
     * 게임 불러오기
     */
    loadGame() {
        this.game.saveSystem.load();
    }

    /**
     * 메인 메뉴로 나가기
     */
    quitToMain() {
        this.game.returnToMainMenu();
    }

    /**
     * 다시 하기
     */
    playAgain() {
        this.game.startNewGame(this.selectedMode, this.selectedFaction, this.selectedDifficulty);
    }

    /**
     * 메뉴 오버레이 숨기기
     */
    hideMenuOverlay() {
        this.elements.menuOverlay?.classList.add('hidden');
    }

    /**
     * 게임 UI 표시
     */
    showGameUI() {
        // 건설 메뉴 업데이트
        this.updateBuildMenu();
    }

    /**
     * 게임 오버 화면 표시
     */
    showGameOverScreen(victory, stats) {
        this.hideAllMenuSections();
        this.elements.menuOverlay?.classList.remove('hidden');
        this.elements.gameOverScreen?.classList.remove('hidden');

        const result = document.getElementById('game-result');
        if (result) {
            result.textContent = victory ? '🎉 승리!' : '💀 패배...';
            result.className = victory ? 'victory' : 'defeat';
        }

        // 통계 표시
        document.getElementById('stat-time').textContent = stats.time;
        document.getElementById('stat-units').textContent = stats.unitsProduced;
        document.getElementById('stat-kills').textContent = stats.enemiesKilled;
        document.getElementById('stat-buildings').textContent = stats.buildingsConstructed;
    }

    /**
     * 건설 메뉴 토글
     */
    toggleBuildMenu() {
        const menu = this.elements.buildMenu;
        if (menu?.classList.contains('hidden')) {
            this.showBuildMenu();
        } else {
            this.hideBuildMenu();
        }
    }

    /**
     * 건설 메뉴 표시
     */
    showBuildMenu() {
        this.elements.buildMenu?.classList.remove('hidden');
        this.updateBuildMenu();
    }

    /**
     * 건설 메뉴 숨기기
     */
    hideBuildMenu() {
        this.elements.buildMenu?.classList.add('hidden');
    }

    /**
     * 건설 메뉴 업데이트
     */
    updateBuildMenu() {
        const faction = this.game.playerFaction;
        if (!faction) return;

        // 건물 탭 업데이트
        this.updateBuildingsTab(faction);

        // 유닛 탭 업데이트
        this.updateUnitsTab(faction);
    }

    /**
     * 건물 탭 업데이트
     */
    updateBuildingsTab(faction) {
        const tab = this.elements.buildingsTab;
        if (!tab) return;

        tab.innerHTML = '';

        const configs = BUILDING_CONFIGS[faction.id];
        if (!configs) return;

        const resources = this.game.resourceSystem.getResources(this.game.playerTeam);

        for (const [type, config] of Object.entries(configs)) {
            if (config.isStarting) continue;

            const canAfford = resources.crystal >= config.cost.crystal &&
                resources.energy >= config.cost.energy;

            const item = this.createBuildItem(type, config, canAfford, 'building');
            tab.appendChild(item);
        }
    }

    /**
     * 유닛 탭 업데이트
     */
    updateUnitsTab(faction) {
        const tab = this.elements.unitsTab;
        if (!tab) return;

        tab.innerHTML = '';

        // 선택된 생산 건물 확인
        const selectedBuilding = this.game.selectionSystem?.getSelectedBuilding();
        if (!selectedBuilding || !selectedBuilding.canProduce) {
            tab.innerHTML = '<p style="padding: 20px; text-align: center; color: #888;">생산 건물을 선택하세요</p>';
            return;
        }

        const configs = UNIT_CONFIGS[faction.id];
        if (!configs) return;

        const resources = this.game.resourceSystem.getResources(this.game.playerTeam);
        const trainableUnits = selectedBuilding.buildableUnits || [];

        for (const type of trainableUnits) {
            const config = configs[type];
            if (!config) continue;

            const canAfford = resources.crystal >= config.cost.crystal &&
                resources.energy >= config.cost.energy;

            const item = this.createBuildItem(type, config, canAfford, 'unit');
            tab.appendChild(item);
        }
    }

    /**
     * 건설 아이템 생성
     */
    createBuildItem(type, config, canAfford, itemType) {
        const item = document.createElement('div');
        item.className = 'build-item' + (canAfford ? '' : ' disabled');

        item.innerHTML = `
            <span class="item-icon">${config.icon}</span>
            <span class="item-name">${config.name}</span>
            <span class="item-cost">
                <span>💎${config.cost.crystal}</span>
                ${config.cost.energy > 0 ? `<span>⚡${config.cost.energy}</span>` : ''}
            </span>
        `;

        item.addEventListener('click', () => {
            if (!canAfford) {
                this.showToast('자원이 부족합니다!', 'error');
                return;
            }

            if (itemType === 'building') {
                this.game.buildSystem.startBuild(type);
                this.hideBuildMenu();
            } else if (itemType === 'unit') {
                const building = this.game.selectionSystem.getSelectedBuilding();
                if (building) {
                    building.startProduction(type);
                    this.updateBuildMenu();
                }
            }
        });

        return item;
    }

    /**
     * 탭 전환
     */
    switchTab(tabName) {
        // 탭 버튼 활성화
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // 탭 컨텐츠 표시
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        // 유닛 탭이면 업데이트
        if (tabName === 'units') {
            this.updateUnitsTab(this.game.playerFaction);
        }
    }

    /**
     * 명령 발행
     */
    issueCommand(command) {
        switch (command) {
            case 'move':
                // 이동 모드 (클릭으로 이동)
                break;
            case 'attack':
                this.game.selectionSystem.setAttackMode(true);
                break;
            case 'stop':
                this.game.selectionSystem.stopSelectedUnits();
                break;
            case 'hold':
                this.game.selectionSystem.holdPosition();
                break;
        }
    }

    /**
     * 토스트 메시지 표시
     */
    showToast(message, type = 'info') {
        const container = this.elements.toastContainer;
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // 3초 후 제거
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}
