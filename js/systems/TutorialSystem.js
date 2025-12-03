/**
 * TutorialSystem - 튜토리얼 시스템
 */

export class TutorialSystem {
    constructor(game) {
        this.game = game;

        // 튜토리얼 상태
        this.isActive = false;
        this.currentStep = 0;
        this.steps = [];

        // UI 요소
        this.overlay = document.getElementById('tutorial-overlay');
        this.highlight = document.getElementById('tutorial-highlight');
        this.message = document.getElementById('tutorial-message');
        this.textElement = document.getElementById('tutorial-text');
        this.finger = document.getElementById('tutorial-finger');
        this.skipBtn = document.getElementById('tutorial-skip');
        this.nextBtn = document.getElementById('tutorial-next');

        // 이벤트 바인딩
        this.bindEvents();

        // 튜토리얼 단계 정의
        this.defineSteps();
    }

    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        if (this.skipBtn) {
            this.skipBtn.addEventListener('click', () => this.skip());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }
    }

    /**
     * 튜토리얼 단계 정의
     */
    defineSteps() {
        this.steps = [
            {
                id: 'welcome',
                text: '🎮 Star Siege에 오신 것을 환영합니다!\n기본 조작법을 배워봅시다.',
                target: null,
                waitFor: 'click'
            },
            {
                id: 'camera_move',
                text: '📱 화면 왼쪽 하단의 조이스틱을 사용하거나\nWASD/방향키로 카메라를 이동할 수 있습니다.',
                target: '#joystick-container',
                waitFor: 'camera_move'
            },
            {
                id: 'select_command',
                text: '🏛️ 사령부를 탭하여 선택해보세요.\n선택된 건물은 강조 표시됩니다.',
                target: 'command_building',
                waitFor: 'select_building'
            },
            {
                id: 'produce_worker',
                text: '👷 사령부에서 일꾼을 생산할 수 있습니다.\n건설 메뉴를 열어 유닛을 생산해보세요.',
                target: '#build-button',
                waitFor: 'click'
            },
            {
                id: 'select_worker',
                text: '🔮 이제 일꾼을 선택해보세요.\n유닛을 탭하면 선택됩니다.',
                target: 'worker_unit',
                waitFor: 'select_unit'
            },
            {
                id: 'move_worker',
                text: '👆 빈 공간을 우클릭(또는 길게 탭)하면\n선택된 유닛이 이동합니다.',
                target: null,
                waitFor: 'unit_move'
            },
            {
                id: 'gather_resource',
                text: '💎 크리스탈에 우클릭하면 일꾼이\n자원을 수집합니다.',
                target: 'resource_node',
                waitFor: 'gather_start'
            },
            {
                id: 'open_build_menu',
                text: '🏗️ 건설 메뉴를 열어\n새로운 건물을 건설해봅시다.',
                target: '#build-button',
                waitFor: 'click'
            },
            {
                id: 'build_collector',
                text: '⛏️ 수집기를 선택하고\n크리스탈 근처에 배치하세요.',
                target: null,
                waitFor: 'build_complete'
            },
            {
                id: 'build_barracks',
                text: '🎖️ 병영을 건설하면\n전투 유닛을 생산할 수 있습니다.',
                target: null,
                waitFor: 'build_complete'
            },
            {
                id: 'train_marine',
                text: '🔫 병영에서 해병을 생산해보세요.\n전투 준비를 갖춥시다!',
                target: null,
                waitFor: 'unit_complete'
            },
            {
                id: 'complete',
                text: '🎉 훌륭합니다!\n이제 적과 싸울 준비가 되었습니다.\n행운을 빕니다!',
                target: null,
                waitFor: 'click'
            }
        ];
    }

    /**
     * 튜토리얼 시작
     */
    start() {
        this.isActive = true;
        this.currentStep = 0;
        this.showOverlay();
        this.showStep(0);
    }

    /**
     * 오버레이 표시
     */
    showOverlay() {
        if (this.overlay) {
            this.overlay.classList.remove('hidden');
        }
    }

    /**
     * 오버레이 숨기기
     */
    hideOverlay() {
        if (this.overlay) {
            this.overlay.classList.add('hidden');
        }
    }

    /**
     * 현재 단계 표시
     */
    showStep(index) {
        if (index >= this.steps.length) {
            this.complete();
            return;
        }

        const step = this.steps[index];
        this.currentStep = index;

        // 텍스트 업데이트
        if (this.textElement) {
            this.textElement.textContent = step.text;
        }

        // 하이라이트 업데이트
        this.updateHighlight(step.target);

        // 다음 버튼 텍스트
        if (this.nextBtn) {
            this.nextBtn.textContent = index === this.steps.length - 1 ? '완료' : '다음';
        }
    }

    /**
     * 하이라이트 업데이트
     */
    updateHighlight(target) {
        if (!this.highlight) return;

        if (!target) {
            this.highlight.style.display = 'none';
            return;
        }

        // UI 요소인 경우
        if (target.startsWith('#') || target.startsWith('.')) {
            const element = document.querySelector(target);
            if (element) {
                const rect = element.getBoundingClientRect();
                this.highlight.style.display = 'block';
                this.highlight.style.left = `${rect.left - 5}px`;
                this.highlight.style.top = `${rect.top - 5}px`;
                this.highlight.style.width = `${rect.width + 10}px`;
                this.highlight.style.height = `${rect.height + 10}px`;
            }
        }
        // 게임 오브젝트인 경우
        else if (target === 'command_building') {
            const building = this.game.buildings.find(
                b => b.team === this.game.playerTeam && b.config?.type === 'command'
            );
            if (building) {
                this.highlightEntity(building);
            }
        } else if (target === 'worker_unit') {
            const worker = this.game.units.find(
                u => u.team === this.game.playerTeam && u.isWorker
            );
            if (worker) {
                this.highlightEntity(worker);
            }
        } else if (target === 'resource_node') {
            const node = this.game.resourceNodes[0];
            if (node) {
                this.highlightEntity(node);
            }
        } else {
            this.highlight.style.display = 'none';
        }
    }

    /**
     * 엔티티 하이라이트
     */
    highlightEntity(entity) {
        const screenPos = this.game.camera.worldToScreen(entity.position.x, entity.position.y);
        const size = entity.size * this.game.camera.zoomLevel;

        this.highlight.style.display = 'block';
        this.highlight.style.left = `${screenPos.x - size / 2 - 10}px`;
        this.highlight.style.top = `${screenPos.y - size / 2 - 10}px`;
        this.highlight.style.width = `${size + 20}px`;
        this.highlight.style.height = `${size + 20}px`;
    }

    /**
     * 다음 단계
     */
    next() {
        this.showStep(this.currentStep + 1);
    }

    /**
     * 건너뛰기
     */
    skip() {
        this.complete();
    }

    /**
     * 튜토리얼 완료
     */
    complete() {
        this.isActive = false;
        this.hideOverlay();
        this.game.showToast('튜토리얼 완료! 이제 자유롭게 플레이하세요.', 'success');
    }

    /**
     * 업데이트
     */
    update(deltaTime) {
        if (!this.isActive) return;

        const step = this.steps[this.currentStep];

        // 하이라이트 위치 업데이트 (게임 오브젝트인 경우)
        if (step.target && !step.target.startsWith('#') && !step.target.startsWith('.')) {
            this.updateHighlight(step.target);
        }

        // 조건 체크
        this.checkStepCondition(step);
    }

    /**
     * 단계 조건 체크
     */
    checkStepCondition(step) {
        switch (step.waitFor) {
            case 'camera_move':
                // 카메라가 초기 위치에서 이동했는지 체크
                if (Math.abs(this.game.camera.x) > 50 || Math.abs(this.game.camera.y) > 50) {
                    this.next();
                }
                break;

            case 'select_building':
                // 건물이 선택되었는지 체크
                if (this.game.selectionSystem.getSelectedBuilding()) {
                    this.next();
                }
                break;

            case 'select_unit':
                // 유닛이 선택되었는지 체크
                if (this.game.selectionSystem.selectedEntities.some(e => e.isWorker)) {
                    this.next();
                }
                break;

            case 'unit_move':
                // 유닛이 이동 중인지 체크
                if (this.game.units.some(u => u.team === this.game.playerTeam && u.targetPosition)) {
                    this.next();
                }
                break;

            case 'gather_start':
                // 일꾼이 수집 중인지 체크
                if (this.game.units.some(u => u.team === this.game.playerTeam && u.targetResource)) {
                    this.next();
                }
                break;

            case 'build_complete':
                // 건물이 건설 완료되었는지 체크
                const newBuildings = this.game.buildings.filter(
                    b => b.team === this.game.playerTeam && b.isComplete && b.config?.type !== 'command'
                );
                if (newBuildings.length >= this.currentStep - 7) { // 수집기, 병영
                    this.next();
                }
                break;

            case 'unit_complete':
                // 전투 유닛이 생산되었는지 체크
                if (this.game.units.some(u =>
                    u.team === this.game.playerTeam && !u.isWorker
                )) {
                    this.next();
                }
                break;
        }
    }

    /**
     * 이벤트 트리거
     */
    triggerEvent(eventType) {
        if (!this.isActive) return;

        const step = this.steps[this.currentStep];
        if (step.waitFor === eventType) {
            this.next();
        }
    }
}
