/**
 * Star Siege - 통계 및 리더보드 시스템
 * 게임 통계 추적 및 순위 관리
 */

/**
 * 통계 시스템 클래스
 */
export class StatisticsSystem {
    constructor(game) {
        this.game = game;

        // 전체 통계
        this.lifetime = {
            // 게임 플레이
            gamesPlayed: 0,
            gamesWon: 0,
            gamesLost: 0,
            totalPlayTime: 0, // 초

            // 전투
            unitsKilled: 0,
            unitsLost: 0,
            buildingsDestroyed: 0,
            buildingsLost: 0,
            damageDealt: 0,
            damageTaken: 0,

            // 경제
            totalCrystalsGathered: 0,
            totalEnergyProduced: 0,
            totalUnitsProduced: 0,
            totalBuildingsBuilt: 0,

            // 최고 기록
            highestKillStreak: 0,
            longestGame: 0,
            shortestWin: Infinity,
            maxUnitsControlled: 0,
            maxBuildingsOwned: 0,

            // 모드별
            skirmishWins: 0,
            skirmishLosses: 0,
            waveHighScore: 0,
            waveCompleted: 0,
            campaignMissionsCompleted: 0,

            // 팩션별
            factionGames: {
                terra: { played: 0, won: 0 },
                kryon: { played: 0, won: 0 },
                mechanicus: { played: 0, won: 0 }
            },

            // 유닛별 킬 수
            unitKills: {},

            // 날짜
            firstPlayDate: null,
            lastPlayDate: null
        };

        // 현재 게임 통계
        this.current = null;

        // 게임 이력 (최근 50게임)
        this.gameHistory = [];
        this.maxHistorySize = 50;

        // 로컬 리더보드
        this.leaderboards = {
            wave: [],
            skirmish: [],
            campaign: []
        };

        // 데이터 로드
        this.load();
    }

    /**
     * 초기화
     */
    init() {
        if (!this.lifetime.firstPlayDate) {
            this.lifetime.firstPlayDate = new Date().toISOString();
        }
        this.lifetime.lastPlayDate = new Date().toISOString();
        this.save();
    }

    /**
     * 새 게임 시작
     */
    startGame(mode, faction, difficulty = 'normal') {
        this.current = {
            // 게임 정보
            id: Date.now().toString(),
            mode,
            faction,
            difficulty,
            startTime: Date.now(),
            endTime: null,

            // 전투 통계
            unitsKilled: 0,
            unitsLost: 0,
            buildingsDestroyed: 0,
            buildingsLost: 0,
            damageDealt: 0,
            damageTaken: 0,

            // 경제 통계
            crystalsGathered: 0,
            energyProduced: 0,
            unitsProduced: 0,
            buildingsBuilt: 0,

            // 최대치
            maxUnits: 0,
            maxBuildings: 0,
            killStreak: 0,
            currentStreak: 0,

            // 웨이브 모드용
            wavesCleared: 0,
            waveScore: 0,

            // 결과
            result: null // 'victory' | 'defeat'
        };

        console.log(`📊 게임 통계 시작: ${mode} (${faction})`);
    }

