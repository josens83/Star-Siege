/**
 * Entity - 모든 게임 엔티티의 기본 클래스
 */

import { Vector2 } from '../utils/Vector2.js';
import { ENTITY_STATES, RENDER, COLORS } from '../utils/Constants.js';

export class Entity {
    constructor(game, options = {}) {
        this.game = game;

        // 고유 ID
        this.id = options.id || 0;

        // 위치 및 크기
        this.position = new Vector2(options.x || 0, options.y || 0);
        this.size = options.size || 32;
        this.radius = this.size / 2;

        // 팀 및 진영
        this.team = options.team ?? 0;
        this.faction = options.faction || null;

        // 상태
        this.state = ENTITY_STATES.IDLE;
        this.isAlive = true;
        this.isSelected = false;
        this.isHovered = false;

        // 체력
        this.maxHealth = options.maxHealth || 100;
        this.health = options.health ?? this.maxHealth;

        // 쉴드 (크리온 전용)
        this.maxShield = options.maxShield || 0;
        this.shield = options.shield ?? this.maxShield;
        this.shieldRegenRate = options.shieldRegenRate || 0;
        this.shieldRegenDelay = options.shieldRegenDelay || 3000;
        this.lastDamageTime = 0;

        // 방어력
        this.armor = options.armor || 0;

        // 시야 범위
        this.visionRange = options.visionRange || 200;

        // 렌더링
        this.icon = options.icon || '?';
        this.color = this.getTeamColor();

        // 애니메이션
        this.animationTime = 0;
    }

    /**
     * 팀 색상 반환
     */
    getTeamColor() {
        if (this.team === this.game.playerTeam) {
            return this.faction?.color || COLORS.PLAYER;
        } else if (this.team === this.game.enemyTeam) {
            return COLORS.ENEMY;
        }
        return COLORS.NEUTRAL;
    }

    /**
     * 업데이트
     */
    update(deltaTime) {
        this.animationTime += deltaTime;

        // 쉴드 재생
        if (this.maxShield > 0 && this.shield < this.maxShield) {
            const timeSinceDamage = this.game.gameTime - this.lastDamageTime;
            if (timeSinceDamage >= this.shieldRegenDelay) {
                this.shield = Math.min(this.maxShield, this.shield + this.shieldRegenRate * (deltaTime / 1000));
            }
        }
    }

    /**
     * 렌더링
     */
    render(ctx) {
        // 서브클래스에서 구현
    }

