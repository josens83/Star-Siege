/**
 * MissionSystem - 미션/캠페인 시스템
 */

import { EVENTS } from '../utils/Constants.js';
import { MISSION_DATA } from '../data/MissionData.js';

export class MissionSystem {
    constructor(game) {
        this.game = game;

        // 현재 미션
        this.currentMission = null;
        this.objectives = [];

        // 미션 상태
        this.isActive = false;
        this.missionTime = 0;

        // 이벤트 리스너 등록
        this.setupEventListeners();
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        this.game.on(EVENTS.BUILD_COMPLETE, (data) => this.onBuildComplete(data));
        this.game.on(EVENTS.PRODUCTION_COMPLETE, (data) => this.onUnitComplete(data));
        this.game.on(EVENTS.UNIT_KILLED, (data) => this.onUnitKilled(data));
        this.game.on(EVENTS.BUILDING_DESTROYED, (data) => this.onBuildingDestroyed(data));
    }

    /**
     * 미션 로드
     */
    loadMission(missionId) {
        const mission = MISSION_DATA.campaign?.find(m => m.id === missionId);
        if (!mission) {
            console.error(`미션을 찾을 수 없음: ${missionId}`);
            return false;
        }

        this.currentMission = mission;
        this.objectives = mission.objectives.map(obj => ({
            ...obj,
            completed: false,
            currentCount: obj.currentCount || 0
        }));

        this.isActive = true;
        this.missionTime = 0;

        // 시작 자원 설정
        if (mission.startResources) {
            this.game.resourceSystem.setResources(
                this.game.playerTeam,
                mission.startResources.crystal,
                mission.startResources.energy
            );
        }

        // 목표 패널 업데이트
        this.updateObjectivePanel();

        this.game.showToast(`미션: ${mission.name}`, 'info');

        return true;
    }

    /**
     * 업데이트
     */
    update(deltaTime) {
        if (!this.isActive) return;

        this.missionTime += deltaTime;

        // 시간 기반 목표 체크
        for (const objective of this.objectives) {
            if (objective.completed) continue;

            if (objective.type === 'survive') {
                const targetTime = objective.time * 1000;
                if (this.missionTime >= targetTime) {
                    this.completeObjective(objective);
                }
            }
        }

        // 패배 조건 체크
        this.checkFailConditions();

        // 승리 조건 체크
        this.checkWinConditions();
    }

    /**
     * 건설 완료 이벤트
     */
    onBuildComplete(data) {
        if (!this.isActive) return;

        const { building } = data;
        if (building.team !== this.game.playerTeam) return;

        for (const objective of this.objectives) {
            if (objective.completed) continue;

            if (objective.type === 'build' && objective.buildingType === building.buildingType) {
                this.completeObjective(objective);
            } else if (objective.type === 'build_count' && objective.buildingType === building.buildingType) {
                objective.currentCount++;
                if (objective.currentCount >= objective.targetCount) {
                    this.completeObjective(objective);
                }
            }
        }

        this.updateObjectivePanel();
    }

    /**
     * 유닛 생산 완료 이벤트
     */
    onUnitComplete(data) {
        if (!this.isActive) return;

        const { unit } = data;
        if (unit?.team !== this.game.playerTeam) return;

        for (const objective of this.objectives) {
            if (objective.completed) continue;

            if (objective.type === 'train' && objective.unitType === unit.unitType) {
                this.completeObjective(objective);
            } else if (objective.type === 'train_count') {
                objective.currentCount++;
                if (objective.currentCount >= objective.targetCount) {
                    this.completeObjective(objective);
                }
            }
        }

        this.updateObjectivePanel();
    }

