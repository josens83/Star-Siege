/**
 * SelectionSystem - 선택 시스템
 */

import { SELECTION, COMMANDS, EVENTS, COLORS } from '../utils/Constants.js';
import { Vector2 } from '../utils/Vector2.js';
import { Unit } from '../entities/Unit.js';
import { Building } from '../entities/Building.js';
import { ResourceNode } from '../entities/ResourceNode.js';

export class SelectionSystem {
    constructor(game) {
        this.game = game;

        // 선택된 엔티티
        this.selectedEntities = [];

        // 드래그 선택
        this.isSelecting = false;
        this.selectionStart = new Vector2();
        this.selectionEnd = new Vector2();

        // 공격 모드
        this.attackMode = false;

        // 컨트롤 그룹
        this.controlGroups = new Map();
    }

    /**
     * 선택 시작
     */
    startSelection(x, y) {
        this.isSelecting = true;
        this.selectionStart.set(x, y);
        this.selectionEnd.set(x, y);
    }

    /**
     * 선택 업데이트
     */
    updateSelection(x, y) {
        if (this.isSelecting) {
            this.selectionEnd.set(x, y);
        }
    }

    /**
     * 선택 완료 (드래그)
     */
    endSelection(x, y) {
        if (!this.isSelecting) return;

        this.selectionEnd.set(x, y);
        this.isSelecting = false;

        // 드래그 거리가 작으면 클릭 선택
        const distance = this.selectionStart.distanceTo(this.selectionEnd);
        if (distance < SELECTION.MIN_DRAG_DISTANCE) {
            this.clickSelect(x, y);
            return;
        }

        // 범위 내 유닛 선택
        const entities = this.game.getEntitiesInRect(
            this.selectionStart.x,
            this.selectionStart.y,
            this.selectionEnd.x,
            this.selectionEnd.y,
            (e) => e.team === this.game.playerTeam && e instanceof Unit
        );

        if (entities.length > 0) {
            // 최대 선택 수 제한
            const toSelect = entities.slice(0, SELECTION.MAX_SELECTION);
            this.setSelection(toSelect);
        }
    }

    /**
     * 클릭 선택
     */
    clickSelect(x, y) {
        const entity = this.game.getEntityAt(x, y);

        if (!entity) {
            // 빈 공간 클릭 - 선택 해제
            if (!this.game.inputManager.isKeyDown('ShiftLeft') &&
                !this.game.inputManager.isKeyDown('ShiftRight')) {
                this.clearSelection();
            }
            return;
        }

        // 자원 노드 클릭 - 일꾼에게 수집 명령
        if (entity instanceof ResourceNode) {
            const workers = this.getSelectedWorkers();
            if (workers.length > 0) {
                for (const worker of workers) {
                    worker.gatherResource(entity);
                }
                this.game.audioManager.playSound('command');
                return;
            }
        }

        // 적 클릭 - 공격 명령
        if (entity.team !== this.game.playerTeam) {
            const fighters = this.getSelectedFighters();
            if (fighters.length > 0) {
                for (const fighter of fighters) {
                    fighter.attackTarget(entity);
                }
                this.game.audioManager.playSound('attack');
                return;
            }
        }

        // Shift 클릭 - 토글 선택
        if (this.game.inputManager.isKeyDown('ShiftLeft') ||
            this.game.inputManager.isKeyDown('ShiftRight')) {
            this.toggleSelection(entity);
        } else {
            // 일반 클릭 - 단일 선택
            this.setSelection([entity]);
        }
    }

    /**
     * 더블클릭 선택 (같은 타입 모두)
     */
    doubleClickSelect(x, y) {
        const entity = this.game.getEntityAt(x, y);

        if (!entity || entity.team !== this.game.playerTeam) return;

        // 화면 내 같은 타입의 모든 유닛 선택
        const sameType = this.game.entities.filter(e =>
            e.team === this.game.playerTeam &&
            e.constructor === entity.constructor &&
            e.unitType === entity.unitType &&
            e.isAlive &&
            this.isInView(e)
        );

        const toSelect = sameType.slice(0, SELECTION.MAX_SELECTION);
        this.setSelection(toSelect);
    }

