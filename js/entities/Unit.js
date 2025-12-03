/**
 * Unit - 유닛 엔티티
 */

import { Entity } from './Entity.js';
import { Vector2 } from '../utils/Vector2.js';
import { ENTITY_STATES, COMMANDS, EVENTS, COLORS, DAMAGE_MULTIPLIERS } from '../utils/Constants.js';

export class Unit extends Entity {
    constructor(game, options = {}) {
        const config = options.config || {};

        super(game, {
            ...options,
            size: config.size || 24,
            maxHealth: config.health || 100,
            maxShield: config.shield || 0,
            shieldRegenRate: config.shieldRegenRate || 2,
            shieldRegenDelay: config.shieldRegenDelay || 3000,
            armor: config.armor || 0,
            visionRange: config.visionRange || 250
        });

        // 설정
        this.config = config;
        this.unitType = config.unitType || 'infantry';

        // 아이콘
        this.icon = config.icon || '👤';

        // 이동
        this.speed = config.speed || 100;
        this.velocity = new Vector2();
        this.targetPosition = null;
        this.path = [];

        // 공격
        this.canAttack = config.damage > 0;
        this.attackDamage = config.damage || 10;
        this.attackRange = config.range || 100;
        this.attackSpeed = config.attackSpeed || 1;
        this.attackCooldown = 0;
        this.target = null;

        // 일꾼 특성
        this.isWorker = config.isWorker || false;
        this.gatherRate = config.gatherRate || 5;
        this.carryCapacity = config.carryCapacity || 10;
        this.carriedResource = 0;
        this.targetResource = null;
        this.returnBuilding = null;

        // 건설 관련
        this.canBuild = config.canBuild || false;
        this.currentBuildTarget = null;

        // 치료 (의무병)
        this.canHeal = config.canHeal || false;
        this.healAmount = config.healAmount || 0;
        this.healRange = config.healRange || 0;
        this.healCooldown = 0;
        this.healTarget = null;

        // 명령
        this.currentCommand = null;
        this.commandQueue = [];

        // 회전
        this.rotation = 0;
        this.targetRotation = 0;
        this.rotationSpeed = 5;

        // 인구
        this.population = config.population || 1;

        // 상태
        this.isHoldingPosition = false;
    }

    /**
     * 업데이트
     */
    update(deltaTime) {
        super.update(deltaTime);

        // 쿨다운 감소
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime / 1000;
        }
        if (this.healCooldown > 0) {
            this.healCooldown -= deltaTime / 1000;
        }

        // 상태에 따른 업데이트
        switch (this.state) {
            case ENTITY_STATES.MOVING:
                this.updateMovement(deltaTime);
                break;
            case ENTITY_STATES.ATTACKING:
                this.updateAttack(deltaTime);
                break;
            case ENTITY_STATES.GATHERING:
                this.updateGathering(deltaTime);
                break;
            case ENTITY_STATES.BUILDING:
                this.updateBuilding(deltaTime);
                break;
            case ENTITY_STATES.IDLE:
                this.updateIdle(deltaTime);
                break;
        }

        // 치료 유닛인 경우
        if (this.canHeal) {
            this.updateHealing(deltaTime);
        }