    /**
     * 유닛 사망 이벤트
     */
    onUnitKilled(data) {
        if (!this.isActive) return;

        const { unit, killer } = data;

        // 적 유닛 처치
        if (unit.team !== this.game.playerTeam && killer?.team === this.game.playerTeam) {
            for (const objective of this.objectives) {
                if (objective.completed) continue;

                if (objective.type === 'destroy') {
                    objective.currentCount = (objective.currentCount || 0) + 1;
                    if (objective.currentCount >= objective.targetCount) {
                        this.completeObjective(objective);
                    }
                }
            }
        }

        this.updateObjectivePanel();
    }

    /**
     * 건물 파괴 이벤트
     */
    onBuildingDestroyed(data) {
        if (!this.isActive) return;

        const { building, killer } = data;

        // 적 건물 파괴
        if (building.team !== this.game.playerTeam && killer?.team === this.game.playerTeam) {
            for (const objective of this.objectives) {
                if (objective.completed) continue;

                if (objective.type === 'destroy_building') {
                    if (!objective.buildingType || building.config?.type === objective.buildingType) {
                        this.completeObjective(objective);
                    }
                } else if (objective.type === 'destroy_all') {
                    // 모든 적 체크
                    const remainingEnemies = this.game.entities.filter(
                        e => e.team !== this.game.playerTeam && e.isAlive
                    );
                    if (remainingEnemies.length === 0) {
                        this.completeObjective(objective);
                    }
                }
            }
        }

        // 플레이어 건물 파괴 (패배 조건)
        if (building.team === this.game.playerTeam) {
            for (const objective of this.objectives) {
                if (objective.type === 'protect' && objective.failOnDestroy) {
                    if (building.config?.type === objective.targetType ||
                        building.buildingType === objective.targetType) {
                        this.failMission();
                        return;
                    }
                }
            }
        }

        this.updateObjectivePanel();
    }

    /**
     * 목표 완료
     */
    completeObjective(objective) {
        objective.completed = true;
        this.game.showToast(`✓ 목표 완료: ${objective.description}`, 'success');
        this.game.audioManager.playSound('objectiveComplete');
        this.updateObjectivePanel();
    }

    /**
     * 패배 조건 체크
     */
    checkFailConditions() {
        // 사령부 파괴
        const playerCommands = this.game.getBuildingsByTeam(this.game.playerTeam, 'command');
        if (playerCommands.length === 0) {
            this.failMission();
        }
    }

    /**
     * 승리 조건 체크
     */
    checkWinConditions() {
        // 모든 주요 목표 완료 체크
        const primaryObjectives = this.objectives.filter(o => o.primary !== false);
        const allCompleted = primaryObjectives.every(o => o.completed);

        if (allCompleted) {
            this.completeMission();
        }
    }

    /**
     * 미션 완료
     */
    completeMission() {
        this.isActive = false;
        this.game.showToast('🎉 미션 완료!', 'success');
        setTimeout(() => this.game.gameOver(true), 2000);
    }

    /**
     * 미션 실패
     */
    failMission() {
        this.isActive = false;
        this.game.showToast('💀 미션 실패...', 'error');
        setTimeout(() => this.game.gameOver(false), 2000);
    }

    /**
     * 목표 패널 업데이트
     */
    updateObjectivePanel() {
        const panel = document.getElementById('objective-panel');
        const list = document.getElementById('objective-list');

        if (!panel || !list) return;

        panel.classList.remove('hidden');
        list.innerHTML = '';

        for (const objective of this.objectives) {
            const item = document.createElement('div');
            item.className = 'objective-item' + (objective.completed ? ' completed' : '');

            let text = objective.description;

            // 진행 상황 표시
            if (objective.targetCount && !objective.completed) {
                text += ` (${objective.currentCount || 0}/${objective.targetCount})`;
            }

            // 시간 기반 목표
            if (objective.type === 'survive' && !objective.completed) {
                const remaining = Math.max(0, objective.time - Math.floor(this.missionTime / 1000));
                text += ` (${remaining}초)`;
            }

            item.textContent = text;
            list.appendChild(item);
        }
    }
}
