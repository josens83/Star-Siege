/**
 * Building - 건물 엔티티
 */

import { Entity } from './Entity.js';
import { Vector2 } from '../utils/Vector2.js';
import { ENTITY_STATES, EVENTS, COLORS, RENDER } from '../utils/Constants.js';

export class Building extends Entity {
    constructor(game, options = {}) {
        const config = options.config || {};

        super(game, {
            ...options,
            size: config.size || 64,
            maxHealth: config.health || 500,
            maxShield: config.shield || 0,
            shieldRegenRate: config.shieldRegenRate || 0,
            armor: config.armor || 0,
            visionRange: config.visionRange || 300
        });

        // 설정
        this.config = config;
        this.buildingType = options.type;

        // 아이콘
        this.icon = config.icon || '🏛️';

        // 건설 상태
        this.isComplete = false;
        this.constructionProgress = 0;
        this.constructionTime = config.buildTime || 30;
        this.builder = options.builder || null;

        // 생산 관련
        this.canProduce = config.canProduce || false;
        this.productionQueue = [];
        this.currentProduction = null;
        this.productionProgress = 0;

        // 자원 수집 (수집기인 경우)
        this.isCollector = config.isCollector || false;
        this.gatherRate = config.gatherRate || 0;
        this.nearbyResource = null;

        // 에너지 생산 (발전소인 경우)
        this.isGenerator = config.isGenerator || false;
        this.energyRate = config.energyRate || 0;

        // 인구 제공 (보급소인 경우)
        this.providesSupply = config.providesSupply || 0;

        // 공격 (방어 건물인 경우)
        this.canAttack = config.canAttack || false;
        this.attackDamage = config.damage || 0;
        this.attackRange = config.range || 0;
        this.attackSpeed = config.attackSpeed || 1;
        this.attackCooldown = 0;
        this.target = null;

        // 랠리 포인트 (생산 건물)
        this.rallyPoint = null;

        // 건설 가능 유닛 목록
        this.buildableUnits = config.units || [];
    }

    /**
     * 업데이트
     */
    update(deltaTime) {
        super.update(deltaTime);

        if (!this.isComplete) {
            // 건설 중
            this.updateConstruction(deltaTime);
        } else {
            // 완료된 건물
            this.updateProduction(deltaTime);
            this.updateResourceGathering(deltaTime);
            this.updateAttack(deltaTime);
        }
    }

    /**
     * 건설 진행 업데이트
     */
    updateConstruction(deltaTime) {
        if (this.builder) {
            // 일꾼이 건설 중
            const buildSpeed = 1 / this.constructionTime;
            this.constructionProgress += buildSpeed * (deltaTime / 1000);

            // 체력도 함께 증가
            this.health = this.maxHealth * this.constructionProgress;

            if (this.constructionProgress >= 1) {
                this.completeConstruction();
            }
        }
    }

    /**
     * 건설 완료
     */
    completeConstruction() {
        this.isComplete = true;
        this.constructionProgress = 1;
        this.health = this.maxHealth;
        this.state = ENTITY_STATES.IDLE;

        // 빌더 해제
        if (this.builder) {
            this.builder.currentBuildTarget = null;
            this.builder = null;
        }

        // 인구 증가
        if (this.providesSupply > 0) {
            this.game.resourceSystem.addPopulationCap(this.team, this.providesSupply);
        }

        // 자원 수집기인 경우 근처 자원 찾기
        if (this.isCollector) {
            this.findNearbyResource();
        }

        // 이펙트
        this.game.effectSystem.createBuildComplete(this.position.x, this.position.y);

        // 사운드
        this.game.audioManager.playSound('buildComplete', this.position);

        // 이벤트
        this.game.emit(EVENTS.BUILD_COMPLETE, { building: this });

        // 통계
        if (this.team === this.game.playerTeam) {
            this.game.stats.buildingsConstructed++;
        }

        // 토스트
        if (this.team === this.game.playerTeam) {
            this.game.showToast(`${this.config.name} 건설 완료!`, 'success');
        }
    }

    /**
     * 근처 자원 노드 찾기
     */
    findNearbyResource() {
        this.nearbyResource = this.game.getNearestEntity(
            this.position.x,
            this.position.y,
            (e) => e instanceof this.game.resourceNodes[0]?.constructor && e.amount > 0
        );
    }

    /**
     * 생산 업데이트
     */
    updateProduction(deltaTime) {
        if (!this.canProduce || !this.currentProduction) return;

        this.productionProgress += deltaTime / 1000;

        if (this.productionProgress >= this.currentProduction.buildTime) {
            this.completeProduction();
        }
    }

