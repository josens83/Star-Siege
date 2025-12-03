/**
 * MissionData - 미션/캠페인 데이터
 */

export const MISSION_DATA = {
    tutorial: {
        id: 'tutorial',
        name: '튜토리얼',
        description: '기본 조작법을 배웁니다.',
        faction: 'terra',
        objectives: [
            {
                id: 'move_camera',
                type: 'action',
                description: '카메라를 이동해보세요',
                completed: false
            },
            {
                id: 'select_unit',
                type: 'action',
                description: '유닛을 선택해보세요',
                completed: false
            },
            {
                id: 'move_unit',
                type: 'action',
                description: '유닛을 이동시켜보세요',
                completed: false
            },
            {
                id: 'gather_resource',
                type: 'action',
                description: '자원을 수집해보세요',
                completed: false
            },
            {
                id: 'build_collector',
                type: 'build',
                buildingType: 'collector',
                description: '수집기를 건설해보세요',
                completed: false
            },
            {
                id: 'train_unit',
                type: 'train',
                unitType: 'marine',
                description: '해병을 생산해보세요',
                completed: false
            }
        ]
    },

    campaign: [
        {
            id: 'mission_1',
            name: '첫 번째 접촉',
            description: '적의 정찰대를 격퇴하세요.',
            faction: 'terra',
            difficulty: 'easy',
            startResources: { crystal: 200, energy: 100 },
            objectives: [
                {
                    id: 'survive',
                    type: 'survive',
                    time: 180,
                    description: '3분간 생존하세요',
                    completed: false,
                    primary: true
                },
                {
                    id: 'destroy_scouts',
                    type: 'destroy',
                    targetCount: 5,
                    currentCount: 0,
                    description: '적 정찰대 5기 격파',
                    completed: false,
                    primary: true
                },
                {
                    id: 'build_barracks',
                    type: 'build',
                    buildingType: 'barracks',
                    description: '병영 건설 (보너스)',
                    completed: false,
                    primary: false
                }
            ],
            waves: [
                { time: 30, units: [{ type: 'scout', count: 2 }] },
                { time: 90, units: [{ type: 'scout', count: 3 }] },
                { time: 150, units: [{ type: 'marine', count: 4 }] }
            ]
        },
        {
            id: 'mission_2',
            name: '기지 확장',
            description: '새로운 자원 지역을 확보하세요.',
            faction: 'terra',
            difficulty: 'normal',
            startResources: { crystal: 150, energy: 50 },
            objectives: [
                {
                    id: 'build_collectors',
                    type: 'build_count',
                    buildingType: 'collector',
                    targetCount: 3,
                    currentCount: 0,
                    description: '수집기 3개 건설',
                    completed: false,
                    primary: true
                },
                {
                    id: 'train_army',
                    type: 'train_count',
                    targetCount: 10,
                    currentCount: 0,
                    description: '전투 유닛 10기 생산',
                    completed: false,
                    primary: true
                },
                {
                    id: 'destroy_enemy_base',
                    type: 'destroy_building',
                    buildingType: 'command',
                    description: '적 사령부 파괴',
                    completed: false,
                    primary: true
                }
            ]
        },
        {
            id: 'mission_3',
            name: '최후의 결전',
            description: '적의 본거지를 함락하세요.',
            faction: 'terra',
            difficulty: 'hard',
            startResources: { crystal: 300, energy: 150 },
            objectives: [
                {
                    id: 'protect_base',
                    type: 'protect',
                    targetType: 'command_center',
                    description: '사령부를 보호하세요',
                    completed: false,
                    primary: true,
                    failOnDestroy: true
                },
                {
                    id: 'destroy_all_enemies',
                    type: 'destroy_all',
                    description: '모든 적 건물과 유닛 파괴',
                    completed: false,
                    primary: true
                }
            ]
        }
    ]
};

// 웨이브 모드 설정
export const WAVE_CONFIG = {
    totalWaves: 10,
    waveInterval: 60, // 초
    bossWaves: [5, 10],
    baseEnemies: 5,
    enemiesPerWave: 3,
    waveReward: { crystal: 50, energy: 25 },
    bossReward: { crystal: 150, energy: 75 },

    // 웨이브별 적 구성
    waves: [
        // 웨이브 1
        {
            units: [{ type: 'marine', count: 3 }],
            faction: 'terra'
        },
        // 웨이브 2
        {
            units: [
                { type: 'marine', count: 4 },
                { type: 'scout', count: 1 }
            ],
            faction: 'terra'
        },
        // 웨이브 3
        {
            units: [
                { type: 'marine', count: 5 },
                { type: 'scout', count: 2 }
            ],
            faction: 'terra'
        },
        // 웨이브 4
        {
            units: [
                { type: 'zealot', count: 3 },
                { type: 'ranger', count: 2 }
            ],
            faction: 'kryon'
        },
        // 웨이브 5 (보스)
        {
            units: [
                { type: 'zealot', count: 4 },
                { type: 'stalker', count: 3 },
                { type: 'ranger', count: 2 }
            ],
            faction: 'kryon',
            isBoss: true
        },
        // 웨이브 6
        {
            units: [
                { type: 'sentinel', count: 4 },
                { type: 'flak', count: 2 }
            ],
            faction: 'mechanicus'
        },
        // 웨이브 7
        {
            units: [
                { type: 'sentinel', count: 5 },
                { type: 'flak', count: 3 }
            ],
            faction: 'mechanicus'
        },
        // 웨이브 8
        {
            units: [
                { type: 'marine', count: 6 },
                { type: 'tank', count: 2 }
            ],
            faction: 'terra'
        },
        // 웨이브 9
        {
            units: [
                { type: 'zealot', count: 5 },
                { type: 'stalker', count: 4 },
                { type: 'crusher', count: 1 }
            ],
            faction: 'kryon'
        },
        // 웨이브 10 (최종 보스)
        {
            units: [
                { type: 'tank', count: 3 },
                { type: 'crusher', count: 2 },
                { type: 'stalker', count: 4 },
                { type: 'marine', count: 8 }
            ],
            faction: 'terra',
            isBoss: true
        }
    ]
};
