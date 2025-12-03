/**
 * EffectSystem - 이펙트 시스템
 * 파티클, 플로팅 텍스트, 시각 효과 관리
 */

import { EFFECTS, COLORS } from '../utils/Constants.js';
import { Vector2 } from '../utils/Vector2.js';

export class EffectSystem {
    constructor(game) {
        this.game = game;

        // 파티클
        this.particles = [];

        // 플로팅 텍스트
        this.floatingTexts = [];

        // 이동 마커
        this.moveMarkers = [];
    }

    /**
     * 업데이트
     */
    update(deltaTime) {
        // 파티클 업데이트
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.life -= deltaTime;

            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            // 위치 업데이트
            particle.x += particle.vx * (deltaTime / 1000);
            particle.y += particle.vy * (deltaTime / 1000);

            // 중력
            if (particle.gravity) {
                particle.vy += particle.gravity * (deltaTime / 1000);
            }

            // 감속
            if (particle.friction) {
                particle.vx *= 1 - particle.friction;
                particle.vy *= 1 - particle.friction;
            }
        }

        // 플로팅 텍스트 업데이트
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const text = this.floatingTexts[i];
            text.life -= deltaTime;

            if (text.life <= 0) {
                this.floatingTexts.splice(i, 1);
                continue;
            }

            text.y -= EFFECTS.FLOATING_TEXT_SPEED * (deltaTime / 1000);
        }

        // 이동 마커 업데이트
        for (let i = this.moveMarkers.length - 1; i >= 0; i--) {
            const marker = this.moveMarkers[i];
            marker.life -= deltaTime;

            if (marker.life <= 0) {
                this.moveMarkers.splice(i, 1);
            }
        }
    }

    /**
     * 렌더링
     */
    render(ctx) {
        // 파티클 렌더링
        for (const particle of this.particles) {
            const alpha = particle.life / particle.maxLife;

            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;

        // 플로팅 텍스트 렌더링
        for (const text of this.floatingTexts) {
            const alpha = text.life / EFFECTS.FLOATING_TEXT_DURATION;

            ctx.globalAlpha = alpha;
            ctx.fillStyle = text.color;
            ctx.font = `bold ${text.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // 외곽선
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeText(text.text, text.x, text.y);
            ctx.fillText(text.text, text.x, text.y);
        }

        ctx.globalAlpha = 1;

        // 이동 마커 렌더링
        for (const marker of this.moveMarkers) {
            const alpha = marker.life / 500;
            const scale = 1 + (1 - alpha) * 0.5;

            ctx.strokeStyle = `rgba(68, 136, 255, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(marker.x, marker.y, 10 * scale, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    /**
     * 파티클 생성
     */
    createParticles(x, y, count, options = {}) {
        if (!this.game.performanceManager?.canCreateParticle()) return;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (options.speed || 100) * (0.5 + Math.random() * 0.5);

            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: options.size || 4,
                color: options.color || '#ffffff',
                life: options.life || EFFECTS.PARTICLE_LIFETIME,
                maxLife: options.life || EFFECTS.PARTICLE_LIFETIME,
                gravity: options.gravity || 0,
                friction: options.friction || 0.02
            });
        }
    }

    /**
     * 히트 이펙트
     */
    createHit(x, y, color = COLORS.WARNING) {
        this.createParticles(x, y, EFFECTS.HIT_PARTICLES, {
            color,
            speed: 80,
            size: 3,
            life: 300
        });
    }

    /**
     * 폭발 이펙트
     */
    createExplosion(x, y, color = '#ff8800') {
        const colors = ['#ff4400', '#ff8800', '#ffcc00'];

        for (let i = 0; i < EFFECTS.EXPLOSION_PARTICLES; i++) {
            const particleColor = colors[Math.floor(Math.random() * colors.length)];
            this.createParticles(x, y, 1, {
                color: particleColor,
                speed: 150,
                size: 5 + Math.random() * 3,
                life: 500 + Math.random() * 300,
                gravity: 100
            });
        }

        // 카메라 흔들림
        this.game.camera?.shake(5);
    }

    /**
     * 사망 이펙트
     */
    createDeath(x, y) {
        this.createParticles(x, y, EFFECTS.DEATH_PARTICLES, {
            color: '#888888',
            speed: 60,
            size: 4,
            life: 800,
            gravity: 50
        });
    }

    /**
     * 건설 완료 이펙트
     */
    createBuildComplete(x, y) {
        const colors = ['#44ff88', '#88ff88', '#aaffaa'];

        for (let i = 0; i < EFFECTS.BUILD_COMPLETE_PARTICLES; i++) {
            const angle = (Math.PI * 2 / EFFECTS.BUILD_COMPLETE_PARTICLES) * i;
            const particleColor = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push({
                x: x + Math.cos(angle) * 30,
                y: y + Math.sin(angle) * 30,
                vx: Math.cos(angle) * 80,
                vy: Math.sin(angle) * 80 - 50,
                size: 4,
                color: particleColor,
                life: 600,
                maxLife: 600,
                gravity: 100,
                friction: 0.01
            });
        }
    }

    /**
     * 쉴드 히트 이펙트
     */
    createShieldHit(x, y) {
        this.createParticles(x, y, EFFECTS.SHIELD_HIT_PARTICLES, {
            color: COLORS.SHIELD,
            speed: 100,
            size: 3,
            life: 400
        });
    }

    /**
     * 힐 이펙트
     */
    createHeal(x, y) {
        this.createParticles(x, y, EFFECTS.HEAL_PARTICLES, {
            color: COLORS.SUCCESS,
            speed: 30,
            size: 3,
            life: 500,
            gravity: -30 // 위로 올라감
        });
    }

    /**
     * 자원 수집 이펙트
     */
    createGather(x, y) {
        this.createParticles(x, y, 3, {
            color: COLORS.CRYSTAL,
            speed: 20,
            size: 2,
            life: 300,
            gravity: -20
        });
    }

    /**
     * 플로팅 텍스트 생성
     */
    createFloatingText(x, y, text, color = '#ffffff', size = 14) {
        this.floatingTexts.push({
            x,
            y,
            text,
            color,
            size,
            life: EFFECTS.FLOATING_TEXT_DURATION
        });
    }

    /**
     * 이동 마커 생성
     */
    createMoveMarker(x, y) {
        this.moveMarkers.push({
            x,
            y,
            life: 500
        });
    }

    /**
     * 모든 이펙트 초기화
     */
    clear() {
        this.particles = [];
        this.floatingTexts = [];
        this.moveMarkers = [];
    }
}