    /**
     * 게임 종료
     */
    endGame(result) {
        if (!this.current) return;

        this.current.endTime = Date.now();
        this.current.result = result;

        const duration = (this.current.endTime - this.current.startTime) / 1000;

        // 전체 통계 업데이트
        this.lifetime.gamesPlayed++;
        this.lifetime.totalPlayTime += duration;

        if (result === 'victory') {
            this.lifetime.gamesWon++;

            // 최단 승리 시간
            if (duration < this.lifetime.shortestWin) {
                this.lifetime.shortestWin = duration;
            }
        } else {
            this.lifetime.gamesLost++;
        }

        // 최장 게임
        if (duration > this.lifetime.longestGame) {
            this.lifetime.longestGame = duration;
        }

        // 전투 통계
        this.lifetime.unitsKilled += this.current.unitsKilled;
        this.lifetime.unitsLost += this.current.unitsLost;
        this.lifetime.buildingsDestroyed += this.current.buildingsDestroyed;
        this.lifetime.buildingsLost += this.current.buildingsLost;
        this.lifetime.damageDealt += this.current.damageDealt;
        this.lifetime.damageTaken += this.current.damageTaken;

        // 경제 통계
        this.lifetime.totalCrystalsGathered += this.current.crystalsGathered;
        this.lifetime.totalEnergyProduced += this.current.energyProduced;
        this.lifetime.totalUnitsProduced += this.current.unitsProduced;
        this.lifetime.totalBuildingsBuilt += this.current.buildingsBuilt;

        // 최고 기록
        if (this.current.killStreak > this.lifetime.highestKillStreak) {
            this.lifetime.highestKillStreak = this.current.killStreak;
        }
        if (this.current.maxUnits > this.lifetime.maxUnitsControlled) {
            this.lifetime.maxUnitsControlled = this.current.maxUnits;
        }
        if (this.current.maxBuildings > this.lifetime.maxBuildingsOwned) {
            this.lifetime.maxBuildingsOwned = this.current.maxBuildings;
        }

        // 모드별 통계
        switch (this.current.mode) {
            case 'skirmish':
                if (result === 'victory') {
                    this.lifetime.skirmishWins++;
                } else {
                    this.lifetime.skirmishLosses++;
                }
                this.updateLeaderboard('skirmish', {
                    date: new Date().toISOString(),
                    faction: this.current.faction,
                    duration,
                    kills: this.current.unitsKilled,
                    result
                });
                break;

            case 'wave':
                if (this.current.wavesCleared > this.lifetime.waveHighScore) {
                    this.lifetime.waveHighScore = this.current.wavesCleared;
                }
                if (this.current.wavesCleared >= 10) {
                    this.lifetime.waveCompleted++;
                }
                this.updateLeaderboard('wave', {
                    date: new Date().toISOString(),
                    faction: this.current.faction,
                    waves: this.current.wavesCleared,
                    score: this.current.waveScore,
                    duration
                });
                break;

            case 'campaign':
                if (result === 'victory') {
                    this.lifetime.campaignMissionsCompleted++;
                }
                break;
        }

        // 팩션별 통계
        const factionStats = this.lifetime.factionGames[this.current.faction];
        if (factionStats) {
            factionStats.played++;
            if (result === 'victory') {
                factionStats.won++;
            }
        }

        // 게임 이력 저장
        this.addToHistory(this.current);

        // 마지막 플레이 날짜 업데이트
        this.lifetime.lastPlayDate = new Date().toISOString();

        this.save();

        console.log(`📊 게임 통계 종료: ${result} (${Math.floor(duration)}초)`);

        return this.current;
    }

    /**
     * 유닛 처치 기록
     */
    recordKill(unitType, killedBy = null) {
        if (!this.current) return;

        this.current.unitsKilled++;
        this.current.currentStreak++;

        if (this.current.currentStreak > this.current.killStreak) {
            this.current.killStreak = this.current.currentStreak;
        }

        // 유닛 타입별 킬 수
        if (!this.lifetime.unitKills[unitType]) {
            this.lifetime.unitKills[unitType] = 0;
        }
        this.lifetime.unitKills[unitType]++;
    }

    /**
     * 유닛 손실 기록
     */
    recordUnitLoss(unitType) {
        if (!this.current) return;

        this.current.unitsLost++;
        this.current.currentStreak = 0; // 연속 킬 초기화
    }

    /**
     * 건물 파괴 기록
     */
    recordBuildingDestroyed(buildingType) {
        if (!this.current) return;
        this.current.buildingsDestroyed++;
    }

    /**
     * 건물 손실 기록
     */
    recordBuildingLoss(buildingType) {
        if (!this.current) return;
        this.current.buildingsLost++;
    }

    /**
     * 데미지 기록
     */
    recordDamage(dealt, taken) {
        if (!this.current) return;
        this.current.damageDealt += dealt;
        this.current.damageTaken += taken;
    }

    /**
     * 자원 수집 기록
     */
    recordResourceGathered(type, amount) {
        if (!this.current) return;

        if (type === 'crystal') {
            this.current.crystalsGathered += amount;
        } else if (type === 'energy') {
            this.current.energyProduced += amount;
        }
    }

    /**
     * 유닛 생산 기록
     */
    recordUnitProduced(unitType) {
        if (!this.current) return;
        this.current.unitsProduced++;
    }

