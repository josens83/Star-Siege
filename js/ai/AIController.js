/**
 * AIController - AI 컨트롤러
 * 적 AI의 전략 및 전술 결정
 */

import { GAME, AI, FACTIONS } from '../utils/Constants.js';
import { Vector2 } from '../utils/Vector2.js';
import { Unit } from '../entities/Unit.js';
import { Building } from '../entities/Building.js';
import { BUILDING_CONFIGS } from '../data/BuildingConfigs.js';
import { UNIT_CONFIGS } from '../data/UnitConfigs.js';

export class AIController {
    constructor(game, team, faction, difficulty = 'normal') {
        this.game = game;
        this.team = team;
        this.faction = faction;
        this.difficulty = difficulty;

        // 난이도 설정
        this.difficultySettings = this.getDifficultySettings();

        // AI 상태
        this.state = 'building'; // building, expanding, attacking, defending
        this.lastStateChange = 0;

        // 타이머
        this.updateTimer = 0;
        this.updateInterval = AI.UPDATE_INTERVAL;

        // 공격 관련
        this.attackForce = [];
        this.targetPosition = null;
        this.lastAttackTime = 0;
        this.attackCooldown = 30000; // 30초

        // 건설 계획
        this.buildQueue = [];
        this.productionQueue = [];

        // 경제 목표
        this.targetWorkers = 8;
        this.targetBuildings = {
            collector: 3,
            production: 2,
            defense: 2
        };
    }

    /**
     * 난이도별 설정 반환
     */
    getDifficultySettings() {
        return {
            easy: {
                reactionTime: 3000,
                attackForce: 5,
                buildSpeed: 0.8,
                aggression: 0.3
            },
            normal: {
                reactionTime: 1000,
                attackForce: 8,
                buildSpeed: 1.0,
                aggression: 0.5
            },
            hard: {
                reactionTime: 500,
                attackForce: 12,
                buildSpeed: 1.2,
                aggression: 0.7
            }
        }[this.difficulty] || this.getDifficultySettings().normal;
    }

    /**
     * 업데이트
     */
    update(deltaTime) {
        this.updateTimer += deltaTime;

        if (this.updateTimer < this.updateInterval) return;
        this.updateTimer = 0;

        // 자원 추가 (난이도 보너스)
        if (this.difficulty === 'hard') {
            this.game.resourceSystem.addCrystal(this.team, 0.5);
            this.game.resourceSystem.addEnergy(this.team, 0.2);
        }

        // 상태 업데이트
        this.updateState();

        // 상태별 행동
        switch (this.state) {
            case 'building':
                this.doBuildingBehavior();
                break;
            case 'expanding':
                this.doExpandingBehavior();
                break;
            case 'attacking':
                this.doAttackingBehavior();
                break;
            case 'defending':
                this.doDefendingBehavior();
                break;
        }

        // 유닛 생산
        this.updateProduction();

        // 일꾼 관리
        this.manageWorkers();
    }

    /**
     * 상태 업데이트
     */
    updateState() {
        const resources = this.game.resourceSystem.getResources(this.team);
        const myUnits = this.game.getUnitsByTeam(this.team);
        const myBuildings = this.game.getBuildingsByTeam(this.team);
        const combatUnits = myUnits.filter(u => u.canAttack && !u.isWorker);

        // 방어 상태 체크
        const baseUnderAttack = this.isBaseUnderAttack();
        if (baseUnderAttack) {
            this.state = 'defending';
            return;
        }

        // 충분한 병력이 있으면 공격
        if (combatUnits.length >= this.difficultySettings.attackForce) {
            const timeSinceLastAttack = this.game.gameTime - this.lastAttackTime;
            if (timeSinceLastAttack > this.attackCooldown) {
                this.state = 'attacking';
                return;
            }
        }

        // 경제 성장 필요
        const workers = myUnits.filter(u => u.isWorker);
        const collectors = myBuildings.filter(b => b.isCollector);

        if (workers.length < this.targetWorkers || collectors.length < this.targetBuildings.collector) {
            this.state = 'building';
            return;
        }

        // 기본 상태는 building
        this.state = 'building';
    }

    /**
     * 기지가 공격받고 있는지 체크
     */
    isBaseUnderAttack() {
        const commandCenter = this.game.getBuildingsByTeam(this.team, 'command')[0];
        if (!commandCenter) return false;

        // 사령부 근처의 적 유닛 체크
        const nearbyEnemies = this.game.getEntitiesInRadius(
            commandCenter.position.x,
            commandCenter.position.y,
            300,
            (e) => e.team !== this.team && e instanceof Unit && e.isAlive
        );

        return nearbyEnemies.length > 0;
    }

