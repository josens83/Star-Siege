/**
 * Star Siege - 설정 UI
 * 오디오, 그래픽, 게임플레이, 컨트롤, 접근성 설정 인터페이스
 */

/**
 * 탭 정보
 */
const TAB_INFO = {
    audio: { name: '오디오', icon: '🔊' },
    graphics: { name: '그래픽', icon: '🖥️' },
    gameplay: { name: '게임플레이', icon: '🎮' },
    controls: { name: '컨트롤', icon: '🕹️' },
    accessibility: { name: '접근성', icon: '♿' },
    account: { name: '계정', icon: '👤' }
};

/**
 * 설정 UI 클래스
 */
export class SettingsUI {
    constructor(game) {
        this.game = game;
        this.container = null;
        this.currentTab = 'audio';
        this.visible = false;
        this.pendingChanges = {};
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
        this.container.id = 'settings-ui';
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
        this.container.addEventListener('input', (e) => this.handleInput(e));
        this.container.addEventListener('change', (e) => this.handleChange(e));
    }

    /**
     * UI 표시
     */
    show() {
        this.visible = true;
        this.pendingChanges = {};
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

        if (target.classList.contains('reset-btn')) {
            const category = target.dataset.category;
            this.resetCategory(category);
            return;
        }

        if (target.classList.contains('toggle-btn')) {
            const path = target.dataset.path;
            if (path) {
                this.toggleSetting(path);
            }
            return;
        }

        if (target.classList.contains('option-btn')) {
            const path = target.dataset.path;
            const value = target.dataset.value;
            if (path && value !== undefined) {
                this.setSetting(path, value);
            }
            return;
        }
    }

    /**
     * 입력 처리 (슬라이더)
     */
    handleInput(e) {
        const target = e.target;

        if (target.classList.contains('setting-slider')) {
            const path = target.dataset.path;
            const value = parseFloat(target.value);
            const display = target.parentElement.querySelector('.slider-value');

            if (display) {
                display.textContent = Math.round(value * 100) + '%';
            }

            // 실시간 적용
            this.setSetting(path, value, false);
        }
    }

