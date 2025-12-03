/**
 * Star Siege - 오디오 관리자 (개선판)
 * Web Audio API를 사용한 사운드 생성, BGM 합성 및 재생
 */

import { AUDIO } from '../utils/Constants.js';

/**
 * BGM 패턴 정의
 */
const BGM_PATTERNS = {
    menu: {
        bpm: 80,
        key: 'C',
        scale: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88], // C4 Major
        bassPattern: [0, 0, 4, 4, 3, 3, 4, 4],
        melodyPattern: [0, 2, 4, 2, 0, 2, 4, 5],
        padChords: [[0, 2, 4], [3, 5, 7], [4, 6, 8], [2, 4, 6]],
        style: 'ambient'
    },
    battle: {
        bpm: 120,
        key: 'Am',
        scale: [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00], // A minor
        bassPattern: [0, 0, 0, 3, 4, 4, 3, 0],
        melodyPattern: [4, 3, 2, 0, 2, 3, 4, 4],
        drumPattern: [1, 0, 1, 0, 1, 0, 1, 1],
        style: 'intense'
    },
    victory: {
        bpm: 100,
        key: 'C',
        scale: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88],
        melodyPattern: [0, 2, 4, 5, 4, 2, 0, 0],
        style: 'triumphant'
    },
    defeat: {
        bpm: 60,
        key: 'Dm',
        scale: [146.83, 164.81, 174.61, 196.00, 220.00, 233.08, 261.63],
        melodyPattern: [4, 3, 2, 1, 0, 0, 0, 0],
        style: 'somber'
    },
    wave: {
        bpm: 140,
        key: 'Em',
        scale: [164.81, 185.00, 196.00, 220.00, 246.94, 261.63, 293.66],
        bassPattern: [0, 0, 3, 3, 4, 4, 0, 0],
        drumPattern: [1, 0, 1, 1, 1, 0, 1, 1],
        style: 'urgent'
    }
};

export class AudioManager {
    constructor(game) {
        this.game = game;

        // Web Audio Context
        this.context = null;
        this.masterGain = null;
        this.bgmGain = null;
        this.sfxGain = null;
        this.voiceGain = null;

        // 볼륨
        this.masterVolume = 0.7;
        this.bgmVolume = AUDIO.DEFAULT_BGM_VOLUME;
        this.sfxVolume = AUDIO.DEFAULT_SFX_VOLUME;
        this.voiceVolume = 0.7;
        this.muted = false;

        // BGM 상태
        this.currentBGM = null;
        this.bgmPlaying = false;
        this.bgmNodes = [];
        this.bgmIntervals = [];

        // 사운드 풀 (동시 재생 최적화)
        this.soundPool = new Map();
        this.maxPoolSize = 20;

        // 최근 재생 추적 (중복 방지)
        this.recentSounds = new Map();
        this.soundCooldown = 50; // ms

        // 상태
        this.initialized = false;
        this.suspended = false;

        // 초기화
        this.init();
    }

