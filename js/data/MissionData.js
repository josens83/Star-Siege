/**
 * Star Siege - 미션/캠페인 데이터
 * 풍부한 스토리라인과 다양한 미션 구성
 */

/**
 * 스토리 배경
 */
export const STORY_BACKGROUND = {
    intro: `
        2487년, 인류는 은하계 외곽에서 새로운 행성계 "노바 섹터"를 발견했다.
        풍부한 크리스탈 자원이 매장된 이 곳은 곧 세 세력의 격전지가 되었다.

        테라 연합(Terra Union) - 지구 연방의 후예, 균형 잡힌 군사력
        크라이온(Kryon) - 고대 외계 종족, 쉴드와 사이오닉 기술
        메카니쿠스(Mechanicus) - AI 기계 집합체, 강력하지만 느린 유닛

        당신은 테라 연합의 신임 사령관. 노바 섹터에서의 생존과 승리가 당신의 임무다.
    `,

    factions: {
        terra: {
            name: '테라 연합',
            description: '지구 연방의 후예로, 균형 잡힌 군사력을 보유',
            motto: '"연합을 위하여, 인류를 위하여"',
            color: '#4a90d9'
        },
        kryon: {
            name: '크라이온',
            description: '고대 외계 종족으로, 쉴드와 사이오닉 기술에 능함',
            motto: '"영원한 빛이 우리를 인도한다"',
            color: '#9b59b6'
        },
        mechanicus: {
            name: '메카니쿠스',
            description: 'AI 기계 집합체로, 강력하지만 느린 중장갑 유닛 특화',
            motto: '"로직이 곧 진리"',
            color: '#e67e22'
        }
    }
};

/**
 * 튜토리얼 미션
 */
export const TUTORIAL_MISSION = {
    id: 'tutorial',
    name: '훈련 프로그램',
    description: '기본 조작법을 배웁니다.',
    faction: 'terra',

    briefing: `
        사령관님, 환영합니다.
        노바 섹터에 배치되기 전에 기본 훈련을 완료해야 합니다.
        시뮬레이터에서 기지 운영의 기본을 익히세요.
    `,

    objectives: [
        {
            id: 'move_camera',
            type: 'action',
            description: '카메라를 이동해보세요 (드래그 또는 화살표키)',
            hint: '화면을 드래그하거나 가장자리로 이동하세요',
            completed: false
        },
        {
            id: 'select_unit',
            type: 'action',
            description: '유닛을 선택해보세요 (탭 또는 클릭)',
            hint: '유닛을 탭하면 선택됩니다',
            completed: false
        },
        {
            id: 'move_unit',
            type: 'action',
            description: '유닛을 이동시켜보세요',
            hint: '유닛 선택 후 이동할 위치를 탭하세요',
            completed: false
        },
        {
            id: 'gather_resource',
            type: 'action',
            description: '자원을 수집해보세요',
            hint: '일꾼 유닛으로 크리스탈 노드를 탭하세요',
            completed: false
        },
        {
            id: 'build_collector',
            type: 'build',
            buildingType: 'collector',
            description: '수집기를 건설해보세요',
            hint: '건설 메뉴에서 수집기를 선택하세요',
            completed: false
        },
        {
            id: 'train_unit',
            type: 'train',
            unitType: 'marine',
            description: '해병을 생산해보세요',
            hint: '병영을 선택하고 해병 생산 버튼을 누르세요',
            completed: false
        }
    ],

    rewards: {
        coins: 200,
        gems: 10,
        experience: 50
    }
};

/**
 * 테라 연합 캠페인
 */
