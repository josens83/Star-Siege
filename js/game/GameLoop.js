/**
 * GameLoop - 게임 루프 관리
 * 프레임 업데이트 및 렌더링 타이밍 제어
 */

import { GAME } from '../utils/Constants.js';

export class GameLoop {
    constructor(game) {
        this.game = game;

        // 루프 상태
        this.isRunning = false;
        this.animationFrameId = null;

        // 타이밍
        this.lastTime = 0;
        this.accumulator = 0;
        this.frameCount = 0;

        // 성능 측정
        this.fps = 0;
        this.fpsTimer = 0;
        this.fpsCount = 0;

        // 프레임 제한 (모바일 성능 최적화)
        this.targetFPS = GAME.TARGET_FPS;
        this.frameInterval = 1000 / this.targetFPS;

        // 바인딩
        this.loop = this.loop.bind(this);
    }

    /**
     * 게임 루프 시작
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastTime = performance.now();
        this.accumulator = 0;
        this.fpsTimer = 0;
        this.fpsCount = 0;

        // requestAnimationFrame으로 루프 시작
        this.animationFrameId = requestAnimationFrame(this.loop);

        console.log('게임 루프 시작');
    }

    /**
     * 게임 루프 정지
     */
    stop() {
        if (!this.isRunning) return;

        this.isRunning = false;

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        console.log('게임 루프 정지');
    }

    /**
     * 메인 루프
     */
    loop(currentTime) {
        if (!this.isRunning) return;

        // 다음 프레임 요청
        this.animationFrameId = requestAnimationFrame(this.loop);

        // 델타 타임 계산
        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // 최대 델타 타임 제한 (탭 전환 후 큰 점프 방지)
        if (deltaTime > GAME.MAX_DELTA_TIME) {
            deltaTime = GAME.MAX_DELTA_TIME;
        }

        // FPS 계산
        this.fpsCount++;
        this.fpsTimer += deltaTime;
        if (this.fpsTimer >= 1000) {
            this.fps = this.fpsCount;
            this.fpsCount = 0;
            this.fpsTimer -= 1000;

            // 퍼포먼스 매니저에 전달
            if (this.game.performanceManager) {
                this.game.performanceManager.fps = this.fps;
            }
        }

        // 고정 타임스텝 물리/게임 로직 업데이트
        this.accumulator += deltaTime;

        while (this.accumulator >= GAME.FIXED_TIMESTEP) {
            this.game.update(GAME.FIXED_TIMESTEP);
            this.accumulator -= GAME.FIXED_TIMESTEP;
        }

        // 렌더링 (보간 비율 계산 가능)
        // const alpha = this.accumulator / GAME.FIXED_TIMESTEP;
        this.game.render();

        // 미니맵 업데이트
        if (this.game.minimap) {
            this.game.minimap.render();
        }

        this.frameCount++;
    }

    /**
     * 타겟 FPS 설정
     */
    setTargetFPS(fps) {
        this.targetFPS = fps;
        this.frameInterval = 1000 / fps;
    }

    /**
     * 현재 FPS 반환
     */
    getFPS() {
        return this.fps;
    }

    /**
     * 총 프레임 수 반환
     */
    getFrameCount() {
        return this.frameCount;
    }
}