    /**
     * 변경 처리 (select)
     */
    handleChange(e) {
        const target = e.target;

        if (target.classList.contains('setting-select')) {
            const path = target.dataset.path;
            const value = target.value;
            this.setSetting(path, value);
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
     * 설정 값 변경
     */
    setSetting(path, value, save = true) {
        const settings = this.game?.settings;
        if (!settings) return;

        settings.set(path, value);

        if (save) {
            this.render();
        }
    }

    /**
     * 토글 설정
     */
    toggleSetting(path) {
        const settings = this.game?.settings;
        if (!settings) return;

        const currentValue = settings.get(path);
        settings.set(path, !currentValue);
        this.render();
    }

    /**
     * 카테고리 초기화
     */
    resetCategory(category) {
        if (confirm(`${TAB_INFO[category]?.name || category} 설정을 초기화하시겠습니까?`)) {
            const settings = this.game?.settings;
            if (settings) {
                settings.reset(category);
                this.render();
            }
        }
    }

    /**
     * 렌더링
     */
    render() {
        const settings = this.game?.settings;
        if (!settings) {
            this.container.innerHTML = '<div style="color: white; text-align: center; padding: 40px;">설정을 불러오는 중...</div>';
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
                    <h2 style="margin: 0; color: #9c27b0; font-size: 20px;">⚙️ 설정</h2>
                    <div style="color: #888; font-size: 12px; margin-top: 4px;">
                        게임 환경 설정
                    </div>
                </div>
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
                            padding: 8px 14px;
                            border-radius: 8px;
                            border: 1px solid ${isActive ? '#9c27b0' : '#333'};
                            background: ${isActive ? 'rgba(156, 39, 176, 0.2)' : 'transparent'};
                            color: ${isActive ? '#9c27b0' : '#888'};
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
            case 'audio':
                return this.renderAudioSettings();
            case 'graphics':
                return this.renderGraphicsSettings();
            case 'gameplay':
                return this.renderGameplaySettings();
            case 'controls':
                return this.renderControlsSettings();
            case 'accessibility':
                return this.renderAccessibilitySettings();
            case 'account':
                return this.renderAccountSettings();
            default:
                return '';
        }
    }

    /**
     * 오디오 설정 렌더링
     */
    renderAudioSettings() {
        const settings = this.game.settings;
        const audio = settings.settings.audio;

        return `
            <div style="flex: 1; overflow-y: auto; padding: 16px;">
                <!-- 음소거 토글 -->
                ${this.renderToggle('audio.muted', '🔇 전체 음소거', audio.muted)}

                <!-- 볼륨 슬라이더들 -->
                <div style="
                    background: rgba(30, 30, 50, 0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                    margin-top: 12px;
                ">
                    <h3 style="color: #fff; margin: 0 0 16px 0; font-size: 14px;">🔊 볼륨 설정</h3>

                    ${this.renderSlider('audio.masterVolume', '마스터 볼륨', audio.masterVolume)}
                    ${this.renderSlider('audio.musicVolume', '배경 음악', audio.musicVolume)}
                    ${this.renderSlider('audio.sfxVolume', '효과음', audio.sfxVolume)}
                    ${this.renderSlider('audio.voiceVolume', '음성', audio.voiceVolume)}
                </div>

                <!-- 사운드 테스트 -->
                <div style="
                    background: rgba(30, 30, 50, 0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                    margin-top: 12px;
                    text-align: center;
                ">
                    <button onclick="window.game?.audio?.playSound('select')" style="
                        background: #4caf50;
                        border: none;
                        border-radius: 8px;
                        padding: 10px 20px;
                        color: #fff;
                        font-size: 14px;
                        cursor: pointer;
                        margin: 4px;
                    ">🔈 테스트 효과음</button>
                </div>

                ${this.renderResetButton('audio')}
            </div>
        `;
    }

    /**
     * 그래픽 설정 렌더링
     */
    renderGraphicsSettings() {
        const settings = this.game.settings;
        const graphics = settings.settings.graphics;

        return `
            <div style="flex: 1; overflow-y: auto; padding: 16px;">
                <!-- 품질 프리셋 -->
                <div style="
                    background: rgba(30, 30, 50, 0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 12px;
                ">
                    <h3 style="color: #fff; margin: 0 0 12px 0; font-size: 14px;">🎨 그래픽 품질</h3>
                    ${this.renderOptionButtons('graphics.quality', [
                        { value: 'low', label: '낮음', desc: '최고 성능' },
                        { value: 'medium', label: '중간', desc: '균형' },
                        { value: 'high', label: '높음', desc: '최고 품질' }
                    ], graphics.quality)}
                </div>

                <!-- 개별 설정 -->
                <div style="
                    background: rgba(30, 30, 50, 0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 12px;
                ">
                    <h3 style="color: #fff; margin: 0 0 16px 0; font-size: 14px;">⚙️ 상세 설정</h3>

                    ${this.renderToggle('graphics.particleEffects', '✨ 파티클 효과', graphics.particleEffects)}
                    ${this.renderToggle('graphics.screenShake', '📳 화면 흔들림', graphics.screenShake)}
                    ${this.renderToggle('graphics.showDamageNumbers', '💥 데미지 숫자', graphics.showDamageNumbers)}
                    ${this.renderToggle('graphics.showHealthBars', '❤️ 체력바 표시', graphics.showHealthBars)}
                    ${this.renderToggle('graphics.autoQuality', '🔄 자동 품질 조절', graphics.autoQuality)}
                </div>

                <!-- 미니맵 설정 -->
                <div style="
                    background: rgba(30, 30, 50, 0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 12px;
                ">
                    <h3 style="color: #fff; margin: 0 0 12px 0; font-size: 14px;">🗺️ 미니맵</h3>
                    ${this.renderToggle('graphics.showMinimap', '미니맵 표시', graphics.showMinimap)}

                    <div style="margin-top: 12px;">
                        <div style="color: #888; font-size: 12px; margin-bottom: 8px;">미니맵 크기</div>
                        ${this.renderOptionButtons('graphics.minimapSize', [
                            { value: 'small', label: '작게' },
                            { value: 'medium', label: '보통' },
                            { value: 'large', label: '크게' }
                        ], graphics.minimapSize)}
                    </div>
                </div>

                <!-- FPS 설정 -->
                <div style="
                    background: rgba(30, 30, 50, 0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                ">
                    <h3 style="color: #fff; margin: 0 0 12px 0; font-size: 14px;">🎞️ 프레임 레이트</h3>
                    ${this.renderOptionButtons('graphics.fps', [
                        { value: '30', label: '30 FPS', desc: '배터리 절약' },
                        { value: '60', label: '60 FPS', desc: '부드러운 동작' }
                    ], String(graphics.fps))}
                </div>

                ${this.renderResetButton('graphics')}
            </div>
        `;
    }

    /**
     * 게임플레이 설정 렌더링
     */
    renderGameplaySettings() {
        const settings = this.game.settings;
        const gameplay = settings.settings.gameplay;

        return `
            <div style="flex: 1; overflow-y: auto; padding: 16px;">
                <!-- 난이도 -->
                <div style="
                    background: rgba(30, 30, 50, 0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 12px;
                ">
                    <h3 style="color: #fff; margin: 0 0 12px 0; font-size: 14px;">⚔️ 난이도</h3>
                    ${this.renderOptionButtons('gameplay.difficulty', [
                        { value: 'easy', label: '쉬움', desc: '적 체력 -30%' },
                        { value: 'normal', label: '보통', desc: '기본 난이도' },
                        { value: 'hard', label: '어려움', desc: '적 체력 +50%' }
                    ], gameplay.difficulty)}
                </div>

                <!-- 게임 설정 -->
                <div style="
                    background: rgba(30, 30, 50, 0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 12px;
                ">
                    <h3 style="color: #fff; margin: 0 0 16px 0; font-size: 14px;">🎮 게임 설정</h3>

                    ${this.renderToggle('gameplay.autoSave', '💾 자동 저장', gameplay.autoSave)}
                    ${this.renderToggle('gameplay.confirmQuit', '🚪 종료 확인', gameplay.confirmQuit)}
                    ${this.renderToggle('gameplay.pauseOnFocusLoss', '⏸️ 포커스 잃을 때 일시정지', gameplay.pauseOnFocusLoss)}
                    ${this.renderToggle('gameplay.showTutorialHints', '💡 튜토리얼 힌트', gameplay.showTutorialHints)}
                    ${this.renderToggle('gameplay.combatLog', '📋 전투 로그', gameplay.combatLog)}
                </div>

                <!-- 알림 설정 -->
                <div style="
                    background: rgba(30, 30, 50, 0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                ">
                    <h3 style="color: #fff; margin: 0 0 16px 0; font-size: 14px;">🔔 알림</h3>

                    ${this.renderToggle('notifications.inGameAlerts', '게임 내 알림', settings.settings.notifications.inGameAlerts)}
                    ${this.renderToggle('notifications.waveWarning', '웨이브 경고', settings.settings.notifications.waveWarning)}
                    ${this.renderToggle('notifications.resourceWarning', '자원 부족 경고', settings.settings.notifications.resourceWarning)}
                    ${this.renderToggle('notifications.unitCompletionAlert', '유닛 생산 완료', settings.settings.notifications.unitCompletionAlert)}
                </div>

                ${this.renderResetButton('gameplay')}
            </div>
        `;
    }

    /**
     * 컨트롤 설정 렌더링
     */
    renderControlsSettings() {
        const settings = this.game.settings;
        const controls = settings.settings.controls;

        return `
            <div style="flex: 1; overflow-y: auto; padding: 16px;">
                <!-- 터치 감도 -->
                <div style="
                    background: rgba(30, 30, 50, 0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 12px;
                ">
                    <h3 style="color: #fff; margin: 0 0 16px 0; font-size: 14px;">👆 터치 설정</h3>

                    ${this.renderSlider('controls.touchSensitivity', '터치 감도', controls.touchSensitivity, 0.5, 2.0)}

                    <div style="margin-top: 16px;">
                        <div style="color: #888; font-size: 12px; margin-bottom: 8px;">더블 탭 시간 (ms)</div>
                        ${this.renderOptionButtons('controls.doubleTapTime', [
                            { value: '200', label: '빠름' },
                            { value: '300', label: '보통' },
                            { value: '400', label: '느림' }
                        ], String(controls.doubleTapTime))}
                    </div>

                    <div style="margin-top: 16px;">
                        <div style="color: #888; font-size: 12px; margin-bottom: 8px;">롱 프레스 시간 (ms)</div>
                        ${this.renderOptionButtons('controls.longPressTime', [
                            { value: '300', label: '빠름' },
                            { value: '500', label: '보통' },
                            { value: '700', label: '느림' }
                        ], String(controls.longPressTime))}
                    </div>
                </div>

                <!-- 스크롤/줌 -->
                <div style="
                    background: rgba(30, 30, 50, 0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 12px;
                ">
                    <h3 style="color: #fff; margin: 0 0 16px 0; font-size: 14px;">🔄 스크롤 & 줌</h3>

                    ${this.renderToggle('controls.edgeScrolling', '🖱️ 엣지 스크롤', controls.edgeScrolling)}
                    ${this.renderToggle('controls.invertZoom', '🔍 줌 방향 반전', controls.invertZoom)}
                    ${this.renderToggle('controls.gesturesEnabled', '👋 제스처 활성화', controls.gesturesEnabled)}

                    ${controls.edgeScrolling ? `
                        <div style="margin-top: 12px;">
                            ${this.renderSlider('controls.edgeScrollSpeed', '엣지 스크롤 속도', controls.edgeScrollSpeed / 10, 0.1, 1.0)}
                        </div>
                    ` : ''}
                </div>

                <!-- 가상 조이스틱 -->
                <div style="
                    background: rgba(30, 30, 50, 0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                ">
                    <h3 style="color: #fff; margin: 0 0 16px 0; font-size: 14px;">🕹️ 가상 조이스틱</h3>

                    ${this.renderToggle('controls.showVirtualJoystick', '조이스틱 표시', controls.showVirtualJoystick)}

                    ${controls.showVirtualJoystick ? `
                        <div style="margin-top: 12px;">
                            <div style="color: #888; font-size: 12px; margin-bottom: 8px;">조이스틱 위치</div>
                            ${this.renderOptionButtons('controls.joystickPosition', [
                                { value: 'left', label: '⬅️ 왼쪽' },
                                { value: 'right', label: '➡️ 오른쪽' }
                            ], controls.joystickPosition)}
                        </div>
                    ` : ''}
                </div>

                ${this.renderResetButton('controls')}
            </div>
        `;
    }

    /**
     * 접근성 설정 렌더링
     */
    renderAccessibilitySettings() {
        const settings = this.game.settings;
        const accessibility = settings.settings.accessibility;

        return `
            <div style="flex: 1; overflow-y: auto; padding: 16px;">
                <!-- 시각 -->
                <div style="
                    background: rgba(30, 30, 50, 0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 12px;
                ">
                    <h3 style="color: #fff; margin: 0 0 16px 0; font-size: 14px;">👁️ 시각 설정</h3>

                    <div style="margin-bottom: 16px;">
                        <div style="color: #888; font-size: 12px; margin-bottom: 8px;">색맹 모드</div>
                        ${this.renderOptionButtons('accessibility.colorBlindMode', [
                            { value: 'none', label: '없음' },
                            { value: 'protanopia', label: '적색맹' },
                            { value: 'deuteranopia', label: '녹색맹' },
                            { value: 'tritanopia', label: '청색맹' }
                        ], accessibility.colorBlindMode)}
                    </div>

                    ${this.renderToggle('accessibility.highContrast', '🔲 고대비 모드', accessibility.highContrast)}
                    ${this.renderToggle('accessibility.largeText', '🔤 큰 글자', accessibility.largeText)}
                </div>

                <!-- 모션 -->
                <div style="
                    background: rgba(30, 30, 50, 0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 12px;
                ">
                    <h3 style="color: #fff; margin: 0 0 16px 0; font-size: 14px;">🎬 모션 설정</h3>

                    ${this.renderToggle('accessibility.reducedMotion', '⚡ 모션 감소', accessibility.reducedMotion)}

                    <div style="color: #666; font-size: 11px; margin-top: 8px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 4px;">
                        ℹ️ 모션 감소를 활성화하면 파티클 효과와 화면 흔들림이 비활성화됩니다.
                    </div>
                </div>

                <!-- 보조 기능 -->
                <div style="
                    background: rgba(30, 30, 50, 0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                ">
                    <h3 style="color: #fff; margin: 0 0 16px 0; font-size: 14px;">🔧 보조 기능</h3>

                    ${this.renderToggle('accessibility.screenReader', '📖 스크린 리더 지원', accessibility.screenReader)}

                    <div style="color: #666; font-size: 11px; margin-top: 8px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 4px;">
                        ℹ️ 스크린 리더 지원은 UI 요소에 대한 추가 설명을 제공합니다.
                    </div>
                </div>

                ${this.renderResetButton('accessibility')}
            </div>
        `;
    }

    /**
     * 계정 설정 렌더링
     */
    renderAccountSettings() {
        const settings = this.game.settings;
        const account = settings.settings.account;
        const language = settings.settings.language;

        return `
            <div style="flex: 1; overflow-y: auto; padding: 16px;">
                <!-- 언어 -->
                <div style="
                    background: rgba(30, 30, 50, 0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 12px;
                ">
                    <h3 style="color: #fff; margin: 0 0 12px 0; font-size: 14px;">🌍 언어</h3>
                    ${this.renderOptionButtons('language', [
                        { value: 'ko', label: '🇰🇷 한국어' },
                        { value: 'en', label: '🇺🇸 English' },
                        { value: 'ja', label: '🇯🇵 日本語' },
                        { value: 'zh', label: '🇨🇳 中文' }
                    ], language)}
                </div>

                <!-- 클라우드 -->
                <div style="
                    background: rgba(30, 30, 50, 0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 12px;
                ">
                    <h3 style="color: #fff; margin: 0 0 16px 0; font-size: 14px;">☁️ 클라우드</h3>

                    ${this.renderToggle('account.cloudSave', '클라우드 저장', account.cloudSave)}
                    ${this.renderToggle('account.autoLogin', '자동 로그인', account.autoLogin)}

                    <div style="margin-top: 16px; text-align: center;">
                        <button style="
                            background: #2196f3;
                            border: none;
                            border-radius: 8px;
                            padding: 10px 20px;
                            color: #fff;
                            font-size: 14px;
                            cursor: pointer;
                            margin: 4px;
                        ">📤 데이터 백업</button>
                        <button style="
                            background: #ff9800;
                            border: none;
                            border-radius: 8px;
                            padding: 10px 20px;
                            color: #fff;
                            font-size: 14px;
                            cursor: pointer;
                            margin: 4px;
                        ">📥 데이터 복원</button>
                    </div>
                </div>

                <!-- 개인정보 -->
                <div style="
                    background: rgba(30, 30, 50, 0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 12px;
                ">
                    <h3 style="color: #fff; margin: 0 0 16px 0; font-size: 14px;">🔒 개인정보</h3>

                    ${this.renderToggle('account.dataSharing', '데이터 공유 동의', account.dataSharing)}

                    <div style="color: #666; font-size: 11px; margin-top: 8px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 4px;">
                        ℹ️ 데이터 공유에 동의하시면 게임 개선을 위한 익명 통계가 수집됩니다.
                    </div>
                </div>

                <!-- 앱 정보 -->
                <div style="
                    background: rgba(30, 30, 50, 0.8);
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                    text-align: center;
                ">
                    <div style="font-size: 32px; margin-bottom: 8px;">🚀</div>
                    <div style="color: #fff; font-size: 16px; font-weight: bold;">Star Siege</div>
                    <div style="color: #888; font-size: 12px; margin-top: 4px;">버전 1.0.0</div>
                    <div style="color: #666; font-size: 11px; margin-top: 8px;">© 2024 Star Siege Team</div>

                    <div style="margin-top: 16px; display: flex; justify-content: center; gap: 8px;">
                        <button style="
                            background: transparent;
                            border: 1px solid #333;
                            border-radius: 8px;
                            padding: 8px 16px;
                            color: #888;
                            font-size: 12px;
                            cursor: pointer;
                        ">📋 이용약관</button>
                        <button style="
                            background: transparent;
                            border: 1px solid #333;
                            border-radius: 8px;
                            padding: 8px 16px;
                            color: #888;
                            font-size: 12px;
                            cursor: pointer;
                        ">🔐 개인정보처리방침</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 슬라이더 렌더링
     */
    renderSlider(path, label, value, min = 0, max = 1) {
        const percentage = Math.round(value * 100);

        return `
            <div style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #888; font-size: 13px;">${label}</span>
                    <span class="slider-value" style="color: #fff; font-size: 13px;">${percentage}%</span>
                </div>
                <input type="range" class="setting-slider" data-path="${path}"
                    min="${min}" max="${max}" step="0.01" value="${value}"
                    style="
                        width: 100%;
                        height: 8px;
                        border-radius: 4px;
                        background: #333;
                        outline: none;
                        -webkit-appearance: none;
                    "
                >
            </div>
        `;
    }

    /**
     * 토글 버튼 렌더링
     */
    renderToggle(path, label, value) {
        return `
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #222;
            ">
                <span style="color: #fff; font-size: 14px;">${label}</span>
                <button class="toggle-btn" data-path="${path}" style="
                    width: 50px;
                    height: 26px;
                    border-radius: 13px;
                    border: none;
                    background: ${value ? '#4caf50' : '#333'};
                    position: relative;
                    cursor: pointer;
                    transition: background 0.2s;
                ">
                    <div style="
                        width: 22px;
                        height: 22px;
                        border-radius: 11px;
                        background: #fff;
                        position: absolute;
                        top: 2px;
                        left: ${value ? '26px' : '2px'};
                        transition: left 0.2s;
                    "></div>
                </button>
            </div>
        `;
    }

    /**
     * 옵션 버튼 렌더링
     */
    renderOptionButtons(path, options, currentValue) {
        return `
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${options.map(opt => {
                    const isActive = String(opt.value) === String(currentValue);
                    return `
                        <button class="option-btn" data-path="${path}" data-value="${opt.value}" style="
                            flex: 1;
                            min-width: 80px;
                            padding: ${opt.desc ? '8px 12px' : '10px 16px'};
                            border-radius: 8px;
                            border: 1px solid ${isActive ? '#9c27b0' : '#333'};
                            background: ${isActive ? 'rgba(156, 39, 176, 0.2)' : 'transparent'};
                            color: ${isActive ? '#9c27b0' : '#888'};
                            font-size: 13px;
                            cursor: pointer;
                            text-align: center;
                        ">
                            <div>${opt.label}</div>
                            ${opt.desc ? `<div style="font-size: 10px; opacity: 0.7; margin-top: 2px;">${opt.desc}</div>` : ''}
                        </button>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * 리셋 버튼 렌더링
     */
    renderResetButton(category) {
        return `
            <div style="text-align: center; margin-top: 20px;">
                <button class="reset-btn" data-category="${category}" style="
                    background: transparent;
                    border: 1px solid #f44336;
                    border-radius: 8px;
                    padding: 8px 16px;
                    color: #f44336;
                    font-size: 12px;
                    cursor: pointer;
                ">🔄 ${TAB_INFO[category]?.name || ''} 설정 초기화</button>
            </div>
        `;
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
        this.currentTab = data.currentTab || 'audio';
    }
}