export const TERRA_CAMPAIGN = [
    // 챕터 1: 도착
    {
        id: 'terra_1_1',
        chapter: 1,
        name: '첫 번째 접촉',
        description: '노바 섹터에 도착한 후, 적의 정찰대를 격퇴하세요.',
        faction: 'terra',
        enemyFaction: 'kryon',
        difficulty: 'easy',

        briefing: `
            사령관님, 노바 섹터에 도착하셨습니다.
            하지만 크라이온 정찰대가 이미 이 지역을 탐색 중입니다.
            기지를 방어하고 정찰대를 격퇴하세요.
        `,

        debriefing: {
            victory: '훌륭합니다! 첫 전투에서 승리했습니다. 하지만 이것은 시작에 불과합니다.',
            defeat: '기지가 함락되었습니다. 다시 시도하세요.'
        },

        startResources: { crystal: 200, energy: 100 },
        startUnits: [
            { type: 'worker', count: 3 },
            { type: 'marine', count: 2 }
        ],

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
                type: 'destroy_count',
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
            { time: 30, units: [{ type: 'ranger', count: 2 }] },
            { time: 90, units: [{ type: 'ranger', count: 3 }] },
            { time: 150, units: [{ type: 'zealot', count: 2 }, { type: 'ranger', count: 2 }] }
        ],

        rewards: {
            coins: 150,
            gems: 5,
            experience: 100
        }
    },

    {
        id: 'terra_1_2',
        chapter: 1,
        name: '교두보 확보',
        description: '새로운 자원 지역을 확보하고 기지를 확장하세요.',
        faction: 'terra',
        enemyFaction: 'kryon',
        difficulty: 'easy',

        briefing: `
            정찰대를 격퇴했지만, 더 많은 자원이 필요합니다.
            근처 크리스탈 광맥을 확보하고 기지를 확장하세요.
            적의 반격에 대비하세요.
        `,

        startResources: { crystal: 150, energy: 50 },
        startUnits: [
            { type: 'worker', count: 4 },
            { type: 'marine', count: 3 }
        ],

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
                id: 'gather_crystals',
                type: 'gather',
                resourceType: 'crystal',
                targetAmount: 500,
                currentAmount: 0,
                description: '크리스탈 500 수집',
                completed: false,
                primary: true
            },
            {
                id: 'no_building_loss',
                type: 'protect_all',
                targetType: 'building',
                description: '건물 손실 없이 완료 (보너스)',
                completed: false,
                primary: false
            }
        ],

        waves: [
            { time: 60, units: [{ type: 'ranger', count: 3 }] },
            { time: 120, units: [{ type: 'zealot', count: 2 }] },
            { time: 200, units: [{ type: 'zealot', count: 3 }, { type: 'ranger', count: 2 }] }
        ],

        rewards: {
            coins: 200,
            gems: 5,
            experience: 120
        }
    },

    {
        id: 'terra_1_3',
        chapter: 1,
        name: '반격',
        description: '적 전초기지를 공격하여 이 지역의 위협을 제거하세요.',
        faction: 'terra',
        enemyFaction: 'kryon',
        difficulty: 'normal',

        briefing: `
            정보부가 근처 크라이온 전초기지 위치를 파악했습니다.
            지속적인 공격을 막으려면 이 기지를 파괴해야 합니다.
            충분한 병력을 모아 공격하세요.
        `,

        startResources: { crystal: 300, energy: 150 },
        startUnits: [
            { type: 'worker', count: 5 },
            { type: 'marine', count: 4 }
        ],

        objectives: [
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
            },
            {
                id: 'fast_victory',
                type: 'time_limit',
                timeLimit: 480,
                description: '8분 내 완료 (보너스)',
                completed: false,
                primary: false
            }
        ],

        enemyBase: {
            buildings: [
                { type: 'command', x: 1600, y: 400 },
                { type: 'barracks', x: 1500, y: 500 },
                { type: 'turret', x: 1400, y: 350 },
                { type: 'turret', x: 1400, y: 550 }
            ],
            units: [
                { type: 'zealot', count: 4 },
                { type: 'ranger', count: 3 }
            ]
        },

        rewards: {
            coins: 300,
            gems: 10,
            experience: 150
        }
    },

    // 챕터 2: 확전
    {
        id: 'terra_2_1',
        chapter: 2,
        name: '새로운 위협',
        description: '메카니쿠스의 정찰 드론이 발견되었습니다.',
        faction: 'terra',
        enemyFaction: 'mechanicus',
        difficulty: 'normal',

        briefing: `
            사령관님, 크라이온만이 문제가 아닙니다.
            메카니쿠스 정찰 드론이 우리 기지 근처에서 발견되었습니다.
            그들의 의도를 파악하기 전에 드론들을 파괴하세요.
        `,

        startResources: { crystal: 250, energy: 100 },
        startUnits: [
            { type: 'worker', count: 4 },
            { type: 'marine', count: 5 }
        ],

        objectives: [
            {
                id: 'destroy_drones',
                type: 'destroy_count',
                targetCount: 8,
                currentCount: 0,
                description: '정찰 드론 8기 파괴',
                completed: false,
                primary: true
            },
            {
                id: 'protect_base',
                type: 'protect',
                targetType: 'command_center',
                description: '사령부를 보호하세요',
                completed: false,
                primary: true,
                failOnDestroy: true
            }
        ],

        waves: [
            { time: 20, units: [{ type: 'sentinel', count: 2 }] },
            { time: 60, units: [{ type: 'sentinel', count: 3 }] },
            { time: 100, units: [{ type: 'sentinel', count: 3 }, { type: 'flak', count: 1 }] },
            { time: 150, units: [{ type: 'sentinel', count: 4 }, { type: 'flak', count: 2 }] }
        ],

        rewards: {
            coins: 250,
            gems: 10,
            experience: 150
        }
    },

    {
        id: 'terra_2_2',
        chapter: 2,
        name: '양면 전쟁',
        description: '크라이온과 메카니쿠스 모두 공격해 옵니다.',
        faction: 'terra',
        enemyFaction: 'mixed',
        difficulty: 'normal',

        briefing: `
            상황이 복잡해졌습니다.
            크라이온과 메카니쿠스 모두 우리 영역을 노리고 있습니다.
            두 세력의 공격을 모두 막아내야 합니다.
        `,

        startResources: { crystal: 350, energy: 150 },
        startUnits: [
            { type: 'worker', count: 5 },
            { type: 'marine', count: 6 },
            { type: 'medic', count: 1 }
        ],

        objectives: [
            {
                id: 'survive_waves',
                type: 'survive_waves',
                waveCount: 6,
                currentWave: 0,
                description: '6개 웨이브 생존',
                completed: false,
                primary: true
            },
            {
                id: 'build_defenses',
                type: 'build_count',
                buildingType: 'turret',
                targetCount: 3,
                currentCount: 0,
                description: '터렛 3개 건설',
                completed: false,
                primary: true
            },
            {
                id: 'counter_attack',
                type: 'destroy_count',
                targetCount: 20,
                currentCount: 0,
                description: '적 유닛 20기 처치 (보너스)',
                completed: false,
                primary: false
            }
        ],

        waves: [
            { time: 30, units: [{ type: 'ranger', count: 3 }], faction: 'kryon' },
            { time: 70, units: [{ type: 'sentinel', count: 3 }], faction: 'mechanicus' },
            { time: 110, units: [{ type: 'zealot', count: 3 }, { type: 'ranger', count: 2 }], faction: 'kryon' },
            { time: 150, units: [{ type: 'sentinel', count: 4 }, { type: 'flak', count: 2 }], faction: 'mechanicus' },
            { time: 200, units: [{ type: 'zealot', count: 4 }, { type: 'stalker', count: 2 }], faction: 'kryon' },
            { time: 250, units: [{ type: 'sentinel', count: 5 }, { type: 'crusher', count: 1 }], faction: 'mechanicus' }
        ],

        rewards: {
            coins: 350,
            gems: 15,
            experience: 200
        }
    },

    {
        id: 'terra_2_3',
        chapter: 2,
        name: '연합 타격',
        description: '크라이온과 메카니쿠스가 동맹을 맺었습니다. 그들의 합동 기지를 파괴하세요.',
        faction: 'terra',
        enemyFaction: 'mixed',
        difficulty: 'hard',

        briefing: `
            최악의 상황입니다.
            정보부에 따르면 크라이온과 메카니쿠스가 임시 동맹을 맺었습니다.
            그들이 합류하기 전에 각각의 전초기지를 파괴해야 합니다.
        `,

        startResources: { crystal: 400, energy: 200 },
        startUnits: [
            { type: 'worker', count: 6 },
            { type: 'marine', count: 8 },
            { type: 'tank', count: 2 }
        ],

        objectives: [
            {
                id: 'destroy_kryon_base',
                type: 'destroy_building',
                buildingType: 'kryon_command',
                description: '크라이온 사령부 파괴',
                completed: false,
                primary: true
            },
            {
                id: 'destroy_mech_base',
                type: 'destroy_building',
                buildingType: 'mech_command',
                description: '메카니쿠스 사령부 파괴',
                completed: false,
                primary: true
            },
            {
                id: 'protect_base',
                type: 'protect',
                targetType: 'command_center',
                description: '아군 사령부 보호',
                completed: false,
                primary: true,
                failOnDestroy: true
            }
        ],

        enemyBases: [
            {
                faction: 'kryon',
                buildings: [
                    { type: 'command', x: 1600, y: 300 },
                    { type: 'barracks', x: 1500, y: 400 },
                    { type: 'turret', x: 1400, y: 250 }
                ],
                units: [{ type: 'zealot', count: 5 }, { type: 'stalker', count: 3 }]
            },
            {
                faction: 'mechanicus',
                buildings: [
                    { type: 'command', x: 1600, y: 900 },
                    { type: 'factory', x: 1500, y: 800 },
                    { type: 'turret', x: 1400, y: 950 }
                ],
                units: [{ type: 'sentinel', count: 4 }, { type: 'crusher', count: 2 }]
            }
        ],

        rewards: {
            coins: 500,
            gems: 25,
            experience: 300
        }
    },

    // 챕터 3: 결전
    {
        id: 'terra_3_1',
        chapter: 3,
        name: '최후의 작전',
        description: '적의 주력 기지를 향해 총공격을 개시합니다.',
        faction: 'terra',
        enemyFaction: 'kryon',
        difficulty: 'hard',

        briefing: `
            사령관님, 정보부가 크라이온의 주력 기지 위치를 파악했습니다.
            이것이 마지막 기회입니다.
            모든 전력을 동원하여 총공격을 개시하세요.
        `,

        startResources: { crystal: 500, energy: 250 },
        startUnits: [
            { type: 'worker', count: 6 },
            { type: 'marine', count: 10 },
            { type: 'tank', count: 3 },
            { type: 'medic', count: 2 }
        ],

        objectives: [
            {
                id: 'destroy_all_enemies',
                type: 'destroy_all',
                description: '모든 적 건물과 유닛 파괴',
                completed: false,
                primary: true
            },
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
                id: 'minimal_losses',
                type: 'unit_loss_limit',
                maxLosses: 10,
                currentLosses: 0,
                description: '유닛 손실 10기 이하 (보너스)',
                completed: false,
                primary: false
            }
        ],

        enemyBase: {
            buildings: [
                { type: 'command', x: 1700, y: 600 },
                { type: 'barracks', x: 1600, y: 500 },
                { type: 'barracks', x: 1600, y: 700 },
                { type: 'turret', x: 1500, y: 400 },
                { type: 'turret', x: 1500, y: 800 },
                { type: 'turret', x: 1550, y: 600 },
                { type: 'generator', x: 1800, y: 500 },
                { type: 'generator', x: 1800, y: 700 }
            ],
            units: [
                { type: 'zealot', count: 8 },
                { type: 'stalker', count: 5 },
                { type: 'ranger', count: 4 }
            ]
        },

        rewards: {
            coins: 600,
            gems: 30,
            experience: 400
        }
    },

    {
        id: 'terra_3_2',
        chapter: 3,
        name: '영광의 승리',
        description: '노바 섹터의 패권을 차지하기 위한 최종 결전.',
        faction: 'terra',
        enemyFaction: 'mixed',
        difficulty: 'hard',

        briefing: `
            이것이 마지막 전투입니다.
            크라이온과 메카니쿠스의 연합군이 총공격을 준비하고 있습니다.
            이 전투에서 승리하면, 노바 섹터는 테라 연합의 것이 됩니다.

            인류의 미래가 당신의 손에 달려있습니다, 사령관님.
        `,

        startResources: { crystal: 600, energy: 300 },
        startUnits: [
            { type: 'worker', count: 8 },
            { type: 'marine', count: 12 },
            { type: 'tank', count: 4 },
            { type: 'medic', count: 3 }
        ],

        objectives: [
            {
                id: 'survive_assault',
                type: 'survive',
                time: 600,
                description: '10분간 적의 총공격 생존',
                completed: false,
                primary: true
            },
            {
                id: 'counter_destroy',
                type: 'destroy_all',
                description: '모든 적 세력 섬멸',
                completed: false,
                primary: true
            },
            {
                id: 'flawless',
                type: 'protect_all',
                targetType: 'building',
                description: '건물 손실 없이 승리 (보너스)',
                completed: false,
                primary: false
            }
        ],

        waves: [
            { time: 30, units: [{ type: 'zealot', count: 5 }, { type: 'ranger', count: 3 }], faction: 'kryon' },
            { time: 60, units: [{ type: 'sentinel', count: 5 }, { type: 'flak', count: 2 }], faction: 'mechanicus' },
            { time: 100, units: [{ type: 'zealot', count: 6 }, { type: 'stalker', count: 4 }], faction: 'kryon' },
            { time: 150, units: [{ type: 'sentinel', count: 6 }, { type: 'crusher', count: 2 }], faction: 'mechanicus' },
            { time: 200, units: [{ type: 'stalker', count: 6 }, { type: 'zealot', count: 6 }], faction: 'kryon' },
            { time: 260, units: [{ type: 'crusher', count: 3 }, { type: 'sentinel', count: 8 }], faction: 'mechanicus' },
            { time: 320, units: [{ type: 'zealot', count: 8 }, { type: 'stalker', count: 5 }, { type: 'ranger', count: 4 }], faction: 'kryon' },
            { time: 400, units: [{ type: 'crusher', count: 4 }, { type: 'sentinel', count: 10 }, { type: 'flak', count: 4 }], faction: 'mechanicus', isBoss: true }
        ],

        rewards: {
            coins: 1000,
            gems: 50,
            experience: 500
        },

        unlocks: ['kryon_campaign', 'mechanicus_campaign']
    }
];

