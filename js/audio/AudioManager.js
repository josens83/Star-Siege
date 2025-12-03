/**
 * AudioManager - 오디오 관리자
 * Web Audio API를 사용한 사운드 생성 및 재생
 */

import { AUDIO } from '../utils/Constants.js';

export class AudioManager {
    constructor(game) {
        this.game = game;

        // Web Audio Context
        this.context = null;
        this.masterGain = null;
        this.bgmGain = null;
        this.sfxGain = null;

        // 볼륨
        this.bgmVolume = AUDIO.DEFAULT_BGM_VOLUME;
        this.sfxVolume = AUDIO.DEFAULT_SFX_VOLUME;

        // 현재 BGM
        this.currentBGM = null;
        this.bgmSource = null;

        // 초기화
        this.init();
    }

    /**
     * 초기화
     */
    init() {
        // 사용자 상호작용 후 오디오 컨텍스트 생성
        const initAudio = () => {
            if (this.context) return;

            try {
                this.context = new (window.AudioContext || window.webkitAudioContext)();

                // 마스터 게인
                this.masterGain = this.context.createGain();
                this.masterGain.connect(this.context.destination);

                // BGM 게인
                this.bgmGain = this.context.createGain();
                this.bgmGain.gain.value = this.bgmVolume;
                this.bgmGain.connect(this.masterGain);

                // SFX 게인
                this.sfxGain = this.context.createGain();
                this.sfxGain.gain.value = this.sfxVolume;
                this.sfxGain.connect(this.masterGain);

                console.log('오디오 시스템 초기화됨');
            } catch (e) {
                console.error('오디오 초기화 실패:', e);
            }
        };

        // 클릭 시 초기화
        document.addEventListener('click', initAudio, { once: true });
        document.addEventListener('touchstart', initAudio, { once: true });
    }

    /**
     * BGM 재생
     */
    playBGM(type = 'battle') {
        if (!this.context) return;

        // 기존 BGM 정지
        this.stopBGM();

        // 간단한 BGM 생성 (실제로는 오디오 파일 사용)
        try {
            this.currentBGM = type;

            // 여기서는 간단한 앰비언스 생성
            // 실제 구현에서는 AudioBuffer를 로드해서 사용
        } catch (e) {
            console.error('BGM 재생 실패:', e);
        }
    }

    /**
     * BGM 정지
     */
    stopBGM() {
        if (this.bgmSource) {
            try {
                this.bgmSource.stop();
            } catch (e) {
                // 이미 정지됨
            }
            this.bgmSource = null;
        }
        this.currentBGM = null;
    }

    /**
     * 효과음 재생
     */
    playSound(type, position = null) {
        if (!this.context) return;

        try {
            // 위치 기반 볼륨 조절
            let volume = 1;
            if (position && this.game.camera) {
                const cameraPos = {
                    x: this.game.camera.x + this.game.screenWidth / 2,
                    y: this.game.camera.y + this.game.screenHeight / 2
                };
                const distance = Math.sqrt(
                    Math.pow(position.x - cameraPos.x, 2) +
                    Math.pow(position.y - cameraPos.y, 2)
                );
                volume = Math.max(0, 1 - distance / AUDIO.MAX_DISTANCE);

                if (volume <= 0) return;
            }

            // 사운드 생성
            const sound = this.generateSound(type);
            if (sound) {
                const gainNode = this.context.createGain();
                gainNode.gain.value = volume;
                gainNode.connect(this.sfxGain);

                sound.connect(gainNode);
                sound.start();
            }
        } catch (e) {
            // 오디오 에러 무시
        }
    }

