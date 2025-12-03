/**
 * ProductionSystem - 생산 시스템
 */

import { EVENTS } from '../utils/Constants.js';
import { Building } from '../entities/Building.js';
import { UNIT_CONFIGS } from '../data/UnitConfigs.js';

export class ProductionSystem {
    constructor(game) {
        this.game = game;
    }

    /**
     * 업데이트
     */
    update(deltaTime) {
        // Building 클래스에서 생산 처리
        // 여기서는 추가적인 전역 로직 처리
    }

    /**
     * 특정 건물에서 유닛 생산 시작
     */
    startProduction(building, unitType) {
        if (!building || !(building instanceof Building)) return false;
        if (!building.canProduce) return false;

        return building.startProduction(unitType);
    }

    /**
     * 생산 큐에서 제거
     */
    cancelProduction(building, index = -1) {
        if (!building || !(building instanceof Building)) return;

        building.cancelProduction(index);
    }

    /**
     * 진영별 생산 가능 유닛 목록
     */
    getTrainableUnits(building) {
        if (!building || !(building instanceof Building)) return [];
        if (!building.canProduce || !building.isComplete) return [];

        const faction = building.faction;
        const configs = UNIT_CONFIGS[faction?.id];
        if (!configs) return [];

        // 건물에서 생산 가능한 유닛만 필터링
        const trainableTypes = building.buildableUnits || [];

        return trainableTypes
            .map(type => ({
                type,
                ...configs[type]
            }))
            .filter(config => config.name);
    }

    /**
     * 유닛 생산 비용 반환
     */
    getUnitCost(faction, unitType) {
        const config = UNIT_CONFIGS[faction?.id]?.[unitType];
        return config?.cost || { crystal: 0, energy: 0 };
    }

    /**
     * 유닛 생산 시간 반환
     */
    getUnitBuildTime(faction, unitType) {
        const config = UNIT_CONFIGS[faction?.id]?.[unitType];
        return config?.buildTime || 10;
    }
}
