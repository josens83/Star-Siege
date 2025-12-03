/**
 * BuildSystem - 건설 시스템
 */

import { BUILD_STATES, EVENTS, RENDER } from '../utils/Constants.js';
import { Vector2 } from '../utils/Vector2.js';
import { Building } from '../entities/Building.js';
import { Unit } from '../entities/Unit.js';
import { BUILDING_CONFIGS } from '../data/BuildingConfigs.js';

export class BuildSystem {
    constructor(game) {
        this.game = game;

        // 건설 상태
        this.state = BUILD_STATES.NONE;
        this.isPlacing = false;

        // 현재 선택된 건물 타입
        this.selectedBuildingType = null;
        this.selectedConfig = null;

        // 미리보기
        this.previewPosition = new Vector2();
        this.isValidPlacement = false;

        // 빌더 유닛
        this.builder = null;
    }

    /**
     * 건물 건설 시작
     */
    startBuild(buildingType, builder = null) {
        const faction = this.game.playerFaction;
        if (!faction) return false;

        const config = BUILDING_CONFIGS[faction.id]?.[buildingType];
        if (!config) {
            console.error(`건물 설정을 찾을 수 없음: ${faction.id}/${buildingType}`);
            return false;
        }

        // 자원 체크
        if (!this.game.resourceSystem.canAfford(this.game.playerTeam, config.cost.crystal, config.cost.energy)) {
            this.game.showToast('자원이 부족합니다!', 'error');
            return false;
        }

        this.selectedBuildingType = buildingType;
        this.selectedConfig = config;
        this.builder = builder;
        this.isPlacing = true;
        this.state = BUILD_STATES.PLACING;

        return true;
    }

    /**
     * 건설 취소
     */
    cancelBuild() {
        this.selectedBuildingType = null;
        this.selectedConfig = null;
        this.builder = null;
        this.isPlacing = false;
        this.state = BUILD_STATES.NONE;
    }

    /**
     * 미리보기 위치 업데이트
     */
    updatePreview(x, y) {
        // 그리드 스냅
        const gridSize = 32;
        this.previewPosition.set(
            Math.round(x / gridSize) * gridSize,
            Math.round(y / gridSize) * gridSize
        );

        // 배치 유효성 체크
        this.isValidPlacement = this.checkPlacement(this.previewPosition.x, this.previewPosition.y);
    }

    /**
     * 배치 유효성 체크
     */
    checkPlacement(x, y) {
        if (!this.selectedConfig) return false;

        const size = this.selectedConfig.size || 64;
        const halfSize = size / 2;

        // 맵 경계 체크
        const { MAP_WIDTH, MAP_HEIGHT } = this.game.constructor.GAME || { MAP_WIDTH: 3200, MAP_HEIGHT: 2400 };
        if (x - halfSize < 0 || x + halfSize > MAP_WIDTH ||
            y - halfSize < 0 || y + halfSize > MAP_HEIGHT) {
            return false;
        }

        // 다른 건물/유닛과 겹침 체크
        for (const entity of this.game.entities) {
            if (!entity.isAlive) continue;
            if (entity instanceof Building || entity instanceof Unit) {
                const entitySize = entity.size || 32;
                const minDist = (size + entitySize) / 2 + 5;

                const dist = entity.position.distanceTo(new Vector2(x, y));
                if (dist < minDist) {
                    return false;
                }
            }
        }

        // 자원 노드 위에 건설 불가
        for (const node of this.game.resourceNodes) {
            const dist = node.position.distanceTo(new Vector2(x, y));
            if (dist < size / 2 + node.size / 2 + 10) {
                return false;
            }
        }

        return true;
    }

    /**
     * 건물 배치
     */
    placeBuild(x, y) {
        if (!this.isPlacing || !this.selectedConfig) return false;

        // 그리드 스냅
        const gridSize = 32;
        const snapX = Math.round(x / gridSize) * gridSize;
        const snapY = Math.round(y / gridSize) * gridSize;

        // 유효성 재확인
        if (!this.checkPlacement(snapX, snapY)) {
            this.game.showToast('이 위치에 건설할 수 없습니다!', 'error');
            this.game.audioManager.playSound('error');
            return false;
        }

        // 자원 차감
        const cost = this.selectedConfig.cost;
        this.game.resourceSystem.spend(this.game.playerTeam, cost.crystal, cost.energy);

        // 건물 생성
        const building = this.game.createBuilding(
            this.selectedBuildingType,
            snapX,
            snapY,
            this.game.playerTeam,
            this.game.playerFaction,
            this.builder
        );

        // 빌더가 있으면 건설하러 이동
        if (this.builder) {
            this.builder.buildAt(building);
        } else {
            // 가장 가까운 일꾼 찾아서 건설 명령
            const nearestWorker = this.game.getNearestEntity(
                snapX,
                snapY,
                (e) => e instanceof Unit && e.team === this.game.playerTeam &&
                    e.isWorker && e.isAlive
            );

            if (nearestWorker) {
                nearestWorker.buildAt(building);
            }
        }

        // 이벤트
        this.game.emit(EVENTS.BUILD_START, { building, type: this.selectedBuildingType });

        // 사운드
        this.game.audioManager.playSound('buildStart');

        // 건설 모드 종료
        this.cancelBuild();

        return true;
    }

    /**
     * 업데이트
     */
    update(deltaTime) {
        // 특별한 업데이트 없음
    }

    /**
     * 미리보기 렌더링
     */
    renderPreview(ctx) {
        if (!this.isPlacing || !this.selectedConfig) return;

        const x = this.previewPosition.x;
        const y = this.previewPosition.y;
        const size = this.selectedConfig.size || 64;

        // 배치 범위 (반투명)
        ctx.fillStyle = this.isValidPlacement ? RENDER.PREVIEW_VALID_COLOR : RENDER.PREVIEW_INVALID_COLOR;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);

        // 건물 미리보기
        ctx.globalAlpha = RENDER.PREVIEW_ALPHA;
        ctx.fillStyle = this.game.playerFaction?.color || '#4488ff';
        ctx.fillRect(x - size / 2, y - size / 2, size, size);

        // 테두리
        ctx.strokeStyle = this.isValidPlacement ? '#44ff88' : '#ff4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - size / 2, y - size / 2, size, size);

        // 아이콘
        ctx.fillStyle = '#ffffff';
        ctx.font = `${size * 0.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.selectedConfig.icon || '🏛️', x, y);

        ctx.globalAlpha = 1;
    }

    /**
     * 진영별 건설 가능 목록 반환
     */
    getBuildableBuildings(faction) {
        const configs = BUILDING_CONFIGS[faction?.id];
        if (!configs) return [];

        return Object.entries(configs)
            .filter(([key, config]) => !config.isStarting)
            .map(([key, config]) => ({
                type: key,
                ...config
            }));
    }
}