/**
 * 미션 데이터 (기존 호환성 유지)
 */
export const MISSION_DATA = {
    tutorial: TUTORIAL_MISSION,
    campaign: TERRA_CAMPAIGN
};

/**
 * 웨이브 모드 설정
 */
export const WAVE_CONFIG = {
    totalWaves: 10,
    waveInterval: 60,
    bossWaves: [5, 10],
    baseEnemies: 5,
    enemiesPerWave: 3,
    waveReward: { crystal: 50, energy: 25, coins: 50 },
    bossReward: { crystal: 150, energy: 75, coins: 150 },

    waves: [
        {
            number: 1,
            units: [{ type: 'marine', count: 3 }],
            faction: 'terra',
            description: '정찰대'
        },
        {
            number: 2,
            units: [
                { type: 'marine', count: 4 },
                { type: 'scout', count: 1 }
            ],
            faction: 'terra',
            description: '선발대'
        },
        {
            number: 3,
            units: [
                { type: 'marine', count: 5 },
                { type: 'scout', count: 2 }
            ],
            faction: 'terra',
            description: '공격대'
        },
        {
            number: 4,
            units: [
                { type: 'zealot', count: 3 },
                { type: 'ranger', count: 2 }
            ],
            faction: 'kryon',
            description: '크라이온 습격대'
        },
        {
            number: 5,
            units: [
                { type: 'zealot', count: 4 },
                { type: 'stalker', count: 3 },
                { type: 'ranger', count: 2 }
            ],
            faction: 'kryon',
            isBoss: true,
            bossName: '크라이온 선봉대',
            description: '엘리트 크라이온 부대'
        },
        {
            number: 6,
            units: [
                { type: 'sentinel', count: 4 },
                { type: 'flak', count: 2 }
            ],
            faction: 'mechanicus',
            description: '메카니쿠스 정찰대'
        },
        {
            number: 7,
            units: [
                { type: 'sentinel', count: 5 },
                { type: 'flak', count: 3 }
            ],
            faction: 'mechanicus',
            description: '메카니쿠스 공격대'
        },
        {
            number: 8,
            units: [
                { type: 'marine', count: 6 },
                { type: 'tank', count: 2 }
            ],
            faction: 'terra',
            description: '중무장 공격대'
        },
        {
            number: 9,
            units: [
                { type: 'zealot', count: 5 },
                { type: 'stalker', count: 4 },
                { type: 'crusher', count: 1 }
            ],
            faction: 'kryon',
            description: '크라이온 주력군'
        },
        {
            number: 10,
            units: [
                { type: 'tank', count: 3 },
                { type: 'crusher', count: 2 },
                { type: 'stalker', count: 4 },
                { type: 'marine', count: 8 }
            ],
            faction: 'mixed',
            isBoss: true,
            bossName: '연합 최종 공격대',
            description: '모든 세력의 연합 공격!'
        }
    ]
};

