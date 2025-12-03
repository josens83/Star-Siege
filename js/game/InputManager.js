/**
 * InputManager - 입력 관리자
 * 마우스/터치/키보드 입력 처리
 */

import { SELECTION, TOUCH, GAME_STATES } from '../utils/Constants.js';
import { Vector2 } from '../utils/Vector2.js';

export class InputManager {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;

        // 마우스 상태
        this.mousePosition = new Vector2();
        this.mouseWorldPosition = new Vector2();
        this.isMouseDown = false;
        this.mouseButton = -1;
        this.dragStart = new Vector2();
        this.isDragging = false;

        // 터치 상태
        this.touches = new Map();
        this.lastTapTime = 0;
        this.lastTapPosition = new Vector2();
        this.isPinching = false;
        this.pinchStartDistance = 0;
        this.pinchStartZoom = 1;

        // 키보드 상태
        this.keys = new Set();
        this.keyDownCallbacks = new Map();

        // 모바일 여부
        this.isMobile = this.detectMobile();

        // 이벤트 리스너 등록
        this.bindEvents();
    }

    /**
     * 모바일 기기 감지
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    }

    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        // 마우스 이벤트
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.onMouseLeave(e));
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // 터치 이벤트
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));
        this.canvas.addEventListener('touchcancel', (e) => this.onTouchEnd(e));

        // 키보드 이벤트
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        // 포커스 잃을 때
        window.addEventListener('blur', () => this.onBlur());
    }

    /**
     * 화면 좌표를 캔버스 좌표로 변환
     */
    getCanvasPosition(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        return new Vector2(
            clientX - rect.left,
            clientY - rect.top
        );
    }

    /**
     * 캔버스 좌표를 월드 좌표로 변환
     */
    getWorldPosition(canvasX, canvasY) {
        return this.game.camera.screenToWorld(canvasX, canvasY);
    }

    /**
     * 마우스 다운 이벤트
     */
    onMouseDown(e) {
        if (this.game.state !== GAME_STATES.PLAYING) return;

        this.isMouseDown = true;
        this.mouseButton = e.button;

        const canvasPos = this.getCanvasPosition(e.clientX, e.clientY);
        this.mousePosition.copy(canvasPos);
        this.dragStart.copy(canvasPos);
        this.isDragging = false;

        this.mouseWorldPosition = this.getWorldPosition(canvasPos.x, canvasPos.y);

        // 좌클릭: 선택 시작
        if (e.button === 0) {
            this.game.selectionSystem.startSelection(this.mouseWorldPosition.x, this.mouseWorldPosition.y);
        }
    }

    /**
     * 마우스 이동 이벤트
     */
    onMouseMove(e) {
        const canvasPos = this.getCanvasPosition(e.clientX, e.clientY);
        this.mousePosition.copy(canvasPos);
        this.mouseWorldPosition = this.getWorldPosition(canvasPos.x, canvasPos.y);

        if (this.game.state !== GAME_STATES.PLAYING) return;

        // 드래그 체크
        if (this.isMouseDown && !this.isDragging) {
            const distance = this.mousePosition.distanceTo(this.dragStart);
            if (distance > SELECTION.MIN_DRAG_DISTANCE) {
                this.isDragging = true;
            }
        }

        // 좌클릭 드래그: 범위 선택
        if (this.isMouseDown && this.mouseButton === 0) {
            this.game.selectionSystem.updateSelection(this.mouseWorldPosition.x, this.mouseWorldPosition.y);
        }

        // 우클릭 드래그: 카메라 이동 (데스크톱)
        if (this.isMouseDown && this.mouseButton === 2 && !this.isMobile) {
            const deltaX = e.movementX || 0;
            const deltaY = e.movementY || 0;
            this.game.camera.pan(-deltaX, -deltaY);
        }

        // 건설 미리보기 업데이트
        if (this.game.buildSystem.isPlacing) {
            this.game.buildSystem.updatePreview(this.mouseWorldPosition.x, this.mouseWorldPosition.y);
        }
    }

    /**
     * 마우스 업 이벤트
     */
    onMouseUp(e) {
        if (this.game.state !== GAME_STATES.PLAYING) {
            this.isMouseDown = false;
            return;
        }

        const canvasPos = this.getCanvasPosition(e.clientX, e.clientY);
        const worldPos = this.getWorldPosition(canvasPos.x, canvasPos.y);

        // 좌클릭
        if (e.button === 0) {
            if (this.isDragging) {
                // 드래그 선택 완료
                this.game.selectionSystem.endSelection(worldPos.x, worldPos.y);
            } else {
                // 단일 클릭
                if (this.game.buildSystem.isPlacing) {
                    // 건설 배치
                    this.game.buildSystem.placeBuild(worldPos.x, worldPos.y);
                } else {
                    // 선택
                    this.game.selectionSystem.clickSelect(worldPos.x, worldPos.y);
                }
            }
        }

        // 우클릭: 명령
        if (e.button === 2) {
            if (!this.isDragging) {
                if (this.game.buildSystem.isPlacing) {
                    // 건설 취소
                    this.game.buildSystem.cancelBuild();
                } else {
                    // 이동/공격 명령
                    this.game.selectionSystem.issueCommand(worldPos.x, worldPos.y);
                }
            }
        }

        this.isMouseDown = false;
        this.isDragging = false;
        this.mouseButton = -1;
    }

    /**
     * 마우스가 캔버스를 벗어날 때
     */
    onMouseLeave(e) {
        this.isMouseDown = false;
        this.isDragging = false;
    }

    /**
     * 마우스 휠 이벤트 (줌)
     */
    onWheel(e) {
        e.preventDefault();

        if (this.game.state !== GAME_STATES.PLAYING) return;

        const delta = e.deltaY > 0 ? -1 : 1;
        this.game.camera.zoom(delta * 0.1, this.mousePosition.x, this.mousePosition.y);
    }

    /**
     * 터치 시작 이벤트
     */
    onTouchStart(e) {
        e.preventDefault();

        // 터치 상태 업데이트
        for (const touch of e.changedTouches) {
            const canvasPos = this.getCanvasPosition(touch.clientX, touch.clientY);
            this.touches.set(touch.identifier, {
                id: touch.identifier,
                startPos: canvasPos.clone(),
                currentPos: canvasPos.clone(),
                startTime: performance.now()
            });
        }

        if (this.game.state !== GAME_STATES.PLAYING) return;

        const touchCount = this.touches.size;

        if (touchCount === 1) {
            // 싱글 터치
            const touch = this.touches.values().next().value;
            const worldPos = this.getWorldPosition(touch.startPos.x, touch.startPos.y);

            // 더블탭 체크
            const now = performance.now();
            const timeSinceLastTap = now - this.lastTapTime;
            const distFromLastTap = touch.startPos.distanceTo(this.lastTapPosition);

            if (timeSinceLastTap < SELECTION.DOUBLE_CLICK_TIME && distFromLastTap < TOUCH.TAP_THRESHOLD) {
                // 더블탭: 같은 타입 모두 선택
                this.game.selectionSystem.doubleClickSelect(worldPos.x, worldPos.y);
                this.lastTapTime = 0;
            } else {
                // 선택 시작
                this.game.selectionSystem.startSelection(worldPos.x, worldPos.y);
            }

            this.mouseWorldPosition.set(worldPos.x, worldPos.y);

        } else if (touchCount === 2) {
            // 핀치 줌 시작
            this.isPinching = true;
            const touchArray = Array.from(this.touches.values());
            this.pinchStartDistance = touchArray[0].currentPos.distanceTo(touchArray[1].currentPos);
            this.pinchStartZoom = this.game.camera.zoomLevel;

            // 선택 취소
            this.game.selectionSystem.cancelSelection();
        }
    }

    /**
     * 터치 이동 이벤트
     */
    onTouchMove(e) {
        e.preventDefault();

        // 터치 위치 업데이트
        for (const touch of e.changedTouches) {
            const touchData = this.touches.get(touch.identifier);
            if (touchData) {
                touchData.currentPos = this.getCanvasPosition(touch.clientX, touch.clientY);
            }
        }

        if (this.game.state !== GAME_STATES.PLAYING) return;

        const touchCount = this.touches.size;

        if (touchCount === 1 && !this.isPinching) {
            // 싱글 터치 드래그
            const touch = this.touches.values().next().value;
            const worldPos = this.getWorldPosition(touch.currentPos.x, touch.currentPos.y);

            // 드래그 거리 체크
            const dragDistance = touch.currentPos.distanceTo(touch.startPos);

            if (dragDistance > TOUCH.TAP_THRESHOLD) {
                // 범위 선택 업데이트
                this.game.selectionSystem.updateSelection(worldPos.x, worldPos.y);
            }

            // 건설 미리보기
            if (this.game.buildSystem.isPlacing) {
                this.game.buildSystem.updatePreview(worldPos.x, worldPos.y);
            }

            this.mouseWorldPosition.set(worldPos.x, worldPos.y);

        } else if (touchCount === 2) {
            // 핀치 줌 및 카메라 이동
            const touchArray = Array.from(this.touches.values());
            const currentDistance = touchArray[0].currentPos.distanceTo(touchArray[1].currentPos);

            // 줌
            if (this.isPinching) {
                const scale = currentDistance / this.pinchStartDistance;
                const newZoom = this.pinchStartZoom * scale;
                this.game.camera.setZoom(newZoom);
            }

            // 팬 (두 손가락의 중심점 이동)
            const center = Vector2.lerp(touchArray[0].currentPos, touchArray[1].currentPos, 0.5);
            const prevCenter = Vector2.lerp(
                touchArray[0].startPos,
                touchArray[1].startPos,
                0.5
            );

            // 이동 거리가 크면 카메라 이동
            const panDistance = center.distanceTo(prevCenter);
            if (panDistance > 5) {
                const deltaX = touchArray[0].currentPos.x - touchArray[0].startPos.x;
                const deltaY = touchArray[0].currentPos.y - touchArray[0].startPos.y;
                // 카메라는 터치 이동의 반대 방향으로 이동
                this.game.camera.pan(-deltaX * 0.5, -deltaY * 0.5);

                // 시작점 업데이트
                touchArray[0].startPos.copy(touchArray[0].currentPos);
                touchArray[1].startPos.copy(touchArray[1].currentPos);
            }
        }
    }

    /**
     * 터치 종료 이벤트
     */
    onTouchEnd(e) {
        for (const touch of e.changedTouches) {
            const touchData = this.touches.get(touch.identifier);

            if (touchData && this.game.state === GAME_STATES.PLAYING) {
                const duration = performance.now() - touchData.startTime;
                const distance = touchData.currentPos.distanceTo(touchData.startPos);

                // 탭 여부 확인
                const isTap = duration < TOUCH.TAP_DURATION && distance < TOUCH.TAP_THRESHOLD;

                if (isTap && this.touches.size === 1) {
                    const worldPos = this.getWorldPosition(touchData.currentPos.x, touchData.currentPos.y);

                    if (this.game.buildSystem.isPlacing) {
                        // 건설 배치
                        this.game.buildSystem.placeBuild(worldPos.x, worldPos.y);
                    } else {
                        // 클릭 선택
                        this.game.selectionSystem.clickSelect(worldPos.x, worldPos.y);
                    }

                    // 더블탭 기록
                    this.lastTapTime = performance.now();
                    this.lastTapPosition.copy(touchData.currentPos);
                } else if (distance > TOUCH.TAP_THRESHOLD && this.touches.size === 1) {
                    // 드래그 선택 완료
                    const worldPos = this.getWorldPosition(touchData.currentPos.x, touchData.currentPos.y);
                    this.game.selectionSystem.endSelection(worldPos.x, worldPos.y);
                }
            }

            this.touches.delete(touch.identifier);
        }

        // 모든 터치가 끝났으면 핀치 상태 해제
        if (this.touches.size === 0) {
            this.isPinching = false;
        }
    }

    /**
     * 키 다운 이벤트
     */
    onKeyDown(e) {
        // 이미 눌린 키면 무시 (키 반복 방지)
        if (this.keys.has(e.code)) return;

        this.keys.add(e.code);

        // 게임 중 키보드 단축키
        if (this.game.state === GAME_STATES.PLAYING) {
            switch (e.code) {
                case 'Escape':
                    if (this.game.buildSystem.isPlacing) {
                        this.game.buildSystem.cancelBuild();
                    } else {
                        this.game.pause();
                    }
                    break;

                case 'Space':
                    // 선택된 유닛 정지
                    this.game.selectionSystem.stopSelectedUnits();
                    break;

                case 'KeyA':
                    // 공격 명령 모드
                    this.game.selectionSystem.setAttackMode(true);
                    break;

                case 'KeyS':
                    // 정지
                    this.game.selectionSystem.stopSelectedUnits();
                    break;

                case 'KeyH':
                    // 위치 고수
                    this.game.selectionSystem.holdPosition();
                    break;

                case 'Delete':
                case 'Backspace':
                    // 선택된 건물/유닛 삭제 (디버그)
                    if (this.game.debug) {
                        this.game.selectionSystem.destroySelected();
                    }
                    break;

                case 'F1':
                    // 도움말
                    e.preventDefault();
                    break;

                case 'F2':
                    // 디버그 모드 토글
                    e.preventDefault();
                    this.game.toggleDebug();
                    break;

                // 숫자 키: 컨트롤 그룹
                case 'Digit1':
                case 'Digit2':
                case 'Digit3':
                case 'Digit4':
                case 'Digit5':
                case 'Digit6':
                case 'Digit7':
                case 'Digit8':
                case 'Digit9':
                case 'Digit0':
                    const groupNum = parseInt(e.code.replace('Digit', ''));
                    if (e.ctrlKey || e.metaKey) {
                        // Ctrl + 숫자: 그룹 지정
                        this.game.selectionSystem.assignControlGroup(groupNum);
                    } else {
                        // 숫자만: 그룹 선택
                        this.game.selectionSystem.selectControlGroup(groupNum);
                    }
                    break;
            }
        } else if (this.game.state === GAME_STATES.PAUSED) {
            if (e.code === 'Escape') {
                this.game.resume();
            }
        }

        // 등록된 콜백 실행
        if (this.keyDownCallbacks.has(e.code)) {
            this.keyDownCallbacks.get(e.code)(e);
        }
    }

    /**
     * 키 업 이벤트
     */
    onKeyUp(e) {
        this.keys.delete(e.code);

        if (this.game.state === GAME_STATES.PLAYING) {
            switch (e.code) {
                case 'KeyA':
                    // 공격 명령 모드 해제
                    this.game.selectionSystem.setAttackMode(false);
                    break;
            }
        }
    }

    /**
     * 포커스 잃을 때
     */
    onBlur() {
        // 모든 키 상태 초기화
        this.keys.clear();
        this.isMouseDown = false;
        this.isDragging = false;
        this.touches.clear();
        this.isPinching = false;
    }

    /**
     * 특정 키가 눌려있는지 확인
     */
    isKeyDown(code) {
        return this.keys.has(code);
    }

    /**
     * 이동 키 입력 값 반환 (WASD)
     */
    getMovementInput() {
        const input = new Vector2();

        if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) input.y -= 1;
        if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) input.y += 1;
        if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) input.x -= 1;
        if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) input.x += 1;

        if (input.magnitudeSquared() > 0) {
            input.normalize();
        }

        return input;
    }

    /**
     * 키 다운 콜백 등록
     */
    onKey(code, callback) {
        this.keyDownCallbacks.set(code, callback);
    }

    /**
     * 마우스 월드 좌표 반환
     */
    getMouseWorldPosition() {
        return this.mouseWorldPosition.clone();
    }

    /**
     * 현재 터치 수 반환
     */
    getTouchCount() {
        return this.touches.size;
    }
}