    /**
     * 화면 내 여부 체크
     */
    isInView(entity) {
        const screenPos = this.game.camera.worldToScreen(entity.position.x, entity.position.y);
        return screenPos.x >= 0 && screenPos.x <= this.game.screenWidth &&
            screenPos.y >= 0 && screenPos.y <= this.game.screenHeight;
    }

    /**
     * 선택 설정
     */
    setSelection(entities) {
        // 기존 선택 해제
        this.clearSelection();

        // 새 선택
        for (const entity of entities) {
            if (entity.team === this.game.playerTeam) {
                entity.select();
                this.selectedEntities.push(entity);
            }
        }

        // UI 업데이트
        this.updateUI();

        // 사운드
        if (this.selectedEntities.length > 0) {
            this.game.audioManager.playSound('select');
            this.game.emit(EVENTS.ENTITY_SELECTED, { entities: this.selectedEntities });
        }
    }

    /**
     * 선택 토글
     */
    toggleSelection(entity) {
        const index = this.selectedEntities.indexOf(entity);

        if (index !== -1) {
            // 선택 해제
            entity.deselect();
            this.selectedEntities.splice(index, 1);
        } else if (entity.team === this.game.playerTeam &&
            this.selectedEntities.length < SELECTION.MAX_SELECTION) {
            // 선택 추가
            entity.select();
            this.selectedEntities.push(entity);
        }

        this.updateUI();
    }

    /**
     * 선택 초기화
     */
    clearSelection() {
        for (const entity of this.selectedEntities) {
            entity.deselect();
        }
        this.selectedEntities = [];
        this.updateUI();
        this.game.emit(EVENTS.ENTITY_DESELECTED);
    }

    /**
     * 선택 취소 (드래그 중 취소)
     */
    cancelSelection() {
        this.isSelecting = false;
    }

    /**
     * 엔티티 선택 해제
     */
    deselectEntity(entity) {
        const index = this.selectedEntities.indexOf(entity);
        if (index !== -1) {
            entity.deselect();
            this.selectedEntities.splice(index, 1);
            this.updateUI();
        }
    }

    /**
     * 명령 발행
     */
    issueCommand(x, y) {
        if (this.selectedEntities.length === 0) return;

        const targetEntity = this.game.getEntityAt(x, y);

        // 공격 모드
        if (this.attackMode) {
            if (targetEntity && targetEntity.team !== this.game.playerTeam) {
                // 타겟 공격
                for (const entity of this.selectedEntities) {
                    if (entity instanceof Unit && entity.canAttack) {
                        entity.attackTarget(targetEntity);
                    }
                }
            } else {
                // 공격 이동
                for (const entity of this.selectedEntities) {
                    if (entity instanceof Unit) {
                        entity.attackMove(x, y);
                    }
                }
            }
            this.game.audioManager.playSound('attack');
            this.setAttackMode(false);
            return;
        }

        // 자원 노드 클릭 - 수집 명령
        if (targetEntity instanceof ResourceNode) {
            const workers = this.getSelectedWorkers();
            for (const worker of workers) {
                worker.gatherResource(targetEntity);
            }
            if (workers.length > 0) {
                this.game.audioManager.playSound('command');
                return;
            }
        }

        // 적 클릭 - 공격 명령
        if (targetEntity && targetEntity.team !== this.game.playerTeam) {
            const fighters = this.getSelectedFighters();
            for (const fighter of fighters) {
                fighter.attackTarget(targetEntity);
            }
            if (fighters.length > 0) {
                this.game.audioManager.playSound('attack');
                return;
            }
        }

        // 건물 클릭 (생산 건물) - 랠리 포인트 설정
        if (this.selectedEntities.length === 1 &&
            this.selectedEntities[0] instanceof Building &&
            this.selectedEntities[0].canProduce) {
            this.selectedEntities[0].setRallyPoint(x, y);
            this.game.audioManager.playSound('command');
            return;
        }

        // 이동 명령
        const units = this.selectedEntities.filter(e => e instanceof Unit);
        if (units.length > 0) {
            // 유닛들을 포메이션으로 배치
            const positions = this.calculateFormation(x, y, units.length);

            for (let i = 0; i < units.length; i++) {
                units[i].moveTo(positions[i].x, positions[i].y);
            }

            this.game.audioManager.playSound('command');

            // 이동 이펙트
            this.game.effectSystem.createMoveMarker(x, y);
        }
    }

