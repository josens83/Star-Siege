/**
 * Game - 게임 메인 클래스
 * 모든 게임 시스템을 통합 관리
 */

import { GAME, FACTIONS, GAME_STATES, GAME_MODES, EVENTS, COLORS, RENDER } from '../utils/Constants.js';
import { Vector2 } from '../utils/Vector2.js';
import { GameLoop } from './GameLoop.js';
import { InputManager } from './InputManager.js';
import { Camera } from '../systems/Camera.js';
import { ResourceSystem } from '../systems/ResourceSystem.js';
import { SelectionSystem } from '../systems/SelectionSystem.js';
import { BuildSystem } from '../systems/BuildSystem.js';
import { ProductionSystem } from '../systems/ProductionSystem.js';
import { BalanceManager } from '../systems/BalanceManager.js';
import { PerformanceManager } from '../systems/PerformanceManager.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { TutorialSystem } from '../systems/TutorialSystem.js';
import { AIController } from '../ai/AIController.js';
import { WaveSystem } from '../ai/WaveSystem.js';
import { MissionSystem } from '../ai/MissionSystem.js';
import { UIManager } from '../ui/UIManager.js';
import { Minimap } from '../ui/Minimap.js';
import { TouchControls } from '../ui/TouchControls.js';
import { AudioManager } from '../audio/AudioManager.js';
import { EffectSystem } from '../effects/EffectSystem.js';
import { Entity } from '../entities/Entity.js';
import { Unit } from '../entities/Unit.js';
import { Building } from '../entities/Building.js';
import { Projectile } from '../entities/Projectile.js';
import { ResourceNode } from '../entities/ResourceNode.js';
import { BUILDING_CONFIGS } from '../data/BuildingConfigs.js';
import { UNIT_CONFIGS } from '../data/UnitConfigs.js';

export class Game {
    constructor() {
        // 캔버스 설정
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // 게임 상태
        this.state = GAME_STATES.LOADING;
        this.mode = null;
        this.difficulty = 'normal';
        this.playerFaction = null;
        this.enemyFaction = null;

        // 게임 시간
        this.gameTime = 0;
        this.playTime = 0;

        // 엔티티 관리
        this.entities = [];
        this.units = [];
        this.buildings = [];
        this.projectiles = [];
        this.resourceNodes = [];

        // 팀 관리
        this.playerTeam = 0;
        this.enemyTeam = 1;

        // 통계
        this.stats = {
            unitsProduced: 0,
            unitsLost: 0,
            enemiesKilled: 0,
            buildingsConstructed: 0,
            resourcesGathered: 0
        };

        // 이벤트 리스너
        this.eventListeners = {};

        // 엔티티 ID 카운터
        this.nextEntityId = 1;

        // 시스템들 (나중에 초기화)
        this.gameLoop = null;
        this.inputManager = null;
        this.camera = null;
        this.resourceSystem = null;
        this.selectionSystem = null;
        this.buildSystem = null;
        this.productionSystem = null;
        this.balanceManager = null;
        this.performanceManager = null;
        this.saveSystem = null;
        this.tutorialSystem = null;
        this.aiController = null;
        this.waveSystem = null;
        this.missionSystem = null;
        this.uiManager = null;
        this.minimap = null;
        this.touchControls = null;
        this.audioManager = null;
        this.effectSystem = null;

        // 디버그 모드
        this.debug = false;
    }

    /**
     * 게임 초기화
     */
    async init() {
        console.log('Star Siege 초기화 시작...');

        // 캔버스 크기 설정
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // 시스템 초기화
        await this.initSystems();

        // 로딩 완료
        this.state = GAME_STATES.MENU;
        this.hideLoadingScreen();

        console.log('Star Siege 초기화 완료');
    }

