/**
 * Star Siege - 설정 시스템
 * 게임 설정 관리 및 저장
 */

/**
 * 기본 설정 값
 */
export const DEFAULT_SETTINGS = {
    // 오디오 설정
    audio: {
        masterVolume: 0.7,
        musicVolume: 0.5,
        sfxVolume: 0.8,
        voiceVolume: 0.7,
        muted: false
    },

    // 그래픽 설정
    graphics: {
        quality: 'medium', // 'low', 'medium', 'high'
        particleEffects: true,
        screenShake: true,
        showDamageNumbers: true,
        showHealthBars: true,
        showMinimap: true,
        minimapSize: 'medium', // 'small', 'medium', 'large'
        fps: 60,
        autoQuality: true
    },

    // 게임플레이 설정
    gameplay: {
        difficulty: 'normal', // 'easy', 'normal', 'hard'
        autoSave: true,
        autoSaveInterval: 60, // 초
        confirmQuit: true,
        pauseOnFocusLoss: true,
        showTutorialHints: true,
        combatLog: false
    },

    // 컨트롤 설정
    controls: {
        touchSensitivity: 1.0,
        dragThreshold: 10,
        doubleTapTime: 300,
        longPressTime: 500,
        edgeScrolling: true,
        edgeScrollSpeed: 5,
        invertZoom: false,
        showVirtualJoystick: true,
        joystickPosition: 'left', // 'left', 'right'
        gesturesEnabled: true
    },

    // 알림 설정
    notifications: {
        pushEnabled: false,
        dailyReminder: false,
        reminderTime: '20:00',
        soundOnNotification: true,
        inGameAlerts: true,
        waveWarning: true,
        resourceWarning: true,
        unitCompletionAlert: true
    },

    // 접근성 설정
    accessibility: {
        colorBlindMode: 'none', // 'none', 'protanopia', 'deuteranopia', 'tritanopia'
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        screenReader: false
    },

    // 언어 설정
    language: 'ko', // 'ko', 'en', 'ja', 'zh'

    // 계정 연동
    account: {
        cloudSave: false,
        autoLogin: true,
        dataSharing: false
    }
};

/**
 * 그래픽 품질 프리셋
 */
export const QUALITY_PRESETS = {
    low: {
        particleEffects: false,
        screenShake: false,
        showDamageNumbers: false,
        fps: 30,
        maxParticles: 50,
        shadowsEnabled: false,
        antiAliasing: false
    },
    medium: {
        particleEffects: true,
        screenShake: true,
        showDamageNumbers: true,
        fps: 60,
        maxParticles: 200,
        shadowsEnabled: false,
        antiAliasing: false
    },
    high: {
        particleEffects: true,
        screenShake: true,
        showDamageNumbers: true,
        fps: 60,
        maxParticles: 500,
        shadowsEnabled: true,
        antiAliasing: true
    }
};

/**
 * 색맹 모드 색상 변환
 */
export const COLOR_BLIND_FILTERS = {
    none: null,
    protanopia: {
        // 적록색맹 (적색 약화)
        matrix: [
            0.567, 0.433, 0, 0, 0,
            0.558, 0.442, 0, 0, 0,
            0, 0.242, 0.758, 0, 0,
            0, 0, 0, 1, 0
        ]
    },
    deuteranopia: {
        // 적록색맹 (녹색 약화)
        matrix: [
            0.625, 0.375, 0, 0, 0,
            0.7, 0.3, 0, 0, 0,
            0, 0.3, 0.7, 0, 0,
            0, 0, 0, 1, 0
        ]
    },
    tritanopia: {
        // 청황색맹
        matrix: [
            0.95, 0.05, 0, 0, 0,
            0, 0.433, 0.567, 0, 0,
            0, 0.475, 0.525, 0, 0,
            0, 0, 0, 1, 0
        ]
    }
};

/**
 * 설정 시스템 클래스
 */
export class SettingsSystem {
    constructor(game) {
        this.game = game;
        this.settings = this.deepClone(DEFAULT_SETTINGS);
        this.listeners = new Map();

        this.load();
    }

    /**
     * 초기화
     */
    init() {
        this.applyAllSettings();
    }

    /**
     * 설정 값 가져오기
     */
    get(path) {
        const keys = path.split('.');
        let value = this.settings;

        for (const key of keys) {
            if (value === undefined || value === null) return undefined;
            value = value[key];
        }

        return value;
    }