    /**
     * 건설 행동
     */
    doBuildingBehavior() {
        const resources = this.game.resourceSystem.getResources(this.team);
        const myBuildings = this.game.getBuildingsByTeam(this.team);

        // 수집기 건설
        const collectors = myBuildings.filter(b => b.isCollector);
        if (collectors.length < this.targetBuildings.collector) {
            this.tryBuild('collector');
            return;
        }

        // 생산 건물 건설
        const productionBuildings = myBuildings.filter(b => b.canProduce && b.config?.type !== 'command');
        if (productionBuildings.length < this.targetBuildings.production) {
            this.tryBuild('barracks') || this.tryBuild('gateway') || this.tryBuild('foundry');
            return;
        }

        // 방어 건물 건설
        const defenseBuildings = myBuildings.filter(b => b.canAttack);
        if (defenseBuildings.length < this.targetBuildings.defense) {
            this.tryBuild('turret') || this.tryBuild('photon_cannon') || this.tryBuild('bunker');
        }

        // 보급소 건설 (인구 부족 시)
        if (!this.game.resourceSystem.canAddPopulation(this.team, 2)) {
            this.tryBuild('supply_depot') || this.tryBuild('pylon') || this.tryBuild('depot');
        }
    }

    /**
     * 확장 행동
     */
    doExpandingBehavior() {
        // 새로운 자원 지점 확보 (미구현)
        this.state = 'building';
    }

    /**
     * 공격 행동
     */
    doAttackingBehavior() {
        const combatUnits = this.game.getUnitsByTeam(this.team).filter(
            u => u.canAttack && !u.isWorker
        );

        if (combatUnits.length < 3) {
            this.state = 'building';
            return;
        }

        // 적 사령부 위치 찾기
        const enemyCommand = this.game.getBuildingsByTeam(this.game.playerTeam, 'command')[0];
        if (!enemyCommand) {
            // 적 건물 아무거나
            const enemyBuilding = this.game.buildings.find(
                b => b.team === this.game.playerTeam && b.isAlive
            );
            if (enemyBuilding) {
                this.targetPosition = enemyBuilding.position.clone();
            }
        } else {
            this.targetPosition = enemyCommand.position.clone();
        }

        if (this.targetPosition) {
            // 모든 전투 유닛에게 공격 이동 명령
            for (const unit of combatUnits) {
                if (unit.state !== 'attacking') {
                    unit.attackMove(this.targetPosition.x, this.targetPosition.y);
                }
            }

            this.lastAttackTime = this.game.gameTime;
        }
    }

    /**
     * 방어 행동
     */
    doDefendingBehavior() {
        const combatUnits = this.game.getUnitsByTeam(this.team).filter(
            u => u.canAttack && !u.isWorker
        );

        const commandCenter = this.game.getBuildingsByTeam(this.team, 'command')[0];
        if (!commandCenter) return;

        // 방어 위치로 이동
        for (const unit of combatUnits) {
            if (!unit.target) {
                // 근처 적 찾기
                const enemy = this.game.getNearestEntity(
                    commandCenter.position.x,
                    commandCenter.position.y,
                    (e) => e.team !== this.team && e.isAlive && e instanceof Unit
                );

                if (enemy && unit.distanceTo(enemy) < 400) {
                    unit.attackTarget(enemy);
                } else {
                    // 사령부 근처로 이동
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 80 + Math.random() * 40;
                    unit.moveTo(
                        commandCenter.position.x + Math.cos(angle) * dist,
                        commandCenter.position.y + Math.sin(angle) * dist
                    );
                }
            }
        }
    }

    /**
     * 건물 건설 시도
     */
    tryBuild(buildingType) {
        const configs = BUILDING_CONFIGS[this.faction.id];
        const config = configs?.[buildingType];
        if (!config) return false;

        // 자원 체크
        const cost = config.cost;
        if (!this.game.resourceSystem.canAfford(this.team, cost.crystal, cost.energy)) {
            return false;
        }

        // 건설 위치 찾기
        const position = this.findBuildPosition(buildingType);
        if (!position) return false;

        // 자원 차감
        this.game.resourceSystem.spend(this.team, cost.crystal, cost.energy);

        // 건물 생성
        const building = this.game.createBuilding(
            buildingType,
            position.x,
            position.y,
            this.team,
            this.faction
        );

        // 가장 가까운 일꾼에게 건설 명령
        const worker = this.game.getNearestEntity(
            position.x,
            position.y,
            (e) => e.team === this.team && e.isWorker && e.isAlive
        );

        if (worker) {
            worker.buildAt(building);
        }

        return true;
    }

