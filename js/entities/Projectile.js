/**
 * Projectile - 투사체 엔티티
 */

import { Entity } from './Entity.js';
import { Vector2 } from '../utils/Vector2.js';
import { COLORS } from '../utils/Constants.js';

export class Projectile extends Entity {
    constructor(game, options = {}) {
        super(game, {
            ...options,
            size: 6,
            maxHealth: 1
        });

        // 소스 및 타겟
        this.source = options.source;
        this.target = options.target;
        this.targetPosition = options.target.position.clone();

        // 데미지
        this.damage = options.damage || 10;

        // 타입
        this.type = options.type || 'bullet';

        // 속도
        this.speed = this.getSpeedByType();

        // 방향
        const direction = Vector2.sub(this.targetPosition, this.position);
        this.velocity = direction.normalize().mul(this.speed);
        this.rotation = direction.angle();

        // 색상
        this.color = this.getColorByType();

        // 수명
        this.lifetime = 3000; // 3초
        this.age = 0;

        // 스플래시 데미지
        this.splashRadius = options.splashRadius || 0;

        // 팀 (소스에서 상속)
        this.team = this.source?.team ?? 0;
    }

    /**
     * 타입별 속도
     */
    getSpeedByType() {
        const speeds = {
            bullet: 600,
            laser: 800,
            cannon: 400,
            plasma: 500,
            missile: 350,
            turret: 700
        };
        return speeds[this.type] || 600;
    }

    /**
     * 타입별 색상
     */
    getColorByType() {
        const colors = {
            bullet: '#ffff00',
            laser: '#ff0000',
            cannon: '#ff8800',
            plasma: '#00ffff',
            missile: '#ff4400',
            turret: '#ffaa00'
        };
        return colors[this.type] || '#ffffff';
    }

    /**
     * 업데이트
     */
    update(deltaTime) {
        this.age += deltaTime;

        // 수명 초과
        if (this.age >= this.lifetime) {
            this.isAlive = false;
            return;
        }

        // 이동
        this.position.add(Vector2.mul(this.velocity, deltaTime / 1000));

        // 유도 미사일인 경우 타겟 추적
        if (this.type === 'missile' && this.target?.isAlive) {
            const direction = Vector2.sub(this.target.position, this.position);
            const targetAngle = direction.angle();
            let angleDiff = targetAngle - this.rotation;

            // 최단 경로로 회전
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

            // 회전 속도 제한
            const maxTurn = 3 * (deltaTime / 1000);
            if (Math.abs(angleDiff) > maxTurn) {
                angleDiff = Math.sign(angleDiff) * maxTurn;
            }

            this.rotation += angleDiff;
            this.velocity = Vector2.fromAngle(this.rotation).mul(this.speed);
            this.targetPosition.copy(this.target.position);
        }

        // 충돌 체크
        this.checkCollision();
    }

    /**
     * 충돌 체크
     */
    checkCollision() {
        // 타겟과의 거리 체크
        const distToTarget = this.position.distanceTo(this.targetPosition);

        if (distToTarget < 15) {
            // 명중
            this.hit();
            return;
        }

        // 타겟을 지나쳤는지 체크 (원거리 공격용)
        if (this.target?.isAlive) {
            const distToActualTarget = this.position.distanceTo(this.target.position);
            if (distToActualTarget < 15) {
                this.hit();
            }
        }
    }

    /**
     * 명중 처리
     */
    hit() {
        if (!this.isAlive) return;

        this.isAlive = false;

        // 스플래시 데미지
        if (this.splashRadius > 0) {
            const targets = this.game.getEntitiesInRadius(
                this.position.x,
                this.position.y,
                this.splashRadius,
                (e) => e.team !== this.team && e.isAlive
            );

            for (const target of targets) {
                // 거리에 따른 데미지 감소
                const dist = this.position.distanceTo(target.position);
                const falloff = 1 - (dist / this.splashRadius);
                const splashDamage = this.damage * falloff;

                target.takeDamage(splashDamage, this.source);
            }

            // 폭발 이펙트
            this.game.effectSystem.createExplosion(this.position.x, this.position.y, this.color);
        } else {
            // 단일 타겟 데미지
            if (this.target?.isAlive) {
                this.target.takeDamage(this.damage, this.source);
            }

            // 히트 이펙트
            this.game.effectSystem.createHit(this.position.x, this.position.y, this.color);
        }

        // 사운드
        this.game.audioManager.playSound('hit', this.position);
    }

    /**
     * 렌더링
     */
    render(ctx) {
        const x = this.position.x;
        const y = this.position.y;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rotation);

        switch (this.type) {
            case 'bullet':
                this.renderBullet(ctx);
                break;
            case 'laser':
                this.renderLaser(ctx);
                break;
            case 'cannon':
                this.renderCannon(ctx);
                break;
            case 'plasma':
                this.renderPlasma(ctx);
                break;
            case 'missile':
                this.renderMissile(ctx);
                break;
            case 'turret':
                this.renderTurret(ctx);
                break;
            default:
                this.renderBullet(ctx);
        }

        ctx.restore();
    }

    /**
     * 총알 렌더링
     */
    renderBullet(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, 6, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 꼬리
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(-15, 0);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    /**
     * 레이저 렌더링
     */
    renderLaser(ctx) {
        // 레이저 빔
        const gradient = ctx.createLinearGradient(-10, 0, 10, 0);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, 'transparent');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.stroke();

        // 글로우
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    /**
     * 캐논 렌더링
     */
    renderCannon(ctx) {
        // 포탄
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        // 테두리
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 꼬리 불꽃
        ctx.fillStyle = '#ff4400';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(-12, -3);
        ctx.lineTo(-10, 0);
        ctx.lineTo(-12, 3);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    /**
     * 플라즈마 렌더링
     */
    renderPlasma(ctx) {
        // 플라즈마 구체
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 미사일 렌더링
     */
    renderMissile(ctx) {
        // 미사일 몸체
        ctx.fillStyle = '#888888';
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-4, -3);
        ctx.lineTo(-4, 3);
        ctx.closePath();
        ctx.fill();

        // 불꽃
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(-10, -2);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-10, 2);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * 터렛 투사체 렌더링
     */
    renderTurret(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        // 글로우
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    /**
     * 점 포함 여부 (투사체는 충돌 없음)
     */
    containsPoint(x, y) {
        return false;
    }

    /**
     * 사각형 교차 (투사체는 선택 불가)
     */
    intersectsRect() {
        return false;
    }
}