    /**
     * 시스템 초기화
     */
    async initSystems() {
        const loadingProgress = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');
        let progress = 0;

        const updateProgress = (text, amount) => {
            progress += amount;
            if (loadingProgress) loadingProgress.style.width = `${progress}%`;
            if (loadingText) loadingText.textContent = text;
        };

        // 카메라
        updateProgress('카메라 초기화...', 10);
        this.camera = new Camera(this);

        // 입력 관리자
        updateProgress('입력 시스템 초기화...', 10);
        this.inputManager = new InputManager(this);

        // 자원 시스템
        updateProgress('자원 시스템 초기화...', 10);
        this.resourceSystem = new ResourceSystem(this);

        // 선택 시스템
        updateProgress('선택 시스템 초기화...', 10);
        this.selectionSystem = new SelectionSystem(this);

        // 건설 시스템
        updateProgress('건설 시스템 초기화...', 10);
        this.buildSystem = new BuildSystem(this);

        // 생산 시스템
        updateProgress('생산 시스템 초기화...', 10);
        this.productionSystem = new ProductionSystem(this);

        // 밸런스 관리자
        updateProgress('밸런스 시스템 초기화...', 5);
        this.balanceManager = new BalanceManager(this);

        // 퍼포먼스 관리자
        updateProgress('퍼포먼스 시스템 초기화...', 5);
        this.performanceManager = new PerformanceManager(this);

        // 저장 시스템
        updateProgress('저장 시스템 초기화...', 5);
        this.saveSystem = new SaveSystem(this);

        // 이펙트 시스템
        updateProgress('이펙트 시스템 초기화...', 5);
        this.effectSystem = new EffectSystem(this);

        // 오디오 관리자
        updateProgress('오디오 시스템 초기화...', 5);
        this.audioManager = new AudioManager(this);

        // UI 관리자
        updateProgress('UI 초기화...', 5);
        this.uiManager = new UIManager(this);

        // 미니맵
        updateProgress('미니맵 초기화...', 5);
        this.minimap = new Minimap(this);

        // 터치 컨트롤
        updateProgress('터치 컨트롤 초기화...', 5);
        this.touchControls = new TouchControls(this);

        // 튜토리얼 시스템
        this.tutorialSystem = new TutorialSystem(this);

        // 게임 루프
        updateProgress('게임 루프 초기화...', 0);
        this.gameLoop = new GameLoop(this);

        // 저장된 게임 확인
        this.saveSystem.checkSavedGame();

        updateProgress('완료!', 0);
    }

    /**
     * 캔버스 크기 조정
     */
    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.parentElement.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.ctx.scale(dpr, dpr);

        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;

        // 화면 크기 저장
        this.screenWidth = rect.width;
        this.screenHeight = rect.height;