/**
 * 스커미시 모드 설정
 */
export const SKIRMISH_CONFIG = {
    maps: [
        {
            id: 'small_valley',
            name: '작은 계곡',
            size: { width: 1600, height: 1200 },
            resourceNodes: 4,
            difficulty: 'easy'
        },
        {
            id: 'crystal_plains',
            name: '크리스탈 평원',
            size: { width: 2000, height: 1500 },
            resourceNodes: 6,
            difficulty: 'normal'
        },
        {
            id: 'war_zone',
            name: '전쟁터',
            size: { width: 2400, height: 1800 },
            resourceNodes: 8,
            difficulty: 'hard'
        }
    ],

    aiDifficulties: {
        easy: {
            buildDelay: 1.5,
            attackDelay: 2.0,
            resourceMultiplier: 0.8,
            unitCap: 15
        },
        normal: {
            buildDelay: 1.0,
            attackDelay: 1.5,
            resourceMultiplier: 1.0,
            unitCap: 25
        },
        hard: {
            buildDelay: 0.7,
            attackDelay: 1.0,
            resourceMultiplier: 1.2,
            unitCap: 35
        }
    }
};

/**
 * 미션 진행 상황 관리
 */
export class CampaignProgress {
    constructor() {
        this.completedMissions = new Set();
        this.missionStars = new Map(); // 미션별 별점 (1-3)
        this.currentChapter = 1;
        this.unlockedCampaigns = new Set(['terra']); // 기본으로 테라 캠페인 해금

        this.load();
    }

