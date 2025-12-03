/**
 * SaveSystem - 저장/불러오기 시스템
 */

import { GAME, FACTIONS } from '../utils/Constants.js';

export class SaveSystem {
    constructor(game) {
        this.game = game;

        // 자동 저장 타이머
        this.autoSaveTimer = 0;
        this.autoSaveInterval = GAME.AUTO_SAVE_INTERVAL;

        // 저장 키
        this.saveKey = GAME.SAVE_KEY;
        this.settingsKey = GAME.SETTINGS_KEY;

        // 저장된 게임 존재 여부
        this.hasSavedGame = false;
    }

    /**
     * 저장된 게임 확인
     */
    checkSavedGame() {
        const saved = localStorage.getItem(this.saveKey);
        this.hasSavedGame = !!saved;

        // UI 업데이트
        const continueBtn = document.getElementById('btn-continue');
        if (continueBtn) {
            continueBtn.disabled = !this.hasSavedGame;
        }
    }

    /**
     * 업데이트 (자동 저장)
     */
    update(deltaTime) {
        this.autoSaveTimer += deltaTime;

        if (this.autoSaveTimer >= this.autoSaveInterval) {
            this.autoSave();
            this.autoSaveTimer = 0;
        }
    }

    /**
     * 자동 저장
     */
    autoSave() {
        if (this.game.state !== 'playing') return;

        this.save();
        this.game.showToast('자동 저장됨', 'info');
    }

    /**
     * 게임 저장
     */
    save() {
        const saveData = {
            version: 1,
            timestamp: Date.now(),

            // 게임 상태
            mode: this.game.mode,
            difficulty: this.game.difficulty,
            playerFactionId: this.game.playerFaction?.id,
            enemyFactionId: this.game.enemyFaction?.id,

            // 시간
            gameTime: this.game.gameTime,
            playTime: this.game.playTime,

            // 자원
            resources: this.game.resourceSystem.serialize(),

            // 카메라
            camera: this.game.camera.serialize(),

            // 통계
            stats: { ...this.game.stats },

            // 엔티티
            entities: this.serializeEntities(),

            // 웨이브 시스템
            waveSystem: this.game.waveSystem?.serialize() || null,

            // AI
            aiController: this.game.aiController?.serialize() || null
        };

        try {
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            this.hasSavedGame = true;
            console.log('게임 저장됨');
            return true;
        } catch (e) {
            console.error('저장 실패:', e);
            this.game.showToast('저장 실패!', 'error');
            return false;
        }
    }

    /**
     * 게임 불러오기
     */
    load() {
        const saved = localStorage.getItem(this.saveKey);
        if (!saved) {
            this.game.showToast('저장된 게임이 없습니다!', 'error');
            return false;
        }

        try {
            const saveData = JSON.parse(saved);

            // 버전 체크
            if (saveData.version !== 1) {
                this.game.showToast('호환되지 않는 저장 파일입니다!', 'error');
                return false;
            }

            // 게임 리셋
            this.game.resetGame();

            // 상태 복원
            this.game.mode = saveData.mode;
            this.game.difficulty = saveData.difficulty;
            this.game.playerFaction = FACTIONS[saveData.playerFactionId.toUpperCase()];
            this.game.enemyFaction = FACTIONS[saveData.enemyFactionId.toUpperCase()];

            // 시간 복원
            this.game.gameTime = saveData.gameTime;
            this.game.playTime = saveData.playTime;

            // 자원 복원
            this.game.resourceSystem.deserialize(saveData.resources);

            // 카메라 복원
            this.game.camera.deserialize(saveData.camera);

            // 통계 복원
            this.game.stats = { ...saveData.stats };

            // 엔티티 복원
            this.deserializeEntities(saveData.entities);

            // 웨이브 시스템 복원
            if (saveData.waveSystem && this.game.mode === 'wave') {
                const { WaveSystem } = require('../ai/WaveSystem.js');
                this.game.waveSystem = new WaveSystem(this.game);
                this.game.waveSystem.deserialize(saveData.waveSystem);
            }

            // AI 복원
            if (saveData.aiController && this.game.mode === 'skirmish') {
                const { AIController } = require('../ai/AIController.js');
                this.game.aiController = new AIController(
                    this.game,
                    this.game.enemyTeam,
                    this.game.enemyFaction,
                    this.game.difficulty
                );
                this.game.aiController.deserialize(saveData.aiController);
            }

            // 게임 시작
            this.game.state = 'playing';
            this.game.gameLoop.start();
            this.game.uiManager.hideMenuOverlay();
            this.game.uiManager.showGameUI();

            console.log('게임 로드됨');
            this.game.showToast('게임을 불러왔습니다!', 'success');
            return true;

        } catch (e) {
            console.error('불러오기 실패:', e);
            this.game.showToast('불러오기 실패!', 'error');
            return false;
        }
    }

    /**
     * 엔티티 직렬화
     */
    serializeEntities() {
        const entities = {
            units: [],
            buildings: [],
            resourceNodes: []
        };

        for (const unit of this.game.units) {
            if (unit.isAlive) {
                entities.units.push(unit.serialize());
            }
        }

        for (const building of this.game.buildings) {
            if (building.isAlive) {
                entities.buildings.push(building.serialize());
            }
        }

        for (const node of this.game.resourceNodes) {
            if (node.isAlive) {
                entities.resourceNodes.push(node.serialize());
            }
        }

        return entities;
    }

    /**
     * 엔티티 역직렬화
     */
    deserializeEntities(entities) {
        // 자원 노드
        for (const nodeData of entities.resourceNodes) {
            const node = this.game.createResourceNode(
                nodeData.x,
                nodeData.y,
                nodeData.resourceType,
                nodeData.maxAmount
            );
            node.amount = nodeData.amount;
        }

        // 건물
        for (const buildingData of entities.buildings) {
            const faction = FACTIONS[buildingData.factionId.toUpperCase()];
            const building = this.game.createBuilding(
                buildingData.buildingType,
                buildingData.x,
                buildingData.y,
                buildingData.team,
                faction
            );
            building.deserialize(buildingData);
        }

        // 유닛
        for (const unitData of entities.units) {
            const faction = FACTIONS[unitData.factionId.toUpperCase()];
            const unit = this.game.createUnit(
                unitData.unitType,
                unitData.x,
                unitData.y,
                unitData.team,
                faction
            );
            unit.deserialize(unitData);
        }
    }

    /**
     * 저장 삭제
     */
    deleteSave() {
        localStorage.removeItem(this.saveKey);
        this.hasSavedGame = false;
        this.checkSavedGame();
    }

    /**
     * 설정 저장
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
        } catch (e) {
            console.error('설정 저장 실패:', e);
        }
    }

    /**
     * 설정 불러오기
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem(this.settingsKey);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error('설정 로드 실패:', e);
            return null;
        }
    }
}