        // 카메라 업데이트
        if (this.camera) {
            this.camera.updateViewport(this.screenWidth, this.screenHeight);
        }
    }

    /**
     * 로딩 화면 숨기기
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    /**
     * 새 게임 시작
     */
    startNewGame(mode, faction, difficulty = 'normal') {
        console.log(`새 게임 시작: ${mode}, ${faction}, ${difficulty}`);

        // 게임 초기화
        this.resetGame();

        // 설정 적용
        this.mode = mode;
        this.difficulty = difficulty;
        this.playerFaction = FACTIONS[faction.toUpperCase()];

        // 적 진영 랜덤 선택
        const factionKeys = Object.keys(FACTIONS).filter(k => k !== faction.toUpperCase());
        const randomFaction = factionKeys[Math.floor(Math.random() * factionKeys.length)];
        this.enemyFaction = FACTIONS[randomFaction];

        // 맵 생성
        this.generateMap();

        // 시작 유닛/건물 배치
        this.spawnStartingEntities();

        // 모드별 시스템 초기화
        if (mode === GAME_MODES.WAVE) {
            this.waveSystem = new WaveSystem(this);
        } else if (mode === GAME_MODES.SKIRMISH) {
            this.aiController = new AIController(this, this.enemyTeam, this.enemyFaction, difficulty);
        } else if (mode === GAME_MODES.CAMPAIGN) {
            this.missionSystem = new MissionSystem(this);
        }

        // 게임 시작
        this.state = GAME_STATES.PLAYING;
        this.gameLoop.start();

        // UI 업데이트
        this.uiManager.hideMenuOverlay();
        this.uiManager.showGameUI();

        // 이벤트 발생
        this.emit(EVENTS.GAME_START, { mode, faction, difficulty });

        // 오디오 시작
        this.audioManager.playBGM('battle');
    }

    /**
     * 게임 리셋
     */
    resetGame() {
        // 엔티티 초기화
        this.entities = [];
        this.units = [];
        this.buildings = [];
        this.projectiles = [];
        this.resourceNodes = [];

        // 시간 초기화
        this.gameTime = 0;
        this.playTime = 0;

        // 통계 초기화
        this.stats = {
            unitsProduced: 0,
            unitsLost: 0,
            enemiesKilled: 0,
            buildingsConstructed: 0,
            resourcesGathered: 0
        };

        // ID 카운터 초기화
        this.nextEntityId = 1;

        // 시스템 초기화
        this.resourceSystem.reset();
        this.selectionSystem.clearSelection();
        this.buildSystem.cancelBuild();

        if (this.aiController) {
            this.aiController = null;
        }
        if (this.waveSystem) {
            this.waveSystem = null;
        }
        if (this.missionSystem) {
            this.missionSystem = null;
        }

        // 이펙트 초기화
        this.effectSystem.clear();

        // 카메라 초기화
        this.camera.reset();
    }

    /**
     * 맵 생성
     */
    generateMap() {
        // 자원 노드 배치
        const nodePositions = [
            // 플레이어 근처
            { x: 300, y: 500, type: 'crystal', amount: 1500 },
            { x: 500, y: 300, type: 'crystal', amount: 1500 },
            // 중앙
            { x: GAME.MAP_WIDTH / 2 - 200, y: GAME.MAP_HEIGHT / 2, type: 'crystal', amount: 2000 },
            { x: GAME.MAP_WIDTH / 2 + 200, y: GAME.MAP_HEIGHT / 2, type: 'crystal', amount: 2000 },
            { x: GAME.MAP_WIDTH / 2, y: GAME.MAP_HEIGHT / 2 - 200, type: 'crystal', amount: 2000 },
            { x: GAME.MAP_WIDTH / 2, y: GAME.MAP_HEIGHT / 2 + 200, type: 'crystal', amount: 2000 },
            // 적 근처
            { x: GAME.MAP_WIDTH - 300, y: GAME.MAP_HEIGHT - 500, type: 'crystal', amount: 1500 },
            { x: GAME.MAP_WIDTH - 500, y: GAME.MAP_HEIGHT - 300, type: 'crystal', amount: 1500 }
        ];

        for (const pos of nodePositions) {
            this.createResourceNode(pos.x, pos.y, pos.type, pos.amount);
        }
    }

    /**
     * 시작 엔티티 배치
     */
    spawnStartingEntities() {
        const playerStartX = 200;
        const playerStartY = 200;
        const enemyStartX = GAME.MAP_WIDTH - 200;
        const enemyStartY = GAME.MAP_HEIGHT - 200;

        // 플레이어 사령부
        const playerCommand = this.createBuilding(
            this.getCommandBuildingType(this.playerFaction.id),
            playerStartX,
            playerStartY,
            this.playerTeam,
            this.playerFaction
        );
        playerCommand.isComplete = true;
        playerCommand.constructionProgress = 1;

        // 플레이어 일꾼 3기
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 / 3) * i;
            const x = playerStartX + Math.cos(angle) * 80;
            const y = playerStartY + Math.sin(angle) * 80;
            this.createUnit(
                this.getWorkerUnitType(this.playerFaction.id),
                x,
                y,
                this.playerTeam,
                this.playerFaction
            );
        }

        // 적 배치 (스커미시 모드인 경우)
        if (this.mode === GAME_MODES.SKIRMISH) {
            const enemyCommand = this.createBuilding(
                this.getCommandBuildingType(this.enemyFaction.id),
                enemyStartX,
                enemyStartY,
                this.enemyTeam,
                this.enemyFaction
            );
            enemyCommand.isComplete = true;
            enemyCommand.constructionProgress = 1;

            // 적 일꾼 3기
            for (let i = 0; i < 3; i++) {
                const angle = (Math.PI * 2 / 3) * i;
                const x = enemyStartX + Math.cos(angle) * 80;
                const y = enemyStartY + Math.sin(angle) * 80;
                this.createUnit(
                    this.getWorkerUnitType(this.enemyFaction.id),
                    x,
                    y,
                    this.enemyTeam,
                    this.enemyFaction
                );
            }

            // 적 자원 초기화
            this.resourceSystem.setResources(this.enemyTeam, GAME.STARTING_CRYSTAL, GAME.STARTING_ENERGY);
        }

        // 카메라를 플레이어 사령부로 이동
        this.camera.centerOn(playerStartX, playerStartY);
    }

    /**
     * 진영별 사령부 건물 타입 반환
     */
    getCommandBuildingType(factionId) {
        const types = {
            'terra': 'command_center',
            'kryon': 'nexus',
            'mechanicus': 'core'
        };
        return types[factionId] || 'command_center';
    }

    /**
     * 진영별 일꾼 유닛 타입 반환
     */
    getWorkerUnitType(factionId) {
        const types = {
            'terra': 'worker',
            'kryon': 'probe',
            'mechanicus': 'drone'
        };
        return types[factionId] || 'worker';
    }

    /**
     * 유닛 생성
     */
    createUnit(type, x, y, team, faction) {
        const config = UNIT_CONFIGS[faction.id]?.[type];
        if (!config) {
            console.error(`유닛 설정을 찾을 수 없음: ${faction.id}/${type}`);
            return null;
        }

        const unit = new Unit(this, {
            id: this.nextEntityId++,
            type,
            x,
            y,
            team,
            faction,
            config
        });

        this.entities.push(unit);
        this.units.push(unit);

        if (team === this.playerTeam) {
            this.stats.unitsProduced++;
        }

        this.emit(EVENTS.ENTITY_CREATED, { entity: unit });

        return unit;
    }

    /**
     * 건물 생성
     */
    createBuilding(type, x, y, team, faction, builder = null) {
        const config = BUILDING_CONFIGS[faction.id]?.[type];
        if (!config) {
            console.error(`건물 설정을 찾을 수 없음: ${faction.id}/${type}`);
            return null;
        }

        const building = new Building(this, {
            id: this.nextEntityId++,
            type,
            x,
            y,
            team,
            faction,
            config,
            builder
        });

        this.entities.push(building);
        this.buildings.push(building);

        if (team === this.playerTeam && building.isComplete) {
            this.stats.buildingsConstructed++;
        }

        this.emit(EVENTS.ENTITY_CREATED, { entity: building });

        return building;
    }

    /**
     * 투사체 생성
     */
    createProjectile(source, target, damage, type = 'bullet') {
        const projectile = new Projectile(this, {
            id: this.nextEntityId++,
            source,
            target,
            damage,
            type,
            x: source.position.x,
            y: source.position.y
        });

        this.entities.push(projectile);
        this.projectiles.push(projectile);

        return projectile;
    }

    /**
     * 자원 노드 생성
     */
    createResourceNode(x, y, type, amount) {
        const node = new ResourceNode(this, {
            id: this.nextEntityId++,
            x,
            y,
            type,
            amount
        });

        this.entities.push(node);
        this.resourceNodes.push(node);

        return node;
    }

    /**
     * 엔티티 제거
     */
    removeEntity(entity) {
        // 배열에서 제거
        const entityIndex = this.entities.indexOf(entity);
        if (entityIndex !== -1) {
            this.entities.splice(entityIndex, 1);
        }

        if (entity instanceof Unit) {
            const unitIndex = this.units.indexOf(entity);
            if (unitIndex !== -1) {
                this.units.splice(unitIndex, 1);
            }
        } else if (entity instanceof Building) {
            const buildingIndex = this.buildings.indexOf(entity);
            if (buildingIndex !== -1) {
                this.buildings.splice(buildingIndex, 1);
            }
        } else if (entity instanceof Projectile) {
            const projIndex = this.projectiles.indexOf(entity);
            if (projIndex !== -1) {
                this.projectiles.splice(projIndex, 1);
            }
        } else if (entity instanceof ResourceNode) {
            const nodeIndex = this.resourceNodes.indexOf(entity);
            if (nodeIndex !== -1) {
                this.resourceNodes.splice(nodeIndex, 1);
            }
        }

        // 선택 해제
        this.selectionSystem.deselectEntity(entity);

        // 이벤트 발생
        this.emit(EVENTS.ENTITY_DESTROYED, { entity });
    }

    /**
     * 게임 업데이트 (매 프레임)
     */
    update(deltaTime) {
        if (this.state !== GAME_STATES.PLAYING) return;

        // 게임 시간 업데이트
        this.gameTime += deltaTime;
        this.playTime += deltaTime;

        // 카메라 업데이트
        this.camera.update(deltaTime);

        // 엔티티 업데이트
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            if (entity.isAlive) {
                entity.update(deltaTime);
            } else {
                this.removeEntity(entity);
            }
        }

        // 시스템 업데이트
        this.resourceSystem.update(deltaTime);
        this.buildSystem.update(deltaTime);
        this.productionSystem.update(deltaTime);
        this.effectSystem.update(deltaTime);

        // AI 업데이트
        if (this.aiController) {
            this.aiController.update(deltaTime);
        }

        // 웨이브 시스템 업데이트
        if (this.waveSystem) {
            this.waveSystem.update(deltaTime);
        }

        // 미션 시스템 업데이트
        if (this.missionSystem) {
            this.missionSystem.update(deltaTime);
        }

        // 튜토리얼 업데이트
        if (this.tutorialSystem.isActive) {
            this.tutorialSystem.update(deltaTime);
        }

        // 퍼포먼스 모니터링
        this.performanceManager.update(deltaTime);

        // 자동 저장
        this.saveSystem.update(deltaTime);

        // 승패 체크
        this.checkWinCondition();
    }

    /**
     * 게임 렌더링
     */
    render() {
        const ctx = this.ctx;

        // 화면 클리어
        ctx.fillStyle = RENDER.TERRAIN_COLORS.ground;
        ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);

        // 카메라 변환 적용
        ctx.save();
        this.camera.applyTransform(ctx);

        // 맵 배경 렌더링
        this.renderMapBackground(ctx);

        // 자원 노드 렌더링
        for (const node of this.resourceNodes) {
            node.render(ctx);
        }

        // 건물 렌더링 (건설 중인 것 포함)
        for (const building of this.buildings) {
            building.render(ctx);
        }

        // 건설 미리보기
        this.buildSystem.renderPreview(ctx);

        // 유닛 렌더링
        for (const unit of this.units) {
            unit.render(ctx);
        }

        // 투사체 렌더링
        for (const projectile of this.projectiles) {
            projectile.render(ctx);
        }

        // 이펙트 렌더링
        this.effectSystem.render(ctx);

        // 선택 박스 렌더링
        this.selectionSystem.renderSelectionBox(ctx);

        ctx.restore();

        // UI 렌더링 (카메라 변환 없이)
        if (this.debug) {
            this.renderDebugInfo(ctx);
        }
    }

    /**
     * 맵 배경 렌더링
     */
    renderMapBackground(ctx) {
        // 그리드 렌더링 (디버그용)
        if (this.debug) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;

            for (let x = 0; x < GAME.MAP_WIDTH; x += GAME.TILE_SIZE) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, GAME.MAP_HEIGHT);
                ctx.stroke();
            }

            for (let y = 0; y < GAME.MAP_HEIGHT; y += GAME.TILE_SIZE) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(GAME.MAP_WIDTH, y);
                ctx.stroke();
            }
        }

        // 맵 경계
        ctx.strokeStyle = 'rgba(68, 136, 255, 0.5)';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, GAME.MAP_WIDTH, GAME.MAP_HEIGHT);
    }

    /**
     * 디버그 정보 렌더링
     */
    renderDebugInfo(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, this.screenHeight - 100, 200, 90);

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.fillText(`FPS: ${this.performanceManager.fps.toFixed(1)}`, 20, this.screenHeight - 80);
        ctx.fillText(`Entities: ${this.entities.length}`, 20, this.screenHeight - 65);
        ctx.fillText(`Units: ${this.units.length}`, 20, this.screenHeight - 50);
        ctx.fillText(`Buildings: ${this.buildings.length}`, 20, this.screenHeight - 35);
        ctx.fillText(`Camera: (${this.camera.x.toFixed(0)}, ${this.camera.y.toFixed(0)})`, 20, this.screenHeight - 20);
    }

    /**
     * 승패 조건 체크
     */
    checkWinCondition() {
        if (this.mode === GAME_MODES.WAVE) {
            // 웨이브 모드는 WaveSystem에서 처리
            return;
        }

        // 플레이어 사령부 체크
        const playerCommands = this.buildings.filter(
            b => b.team === this.playerTeam && b.config.type === 'command' && b.isAlive
        );

        if (playerCommands.length === 0) {
            this.gameOver(false);
            return;
        }

        // 스커미시: 적 사령부 체크
        if (this.mode === GAME_MODES.SKIRMISH) {
            const enemyCommands = this.buildings.filter(
                b => b.team === this.enemyTeam && b.config.type === 'command' && b.isAlive
            );

            if (enemyCommands.length === 0) {
                this.gameOver(true);
            }
        }
    }

    /**
     * 게임 오버 처리
     */
    gameOver(victory) {
        this.state = GAME_STATES.GAME_OVER;
        this.gameLoop.stop();

        // 통계 업데이트
        const minutes = Math.floor(this.playTime / 60000);
        const seconds = Math.floor((this.playTime % 60000) / 1000);

        // UI 표시
        this.uiManager.showGameOverScreen(victory, {
            time: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
            unitsProduced: this.stats.unitsProduced,
            enemiesKilled: this.stats.enemiesKilled,
            buildingsConstructed: this.stats.buildingsConstructed
        });

        // 오디오
        this.audioManager.playSound(victory ? 'victory' : 'defeat');
        this.audioManager.stopBGM();

        // 이벤트 발생
        this.emit(EVENTS.GAME_OVER, { victory });
    }

    /**
     * 게임 일시정지
     */
    pause() {
        if (this.state === GAME_STATES.PLAYING) {
            this.state = GAME_STATES.PAUSED;
            this.gameLoop.stop();
            this.uiManager.showPauseMenu();
            this.emit(EVENTS.GAME_PAUSE);
        }
    }

    /**
     * 게임 재개
     */
    resume() {
        if (this.state === GAME_STATES.PAUSED) {
            this.state = GAME_STATES.PLAYING;
            this.gameLoop.start();
            this.uiManager.hidePauseMenu();
            this.emit(EVENTS.GAME_RESUME);
        }
    }

    /**
     * 메인 메뉴로
     */
    returnToMainMenu() {
        this.gameLoop.stop();
        this.resetGame();
        this.state = GAME_STATES.MENU;
        this.uiManager.showMainMenu();
        this.audioManager.stopBGM();
    }

    /**
     * 튜토리얼 시작
     */
    startTutorial() {
        this.startNewGame(GAME_MODES.TUTORIAL, 'terra', 'easy');
        this.tutorialSystem.start();
    }

    /**
     * 특정 위치의 엔티티 찾기
     */
    getEntityAt(x, y, filter = null) {
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            if (entity.isAlive && entity.containsPoint(x, y)) {
                if (!filter || filter(entity)) {
                    return entity;
                }
            }
        }
        return null;
    }

    /**
     * 범위 내 엔티티 찾기
     */
    getEntitiesInRect(x1, y1, x2, y2, filter = null) {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);

        const result = [];
        for (const entity of this.entities) {
            if (entity.isAlive && entity.intersectsRect(minX, minY, maxX, maxY)) {
                if (!filter || filter(entity)) {
                    result.push(entity);
                }
            }
        }
        return result;
    }

    /**
     * 범위 내 엔티티 찾기 (원형)
     */
    getEntitiesInRadius(x, y, radius, filter = null) {
        const radiusSq = radius * radius;
        const result = [];

        for (const entity of this.entities) {
            if (entity.isAlive) {
                const distSq = entity.position.distanceToSquared(new Vector2(x, y));
                if (distSq <= radiusSq) {
                    if (!filter || filter(entity)) {
                        result.push(entity);
                    }
                }
            }
        }
        return result;
    }

    /**
     * 가장 가까운 엔티티 찾기
     */
    getNearestEntity(x, y, filter = null) {
        let nearest = null;
        let nearestDistSq = Infinity;
        const pos = new Vector2(x, y);

        for (const entity of this.entities) {
            if (entity.isAlive) {
                if (!filter || filter(entity)) {
                    const distSq = entity.position.distanceToSquared(pos);
                    if (distSq < nearestDistSq) {
                        nearest = entity;
                        nearestDistSq = distSq;
                    }
                }
            }
        }
        return nearest;
    }

    /**
     * 특정 팀의 건물 찾기
     */
    getBuildingsByTeam(team, type = null) {
        return this.buildings.filter(b => {
            if (!b.isAlive || b.team !== team) return false;
            if (type && b.config.type !== type) return false;
            return true;
        });
    }

    /**
     * 특정 팀의 유닛 찾기
     */
    getUnitsByTeam(team, type = null) {
        return this.units.filter(u => {
            if (!u.isAlive || u.team !== team) return false;
            if (type && u.config.unitType !== type) return false;
            return true;
        });
    }

    /**
     * 이벤트 리스너 등록
     */
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    /**
     * 이벤트 리스너 제거
     */
    off(event, callback) {
        if (this.eventListeners[event]) {
            const index = this.eventListeners[event].indexOf(callback);
            if (index !== -1) {
                this.eventListeners[event].splice(index, 1);
            }
        }
    }

    /**
     * 이벤트 발생
     */
    emit(event, data = {}) {
        if (this.eventListeners[event]) {
            for (const callback of this.eventListeners[event]) {
                callback(data);
            }
        }
    }

    /**
     * 토스트 메시지 표시
     */
    showToast(message, type = 'info') {
        this.uiManager.showToast(message, type);
    }

    /**
     * 디버그 모드 토글
     */
    toggleDebug() {
        this.debug = !this.debug;
        console.log(`디버그 모드: ${this.debug ? 'ON' : 'OFF'}`);
    }
}