    /**
     * 초기화
     */
    init() {
        const initAudio = async () => {
            if (this.context) return;

            try {
                this.context = new (window.AudioContext || window.webkitAudioContext)();

                // 마스터 게인
                this.masterGain = this.context.createGain();
                this.masterGain.gain.value = this.masterVolume;
                this.masterGain.connect(this.context.destination);

                // 컴프레서 (동적 범위 압축)
                this.compressor = this.context.createDynamicsCompressor();
                this.compressor.threshold.value = -24;
                this.compressor.knee.value = 30;
                this.compressor.ratio.value = 12;
                this.compressor.attack.value = 0.003;
                this.compressor.release.value = 0.25;
                this.compressor.connect(this.masterGain);

                // BGM 게인
                this.bgmGain = this.context.createGain();
                this.bgmGain.gain.value = this.bgmVolume;
                this.bgmGain.connect(this.compressor);

                // SFX 게인
                this.sfxGain = this.context.createGain();
                this.sfxGain.gain.value = this.sfxVolume;
                this.sfxGain.connect(this.compressor);

                // Voice 게인
                this.voiceGain = this.context.createGain();
                this.voiceGain.gain.value = this.voiceVolume;
                this.voiceGain.connect(this.compressor);

                // 리버브 (공간감)
                this.reverb = await this.createReverb();
                if (this.reverb) {
                    this.reverbGain = this.context.createGain();
                    this.reverbGain.gain.value = 0.3;
                    this.reverb.connect(this.reverbGain);
                    this.reverbGain.connect(this.compressor);
                }

                this.initialized = true;
                console.log('오디오 시스템 초기화됨');

                // 컨텍스트 상태 모니터링
                this.context.onstatechange = () => {
                    this.suspended = this.context.state === 'suspended';
                };

            } catch (e) {
                console.error('오디오 초기화 실패:', e);
            }
        };

        // 사용자 상호작용 시 초기화
        ['click', 'touchstart', 'keydown'].forEach(event => {
            document.addEventListener(event, initAudio, { once: true });
        });

        // 가시성 변경 시 처리
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }

    /**
     * 리버브 생성 (임펄스 응답)
     */
    async createReverb() {
        if (!this.context) return null;

        try {
            const sampleRate = this.context.sampleRate;
            const length = sampleRate * 2; // 2초 리버브
            const impulse = this.context.createBuffer(2, length, sampleRate);

            for (let channel = 0; channel < 2; channel++) {
                const channelData = impulse.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                    channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
                }
            }

            const convolver = this.context.createConvolver();
            convolver.buffer = impulse;
            return convolver;

        } catch (e) {
            console.warn('리버브 생성 실패:', e);
            return null;
        }
    }

    /**
     * 오디오 컨텍스트 재개
     */
    async resume() {
        if (this.context && this.context.state === 'suspended') {
            await this.context.resume();
            this.suspended = false;
        }
    }

    /**
     * 오디오 일시 정지
     */
    pause() {
        if (this.context && this.context.state === 'running') {
            // BGM 페이드아웃
            if (this.bgmGain) {
                const now = this.context.currentTime;
                this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, now);
                this.bgmGain.gain.linearRampToValueAtTime(0, now + 0.3);
            }
        }
    }

    /**
     * BGM 재생
     */
    playBGM(type = 'battle') {
        if (!this.context || !this.initialized) return;

        // 이미 같은 BGM이 재생 중이면 무시
        if (this.currentBGM === type && this.bgmPlaying) return;

        // 기존 BGM 정지
        this.stopBGM();

        const pattern = BGM_PATTERNS[type];
        if (!pattern) {
            console.warn(`알 수 없는 BGM 타입: ${type}`);
            return;
        }

        this.currentBGM = type;
        this.bgmPlaying = true;

        // BGM 스타일에 따라 다른 생성 방식
        switch (pattern.style) {
            case 'ambient':
                this.playAmbientBGM(pattern);
                break;
            case 'intense':
                this.playIntenseBGM(pattern);
                break;
            case 'triumphant':
                this.playTriumphantBGM(pattern);
                break;
            case 'somber':
                this.playSomberBGM(pattern);
                break;
            case 'urgent':
                this.playUrgentBGM(pattern);
                break;
            default:
                this.playIntenseBGM(pattern);
        }

        console.log(`BGM 재생: ${type}`);
    }

    /**
     * 앰비언트 BGM (메뉴용)
     */
    playAmbientBGM(pattern) {
        const beatDuration = 60 / pattern.bpm;

        // 패드 사운드
        const playPad = () => {
            if (!this.bgmPlaying) return;

            pattern.padChords.forEach((chord, chordIndex) => {
                setTimeout(() => {
                    if (!this.bgmPlaying) return;

                    chord.forEach(noteIndex => {
                        const freq = pattern.scale[noteIndex % pattern.scale.length];
                        this.playPadNote(freq * 0.5, beatDuration * 4);
                    });
                }, chordIndex * beatDuration * 4 * 1000);
            });
        };

        playPad();
        const padInterval = setInterval(() => {
            if (this.bgmPlaying) {
                playPad();
            } else {
                clearInterval(padInterval);
            }
        }, pattern.padChords.length * beatDuration * 4 * 1000);

        this.bgmIntervals.push(padInterval);
    }

    /**
     * 인텐스 BGM (전투용)
     */
    playIntenseBGM(pattern) {
        const beatDuration = 60 / pattern.bpm;
        let beatIndex = 0;

        const playBeat = () => {
            if (!this.bgmPlaying) return;

            // 베이스
            const bassNote = pattern.bassPattern[beatIndex % pattern.bassPattern.length];
            const bassFreq = pattern.scale[bassNote] * 0.5;
            this.playBassNote(bassFreq, beatDuration * 0.8);

            // 드럼
            if (pattern.drumPattern) {
                const drumHit = pattern.drumPattern[beatIndex % pattern.drumPattern.length];
                if (drumHit) {
                    this.playDrum('kick', beatDuration * 0.3);
                }
                if (beatIndex % 2 === 1) {
                    this.playDrum('hihat', beatDuration * 0.1);
                }
            }

            // 멜로디 (매 2박마다)
            if (beatIndex % 2 === 0) {
                const melodyNote = pattern.melodyPattern[(beatIndex / 2) % pattern.melodyPattern.length];
                const melodyFreq = pattern.scale[melodyNote];
                this.playMelodyNote(melodyFreq, beatDuration * 1.5);
            }

            beatIndex++;
        };

        playBeat();
        const beatInterval = setInterval(playBeat, beatDuration * 1000);
        this.bgmIntervals.push(beatInterval);
    }

    /**
     * 승리 BGM
     */
    playTriumphantBGM(pattern) {
        const beatDuration = 60 / pattern.bpm;

        // 승리 멜로디 재생
        pattern.melodyPattern.forEach((noteIndex, i) => {
            setTimeout(() => {
                if (!this.bgmPlaying) return;
                const freq = pattern.scale[noteIndex];
                this.playMelodyNote(freq, beatDuration * 2);
            }, i * beatDuration * 500);
        });
    }

    /**
     * 패배 BGM
     */
    playSomberBGM(pattern) {
        const beatDuration = 60 / pattern.bpm;

        pattern.melodyPattern.forEach((noteIndex, i) => {
            setTimeout(() => {
                if (!this.bgmPlaying) return;
                const freq = pattern.scale[noteIndex];
                this.playPadNote(freq * 0.5, beatDuration * 3);
            }, i * beatDuration * 1000);
        });
    }

    /**
     * 긴급 BGM (웨이브용)
     */
    playUrgentBGM(pattern) {
        const beatDuration = 60 / pattern.bpm;
        let beatIndex = 0;

        const playBeat = () => {
            if (!this.bgmPlaying) return;

            // 빠른 베이스
            const bassNote = pattern.bassPattern[beatIndex % pattern.bassPattern.length];
            const bassFreq = pattern.scale[bassNote] * 0.5;
            this.playBassNote(bassFreq, beatDuration * 0.5);

            // 드럼 (빠른 템포)
            if (pattern.drumPattern) {
                const drumHit = pattern.drumPattern[beatIndex % pattern.drumPattern.length];
                if (drumHit) {
                    this.playDrum('kick', beatDuration * 0.2);
                }
                this.playDrum('hihat', beatDuration * 0.05);
            }

            beatIndex++;
        };

        playBeat();
        const beatInterval = setInterval(playBeat, beatDuration * 500); // 2배 빠르게
        this.bgmIntervals.push(beatInterval);
    }

    /**
     * 패드 노트 재생
     */
    playPadNote(freq, duration) {
        if (!this.context) return;

        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        const filter = this.context.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.value = freq;

        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.Q.value = 1;

        const now = this.context.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.5);
        gain.gain.linearRampToValueAtTime(0.1, now + duration - 0.5);
        gain.gain.linearRampToValueAtTime(0, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        if (this.reverb) {
            gain.connect(this.reverb);
        }

        osc.start(now);
        osc.stop(now + duration);

        this.bgmNodes.push({ osc, gain });
    }

    /**
     * 베이스 노트 재생
     */
    playBassNote(freq, duration) {
        if (!this.context) return;

        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        const now = this.context.currentTime;
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + duration);

        this.bgmNodes.push({ osc, gain });
    }

    /**
     * 멜로디 노트 재생
     */
    playMelodyNote(freq, duration) {
        if (!this.context) return;

        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = 'triangle';
        osc.frequency.value = freq;

        const now = this.context.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        if (this.reverb) {
            const reverbSend = this.context.createGain();
            reverbSend.gain.value = 0.3;
            gain.connect(reverbSend);
            reverbSend.connect(this.reverb);
        }

        osc.start(now);
        osc.stop(now + duration);

        this.bgmNodes.push({ osc, gain });
    }

    /**
     * 드럼 재생
     */
    playDrum(type, duration) {
        if (!this.context) return;

        const now = this.context.currentTime;

        if (type === 'kick') {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);

            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

            osc.connect(gain);
            gain.connect(this.bgmGain);

            osc.start(now);
            osc.stop(now + duration);

        } else if (type === 'hihat') {
            // 노이즈 생성
            const bufferSize = this.context.sampleRate * duration;
            const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.context.createBufferSource();
            noise.buffer = buffer;

            const filter = this.context.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 7000;

            const gain = this.context.createGain();
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.bgmGain);

            noise.start(now);
            noise.stop(now + duration);
        }
    }

    /**
     * BGM 정지
     */
    stopBGM() {
        this.bgmPlaying = false;
        this.currentBGM = null;

        // 인터벌 정리
        this.bgmIntervals.forEach(interval => clearInterval(interval));
        this.bgmIntervals = [];

        // 노드 정리
        this.bgmNodes.forEach(node => {
            try {
                if (node.osc) node.osc.stop();
            } catch (e) {}
        });
        this.bgmNodes = [];
    }

    /**
     * 효과음 재생
     */
    playSound(type, position = null) {
        if (!this.context || !this.initialized || this.muted) return;

        // 쿨다운 체크
        const now = Date.now();
        const lastPlayed = this.recentSounds.get(type) || 0;
        if (now - lastPlayed < this.soundCooldown) return;
        this.recentSounds.set(type, now);

        try {
            // 위치 기반 볼륨 및 패닝
            let volume = 1;
            let pan = 0;

            if (position && this.game && this.game.camera) {
                const cameraCenter = {
                    x: this.game.camera.x + this.game.screenWidth / 2,
                    y: this.game.camera.y + this.game.screenHeight / 2
                };

                const dx = position.x - cameraCenter.x;
                const dy = position.y - cameraCenter.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                volume = Math.max(0, 1 - distance / (AUDIO.MAX_DISTANCE || 1000));
                pan = Math.max(-1, Math.min(1, dx / 500));

                if (volume <= 0.05) return;
            }

            // 사운드 생성
            const sound = this.generateSound(type);
            if (sound) {
                const gainNode = this.context.createGain();
                gainNode.gain.value = volume;

                // 스테레오 패닝
                if (this.context.createStereoPanner) {
                    const panner = this.context.createStereoPanner();
                    panner.pan.value = pan;
                    sound.connect(panner);
                    panner.connect(gainNode);
                } else {
                    sound.connect(gainNode);
                }

                gainNode.connect(this.sfxGain);
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

        const osc = this.context.createOscillator();
        const envelope = this.context.createGain();
        const now = this.context.currentTime;

        osc.connect(envelope);

        switch (type) {
            case 'select':
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
                osc.type = 'sine';
                envelope.gain.setValueAtTime(0.2, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                osc.stop(now + 0.08);
                break;

            case 'command':
            case 'move':
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
                osc.type = 'sine';
                envelope.gain.setValueAtTime(0.15, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                osc.stop(now + 0.08);
                break;

            case 'attack':
            case 'rifle':
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);
                osc.type = 'sawtooth';
                envelope.gain.setValueAtTime(0.25, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
                osc.stop(now + 0.06);
                break;

            case 'hit':
            case 'damage':
                osc.frequency.setValueAtTime(120, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
                osc.type = 'square';
                envelope.gain.setValueAtTime(0.2, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.stop(now + 0.1);
                break;

            case 'death':
            case 'explosion':
                return this.generateExplosionSound();

            case 'laser':
                osc.frequency.setValueAtTime(1200, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);
                osc.type = 'sine';
                envelope.gain.setValueAtTime(0.15, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                osc.stop(now + 0.12);
                break;

            case 'cannon':
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.exponentialRampToValueAtTime(25, now + 0.25);
                osc.type = 'triangle';
                envelope.gain.setValueAtTime(0.4, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                osc.stop(now + 0.25);
                break;

            case 'plasma':
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.linearRampToValueAtTime(400, now + 0.1);
                osc.frequency.linearRampToValueAtTime(600, now + 0.15);
                osc.type = 'sine';
                envelope.gain.setValueAtTime(0.2, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.stop(now + 0.15);
                break;

            case 'shield':
                osc.frequency.setValueAtTime(500, now);
                osc.frequency.linearRampToValueAtTime(800, now + 0.1);
                osc.type = 'sine';
                envelope.gain.setValueAtTime(0.1, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.stop(now + 0.15);
                break;

            case 'buildStart':
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.setValueAtTime(400, now + 0.1);
                osc.type = 'sine';
                envelope.gain.setValueAtTime(0.15, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.stop(now + 0.2);
                break;

            case 'buildComplete':
                return this.generateCompleteSound();

            case 'unitComplete':
                osc.frequency.setValueAtTime(500, now);
                osc.frequency.setValueAtTime(650, now + 0.08);
                osc.frequency.setValueAtTime(550, now + 0.15);
                osc.type = 'sine';
                envelope.gain.setValueAtTime(0.2, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                osc.stop(now + 0.25);
                break;

            case 'resource':
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1000, now + 0.05);
                osc.type = 'sine';
                envelope.gain.setValueAtTime(0.1, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                osc.stop(now + 0.08);
                break;

            case 'error':
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.setValueAtTime(150, now + 0.1);
                osc.type = 'square';
                envelope.gain.setValueAtTime(0.2, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.stop(now + 0.2);
                break;

            case 'levelUp':
            case 'achievement':
                return this.generateFanfareSound();

            case 'victory':
                this.playVictorySound();
                return null;

            case 'defeat':
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 1);
                osc.type = 'sawtooth';
                envelope.gain.setValueAtTime(0.3, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 1);
                osc.stop(now + 1);
                break;

            case 'waveStart':
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(400, now + 0.3);
                osc.type = 'sawtooth';
                envelope.gain.setValueAtTime(0.25, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                osc.stop(now + 0.4);
                break;

            case 'bossWave':
                return this.generateBossAlertSound();

            case 'countdown':
                osc.frequency.setValueAtTime(800, now);
                osc.type = 'sine';
                envelope.gain.setValueAtTime(0.2, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.stop(now + 0.15);
                break;

            case 'objectiveComplete':
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.setValueAtTime(800, now + 0.1);
                osc.frequency.setValueAtTime(1000, now + 0.2);
                osc.type = 'sine';
                envelope.gain.setValueAtTime(0.2, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
                osc.stop(now + 0.35);
                break;

            case 'ui_click':
                osc.frequency.setValueAtTime(1000, now);
                osc.type = 'sine';
                envelope.gain.setValueAtTime(0.1, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.stop(now + 0.05);
                break;

            case 'ui_hover':
                osc.frequency.setValueAtTime(600, now);
                osc.type = 'sine';
                envelope.gain.setValueAtTime(0.05, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
                osc.stop(now + 0.03);
                break;

            default:
                osc.frequency.setValueAtTime(440, now);
                osc.type = 'sine';
                envelope.gain.setValueAtTime(0.1, now);
                envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.stop(now + 0.1);
        }

        return envelope;
    }

    /**
     * 폭발 사운드 생성
     */
    generateExplosionSound() {
        if (!this.context) return null;

        const now = this.context.currentTime;
        const duration = 0.4;

        // 노이즈
        const bufferSize = this.context.sampleRate * duration;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.context.createBufferSource();
        noise.buffer = buffer;

        // 필터
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + duration);

        // 게인
        const gain = this.context.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        noise.connect(filter);
        filter.connect(gain);

        noise.start = noise.start.bind(noise);
        noise.stop(now + duration);

        return gain;
    }

    /**
     * 완료 사운드 생성
     */
    generateCompleteSound() {
        if (!this.context) return null;

        const now = this.context.currentTime;
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        const masterGain = this.context.createGain();
        masterGain.gain.value = 0.15;

        notes.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.frequency.value = freq;
            osc.type = 'sine';

            gain.gain.setValueAtTime(0, now + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.3, now + i * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.2);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.2);
        });

        return masterGain;
    }

    /**
     * 팡파레 사운드 생성
     */
    generateFanfareSound() {
        if (!this.context) return null;

        const now = this.context.currentTime;
        const notes = [392.00, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
        const masterGain = this.context.createGain();
        masterGain.gain.value = 0.2;

        notes.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.frequency.value = freq;
            osc.type = 'triangle';

            gain.gain.setValueAtTime(0, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.4, now + i * 0.1 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.3);
        });

        return masterGain;
    }

    /**
     * 보스 알림 사운드 생성
     */
    generateBossAlertSound() {
        if (!this.context) return null;

        const now = this.context.currentTime;
        const masterGain = this.context.createGain();
        masterGain.gain.value = 0.3;

        // 경고음 2회
        for (let i = 0; i < 2; i++) {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.frequency.setValueAtTime(200, now + i * 0.3);
            osc.frequency.linearRampToValueAtTime(500, now + i * 0.3 + 0.15);
            osc.type = 'sawtooth';

            gain.gain.setValueAtTime(0.4, now + i * 0.3);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.3 + 0.25);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now + i * 0.3);
            osc.stop(now + i * 0.3 + 0.25);
        }

        return masterGain;
    }

    /**
     * 승리 사운드
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

            osc.frequency.value = freq;
            osc.type = 'sine';

            gain.gain.setValueAtTime(0, now + i * 0.15);
            gain.gain.linearRampToValueAtTime(0.25, now + i * 0.15 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.4);

            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.4);
        });
    }

    /**
     * 볼륨 설정
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
        }
    }

    setBGMVolume(volume) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        if (this.bgmGain) {
            this.bgmGain.gain.value = this.bgmVolume;
        }
    }

    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxVolume;
        }
    }

    setVoiceVolume(volume) {
        this.voiceVolume = Math.max(0, Math.min(1, volume));
        if (this.voiceGain) {
            this.voiceGain.gain.value = this.voiceVolume;
        }
    }

    setMusicVolume(volume) {
        this.setBGMVolume(volume);
    }

    /**
     * 음소거
     */
    mute() {
        this.muted = true;
        if (this.masterGain) {
            this.masterGain.gain.value = 0;
        }
    }

    unmute() {
        this.muted = false;
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }

    toggleMute() {
        if (this.muted) {
            this.unmute();
        } else {
            this.mute();
        }
        return this.muted;
    }

    /**
     * 모든 사운드 정지
     */
    stopAll() {
        this.stopBGM();
    }

    /**
     * 정리
     */
    dispose() {
        this.stopAll();
        if (this.context) {
            this.context.close();
            this.context = null;
        }
    }
}