    /**
     * 건물 건설 기록
     */
    recordBuildingBuilt(buildingType) {
        if (!this.current) return;
        this.current.buildingsBuilt++;
    }

    /**
     * 현재 보유량 업데이트
     */
    updateCurrentCounts(units, buildings) {
        if (!this.current) return;

        this.current.maxUnits = Math.max(this.current.maxUnits, units);
        this.current.maxBuildings = Math.max(this.current.maxBuildings, buildings);
    }

    /**
     * 웨이브 클리어 기록
     */
    recordWaveCleared(waveNumber, score) {
        if (!this.current) return;
        this.current.wavesCleared = waveNumber;
        this.current.waveScore = score;
    }

    /**
     * 게임 이력에 추가
     */
    addToHistory(gameStats) {
        const summary = {
            id: gameStats.id,
            mode: gameStats.mode,
            faction: gameStats.faction,
            difficulty: gameStats.difficulty,
            result: gameStats.result,
            duration: (gameStats.endTime - gameStats.startTime) / 1000,
            kills: gameStats.unitsKilled,
            losses: gameStats.unitsLost,
            buildingsDestroyed: gameStats.buildingsDestroyed,
            wavesCleared: gameStats.wavesCleared,
            date: new Date().toISOString()
        };

        this.gameHistory.unshift(summary);

        // 최대 크기 유지
        if (this.gameHistory.length > this.maxHistorySize) {
            this.gameHistory = this.gameHistory.slice(0, this.maxHistorySize);
        }
    }

    /**
     * 리더보드 업데이트
     */
    updateLeaderboard(type, entry) {
        if (!this.leaderboards[type]) return;

        this.leaderboards[type].push(entry);

        // 정렬
        switch (type) {
            case 'wave':
                this.leaderboards[type].sort((a, b) => {
                    if (b.waves !== a.waves) return b.waves - a.waves;
                    return b.score - a.score;
                });
                break;

            case 'skirmish':
                this.leaderboards[type].sort((a, b) => {
                    if (b.kills !== a.kills) return b.kills - a.kills;
                    return a.duration - b.duration; // 짧은 시간 우선
                });
                break;

            case 'campaign':
                this.leaderboards[type].sort((a, b) => a.duration - b.duration);
                break;
        }

        // 상위 10개만 유지
        this.leaderboards[type] = this.leaderboards[type].slice(0, 10);
    }

    /**
     * 승률 계산
     */
    getWinRate(mode = null) {
        let wins, total;

        if (mode === 'skirmish') {
            wins = this.lifetime.skirmishWins;
            total = this.lifetime.skirmishWins + this.lifetime.skirmishLosses;
        } else {
            wins = this.lifetime.gamesWon;
            total = this.lifetime.gamesPlayed;
        }

        if (total === 0) return 0;
        return Math.round((wins / total) * 100);
    }

    /**
     * K/D 비율 계산
     */
    getKDRatio() {
        if (this.lifetime.unitsLost === 0) {
            return this.lifetime.unitsKilled;
        }
        return (this.lifetime.unitsKilled / this.lifetime.unitsLost).toFixed(2);
    }

    /**
     * 팩션별 승률
     */
    getFactionWinRate(faction) {
        const stats = this.lifetime.factionGames[faction];
        if (!stats || stats.played === 0) return 0;
        return Math.round((stats.won / stats.played) * 100);
    }

    /**
     * 가장 많이 사용한 팩션
     */
    getMostPlayedFaction() {
        let maxPlayed = 0;
        let mostPlayed = null;

        for (const [faction, stats] of Object.entries(this.lifetime.factionGames)) {
            if (stats.played > maxPlayed) {
                maxPlayed = stats.played;
                mostPlayed = faction;
            }
        }

        return mostPlayed;
    }

    /**
     * 가장 많이 처치한 유닛
     */
    getMostKilledUnit() {
        let maxKills = 0;
        let mostKilled = null;

        for (const [unitType, kills] of Object.entries(this.lifetime.unitKills)) {
            if (kills > maxKills) {
                maxKills = kills;
                mostKilled = unitType;
            }
        }

        return { unitType: mostKilled, kills: maxKills };
    }