    /**
     * 건설 위치 찾기
     */
    findBuildPosition(buildingType) {
        const commandCenter = this.game.getBuildingsByTeam(this.team, 'command')[0];
        if (!commandCenter) return null;

        const baseX = commandCenter.position.x;
        const baseY = commandCenter.position.y;

        // 사령부 주변에 랜덤 위치
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 100 + Math.random() * 150;
            const x = baseX + Math.cos(angle) * dist;
            const y = baseY + Math.sin(angle) * dist;

            // 위치 유효성 체크 (간단하게)
            if (x > 50 && x < GAME.MAP_WIDTH - 50 && y > 50 && y < GAME.MAP_HEIGHT - 50) {
                // 다른 건물과 겹치지 않는지
                const overlap = this.game.buildings.some(b =>
                    b.position.distanceTo(new Vector2(x, y)) < 80
                );

                if (!overlap) {
                    return new Vector2(x, y);
                }
            }
        }

        return null;
    }

    /**
     * 유닛 생산 업데이트
     */
    updateProduction() {
        const productionBuildings = this.game.getBuildingsByTeam(this.team).filter(
            b => b.canProduce && b.isComplete
        );

        for (const building of productionBuildings) {
            // 이미 생산 중이면 스킵
            if (building.currentProduction || building.productionQueue.length > 0) continue;

            // 인구 체크
            if (!this.game.resourceSystem.canAddPopulation(this.team, 1)) continue;

            // 사령부: 일꾼 생산
            if (building.config?.type === 'command') {
                const workers = this.game.getUnitsByTeam(this.team).filter(u => u.isWorker);
                if (workers.length < this.targetWorkers) {
                    const workerType = this.getWorkerType();
                    this.tryProduce(building, workerType);
                }
            }
            // 생산 건물: 전투 유닛 생산
            else {
                const unitType = this.chooseCombatUnit(building);
                if (unitType) {
                    this.tryProduce(building, unitType);
                }
            }
        }
    }

    /**
     * 일꾼 타입 반환
     */
    getWorkerType() {
        const workerTypes = {
            terra: 'worker',
            kryon: 'probe',
            mechanicus: 'drone'
        };
        return workerTypes[this.faction.id] || 'worker';
    }

    /**
     * 전투 유닛 선택
     */
    chooseCombatUnit(building) {
        const units = building.buildableUnits || [];
        const combatUnits = units.filter(u => {
            const config = UNIT_CONFIGS[this.faction.id]?.[u];
            return config && !config.isWorker;
        });

        if (combatUnits.length === 0) return null;

        // 랜덤 선택 (또는 전략적 선택)
        return combatUnits[Math.floor(Math.random() * combatUnits.length)];
    }

    /**
     * 유닛 생산 시도
     */
    tryProduce(building, unitType) {
        const config = UNIT_CONFIGS[this.faction.id]?.[unitType];
        if (!config) return false;

        const cost = config.cost;
        if (!this.game.resourceSystem.canAfford(this.team, cost.crystal, cost.energy)) {
            return false;
        }

        // 생산 시작
        this.game.resourceSystem.spend(this.team, cost.crystal, cost.energy);
        building.productionQueue.push({
            type: unitType,
            config: config,
            buildTime: config.buildTime || 10
        });

        if (!building.currentProduction) {
            building.nextProduction();
        }

        return true;
    }

    /**
     * 일꾼 관리
     */
    manageWorkers() {
        const workers = this.game.getUnitsByTeam(this.team).filter(u => u.isWorker && u.isAlive);

        for (const worker of workers) {
            // 이미 일하고 있으면 스킵
            if (worker.targetResource || worker.currentBuildTarget) continue;
            if (worker.carriedResource > 0) continue; // 반납 중

            // 유휴 일꾼에게 자원 수집 명령
            const nearestResource = this.game.getNearestEntity(
                worker.position.x,
                worker.position.y,
                (e) => e.constructor.name === 'ResourceNode' && e.amount > 0 && e.canGather()
            );

            if (nearestResource) {
                worker.gatherResource(nearestResource);
            }
        }
    }

    /**
     * 직렬화
     */
    serialize() {
        return {
            team: this.team,
            factionId: this.faction.id,
            difficulty: this.difficulty,
            state: this.state,
            lastAttackTime: this.lastAttackTime
        };
    }

    /**
     * 역직렬화
     */
    deserialize(data) {
        this.state = data.state;
        this.lastAttackTime = data.lastAttackTime;
    }
}
