/**
 * BalanceManager - 밸런스 관리자
 */

import { DAMAGE_MULTIPLIERS, FACTIONS } from '../utils/Constants.js';

export class BalanceManager {
    constructor(game) {
        this.game = game;
    }

    /**
     * 최종 데미지 계산
     */
    calculateDamage(baseDamage, attacker, defender) {
        let damage = baseDamage;

        // 진영 수정자 적용 (공격자)
        const attackerFaction = attacker.faction;
        if (attackerFaction?.modifiers?.damage) {
            damage *= attackerFaction.modifiers.damage;
        }

        // 타입 상성 적용
        const attackerType = attacker.unitType || 'infantry';
        const defenderType = defender.unitType || 'building';
        const typeMultiplier = DAMAGE_MULTIPLIERS[attackerType]?.[defenderType] || 1;
        damage *= typeMultiplier;

        // 데미지 변동 (±10%)
        damage *= 0.9 + Math.random() * 0.2;

        // 방어력 적용
        damage = Math.max(1, damage - (defender.armor || 0));

        return Math.round(damage);
    }

    /**
     * 진영 수정자 적용된 체력 계산
     */
    getModifiedHealth(baseHealth, faction) {
        const modifier = faction?.modifiers?.health || 1;
        return Math.round(baseHealth * modifier);
    }

    /**
     * 진영 수정자 적용된 건설 시간 계산
     */
    getModifiedBuildTime(baseTime, faction) {
        const modifier = faction?.modifiers?.buildSpeed || 1;
        return baseTime * modifier;
    }

    /**
     * 진영 수정자 적용된 자원 수집률 계산
     */
    getModifiedGatherRate(baseRate, faction) {
        const modifier = faction?.modifiers?.resourceGather || 1;
        return baseRate * modifier;
    }

    /**
     * 난이도별 AI 수정자
     */
    getDifficultyModifiers(difficulty) {
        const modifiers = {
            easy: {
                damageMultiplier: 0.8,
                healthMultiplier: 0.8,
                resourceMultiplier: 0.8,
                reactionTime: 3,
                attackForce: 5
            },
            normal: {
                damageMultiplier: 1.0,
                healthMultiplier: 1.0,
                resourceMultiplier: 1.0,
                reactionTime: 1,
                attackForce: 8
            },
            hard: {
                damageMultiplier: 1.2,
                healthMultiplier: 1.2,
                resourceMultiplier: 1.3,
                reactionTime: 0.5,
                attackForce: 12
            }
        };

        return modifiers[difficulty] || modifiers.normal;
    }
}