    /**
     * 선택 원 렌더링
     */
    renderSelectionCircle(ctx) {
        if (!this.isSelected && !this.isHovered) return;

        ctx.strokeStyle = this.isSelected ? COLORS.PLAYER : 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = RENDER.SELECTION_CIRCLE_WIDTH;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius + 5, 0, Math.PI * 2);
        ctx.stroke();
    }

    /**
     * 체력바 렌더링
     */
    renderHealthBar(ctx) {
        if (this.health >= this.maxHealth && this.shield >= this.maxShield) return;

        const barWidth = RENDER.HEALTH_BAR_WIDTH;
        const barHeight = RENDER.HEALTH_BAR_HEIGHT;
        const x = this.position.x - barWidth / 2;
        const y = this.position.y - this.radius - RENDER.HEALTH_BAR_OFFSET;

        // 배경
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x - 1, y - 1, barWidth + 2, barHeight + 2 + (this.maxShield > 0 ? barHeight + 2 : 0));

        // 체력바
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.6 ? COLORS.HEALTH : healthPercent > 0.3 ? COLORS.WARNING : COLORS.DANGER;
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);

        // 쉴드바
        if (this.maxShield > 0) {
            const shieldPercent = this.shield / this.maxShield;
            ctx.fillStyle = COLORS.SHIELD;
            ctx.fillRect(x, y + barHeight + 1, barWidth * shieldPercent, barHeight);
        }
    }

    /**
     * 데미지 받기
     */
    takeDamage(amount, source = null) {
        if (!this.isAlive) return 0;

        let actualDamage = amount;

        // 쉴드 먼저 감소
        if (this.shield > 0) {
            if (this.shield >= actualDamage) {
                this.shield -= actualDamage;
                this.lastDamageTime = this.game.gameTime;

                // 쉴드 히트 이펙트
                this.game.effectSystem.createShieldHit(this.position.x, this.position.y);
                return 0;
            } else {
                actualDamage -= this.shield;
                this.shield = 0;
            }
            this.lastDamageTime = this.game.gameTime;
        }

        // 방어력 적용
        actualDamage = Math.max(1, actualDamage - this.armor);

        // 체력 감소
        this.health -= actualDamage;

        // 히트 이펙트
        this.game.effectSystem.createHit(this.position.x, this.position.y);

        // 데미지 텍스트
        this.game.effectSystem.createFloatingText(
            this.position.x,
            this.position.y - this.radius,
            `-${Math.round(actualDamage)}`,
            COLORS.DANGER
        );

        // 사망 체크
        if (this.health <= 0) {
            this.die(source);
        }

        return actualDamage;
    }

    /**
     * 회복
     */
    heal(amount) {
        if (!this.isAlive) return 0;

        const actualHeal = Math.min(amount, this.maxHealth - this.health);
        this.health += actualHeal;

        if (actualHeal > 0) {
            // 힐 이펙트
            this.game.effectSystem.createHeal(this.position.x, this.position.y);
            this.game.effectSystem.createFloatingText(
                this.position.x,
                this.position.y - this.radius,
                `+${Math.round(actualHeal)}`,
                COLORS.SUCCESS
            );
        }

        return actualHeal;
    }

    /**
     * 사망 처리
     */
    die(killer = null) {
        if (!this.isAlive) return;

        this.isAlive = false;
        this.state = ENTITY_STATES.DEAD;

        // 사망 이펙트
        this.game.effectSystem.createDeath(this.position.x, this.position.y);

        // 사운드
        this.game.audioManager.playSound('death', this.position);

        // 통계 업데이트
        if (this.team === this.game.playerTeam) {
            this.game.stats.unitsLost++;
        } else if (this.team === this.game.enemyTeam && killer?.team === this.game.playerTeam) {
            this.game.stats.enemiesKilled++;
        }
    }

    /**
     * 점 포함 여부 체크
     */
    containsPoint(x, y) {
        const dx = x - this.position.x;
        const dy = y - this.position.y;
        return dx * dx + dy * dy <= this.radius * this.radius;
    }

    /**
     * 사각형과 교차 여부 체크
     */
    intersectsRect(minX, minY, maxX, maxY) {
        // 원과 사각형 교차 체크
        const closestX = Math.max(minX, Math.min(this.position.x, maxX));
        const closestY = Math.max(minY, Math.min(this.position.y, maxY));

        const dx = this.position.x - closestX;
        const dy = this.position.y - closestY;

        return dx * dx + dy * dy <= this.radius * this.radius;
    }

    /**
     * 다른 엔티티와의 거리
     */
    distanceTo(other) {
        return this.position.distanceTo(other.position);
    }

    /**
     * 다른 엔티티와 충돌 여부
     */
    collidesWith(other) {
        const dist = this.distanceTo(other);
        return dist < this.radius + other.radius;
    }

    /**
     * 선택
     */
    select() {
        this.isSelected = true;
    }

    /**
     * 선택 해제
     */
    deselect() {
        this.isSelected = false;
    }

    /**
     * 직렬화 (저장용)
     */
    serialize() {
        return {
            id: this.id,
            type: this.constructor.name,
            x: this.position.x,
            y: this.position.y,
            team: this.team,
            factionId: this.faction?.id,
            health: this.health,
            shield: this.shield,
            state: this.state
        };
    }

    /**
     * 역직렬화 (불러오기용)
     */
    deserialize(data) {
        this.position.set(data.x, data.y);
        this.health = data.health;
        this.shield = data.shield;
        this.state = data.state;
    }
}