    /**
     * 생산 시작
     */
    startProduction(unitType) {
        const config = this.game.UNIT_CONFIGS?.[this.faction.id]?.[unitType];
        if (!config) return false;

        // 자원 체크
        const cost = config.cost;
        if (!this.game.resourceSystem.canAfford(this.team, cost.crystal, cost.energy)) {
            this.game.showToast('자원이 부족합니다!', 'error');
            return false;
        }

        // 인구 체크
        if (!this.game.resourceSystem.canAddPopulation(this.team, config.population || 1)) {
            this.game.showToast('인구 수가 부족합니다!', 'error');
            return false;
        }

        // 큐에 추가
        this.productionQueue.push({
            type: unitType,
            config: config,
            buildTime: config.buildTime || 10
        });

        // 자원 차감
        this.game.resourceSystem.spend(this.team, cost.crystal, cost.energy);

        // 첫 생산이면 시작
        if (!this.currentProduction) {
            this.nextProduction();
        }

        this.game.emit(EVENTS.PRODUCTION_START, { building: this, unitType });

        return true;
    }

    /**
     * 다음 생산
     */
    nextProduction() {
        if (this.productionQueue.length > 0) {
            this.currentProduction = this.productionQueue.shift();
            this.productionProgress = 0;
            this.state = ENTITY_STATES.PRODUCING;
        } else {
            this.currentProduction = null;
            this.productionProgress = 0;
            this.state = ENTITY_STATES.IDLE;
        }
    }

    /**
     * 생산 완료
     */
    completeProduction() {
        if (!this.currentProduction) return;

        // 유닛 생성 위치 계산
        const spawnOffset = this.size / 2 + 20;
        const angle = Math.random() * Math.PI * 2;
        const spawnX = this.position.x + Math.cos(angle) * spawnOffset;
        const spawnY = this.position.y + Math.sin(angle) * spawnOffset;

        // 유닛 생성
        const unit = this.game.createUnit(
            this.currentProduction.type,
            spawnX,
            spawnY,
            this.team,
            this.faction
        );

        // 랠리 포인트로 이동
        if (unit && this.rallyPoint) {
            unit.moveTo(this.rallyPoint.x, this.rallyPoint.y);
        }

        // 이벤트
        this.game.emit(EVENTS.PRODUCTION_COMPLETE, { building: this, unit });

        // 사운드
        this.game.audioManager.playSound('unitComplete', this.position);

        // 다음 생산
        this.nextProduction();
    }

    /**
     * 생산 취소
     */
    cancelProduction(index = -1) {
        if (index === -1) {
            // 현재 생산 취소
            if (this.currentProduction) {
                // 자원 일부 환불 (50%)
                const cost = this.currentProduction.config.cost;
                this.game.resourceSystem.addResources(
                    this.team,
                    Math.floor(cost.crystal * 0.5),
                    Math.floor(cost.energy * 0.5)
                );

                this.game.emit(EVENTS.PRODUCTION_CANCELLED, { building: this });
                this.nextProduction();
            }
        } else if (index >= 0 && index < this.productionQueue.length) {
            // 큐에서 취소
            const cancelled = this.productionQueue.splice(index, 1)[0];
            const cost = cancelled.config.cost;
            this.game.resourceSystem.addResources(
                this.team,
                Math.floor(cost.crystal * 0.5),
                Math.floor(cost.energy * 0.5)
            );
        }
    }

    /**
     * 자원 수집 업데이트
     */
    updateResourceGathering(deltaTime) {
        if (!this.isCollector || !this.nearbyResource) return;

        if (!this.nearbyResource.isAlive || this.nearbyResource.amount <= 0) {
            this.findNearbyResource();
            return;
        }

        // 자원 수집
        const gatherAmount = this.gatherRate * (deltaTime / 1000);
        const harvested = this.nearbyResource.harvest(gatherAmount);

        if (harvested > 0) {
            this.game.resourceSystem.addCrystal(this.team, harvested);
            this.game.stats.resourcesGathered += harvested;
        }
    }

    /**
     * 공격 업데이트
     */
    updateAttack(deltaTime) {
        if (!this.canAttack) return;

        // 쿨다운 감소
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime / 1000;
        }

        // 타겟 유효성 체크
        if (this.target && (!this.target.isAlive || this.distanceTo(this.target) > this.attackRange)) {
            this.target = null;
        }

        // 새 타겟 찾기
        if (!this.target) {
            this.findTarget();
        }