    /**
     * 사운드 생성 (합성)
     */
    generateSound(type) {
        if (!this.context) return null;

        const oscillator = this.context.createOscillator();
        const envelope = this.context.createGain();

        oscillator.connect(envelope);

        const now = this.context.currentTime;

        switch (type) {
            case 'select':
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
                oscillator.type = 'sine';
                envelope.gain.setValueAtTime(0.2, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.stop(now + 0.1);
                break;

            case 'command':
                oscillator.frequency.setValueAtTime(400, now);
                oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.05);
                oscillator.type = 'sine';
                envelope.gain.setValueAtTime(0.15, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.stop(now + 0.1);
                break;

            case 'attack':
            case 'rifle':
                oscillator.frequency.setValueAtTime(150, now);
                oscillator.type = 'sawtooth';
                envelope.gain.setValueAtTime(0.3, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                oscillator.stop(now + 0.08);
                break;

            case 'hit':
                oscillator.frequency.setValueAtTime(100, now);
                oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.1);
                oscillator.type = 'square';
                envelope.gain.setValueAtTime(0.2, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.stop(now + 0.1);
                break;

            case 'death':
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.3);
                oscillator.type = 'sawtooth';
                envelope.gain.setValueAtTime(0.25, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.stop(now + 0.3);
                break;

            case 'laser':
                oscillator.frequency.setValueAtTime(1000, now);
                oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.15);
                oscillator.type = 'sine';
                envelope.gain.setValueAtTime(0.15, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.stop(now + 0.15);
                break;

            case 'cannon':
                oscillator.frequency.setValueAtTime(80, now);
                oscillator.frequency.exponentialRampToValueAtTime(30, now + 0.2);
                oscillator.type = 'triangle';
                envelope.gain.setValueAtTime(0.4, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.stop(now + 0.2);
                break;

            case 'buildStart':
                oscillator.frequency.setValueAtTime(300, now);
                oscillator.frequency.setValueAtTime(400, now + 0.1);
                oscillator.type = 'sine';
                envelope.gain.setValueAtTime(0.15, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.stop(now + 0.2);
                break;

            case 'buildComplete':
            case 'unitComplete':
                oscillator.frequency.setValueAtTime(500, now);
                oscillator.frequency.setValueAtTime(700, now + 0.1);
                oscillator.frequency.setValueAtTime(600, now + 0.2);
                oscillator.type = 'sine';
                envelope.gain.setValueAtTime(0.2, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.stop(now + 0.3);
                break;

            case 'error':
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.setValueAtTime(150, now + 0.1);
                oscillator.type = 'square';
                envelope.gain.setValueAtTime(0.2, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.stop(now + 0.2);
                break;

            case 'victory':
                this.playVictorySound();
                return null;

            case 'defeat':
                oscillator.frequency.setValueAtTime(400, now);
                oscillator.frequency.exponentialRampToValueAtTime(100, now + 1);
                oscillator.type = 'sawtooth';
                envelope.gain.setValueAtTime(0.3, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 1);
                oscillator.stop(now + 1);
                break;

            case 'waveStart':
            case 'bossWave':
                oscillator.frequency.setValueAtTime(100, now);
                oscillator.frequency.linearRampToValueAtTime(400, now + 0.3);
                oscillator.type = 'sawtooth';
                envelope.gain.setValueAtTime(0.3, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                oscillator.stop(now + 0.5);
                break;

            case 'objectiveComplete':
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.frequency.setValueAtTime(800, now + 0.1);
                oscillator.frequency.setValueAtTime(1000, now + 0.2);
                oscillator.type = 'sine';
                envelope.gain.setValueAtTime(0.2, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                oscillator.stop(now + 0.4);
                break;

            default:
                // 기본 사운드
                oscillator.frequency.setValueAtTime(440, now);
                oscillator.type = 'sine';
                envelope.gain.setValueAtTime(0.1, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.stop(now + 0.1);
        }

        return envelope;
    }

    /**
     * 승리 사운드 (여러 음표)
     */
    playVictorySound() {
        if (!this.context) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const now = this.context.currentTime;

        notes.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.frequency.setValueAtTime(freq, now + i * 0.15);
            osc.type = 'sine';

            gain.gain.setValueAtTime(0, now + i * 0.15);
            gain.gain.linearRampToValueAtTime(0.2, now + i * 0.15 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.3);

            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.3);
        });
    }

    /**
     * BGM 볼륨 설정
     */
    setBGMVolume(volume) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        if (this.bgmGain) {
            this.bgmGain.gain.value = this.bgmVolume;
        }
    }

    /**
     * SFX 볼륨 설정
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxVolume;
        }
    }

    /**
     * 마스터 볼륨 설정
     */
    setMasterVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    /**
     * 모든 사운드 정지
     */
    stopAll() {
        this.stopBGM();
    }
}
