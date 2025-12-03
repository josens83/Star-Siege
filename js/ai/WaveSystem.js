/**
 * WaveSystem - 웨이브 모드 시스템
 */

import { WAVE, FACTIONS, EVENTS } from '../utils/Constants.js';
import { Vector2 } from '../utils/Vector2.js';
import { WAVE_CONFIG } from '../data/MissionData.js';
import { UNIT_CONFIGS } from '../data/UnitConfigs.js';

export class WaveSystem {
    constructor(game) {
        this.game = game;

        // 웨이브 상태
        this.currentWave = 0;
        this.totalWaves = WAVE_CONFIG.totalWaves;
        this.isWaveActive = false;

        // 타이머
        this.waveTimer = 0;
        this.waveInterval = WAVE_CONFIG.waveInterval * 1000; // 밀리초
        this.preparationTime = 10000; // 10초 준비 시간

        // 적 유닛 관리
        this.waveEnemies = [];
        this.spawningQueue = [];

        // 스폰 위치 (맵 가장자리)
        this.spawnPoints = this.generateSpawnPoints();

        // UI 업데이트
        this.updateUI();
    }

    /**
     * 스폰 위치 생성
     */
    generateSpawnPoints() {
        const { MAP_WIDTH, MAP_HEIGHT } = this.game.constructor.GAME || { MAP_WIDTH: 3200, MAP_HEIGHT: 2400 };
        const margin = 100;

        return [
            // 상단
            new Vector2(MAP_WIDTH / 2, margin),
            // 우측
            new Vector2(MAP_WIDTH - margin, MAP_HEIGHT / 2),
            // 하단
            new Vector2(MAP_WIDTH / 2, MAP_HEIGHT - margin),
            // 우상단
            new Vector2(MAP_WIDTH - margin, margin),
            // 우하단
            new Vector2(MAP_WIDTH - margin, MAP_HEIGHT - margin)
        ];
    }

    /**
     * 업데이트
     */
    update(deltaTime) {
        if (this.currentWave >= this.totalWaves && this.waveEnemies.length === 0) {
            // 모든 웨이브 클리어
            this.victory();
            return;
        }

        if (this.isWaveActive) {
            this.updateActiveWave(deltaTime);
        } else {
            this.updateWaveTimer(deltaTime);
        }

        // 스폰 큐 처리
        this.processSpawnQueue(deltaTime);

        // UI 업데이트
        this.updateUI();
    }

    /**
     * 웨이브 타이머 업데이트
     */
    updateWaveTimer(deltaTime) {
        this.waveTimer += deltaTime;

        if (this.waveTimer >= this.waveInterval) {
            this.startNextWave();
        }
    }

    /**
     * 활성 웨이브 업데이트
     */
    updateActiveWave(deltaTime) {
        // 죽은 적 제거
        this.waveEnemies = this.waveEnemies.filter(e => e.isAlive);

        // 모든 적 처치됨
        if (this.waveEnemies.length === 0 && this.spawningQueue.length === 0) {
            this.completeWave();
        }
    }

    /**
     * 다음 웨이브 시작
     */
    startNextWave() {
        this.currentWave++;
        this.isWaveActive = true;
        this.waveTimer = 0;

        const waveConfig = WAVE_CONFIG.waves[this.currentWave - 1];
        if (!waveConfig) return;

        // 보스 웨이브 알림
        if (waveConfig.isBoss) {
            this.game.showToast(`⚠️ 보스 웨이브 ${this.currentWave}!`, 'warning');
            this.game.audioManager.playSound('bossWave');
        } else {
            this.game.showToast(`웨이브 ${this.currentWave} 시작!`, 'info');
            this.game.audioManager.playSound('waveStart');
        }

        // 적 스폰 큐 생성
        this.createSpawnQueue(waveConfig);

        // 이벤트
        this.game.emit(EVENTS.WAVE_START, { wave: this.currentWave, isBoss: waveConfig.isBoss });
    }