    /**
     * 포메이션 위치 계산
     */
    calculateFormation(centerX, centerY, count) {
        const positions = [];
        const spacing = 40;

        if (count === 1) {
            positions.push(new Vector2(centerX, centerY));
        } else {
            // 사각형 포메이션
            const cols = Math.ceil(Math.sqrt(count));
            const rows = Math.ceil(count / cols);

            const startX = centerX - (cols - 1) * spacing / 2;
            const startY = centerY - (rows - 1) * spacing / 2;

            for (let i = 0; i < count; i++) {
                const col = i % cols;
                const row = Math.floor(i / cols);
                positions.push(new Vector2(
                    startX + col * spacing,
                    startY + row * spacing
                ));
            }
        }

        return positions;
    }

    /**
     * 선택된 일꾼 반환
     */
    getSelectedWorkers() {
        return this.selectedEntities.filter(e => e instanceof Unit && e.isWorker);
    }

    /**
     * 선택된 전투 유닛 반환
     */
    getSelectedFighters() {
        return this.selectedEntities.filter(e => e instanceof Unit && e.canAttack);
    }

    /**
     * 선택된 유닛 정지
     */
    stopSelectedUnits() {
        for (const entity of this.selectedEntities) {
            if (entity instanceof Unit) {
                entity.stop();
            }
        }
    }

    /**
     * 위치 고수
     */
    holdPosition() {
        for (const entity of this.selectedEntities) {
            if (entity instanceof Unit) {
                entity.holdPosition();
            }
        }
    }

    /**
     * 공격 모드 설정
     */
    setAttackMode(enabled) {
        this.attackMode = enabled;
        document.body.style.cursor = enabled ? 'crosshair' : 'default';
    }

    /**
     * 컨트롤 그룹 지정
     */
    assignControlGroup(number) {
        if (this.selectedEntities.length > 0) {
            this.controlGroups.set(number, [...this.selectedEntities]);
            this.game.showToast(`그룹 ${number} 지정됨`, 'info');
        }
    }

    /**
     * 컨트롤 그룹 선택
     */
    selectControlGroup(number) {
        const group = this.controlGroups.get(number);
        if (group) {
            // 죽은 유닛 제거
            const aliveUnits = group.filter(e => e.isAlive);
            this.controlGroups.set(number, aliveUnits);

            if (aliveUnits.length > 0) {
                this.setSelection(aliveUnits);

                // 더블탭 시 카메라 이동
                // (여기서는 단순 선택만)
            }
        }
    }

    /**
     * 선택된 엔티티 파괴 (디버그용)
     */
    destroySelected() {
        for (const entity of [...this.selectedEntities]) {
            entity.takeDamage(99999);
        }
    }

    /**
     * 선택 박스 렌더링
     */
    renderSelectionBox(ctx) {
        if (!this.isSelecting) return;

        const minX = Math.min(this.selectionStart.x, this.selectionEnd.x);
        const minY = Math.min(this.selectionStart.y, this.selectionEnd.y);
        const width = Math.abs(this.selectionEnd.x - this.selectionStart.x);
        const height = Math.abs(this.selectionEnd.y - this.selectionStart.y);

        // 배경
        ctx.fillStyle = 'rgba(68, 136, 255, 0.2)';
        ctx.fillRect(minX, minY, width, height);

        // 테두리
        ctx.strokeStyle = COLORS.PLAYER;
        ctx.lineWidth = 2;
        ctx.strokeRect(minX, minY, width, height);
    }

