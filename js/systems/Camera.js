/**
 * Camera - 카메라 시스템
 */

import { GAME, CAMERA } from '../utils/Constants.js';
import { Vector2 } from '../utils/Vector2.js';

export class Camera {
    constructor(game) {
        this.game = game;

        // 위치 (좌상단 기준)
        this.x = 0;
        this.y = 0;

        // 줌
        this.zoomLevel = CAMERA.DEFAULT_ZOOM;
        this.targetZoom = CAMERA.DEFAULT_ZOOM;

        // 뷰포트 크기
        this.viewportWidth = 0;
        this.viewportHeight = 0;

        // 이동
        this.targetX = 0;
        this.targetY = 0;
        this.smoothing = 0.1;

        // 흔들림
        this.shakeIntensity = 0;
        this.shakeDecay = 0.9;
        this.shakeOffset = new Vector2();

        // 경계
        this.minX = 0;
        this.minY = 0;
        this.maxX = GAME.MAP_WIDTH;
        this.maxY = GAME.MAP_HEIGHT;
    }

    /**
     * 뷰포트 업데이트
     */
    updateViewport(width, height) {
        this.viewportWidth = width;
        this.viewportHeight = height;
        this.updateBounds();
    }

    /**
     * 경계 업데이트
     */
    updateBounds() {
        const viewWidth = this.viewportWidth / this.zoomLevel;
        const viewHeight = this.viewportHeight / this.zoomLevel;

        this.minX = 0;
        this.minY = 0;
        this.maxX = Math.max(0, GAME.MAP_WIDTH - viewWidth);
        this.maxY = Math.max(0, GAME.MAP_HEIGHT - viewHeight);
    }

    /**
     * 업데이트
     */
    update(deltaTime) {
        // 키보드 입력으로 카메라 이동
        if (this.game.inputManager) {
            const input = this.game.inputManager.getMovementInput();
            if (!input.isZero()) {
                this.pan(
                    input.x * CAMERA.PAN_SPEED * (deltaTime / 1000),
                    input.y * CAMERA.PAN_SPEED * (deltaTime / 1000)
                );
            }
        }

        // 터치 컨트롤 (조이스틱)
        if (this.game.touchControls) {
            const joystickInput = this.game.touchControls.getJoystickInput();
            if (joystickInput && !joystickInput.isZero()) {
                this.pan(
                    joystickInput.x * CAMERA.PAN_SPEED * (deltaTime / 1000),
                    joystickInput.y * CAMERA.PAN_SPEED * (deltaTime / 1000)
                );
            }
        }

        // 부드러운 이동
        this.x += (this.targetX - this.x) * this.smoothing;
        this.y += (this.targetY - this.y) * this.smoothing;

        // 줌 부드럽게
        this.zoomLevel += (this.targetZoom - this.zoomLevel) * 0.1;
        if (Math.abs(this.targetZoom - this.zoomLevel) < 0.001) {
            this.zoomLevel = this.targetZoom;
        }

        // 경계 제한
        this.clampToBounds();

        // 흔들림 업데이트
        if (this.shakeIntensity > 0.1) {
            this.shakeOffset.set(
                (Math.random() - 0.5) * this.shakeIntensity,
                (Math.random() - 0.5) * this.shakeIntensity
            );
            this.shakeIntensity *= this.shakeDecay;
        } else {
            this.shakeIntensity = 0;
            this.shakeOffset.set(0, 0);
        }
    }

    /**
     * 카메라 이동
     */
    pan(dx, dy) {
        this.targetX += dx / this.zoomLevel;
        this.targetY += dy / this.zoomLevel;
        this.clampToBounds();
    }

    /**
     * 특정 위치로 이동
     */
    moveTo(x, y) {
        this.targetX = x - (this.viewportWidth / 2) / this.zoomLevel;
        this.targetY = y - (this.viewportHeight / 2) / this.zoomLevel;
        this.clampToBounds();
    }

    /**
     * 특정 위치를 중앙에
     */
    centerOn(x, y) {
        this.moveTo(x, y);
        // 즉시 이동
        this.x = this.targetX;
        this.y = this.targetY;
    }

    /**
     * 줌
     */
    zoom(delta, centerX = null, centerY = null) {
        const oldZoom = this.targetZoom;
        this.targetZoom = Math.max(CAMERA.MIN_ZOOM, Math.min(CAMERA.MAX_ZOOM, this.targetZoom + delta));

        // 마우스/터치 위치를 중심으로 줌
        if (centerX !== null && centerY !== null) {
            const zoomRatio = this.targetZoom / oldZoom;
            const worldCenterX = this.x + centerX / oldZoom;
            const worldCenterY = this.y + centerY / oldZoom;

            this.targetX = worldCenterX - centerX / this.targetZoom;
            this.targetY = worldCenterY - centerY / this.targetZoom;
        }

        this.updateBounds();
        this.clampToBounds();
    }

    /**
     * 줌 레벨 설정
     */
    setZoom(level) {
        this.targetZoom = Math.max(CAMERA.MIN_ZOOM, Math.min(CAMERA.MAX_ZOOM, level));
        this.updateBounds();
        this.clampToBounds();
    }

    /**
     * 경계 내로 제한
     */
    clampToBounds() {
        this.targetX = Math.max(this.minX, Math.min(this.maxX, this.targetX));
        this.targetY = Math.max(this.minY, Math.min(this.maxY, this.targetY));
    }

    /**
     * 카메라 흔들림
     */
    shake(intensity) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    }

    /**
     * 화면 좌표를 월드 좌표로 변환
     */
    screenToWorld(screenX, screenY) {
        return new Vector2(
            (screenX / this.zoomLevel) + this.x + this.shakeOffset.x,
            (screenY / this.zoomLevel) + this.y + this.shakeOffset.y
        );
    }

    /**
     * 월드 좌표를 화면 좌표로 변환
     */
    worldToScreen(worldX, worldY) {
        return new Vector2(
            (worldX - this.x - this.shakeOffset.x) * this.zoomLevel,
            (worldY - this.y - this.shakeOffset.y) * this.zoomLevel
        );
    }

    /**
     * 렌더링 변환 적용
     */
    applyTransform(ctx) {
        ctx.scale(this.zoomLevel, this.zoomLevel);
        ctx.translate(-this.x - this.shakeOffset.x, -this.y - this.shakeOffset.y);
    }

    /**
     * 뷰포트 내 여부 체크
     */
    isInView(x, y, margin = 50) {
        const viewWidth = this.viewportWidth / this.zoomLevel;
        const viewHeight = this.viewportHeight / this.zoomLevel;

        return x >= this.x - margin &&
            x <= this.x + viewWidth + margin &&
            y >= this.y - margin &&
            y <= this.y + viewHeight + margin;
    }

    /**
     * 뷰 영역 반환
     */
    getViewBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.viewportWidth / this.zoomLevel,
            height: this.viewportHeight / this.zoomLevel
        };
    }

    /**
     * 리셋
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.zoomLevel = CAMERA.DEFAULT_ZOOM;
        this.targetZoom = CAMERA.DEFAULT_ZOOM;
        this.shakeIntensity = 0;
    }

    /**
     * 직렬화
     */
    serialize() {
        return {
            x: this.x,
            y: this.y,
            zoomLevel: this.zoomLevel
        };
    }

    /**
     * 역직렬화
     */
    deserialize(data) {
        this.x = data.x;
        this.y = data.y;
        this.targetX = data.x;
        this.targetY = data.y;
        this.zoomLevel = data.zoomLevel;
        this.targetZoom = data.zoomLevel;
    }
}