    /**
     * 설정 값 변경
     */
    set(path, value) {
        const keys = path.split('.');
        let target = this.settings;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) {
                target[keys[i]] = {};
            }
            target = target[keys[i]];
        }

        const oldValue = target[keys[keys.length - 1]];
        target[keys[keys.length - 1]] = value;

        // 변경 알림
        this.notifyChange(path, value, oldValue);

        // 설정 적용
        this.applySetting(path, value);

        // 저장
        this.save();

        return true;
    }

    /**
     * 설정 변경 리스너 등록
     */
    onChange(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, []);
        }
        this.listeners.get(path).push(callback);

        // 제거 함수 반환
        return () => {
            const callbacks = this.listeners.get(path);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }

    /**
     * 변경 알림
     */
    notifyChange(path, newValue, oldValue) {
        // 정확한 경로 리스너
        const exactListeners = this.listeners.get(path) || [];
        for (const callback of exactListeners) {
            callback(newValue, oldValue, path);
        }

        // 상위 경로 리스너 (예: 'audio'는 'audio.volume' 변경에도 알림)
        const parts = path.split('.');
        for (let i = parts.length - 1; i > 0; i--) {
            const parentPath = parts.slice(0, i).join('.');
            const parentListeners = this.listeners.get(parentPath) || [];
            for (const callback of parentListeners) {
                callback(this.get(parentPath), null, parentPath);
            }
        }
    }

    /**
     * 개별 설정 적용
     */
    applySetting(path, value) {
        switch (path) {
            // 오디오
            case 'audio.masterVolume':
            case 'audio.musicVolume':
            case 'audio.sfxVolume':
            case 'audio.muted':
                this.applyAudioSettings();
                break;

            // 그래픽
            case 'graphics.quality':
                this.applyQualityPreset(value);
                break;
            case 'graphics.particleEffects':
            case 'graphics.screenShake':
            case 'graphics.showDamageNumbers':
            case 'graphics.showHealthBars':
            case 'graphics.fps':
                this.applyGraphicsSettings();
                break;
            case 'graphics.showMinimap':
            case 'graphics.minimapSize':
                this.applyMinimapSettings();
                break;

            // 접근성
            case 'accessibility.colorBlindMode':
                this.applyColorBlindMode(value);
                break;
            case 'accessibility.highContrast':
                this.applyHighContrast(value);
                break;
            case 'accessibility.largeText':
                this.applyLargeText(value);
                break;
            case 'accessibility.reducedMotion':
                this.applyReducedMotion(value);
                break;

            // 언어
            case 'language':
                this.applyLanguage(value);
                break;
        }
    }

    /**
     * 모든 설정 적용
     */
    applyAllSettings() {
        this.applyAudioSettings();
        this.applyGraphicsSettings();
        this.applyMinimapSettings();
        this.applyAccessibilitySettings();
        this.applyLanguage(this.settings.language);
    }

    /**
     * 오디오 설정 적용
     */
    applyAudioSettings() {
        if (!this.game || !this.game.audio) return;

        const audio = this.settings.audio;
        this.game.audio.setMasterVolume(audio.muted ? 0 : audio.masterVolume);
        this.game.audio.setMusicVolume(audio.musicVolume);
        this.game.audio.setSFXVolume(audio.sfxVolume);
    }

    /**
     * 그래픽 품질 프리셋 적용
     */
    applyQualityPreset(quality) {
        const preset = QUALITY_PRESETS[quality];
        if (!preset) return;

        Object.entries(preset).forEach(([key, value]) => {
            this.settings.graphics[key] = value;
        });

        this.applyGraphicsSettings();
    }

    /**
     * 그래픽 설정 적용
     */
    applyGraphicsSettings() {
        if (!this.game) return;

        const graphics = this.settings.graphics;

        // 파티클 이펙트
        if (this.game.effects) {
            this.game.effects.enabled = graphics.particleEffects;
        }

        // 화면 흔들림
        if (this.game.camera) {
            this.game.camera.shakeEnabled = graphics.screenShake;
        }

        // 데미지 숫자
        if (this.game.effects) {
            this.game.effects.showDamageNumbers = graphics.showDamageNumbers;
        }

        // FPS
        if (this.game.loop) {
            this.game.loop.targetFPS = graphics.fps;
        }
    }

    /**
     * 미니맵 설정 적용
     */
    applyMinimapSettings() {
        if (!this.game || !this.game.minimap) return;

        const graphics = this.settings.graphics;

        this.game.minimap.visible = graphics.showMinimap;

        const sizes = {
            small: 120,
            medium: 160,
            large: 200
        };
        this.game.minimap.size = sizes[graphics.minimapSize] || 160;
    }

    /**
     * 접근성 설정 적용
     */
    applyAccessibilitySettings() {
        const accessibility = this.settings.accessibility;

        this.applyColorBlindMode(accessibility.colorBlindMode);
        this.applyHighContrast(accessibility.highContrast);
        this.applyLargeText(accessibility.largeText);
        this.applyReducedMotion(accessibility.reducedMotion);
    }

    /**
     * 색맹 모드 적용
     */
    applyColorBlindMode(mode) {
        const body = document.body;
        body.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia');

        if (mode !== 'none') {
            body.classList.add(`colorblind-${mode}`);
        }

        // CSS 필터 적용
        const filter = COLOR_BLIND_FILTERS[mode];
        if (filter && filter.matrix) {
            // SVG 필터 사용 (더 정확한 색상 변환)
            this.createColorBlindFilter(mode, filter.matrix);
        }
    }

    /**
     * 색맹 필터 SVG 생성
     */
    createColorBlindFilter(mode, matrix) {
        // 기존 필터 제거
        const existing = document.getElementById('colorblind-filter');
        if (existing) existing.remove();

        if (!matrix) return;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = 'colorblind-filter';
        svg.style.display = 'none';

        svg.innerHTML = `
            <defs>
                <filter id="colorblind-${mode}">
                    <feColorMatrix type="matrix" values="${matrix.join(' ')}"/>
                </filter>
            </defs>
        `;

        document.body.appendChild(svg);

        // 캔버스에 필터 적용
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            canvas.style.filter = `url(#colorblind-${mode})`;
        }
    }

    /**
     * 고대비 모드 적용
     */
    applyHighContrast(enabled) {
        document.body.classList.toggle('high-contrast', enabled);
    }

    /**
     * 큰 글자 모드 적용
     */
    applyLargeText(enabled) {
        document.body.classList.toggle('large-text', enabled);
        document.documentElement.style.fontSize = enabled ? '18px' : '14px';
    }

    /**
     * 모션 감소 모드 적용
     */
    applyReducedMotion(enabled) {
        document.body.classList.toggle('reduced-motion', enabled);

        if (enabled) {
            // 애니메이션 비활성화
            this.settings.graphics.screenShake = false;
            this.settings.graphics.particleEffects = false;
        }
    }

    /**
     * 언어 적용
     */
    applyLanguage(lang) {
        document.documentElement.lang = lang;
        // 실제 구현에서는 i18n 라이브러리 사용
        console.log(`언어 변경: ${lang}`);
    }

    /**
     * 설정 초기화
     */
    reset(category = null) {
        if (category) {
            this.settings[category] = this.deepClone(DEFAULT_SETTINGS[category]);
        } else {
            this.settings = this.deepClone(DEFAULT_SETTINGS);
        }

        this.applyAllSettings();
        this.save();
    }

    /**
     * 저장
     */
    save() {
        try {
            localStorage.setItem('starsiege_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('설정 저장 실패:', e);
        }
    }

    /**
     * 로드
     */
    load() {
        try {
            const saved = localStorage.getItem('starsiege_settings');
            if (!saved) return;

            const data = JSON.parse(saved);
            this.settings = this.mergeSettings(DEFAULT_SETTINGS, data);

            console.log('설정 로드 완료');

        } catch (e) {
            console.error('설정 로드 실패:', e);
            this.settings = this.deepClone(DEFAULT_SETTINGS);
        }
    }

    /**
     * 설정 병합 (새 설정 항목 추가 시 기본값 유지)
     */
    mergeSettings(defaults, saved) {
        const result = this.deepClone(defaults);

        for (const [key, value] of Object.entries(saved)) {
            if (result.hasOwnProperty(key)) {
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    result[key] = this.mergeSettings(result[key], value);
                } else {
                    result[key] = value;
                }
            }
        }

        return result;
    }

    /**
     * 깊은 복사
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * 설정 내보내기
     */
    export() {
        return JSON.stringify(this.settings, null, 2);
    }

    /**
     * 설정 가져오기
     */
    import(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.settings = this.mergeSettings(DEFAULT_SETTINGS, imported);
            this.applyAllSettings();
            this.save();
            return true;
        } catch (e) {
            console.error('설정 가져오기 실패:', e);
            return false;
        }
    }

    /**
     * 데이터 내보내기
     */
    serialize() {
        return this.settings;
    }

    /**
     * 데이터 가져오기
     */
    deserialize(data) {
        if (!data) return;
        this.settings = this.mergeSettings(DEFAULT_SETTINGS, data);
        this.applyAllSettings();
        this.save();
    }
}
