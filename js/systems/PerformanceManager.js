/**
 * PerformanceManager - 퍼포먼스 관리자
 */

export class PerformanceManager {
    constructor(game) {
        this.game = game;

        // FPS 측정
        this.fps = 60;
        this.frameTime = 0;
        this.frameTimes = [];
        this.maxFrameSamples = 60;

        // 퍼포먼스 설정
        this.settings = {
            particlesEnabled: true,
            shadowsEnabled: false,
            maxParticles: 500,
            maxEntities: 200,
            reducedEffects: false
        };

        // 자동 조절
        this.autoAdjust = true;
        this.lowFPSCount = 0;
        this.lowFPSThreshold = 25;
    }

    /**
     * 업데이트
     */
    update(deltaTime) {
        // 프레임 시간 기록
        this.frameTime = deltaTime;
        this.frameTimes.push(deltaTime);

        if (this.frameTimes.length > this.maxFrameSamples) {
            this.frameTimes.shift();
        }

        // 평균 FPS 계산
        if (this.frameTimes.length > 0) {
            const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
            this.fps = 1000 / avgFrameTime;
        }

        // 자동 품질 조절
        if (this.autoAdjust) {
            this.checkPerformance();
        }
    }

    /**
     * 퍼포먼스 체크 및 자동 조절
     */
    checkPerformance() {
        if (this.fps < this.lowFPSThreshold) {
            this.lowFPSCount++;

            // 5프레임 연속 낮은 FPS면 품질 낮춤
            if (this.lowFPSCount > 5) {
                this.reduceQuality();
                this.lowFPSCount = 0;
            }
        } else {
            this.lowFPSCount = 0;
        }
    }

    /**
     * 품질 낮추기
     */
    reduceQuality() {
        if (this.settings.maxParticles > 100) {
            this.settings.maxParticles = Math.floor(this.settings.maxParticles * 0.7);
            console.log(`파티클 수 감소: ${this.settings.maxParticles}`);
        }

        if (!this.settings.reducedEffects) {
            this.settings.reducedEffects = true;
            console.log('이펙트 품질 감소');
        }
    }

    /**
     * 파티클 생성 가능 여부
     */
    canCreateParticle() {
        if (!this.settings.particlesEnabled) return false;

        const currentParticles = this.game.effectSystem?.particles?.length || 0;
        return currentParticles < this.settings.maxParticles;
    }

    /**
     * 엔티티 생성 가능 여부
     */
    canCreateEntity() {
        return this.game.entities.length < this.settings.maxEntities;
    }

    /**
     * 평균 FPS 반환
     */
    getAverageFPS() {
        return this.fps;
    }

    /**
     * 프레임 시간 반환
     */
    getFrameTime() {
        return this.frameTime;
    }

    /**
     * 메모리 사용량 (대략적)
     */
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                total: Math.round(performance.memory.totalJSHeapSize / 1048576)
            };
        }
        return { used: 0, total: 0 };
    }

    /**
     * 설정 저장
     */
    saveSettings() {
        localStorage.setItem('star_siege_performance', JSON.stringify(this.settings));
    }

    /**
     * 설정 불러오기
     */
    loadSettings() {
        const saved = localStorage.getItem('star_siege_performance');
        if (saved) {
            try {
                Object.assign(this.settings, JSON.parse(saved));
            } catch (e) {
                console.error('퍼포먼스 설정 로드 실패:', e);
            }
        }
    }
}