    completeMission(missionId, stars = 1) {
        this.completedMissions.add(missionId);

        const currentStars = this.missionStars.get(missionId) || 0;
        if (stars > currentStars) {
            this.missionStars.set(missionId, stars);
        }

        this.save();
    }

    isMissionCompleted(missionId) {
        return this.completedMissions.has(missionId);
    }

    getMissionStars(missionId) {
        return this.missionStars.get(missionId) || 0;
    }

    getTotalStars() {
        let total = 0;
        for (const stars of this.missionStars.values()) {
            total += stars;
        }
        return total;
    }

    unlockCampaign(campaignId) {
        this.unlockedCampaigns.add(campaignId);
        this.save();
    }

    isCampaignUnlocked(campaignId) {
        return this.unlockedCampaigns.has(campaignId);
    }

    getNextMission(campaignId = 'terra') {
        const campaign = campaignId === 'terra' ? TERRA_CAMPAIGN : [];

        for (const mission of campaign) {
            if (!this.completedMissions.has(mission.id)) {
                return mission;
            }
        }

        return null; // 모든 미션 완료
    }

    save() {
        const data = {
            completedMissions: Array.from(this.completedMissions),
            missionStars: Array.from(this.missionStars.entries()),
            currentChapter: this.currentChapter,
            unlockedCampaigns: Array.from(this.unlockedCampaigns)
        };

        localStorage.setItem('starsiege_campaign', JSON.stringify(data));
    }

    load() {
        try {
            const saved = localStorage.getItem('starsiege_campaign');
            if (!saved) return;

            const data = JSON.parse(saved);

            this.completedMissions = new Set(data.completedMissions || []);
            this.missionStars = new Map(data.missionStars || []);
            this.currentChapter = data.currentChapter || 1;
            this.unlockedCampaigns = new Set(data.unlockedCampaigns || ['terra']);

        } catch (e) {
            console.error('캠페인 진행 로드 실패:', e);
        }
    }

    reset() {
        this.completedMissions.clear();
        this.missionStars.clear();
        this.currentChapter = 1;
        this.unlockedCampaigns = new Set(['terra']);
        localStorage.removeItem('starsiege_campaign');
    }
}
