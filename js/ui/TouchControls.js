/**
 * TouchControls - 터치 컨트롤 (가상 조이스틱)
 */

import { TOUCH } from '../utils/Constants.js';
import { Vector2 } from '../utils/Vector2.js';

export class TouchControls {
    constructor(game) {
        this.game = game;

        // 조이스틱 요소
        this.container = document.getElementById('joystick-container');
        this.base = document.getElementById('joystick-base');
        this.thumb = document.getElementById('joystick-thumb');

        // 조이스틱 상태
        this.isActive = false;
        this.touchId = null;
        this.center = new Vector2();
        this.position = new Vector2();
        this.direction = new Vector2();

        // 크기
        this.baseRadius = TOUCH.JOYSTICK_SIZE / 2;
        this.thumbRadius = TOUCH.JOYSTICK_THUMB_SIZE / 2;
        this.maxDistance = this.baseRadius - this.thumbRadius;

        // 설정
        this.enabled = true;
        this.deadZone = TOUCH.JOYSTICK_DEAD_ZONE;

        // 이벤트 바인딩
        this.bindEvents();

        // 모바일 아니면 숨기기
        if (!this.game.inputManager?.isMobile) {
            this.container?.classList.add('hidden');
        }
    }

    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        if (!this.base) return;

        this.base.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        window.addEventListener('touchend', (e) => this.onTouchEnd(e));
        window.addEventListener('touchcancel', (e) => this.onTouchEnd(e));
    }

    /**
     * 터치 시작
     */
    onTouchStart(e) {
        if (!this.enabled) return;
        e.preventDefault();

        const touch = e.changedTouches[0];
        this.touchId = touch.identifier;
        this.isActive = true;

        // 조이스틱 중앙 위치 계산
        const rect = this.base.getBoundingClientRect();
        this.center.set(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2
        );

        this.updatePosition(touch.clientX, touch.clientY);
    }

    /**
     * 터치 이동
     */
    onTouchMove(e) {
        if (!this.isActive) return;

        for (const touch of e.changedTouches) {
            if (touch.identifier === this.touchId) {
                e.preventDefault();
                this.updatePosition(touch.clientX, touch.clientY);
                break;
            }
        }
    }

    /**
     * 터치 종료
     */
    onTouchEnd(e) {
        for (const touch of e.changedTouches) {
            if (touch.identifier === this.touchId) {
                this.reset();
                break;
            }
        }
    }

    /**
     * 위치 업데이트
     */
    updatePosition(clientX, clientY) {
        // 중앙에서의 오프셋 계산
        const dx = clientX - this.center.x;
        const dy = clientY - this.center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 최대 거리 제한
        let clampedX = dx;
        let clampedY = dy;

        if (distance > this.maxDistance) {
            const ratio = this.maxDistance / distance;
            clampedX = dx * ratio;
            clampedY = dy * ratio;
        }

        // 썸 위치 업데이트
        if (this.thumb) {
            this.thumb.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
        }

        // 방향 계산 (정규화)
        const normalizedDistance = Math.min(distance / this.maxDistance, 1);

        if (normalizedDistance < this.deadZone) {
            this.direction.set(0, 0);
        } else {
            const adjustedDistance = (normalizedDistance - this.deadZone) / (1 - this.deadZone);
            this.direction.set(
                (dx / distance) * adjustedDistance,
                (dy / distance) * adjustedDistance
            );
        }
    }

    /**
     * 리셋
     */
    reset() {
        this.isActive = false;
        this.touchId = null;
        this.direction.set(0, 0);

        if (this.thumb) {
            this.thumb.style.transform = 'translate(0, 0)';
        }
    }

    /**
     * 조이스틱 입력 반환
     */
    getJoystickInput() {
        if (!this.isActive) return null;
        return this.direction.clone();
    }

    /**
     * 활성화/비활성화
     */
    setEnabled(enabled) {
        this.enabled = enabled;

        if (!enabled) {
            this.reset();
        }

        if (this.container) {
            this.container.style.display = enabled ? 'block' : 'none';
        }
    }

    /**
     * 표시/숨기기
     */
    setVisible(visible) {
        if (this.container) {
            this.container.classList.toggle('hidden', !visible);
        }
    }
}