    /**
     * UI 업데이트
     */
    updateUI() {
        const commandPanel = document.getElementById('command-panel');
        const productionQueue = document.getElementById('production-queue');

        if (this.selectedEntities.length === 0) {
            commandPanel?.classList.add('hidden');
            return;
        }

        commandPanel?.classList.remove('hidden');

        // 첫 번째 선택된 엔티티 정보 표시
        const primary = this.selectedEntities[0];

        // 초상화
        const portraitIcon = document.getElementById('portrait-icon');
        const portraitName = document.getElementById('portrait-name');
        if (portraitIcon) portraitIcon.textContent = primary.icon;
        if (portraitName) {
            const name = primary.config?.name || primary.constructor.name;
            portraitName.textContent = this.selectedEntities.length > 1
                ? `${name} (${this.selectedEntities.length})`
                : name;
        }

        // 체력바
        const healthBar = document.getElementById('health-bar');
        const healthText = document.getElementById('health-text');
        const healthPercent = primary.health / primary.maxHealth * 100;
        if (healthBar) healthBar.style.width = `${healthPercent}%`;
        if (healthText) healthText.textContent = `${Math.ceil(primary.health)}/${primary.maxHealth}`;

        // 쉴드바
        const portraitShield = document.getElementById('portrait-shield');
        const shieldBar = document.getElementById('shield-bar');
        const shieldText = document.getElementById('shield-text');

        if (primary.maxShield > 0) {
            portraitShield?.classList.remove('hidden');
            const shieldPercent = primary.shield / primary.maxShield * 100;
            if (shieldBar) shieldBar.style.width = `${shieldPercent}%`;
            if (shieldText) shieldText.textContent = `${Math.ceil(primary.shield)}/${primary.maxShield}`;
        } else {
            portraitShield?.classList.add('hidden');
        }

        // 생산 큐 (건물인 경우)
        if (primary instanceof Building && primary.canProduce) {
            productionQueue?.classList.remove('hidden');
            this.updateProductionQueueUI(primary);
        } else {
            productionQueue?.classList.add('hidden');
        }
    }

    /**
     * 생산 큐 UI 업데이트
     */
    updateProductionQueueUI(building) {
        const queueItems = document.getElementById('queue-items');
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');

        if (!queueItems) return;

        // 큐 아이템 표시
        queueItems.innerHTML = '';

        // 현재 생산 중인 것
        if (building.currentProduction) {
            const item = document.createElement('div');
            item.className = 'queue-item';
            item.textContent = building.currentProduction.config?.icon || '?';
            queueItems.appendChild(item);
        }

        // 대기 중인 것들
        for (let i = 0; i < building.productionQueue.length; i++) {
            const prod = building.productionQueue[i];
            const item = document.createElement('div');
            item.className = 'queue-item';
            item.textContent = prod.config?.icon || '?';

            // 취소 버튼
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'cancel-btn';
            cancelBtn.textContent = '×';
            cancelBtn.onclick = () => building.cancelProduction(i);
            item.appendChild(cancelBtn);

            queueItems.appendChild(item);
        }

        // 진행률
        if (building.currentProduction) {
            const progress = building.productionProgress / building.currentProduction.buildTime * 100;
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progressText) {
                const remaining = Math.ceil(building.currentProduction.buildTime - building.productionProgress);
                progressText.textContent = `${remaining}초`;
            }
        } else {
            if (progressBar) progressBar.style.width = '0%';
            if (progressText) progressText.textContent = '';
        }
    }

    /**
     * 첫 번째 선택된 건물 반환
     */
    getSelectedBuilding() {
        return this.selectedEntities.find(e => e instanceof Building);
    }

    /**
     * 선택된 엔티티가 있는지
     */
    hasSelection() {
        return this.selectedEntities.length > 0;
    }
}
