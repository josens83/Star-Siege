/**
 * ResourceNode - 자원 노드 (크리스탈)
 */

import { Entity } from './Entity.js';
import { COLORS } from '../utils/Constants.js';

export class ResourceNode extends Entity {
    constructor(game, options = {}) {
        super(game, {
            ...options,
            size: 48,
            maxHealth: 99999 // 파괴 불가
        });

        // 자원 타입
        this.resourceType = options.type || 'crystal';

        // 자원량
        this.maxAmount = options.amount || 1500;
        this.amount = this.maxAmount;

        // 수집 중인 일꾼 목록
        this.gatherers = [];

        // 최대 동시 수집자 수
        this.maxGatherers = 3;

        // 아이콘 설정
        this.icon = this.resourceType === 'crystal' ? '💎' : '⚡';
        this.color = this.resourceType === 'crystal' ? COLORS.CRYSTAL : COLORS.ENERGY;

        // 애니메이션
        this.glowPhase = Math.random() * Math.PI * 2;
    }

    /**
     * 업데이트
     */
    update(deltaTime) {
        super.update(deltaTime);

        // 글로우 애니메이션
        this.glowPhase += deltaTime * 0.002;

        // 자원 고갈 체크
        if (this.amount <= 0) {
            this.deplete();
        }
    }

    /**
     * 렌더링
     */
    render(ctx) {
        const x = this.position.x;
        const y = this.position.y;

        // 글로우 이펙트
        const glowSize = 30 + Math.sin(this.glowPhase) * 5;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        gradient.addColorStop(0, `${this.color}44`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // 크리스탈 형태 그리기
        this.renderCrystal(ctx, x, y);

        // 남은 자원량 표시
        this.renderAmount(ctx, x, y);
    }

    /**
     * 크리스탈 형태 렌더링
     */
    renderCrystal(ctx, x, y) {
        const size = this.size / 2;
        const points = 6;

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        ctx.beginPath();
        for (let i = 0; i < points; i++) {
            const angle = (Math.PI * 2 / points) * i - Math.PI / 2;
            const radius = i % 2 === 0 ? size : size * 0.6;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 중앙 하이라이트
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(x - 3, y - 3, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 자원량 표시
     */
    renderAmount(ctx, x, y) {
        const percent = this.amount / this.maxAmount;

        // 자원이 적으면 경고 색상
        ctx.fillStyle = percent > 0.3 ? '#ffffff' : COLORS.WARNING;
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        ctx.fillText(Math.ceil(this.amount).toString(), x, y + this.radius + 5);
    }

    /**
     * 자원 수집
     */
    harvest(amount) {
        const harvested = Math.min(amount, this.amount);
        this.amount -= harvested;
        return harvested;
    }

    /**
     * 수집자 등록
     */
    addGatherer(unit) {
        if (!this.gatherers.includes(unit) && this.gatherers.length < this.maxGatherers) {
            this.gatherers.push(unit);
            return true;
        }
        return false;
    }

    /**
     * 수집자 제거
     */
    removeGatherer(unit) {
        const index = this.gatherers.indexOf(unit);
        if (index !== -1) {
            this.gatherers.splice(index, 1);
        }
    }

    /**
     * 수집 가능 여부
     */
    canGather() {
        return this.amount > 0 && this.gatherers.length < this.maxGatherers;
    }

    /**
     * 자원 고갈
     */
    deplete() {
        this.isAlive = false;

        // 수집자들에게 알림
        for (const gatherer of this.gatherers) {
            if (gatherer.targetResource === this) {
                gatherer.findNewResource();
            }
        }

        // 이펙트
        this.game.effectSystem.createExplosion(this.position.x, this.position.y, this.color);
    }

    /**
     * 직렬화
     */
    serialize() {
        return {
            ...super.serialize(),
            resourceType: this.resourceType,
            amount: this.amount,
            maxAmount: this.maxAmount
        };
    }

    /**
     * 역직렬화
     */
    deserialize(data) {
        super.deserialize(data);
        this.resourceType = data.resourceType;
        this.amount = data.amount;
        this.maxAmount = data.maxAmount;
    }
}