    /**
     * 스폰 큐 생성
     */
    createSpawnQueue(waveConfig) {
        const faction = FACTIONS[waveConfig.faction.toUpperCase()];

        for (const unitInfo of waveConfig.units) {
            const unitConfig = UNIT_CONFIGS[waveConfig.faction]?.[unitInfo.type];
            if (!unitConfig) continue;

            for (let i = 0; i < unitInfo.count; i++) {
                this.spawningQueue.push({
                    type: unitInfo.type,
                    faction: faction,
                    config: unitConfig,
                    delay: i * 500 // 0.5초 간격으로 스폰
                });
            }
        }
    }

    /**
     * 스폰 큐 처리
     */
    processSpawnQueue(deltaTime) {
        if (this.spawningQueue.length === 0) return;

        // 첫 번째 스폰 딜레이 감소
        this.spawningQueue[0].delay -= deltaTime;

        while (this.spawningQueue.length > 0 && this.spawningQueue[0].delay <= 0) {
            const spawn = this.spawningQueue.shift();
            this.spawnEnemy(spawn);
        }
    }

    /**
     * 적 스폰
     */
    spawnEnemy(spawn) {
        // 랜덤 스폰 위치
        const spawnPoint = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];

        // 약간의 랜덤 오프셋
        const x = spawnPoint.x + (Math.random() - 0.5) * 100;
        const y = spawnPoint.y + (Math.random() - 0.5) * 100;

        // 적 유닛 생성
        const enemy = this.game.createUnit(
            spawn.type,
            x,
            y,
            this.game.enemyTeam,
            spawn.faction
        );

        if (enemy) {
            this.waveEnemies.push(enemy);

            // 플레이어 기지로 공격 이동
            const playerCommand = this.game.getBuildingsByTeam(this.game.playerTeam, 'command')[0];
            if (playerCommand) {
                enemy.attackMove(playerCommand.position.x, playerCommand.position.y);
            }
        }
    }

    /**
     * 웨이브 완료
     */
    completeWave() {
        this.isWaveActive = false;
        this.waveTimer = 0;

        const waveConfig = WAVE_CONFIG.waves[this.currentWave - 1];
        const reward = waveConfig?.isBoss ? WAVE_CONFIG.bossReward : WAVE_CONFIG.waveReward;

        // 보상 지급
        this.game.resourceSystem.addCrystal(this.game.playerTeam, reward.crystal);
        this.game.resourceSystem.addEnergy(this.game.playerTeam, reward.energy);

        this.game.showToast(
            `웨이브 ${this.currentWave} 클리어! +💎${reward.crystal} +⚡${reward.energy}`,
            'success'
        );

        // 이벤트
        this.game.emit(EVENTS.WAVE_COMPLETE, { wave: this.currentWave });

        // 마지막 웨이브면 승리
        if (this.currentWave >= this.totalWaves) {
            setTimeout(() => this.victory(), 2000);
        }
    }

    /**
     * 승리
     */
    victory() {
        this.game.gameOver(true);
    }

    /**
     * UI 업데이트
     */
    updateUI() {
        const waveIndicator = document.getElementById('wave-indicator');
        const waveNumber = document.getElementById('wave-number');
        const waveTimerEl = document.getElementById('wave-timer');

        if (!waveIndicator) return;

        waveIndicator.classList.remove('hidden');

        if (waveNumber) {
            waveNumber.textContent = `웨이브 ${this.currentWave}/${this.totalWaves}`;
        }

        if (waveTimerEl) {
            if (this.isWaveActive) {
                waveTimerEl.textContent = `적: ${this.waveEnemies.length + this.spawningQueue.length}`;
            } else {
                const remaining = Math.ceil((this.waveInterval - this.waveTimer) / 1000);
                waveTimerEl.textContent = `다음 웨이브: ${remaining}초`;
            }
        }
    }

    /**
     * 직렬화
     */
    serialize() {
        return {
            currentWave: this.currentWave,
            waveTimer: this.waveTimer,
            isWaveActive: this.isWaveActive
        };
    }

    /**
     * 역직렬화
     */
    deserialize(data) {
        this.currentWave = data.currentWave;
        this.waveTimer = data.waveTimer;
        this.isWaveActive = data.isWaveActive;
    }
}
