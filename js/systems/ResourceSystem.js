/**
 * ResourceSystem - 자원 관리 시스템
 */

import { GAME, EVENTS, COLORS } from '../utils/Constants.js';

export class ResourceSystem {
    constructor(game) {
        this.game = game;

        // 팀별 자원
        this.resources = new Map();

        // 기본 팀 초기화
        this.initTeam(0); // 플레이어
        this.initTeam(1); // 적
    }

    /**
     * 팀 자원 초기화
     */
    initTeam(team) {
        this.resources.set(team, {
            crystal: GAME.STARTING_CRYSTAL,
            energy: GAME.STARTING_ENERGY,
            maxCrystal: GAME.MAX_CRYSTAL,
            maxEnergy: GAME.MAX_ENERGY,
            population: 0,
            populationCap: GAME.STARTING_POPULATION_CAP,
            crystalRate: 0,
            energyRate: 0
        });
    }

    /**
     * 리셋
     */
    reset() {
        this.resources.clear();
        this.initTeam(0);
        this.initTeam(1);
    }

    /**
     * 자원 설정
     */
    setResources(team, crystal, energy) {
        const res = this.resources.get(team);
        if (res) {
            res.crystal = Math.min(crystal, res.maxCrystal);
            res.energy = Math.min(energy, res.maxEnergy);
        }
    }

    /**
     * 크리스탈 추가
     */
    addCrystal(team, amount) {
        const res = this.resources.get(team);
        if (res) {
            res.crystal = Math.min(res.crystal + amount, res.maxCrystal);
            this.game.emit(EVENTS.RESOURCE_CHANGED, { team, type: 'crystal', amount });
        }
    }

    /**
     * 에너지 추가
     */
    addEnergy(team, amount) {
        const res = this.resources.get(team);
        if (res) {
            res.energy = Math.min(res.energy + amount, res.maxEnergy);
            this.game.emit(EVENTS.RESOURCE_CHANGED, { team, type: 'energy', amount });
        }
    }

    /**
     * 자원 추가 (둘 다)
     */
    addResources(team, crystal, energy) {
        this.addCrystal(team, crystal);
        this.addEnergy(team, energy);
    }

    /**
     * 자원 지출
     */
    spend(team, crystal, energy) {
        const res = this.resources.get(team);
        if (res) {
            res.crystal -= crystal;
            res.energy -= energy;
            this.game.emit(EVENTS.RESOURCE_CHANGED, { team, type: 'spend', crystal, energy });
            return true;
        }
        return false;
    }

    /**
     * 지출 가능 여부
     */
    canAfford(team, crystal, energy) {
        const res = this.resources.get(team);
        if (!res) return false;
        return res.crystal >= crystal && res.energy >= energy;
    }

    /**
     * 인구 추가 가능 여부
     */
    canAddPopulation(team, amount) {
        const res = this.resources.get(team);
        if (!res) return false;
        return res.population + amount <= res.populationCap;
    }

    /**
     * 인구 추가
     */
    addPopulation(team, amount) {
        const res = this.resources.get(team);
        if (res) {
            res.population += amount;
        }
    }

    /**
     * 인구 제거
     */
    removePopulation(team, amount) {
        const res = this.resources.get(team);
        if (res) {
            res.population = Math.max(0, res.population - amount);
        }
    }

    /**
     * 인구 상한 추가
     */
    addPopulationCap(team, amount) {
        const res = this.resources.get(team);
        if (res) {
            res.populationCap = Math.min(res.populationCap + amount, GAME.MAX_POPULATION);
        }
    }

    /**
     * 인구 상한 제거
     */
    removePopulationCap(team, amount) {
        const res = this.resources.get(team);
        if (res) {
            res.populationCap = Math.max(GAME.STARTING_POPULATION_CAP, res.populationCap - amount);
        }
    }

    /**
     * 자원 획득률 계산
     */
    calculateRates(team) {
        const res = this.resources.get(team);
        if (!res) return;

        let crystalRate = 0;
        let energyRate = 0;

        // 수집 건물에서 수집률 합산
        const buildings = this.game.buildings.filter(b => b.team === team && b.isComplete && b.isAlive);

        for (const building of buildings) {
            if (building.isCollector && building.nearbyResource) {
                crystalRate += building.gatherRate;
            }
            if (building.isGenerator) {
                energyRate += building.energyRate;
            }
        }

        res.crystalRate = crystalRate;
        res.energyRate = energyRate;
    }

    /**
     * 업데이트
     */
    update(deltaTime) {
        // 각 팀의 자원 획득률 계산
        for (const [team] of this.resources) {
            this.calculateRates(team);

            // 에너지 자동 생산
            const res = this.resources.get(team);
            if (res && res.energyRate > 0) {
                this.addEnergy(team, res.energyRate * (deltaTime / 1000));
            }
        }

        // UI 업데이트 (플레이어만)
        this.updateUI();
    }

    /**
     * UI 업데이트
     */
    updateUI() {
        const playerRes = this.resources.get(this.game.playerTeam);
        if (!playerRes) return;

        // 크리스탈
        const crystalValue = document.getElementById('crystal-value');
        const crystalRate = document.getElementById('crystal-rate');
        if (crystalValue) {
            crystalValue.textContent = Math.floor(playerRes.crystal);
        }
        if (crystalRate) {
            crystalRate.textContent = `+${playerRes.crystalRate.toFixed(1)}/s`;
        }

        // 에너지
        const energyValue = document.getElementById('energy-value');
        const energyRate = document.getElementById('energy-rate');
        if (energyValue) {
            energyValue.textContent = Math.floor(playerRes.energy);
        }
        if (energyRate) {
            energyRate.textContent = `+${playerRes.energyRate.toFixed(1)}/s`;
        }

        // 인구
        const populationValue = document.getElementById('population-value');
        if (populationValue) {
            populationValue.textContent = `${playerRes.population}/${playerRes.populationCap}`;

            // 인구 부족 시 경고 색상
            if (playerRes.population >= playerRes.populationCap) {
                populationValue.style.color = COLORS.DANGER;
            } else if (playerRes.population >= playerRes.populationCap * 0.8) {
                populationValue.style.color = COLORS.WARNING;
            } else {
                populationValue.style.color = '';
            }
        }
    }

    /**
     * 팀 자원 정보 반환
     */
    getResources(team) {
        return this.resources.get(team);
    }

    /**
     * 크리스탈 반환
     */
    getCrystal(team) {
        return this.resources.get(team)?.crystal || 0;
    }

    /**
     * 에너지 반환
     */
    getEnergy(team) {
        return this.resources.get(team)?.energy || 0;
    }

    /**
     * 인구 반환
     */
    getPopulation(team) {
        return this.resources.get(team)?.population || 0;
    }

    /**
     * 인구 상한 반환
     */
    getPopulationCap(team) {
        return this.resources.get(team)?.populationCap || 0;
    }

    /**
     * 직렬화
     */
    serialize() {
        const data = {};
        for (const [team, res] of this.resources) {
            data[team] = { ...res };
        }
        return data;
    }

    /**
     * 역직렬화
     */
    deserialize(data) {
        for (const [team, res] of Object.entries(data)) {
            this.resources.set(parseInt(team), res);
        }
    }
}