    /**
     * 플레이 시간 포맷팅
     */
    formatPlayTime(seconds = this.lifetime.totalPlayTime) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}시간 ${minutes}분`;
        }
        return `${minutes}분`;
    }

    /**
     * 게임 요약 통계
     */
    getSummary() {
        return {
            gamesPlayed: this.lifetime.gamesPlayed,
            gamesWon: this.lifetime.gamesWon,
            winRate: this.getWinRate(),
            playTime: this.formatPlayTime(),
            unitsKilled: this.lifetime.unitsKilled,
            kdRatio: this.getKDRatio(),
            waveHighScore: this.lifetime.waveHighScore,
            campaignMissionsCompleted: this.lifetime.campaignMissionsCompleted,
            mostPlayedFaction: this.getMostPlayedFaction(),
            mostKilledUnit: this.getMostKilledUnit()
        };
    }

    /**
     * 상세 통계
     */
    getDetailedStats() {
        return {
            lifetime: this.lifetime,
            current: this.current,
            gameHistory: this.gameHistory,
            leaderboards: this.leaderboards
        };
    }

    /**
     * 최근 게임 이력
     */
    getRecentGames(count = 10) {
        return this.gameHistory.slice(0, count);
    }

    /**
     * 리더보드 조회
     */
    getLeaderboard(type) {
        return this.leaderboards[type] || [];
    }

    /**
     * 저장
     */
    save() {
        const data = {
            lifetime: this.lifetime,
            gameHistory: this.gameHistory,
            leaderboards: this.leaderboards
        };

        try {
            localStorage.setItem('starsiege_statistics', JSON.stringify(data));
        } catch (e) {
            console.error('통계 데이터 저장 실패:', e);
        }
    }

    /**
     * 로드
     */
    load() {
        try {
            const saved = localStorage.getItem('starsiege_statistics');
            if (!saved) return;

            const data = JSON.parse(saved);

            if (data.lifetime) {
                this.lifetime = { ...this.lifetime, ...data.lifetime };
            }
            if (data.gameHistory) {
                this.gameHistory = data.gameHistory;
            }
            if (data.leaderboards) {
                this.leaderboards = { ...this.leaderboards, ...data.leaderboards };
            }

            console.log(`📊 통계 데이터 로드: ${this.lifetime.gamesPlayed} 게임`);

        } catch (e) {
            console.error('통계 데이터 로드 실패:', e);
        }
    }

    /**
     * 데이터 내보내기
     */
    serialize() {
        return {
            lifetime: this.lifetime,
            gameHistory: this.gameHistory,
            leaderboards: this.leaderboards
        };
    }

    /**
     * 데이터 가져오기
     */
    deserialize(data) {
        if (!data) return;

        if (data.lifetime) {
            this.lifetime = { ...this.lifetime, ...data.lifetime };
        }
        if (data.gameHistory) {
            this.gameHistory = data.gameHistory;
        }
        if (data.leaderboards) {
            this.leaderboards = { ...this.leaderboards, ...data.leaderboards };
        }

        this.save();
    }

    /**
     * 리셋 (디버그용)
     */
    reset() {
        localStorage.removeItem('starsiege_statistics');

        this.lifetime = {
            gamesPlayed: 0,
            gamesWon: 0,
            gamesLost: 0,
            totalPlayTime: 0,
            unitsKilled: 0,
            unitsLost: 0,
            buildingsDestroyed: 0,
            buildingsLost: 0,
            damageDealt: 0,
            damageTaken: 0,
            totalCrystalsGathered: 0,
            totalEnergyProduced: 0,
            totalUnitsProduced: 0,
            totalBuildingsBuilt: 0,
            highestKillStreak: 0,
            longestGame: 0,
            shortestWin: Infinity,
            maxUnitsControlled: 0,
            maxBuildingsOwned: 0,
            skirmishWins: 0,
            skirmishLosses: 0,
            waveHighScore: 0,
            waveCompleted: 0,
            campaignMissionsCompleted: 0,
            factionGames: {
                terra: { played: 0, won: 0 },
                kryon: { played: 0, won: 0 },
                mechanicus: { played: 0, won: 0 }
            },
            unitKills: {},
            firstPlayDate: null,
            lastPlayDate: null
        };

        this.current = null;
        this.gameHistory = [];
        this.leaderboards = { wave: [], skirmish: [], campaign: [] };
    }
}