        // 공격
        if (this.target && this.attackCooldown <= 0) {
            this.attack();
        }
    }

    /**
     * 타겟 찾기
     */
    findTarget() {
        this.target = this.game.getNearestEntity(
            this.position.x,
            this.position.y,
            (e) => e.team !== this.team && e.isAlive && this.distanceTo(e) <= this.attackRange
        );
    }

    /**
     * 공격 실행
     */
    attack() {
        if (!this.target) return;

        // 투사체 생성
        this.game.createProjectile(this, this.target, this.attackDamage, 'turret');

        // 쿨다운 설정
        this.attackCooldown = 1 / this.attackSpeed;

        // 사운드
        this.game.audioManager.playSound('turret', this.position);
    }

    /**
     * 랠리 포인트 설정
     */
    setRallyPoint(x, y) {
        this.rallyPoint = new Vector2(x, y);
    }

    /**
     * 렌더링
     */
    render(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        // 선택 원
        this.renderSelectionCircle(ctx);

        // 건물 몸체
        if (!this.isComplete) {
            // 건설 중 - 반투명
            ctx.globalAlpha = 0.3 + this.constructionProgress * 0.7;
        }

        // 건물 베이스
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.isSelected ? '#ffffff' : this.faction?.colorSecondary || '#333333';
        ctx.lineWidth = 3;

        // 사각형 건물
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
        ctx.strokeRect(x - size / 2, y - size / 2, size, size);

        // 아이콘
        ctx.fillStyle = '#ffffff';
        ctx.font = `${size * 0.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, x, y);

        ctx.globalAlpha = 1;

        // 건설 진행률 (건설 중인 경우)
        if (!this.isComplete) {
            this.renderConstructionProgress(ctx, x, y);
        }

        // 체력바
        this.renderHealthBar(ctx);

        // 생산 진행률
        if (this.currentProduction) {
            this.renderProductionProgress(ctx, x, y);
        }

        // 공격 범위 (선택됐을 때)
        if (this.isSelected && this.canAttack) {
            ctx.strokeStyle = 'rgba(255, 68, 68, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, this.attackRange, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 랠리 포인트 (선택됐을 때)
        if (this.isSelected && this.rallyPoint) {
            ctx.strokeStyle = COLORS.SUCCESS;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(this.rallyPoint.x, this.rallyPoint.y);
            ctx.stroke();
            ctx.setLineDash([]);

            // 랠리 포인트 마커
            ctx.fillStyle = COLORS.SUCCESS;
            ctx.beginPath();
            ctx.arc(this.rallyPoint.x, this.rallyPoint.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * 건설 진행률 렌더링
     */
    renderConstructionProgress(ctx, x, y) {
        const barWidth = this.size;
        const barHeight = 6;
        const barY = y + this.size / 2 + 10;

        // 배경
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x - barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2);

        // 진행률
        ctx.fillStyle = COLORS.SUCCESS;
        ctx.fillRect(x - barWidth / 2, barY, barWidth * this.constructionProgress, barHeight);

        // 텍스트
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.floor(this.constructionProgress * 100)}%`, x, barY + barHeight + 12);
    }

    /**
     * 생산 진행률 렌더링
     */
    renderProductionProgress(ctx, x, y) {
        const barWidth = this.size;
        const barHeight = 4;
        const barY = y - this.size / 2 - 20;

        const progress = this.productionProgress / this.currentProduction.buildTime;

        // 배경
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x - barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2);

        // 진행률
        ctx.fillStyle = COLORS.CRYSTAL;
        ctx.fillRect(x - barWidth / 2, barY, barWidth * progress, barHeight);
    }

    /**
     * 사망 처리
     */
    die(killer = null) {
        super.die(killer);

        // 인구 제거
        if (this.providesSupply > 0) {
            this.game.resourceSystem.removePopulationCap(this.team, this.providesSupply);
        }

        // 생산 큐 취소 (환불 없음)
        this.productionQueue = [];
        this.currentProduction = null;

        // 폭발 이펙트
        this.game.effectSystem.createExplosion(this.position.x, this.position.y);

        // 이벤트
        this.game.emit(EVENTS.BUILDING_DESTROYED, { building: this, killer });
    }

    /**
     * 직렬화
     */
    serialize() {
        return {
            ...super.serialize(),
            buildingType: this.buildingType,
            isComplete: this.isComplete,
            constructionProgress: this.constructionProgress,
            productionQueue: this.productionQueue.map(p => ({ type: p.type })),
            productionProgress: this.productionProgress,
            rallyPoint: this.rallyPoint ? this.rallyPoint.toObject() : null
        };
    }
}