        // 회전 업데이트
        this.updateRotation(deltaTime);
    }

    /**
     * 이동 업데이트
     */
    updateMovement(deltaTime) {
        if (!this.targetPosition) {
            this.state = ENTITY_STATES.IDLE;
            return;
        }

        const direction = Vector2.sub(this.targetPosition, this.position);
        const distance = direction.magnitude();

        if (distance < 5) {
            // 도착
            this.position.copy(this.targetPosition);
            this.velocity.set(0, 0);
            this.targetPosition = null;

            // 다음 명령 실행
            this.executeNextCommand();
            return;
        }

        // 이동
        direction.normalize();
        this.velocity = Vector2.mul(direction, this.speed);
        this.position.add(Vector2.mul(this.velocity, deltaTime / 1000));

        // 회전 목표 설정
        this.targetRotation = direction.angle();

        // 맵 경계 체크
        this.clampToMap();

        // 공격 이동 중이면 적 탐색
        if (this.currentCommand === COMMANDS.ATTACK_MOVE) {
            this.findAndAttackEnemy();
        }
    }

    /**
     * 공격 업데이트
     */
    updateAttack(deltaTime) {
        // 타겟 유효성 체크
        if (!this.target || !this.target.isAlive) {
            this.target = null;
            this.state = ENTITY_STATES.IDLE;
            return;
        }

        const distance = this.distanceTo(this.target);

        if (distance > this.attackRange) {
            // 사거리 밖 - 추격
            if (!this.isHoldingPosition) {
                this.moveTo(this.target.position.x, this.target.position.y);
            } else {
                this.target = null;
                this.state = ENTITY_STATES.IDLE;
            }
            return;
        }

        // 타겟 방향으로 회전
        const direction = Vector2.sub(this.target.position, this.position);
        this.targetRotation = direction.angle();

        // 공격 실행
        if (this.attackCooldown <= 0) {
            this.performAttack();
        }
    }

    /**
     * 공격 실행
     */
    performAttack() {
        if (!this.target) return;

        // 데미지 계산
        let damage = this.attackDamage;

        // 타입 상성 적용
        const attackerType = this.unitType;
        const defenderType = this.target.unitType || 'building';
        const multiplier = DAMAGE_MULTIPLIERS[attackerType]?.[defenderType] || 1;
        damage *= multiplier;

        // 진영 수정자 적용
        damage *= this.faction?.modifiers?.damage || 1;

        // 데미지 변동 (±10%)
        damage *= 0.9 + Math.random() * 0.2;

        // 투사체 생성 또는 즉시 데미지
        if (this.attackRange > 50) {
            // 원거리 공격 - 투사체 생성
            this.game.createProjectile(this, this.target, damage, this.config.projectileType || 'bullet');
        } else {
            // 근거리 공격 - 즉시 데미지
            this.target.takeDamage(damage, this);

            // 근접 공격 이펙트
            this.game.effectSystem.createHit(this.target.position.x, this.target.position.y);
        }

        // 쿨다운 설정
        this.attackCooldown = 1 / this.attackSpeed;

        // 사운드
        this.game.audioManager.playSound(this.config.attackSound || 'attack', this.position);
    }

    /**
     * 자원 수집 업데이트
     */
    updateGathering(deltaTime) {
        if (!this.targetResource || !this.targetResource.isAlive) {
            // 자원 소진됨
            this.findNewResource();
            return;
        }

        const distanceToResource = this.distanceTo(this.targetResource);

        if (this.carriedResource >= this.carryCapacity) {
            // 자원 가득 참 - 반납하러 이동
            this.returnResources();
            return;
        }

        if (distanceToResource > 30) {
            // 자원으로 이동
            this.moveTo(this.targetResource.position.x, this.targetResource.position.y);
            return;
        }

        // 자원 수집
        const gatherAmount = this.gatherRate * (deltaTime / 1000);
        const harvested = this.targetResource.harvest(gatherAmount);
        this.carriedResource += harvested;

        // 수집 애니메이션/이펙트
        if (Math.random() < 0.1) {
            this.game.effectSystem.createGather(this.position.x, this.position.y);
        }
    }

    /**
     * 자원 반납
     */
    returnResources() {
        if (!this.returnBuilding || !this.returnBuilding.isAlive) {
            // 반납 건물 찾기
            this.returnBuilding = this.game.getNearestEntity(
                this.position.x,
                this.position.y,
                (e) => e.team === this.team && e.isComplete &&
                    (e.config?.type === 'command' || e.config?.type === 'resource')
            );
        }

        if (!this.returnBuilding) {
            this.state = ENTITY_STATES.IDLE;
            return;
        }

        const distance = this.distanceTo(this.returnBuilding);

        if (distance > this.returnBuilding.size / 2 + 20) {
            // 건물로 이동
            this.moveTo(this.returnBuilding.position.x, this.returnBuilding.position.y);
            return;
        }

        // 자원 반납
        this.game.resourceSystem.addCrystal(this.team, this.carriedResource);
        this.game.stats.resourcesGathered += this.carriedResource;
        this.carriedResource = 0;

        // 다시 수집하러 이동
        if (this.targetResource && this.targetResource.isAlive && this.targetResource.amount > 0) {
            this.moveTo(this.targetResource.position.x, this.targetResource.position.y);
            this.state = ENTITY_STATES.GATHERING;
        } else {
            this.findNewResource();
        }
    }

    /**
     * 새 자원 찾기
     */
    findNewResource() {
        this.targetResource = this.game.getNearestEntity(
            this.position.x,
            this.position.y,
            (e) => e.constructor.name === 'ResourceNode' && e.amount > 0 && e.canGather()
        );

        if (this.targetResource) {
            this.gatherResource(this.targetResource);
        } else {
            this.state = ENTITY_STATES.IDLE;
        }
    }

    /**
     * 건설 업데이트
     */
    updateBuilding(deltaTime) {
        if (!this.currentBuildTarget || !this.currentBuildTarget.isAlive) {
            this.currentBuildTarget = null;
            this.state = ENTITY_STATES.IDLE;
            return;
        }

        const distance = this.distanceTo(this.currentBuildTarget);

        if (distance > this.currentBuildTarget.size / 2 + 30) {
            // 건물로 이동
            this.moveTo(this.currentBuildTarget.position.x, this.currentBuildTarget.position.y);
            return;
        }

        // 건설 중이면 대기 (Building에서 처리)
        if (this.currentBuildTarget.isComplete) {
            this.currentBuildTarget = null;
            this.state = ENTITY_STATES.IDLE;
        }
    }

    /**
     * 대기 상태 업데이트
     */
    updateIdle(deltaTime) {
        // 주변 적 자동 공격
        if (this.canAttack && !this.isHoldingPosition) {
            this.findAndAttackEnemy();
        }
    }

    /**
     * 치료 업데이트
     */
    updateHealing(deltaTime) {
        if (!this.canHeal || this.healCooldown > 0) return;

        // 치료 대상 찾기
        if (!this.healTarget || !this.healTarget.isAlive || this.healTarget.health >= this.healTarget.maxHealth) {
            this.healTarget = this.game.getNearestEntity(
                this.position.x,
                this.position.y,
                (e) => e.team === this.team && e instanceof Unit && e !== this &&
                    e.health < e.maxHealth && this.distanceTo(e) <= this.healRange
            );
        }

        if (this.healTarget) {
            // 치료 실행
            this.healTarget.heal(this.healAmount);
            this.healCooldown = 1;

            // 이펙트
            this.game.effectSystem.createHeal(this.healTarget.position.x, this.healTarget.position.y);
        }
    }

    /**
     * 회전 업데이트
     */
    updateRotation(deltaTime) {
        if (this.rotation !== this.targetRotation) {
            let diff = this.targetRotation - this.rotation;

            // 최단 경로로 회전
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;

            const rotationStep = this.rotationSpeed * (deltaTime / 1000);

            if (Math.abs(diff) < rotationStep) {
                this.rotation = this.targetRotation;
            } else {
                this.rotation += Math.sign(diff) * rotationStep;
            }
        }
    }

    /**
     * 적 찾아서 공격
     */
    findAndAttackEnemy() {
        const enemy = this.game.getNearestEntity(
            this.position.x,
            this.position.y,
            (e) => e.team !== this.team && e.isAlive && this.distanceTo(e) <= this.visionRange
        );

        if (enemy) {
            this.attackTarget(enemy);
        }
    }

    /**
     * 맵 경계 제한
     */
    clampToMap() {
        const { MAP_WIDTH, MAP_HEIGHT } = this.game.constructor.GAME || { MAP_WIDTH: 3200, MAP_HEIGHT: 2400 };
        this.position.x = Math.max(this.radius, Math.min(MAP_WIDTH - this.radius, this.position.x));
        this.position.y = Math.max(this.radius, Math.min(MAP_HEIGHT - this.radius, this.position.y));
    }

    /**
     * 이동 명령
     */
    moveTo(x, y) {
        this.targetPosition = new Vector2(x, y);
        this.target = null;
        this.state = ENTITY_STATES.MOVING;
        this.currentCommand = COMMANDS.MOVE;
    }

    /**
     * 공격 명령
     */
    attackTarget(target) {
        if (!this.canAttack) return;

        this.target = target;
        this.state = ENTITY_STATES.ATTACKING;
        this.currentCommand = COMMANDS.ATTACK;
    }

    /**
     * 공격 이동 명령
     */
    attackMove(x, y) {
        this.targetPosition = new Vector2(x, y);
        this.state = ENTITY_STATES.MOVING;
        this.currentCommand = COMMANDS.ATTACK_MOVE;
    }

    /**
     * 정지 명령
     */
    stop() {
        this.targetPosition = null;
        this.target = null;
        this.velocity.set(0, 0);
        this.state = ENTITY_STATES.IDLE;
        this.currentCommand = COMMANDS.STOP;
        this.isHoldingPosition = false;
    }

    /**
     * 위치 고수 명령
     */
    holdPosition() {
        this.stop();
        this.isHoldingPosition = true;
        this.currentCommand = COMMANDS.HOLD;
    }

    /**
     * 자원 수집 명령
     */
    gatherResource(resource) {
        if (!this.isWorker) return;

        this.targetResource = resource;
        resource.addGatherer(this);
        this.state = ENTITY_STATES.GATHERING;
        this.currentCommand = COMMANDS.GATHER;

        // 반납 건물 찾기
        this.returnBuilding = this.game.getNearestEntity(
            this.position.x,
            this.position.y,
            (e) => e.team === this.team && e.isComplete &&
                (e.config?.type === 'command' || e.config?.type === 'resource')
        );
    }

    /**
     * 건설 명령
     */
    buildAt(building) {
        if (!this.canBuild) return;

        this.currentBuildTarget = building;
        building.builder = this;
        this.state = ENTITY_STATES.BUILDING;
        this.currentCommand = COMMANDS.BUILD;
    }

    /**
     * 다음 명령 실행
     */
    executeNextCommand() {
        if (this.commandQueue.length > 0) {
            const cmd = this.commandQueue.shift();
            this.executeCommand(cmd);
        } else {
            this.state = ENTITY_STATES.IDLE;
            this.currentCommand = null;
        }
    }

    /**
     * 명령 실행
     */
    executeCommand(cmd) {
        switch (cmd.type) {
            case COMMANDS.MOVE:
                this.moveTo(cmd.x, cmd.y);
                break;
            case COMMANDS.ATTACK:
                if (cmd.target) {
                    this.attackTarget(cmd.target);
                }
                break;
            case COMMANDS.ATTACK_MOVE:
                this.attackMove(cmd.x, cmd.y);
                break;
            case COMMANDS.GATHER:
                if (cmd.target) {
                    this.gatherResource(cmd.target);
                }
                break;
            case COMMANDS.BUILD:
                if (cmd.target) {
                    this.buildAt(cmd.target);
                }
                break;
        }
    }

    /**
     * 명령 큐에 추가
     */
    queueCommand(cmd) {
        this.commandQueue.push(cmd);
    }

    /**
     * 렌더링
     */
    render(ctx) {
        const x = this.position.x;
        const y = this.position.y;

        // 선택 원
        this.renderSelectionCircle(ctx);

        // 유닛 몸체
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rotation);

        // 원형 베이스
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.isSelected ? '#ffffff' : this.faction?.colorSecondary || '#333333';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 방향 표시
        ctx.fillStyle = this.faction?.colorSecondary || '#ffffff';
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(this.radius * 0.5, -this.radius * 0.3);
        ctx.lineTo(this.radius * 0.5, this.radius * 0.3);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // 아이콘
        ctx.fillStyle = '#ffffff';
        ctx.font = `${this.radius}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, x, y);

        // 체력바
        this.renderHealthBar(ctx);

        // 운반 중인 자원 표시
        if (this.carriedResource > 0) {
            ctx.fillStyle = COLORS.CRYSTAL;
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`💎${Math.ceil(this.carriedResource)}`, x, y + this.radius + 15);
        }

        // 공격 범위 (선택됐을 때)
        if (this.isSelected && this.canAttack && this.attackRange > 50) {
            ctx.strokeStyle = 'rgba(255, 68, 68, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, this.attackRange, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 이동 경로 (선택됐을 때)
        if (this.isSelected && this.targetPosition) {
            ctx.strokeStyle = 'rgba(68, 136, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(this.targetPosition.x, this.targetPosition.y);
            ctx.stroke();
            ctx.setLineDash([]);

            // 목표 마커
            ctx.fillStyle = 'rgba(68, 136, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(this.targetPosition.x, this.targetPosition.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * 사망 처리
     */
    die(killer = null) {
        super.die(killer);

        // 자원 노드에서 제거
        if (this.targetResource) {
            this.targetResource.removeGatherer(this);
        }

        // 건설 중인 건물 처리
        if (this.currentBuildTarget) {
            this.currentBuildTarget.builder = null;
        }

        // 이벤트
        this.game.emit(EVENTS.UNIT_KILLED, { unit: this, killer });
    }

    /**
     * 직렬화
     */
    serialize() {
        return {
            ...super.serialize(),
            unitType: this.unitType,
            targetPosition: this.targetPosition?.toObject(),
            carriedResource: this.carriedResource,
            currentCommand: this.currentCommand,
            isHoldingPosition: this.isHoldingPosition
        };
    }
}
