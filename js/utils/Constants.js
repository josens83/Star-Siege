/**
 * Constants - 게임 상수 정의
 * 모든 게임 설정값을 중앙 관리
 */

// 게임 기본 설정
export const GAME = {
    TARGET_FPS: 60,
    FIXED_TIMESTEP: 1000 / 60, // 약 16.67ms
    MAX_DELTA_TIME: 100, // 최대 델타 타임 (밀리초)

    // 맵 크기
    MAP_WIDTH: 3200,
    MAP_HEIGHT: 2400,

    // 타일 크기
    TILE_SIZE: 32,

    // 시작 자원
    STARTING_CRYSTAL: 100,
    STARTING_ENERGY: 50,

    // 최대 자원
    MAX_CRYSTAL: 500,
    MAX_ENERGY: 200,

    // 인구 제한
    MAX_POPULATION: 50,
    STARTING_POPULATION_CAP: 10,
    POPULATION_PER_SUPPLY: 5,

    // 저장 관련
    AUTO_SAVE_INTERVAL: 60000, // 60초
    SAVE_KEY: 'star_siege_save',
    SETTINGS_KEY: 'star_siege_settings'
};

// 진영 정보
export const FACTIONS = {
    TERRA: {
        id: 'terra',
        name: '테라 연합',
        color: '#4488ff',
        colorSecondary: '#2266dd',
        description: '균형잡힌 올라운더',
        modifiers: {
            buildSpeed: 1.0,
            health: 1.0,
            damage: 1.0,
            resourceGather: 1.0
        }
    },
    KRYON: {
        id: 'kryon',
        name: '크리온',
        color: '#44ff88',
        colorSecondary: '#22dd66',
        description: '빠르고 기동성 높음',
        modifiers: {
            buildSpeed: 0.9,
            health: 0.85,
            damage: 1.1,
            resourceGather: 1.1
        }
    },
    MECHANICUS: {
        id: 'mechanicus',
        name: '메카니쿠스',
        color: '#ff8844',
        colorSecondary: '#dd6622',
        description: '느리지만 강력함',
        modifiers: {
            buildSpeed: 1.2,
            health: 1.2,
            damage: 0.95,
            resourceGather: 0.9
        }
    }
};

// 유닛 타입
export const UNIT_TYPES = {
    WORKER: 'worker',
    INFANTRY: 'infantry',
    VEHICLE: 'vehicle',
    AIR: 'air',
    SUPPORT: 'support'
};

// 건물 타입
export const BUILDING_TYPES = {
    COMMAND: 'command',
    RESOURCE: 'resource',
    PRODUCTION: 'production',
    DEFENSE: 'defense',
    SUPPLY: 'supply',
    TECH: 'tech'
};

// 데미지 타입 상성
export const DAMAGE_MULTIPLIERS = {
    // [공격자 타입][방어자 타입] = 배율
    infantry: {
        infantry: 1.0,
        vehicle: 0.5,
        air: 0.7,
        building: 0.5
    },
    vehicle: {
        infantry: 1.3,
        vehicle: 1.0,
        air: 0.3,
        building: 1.5
    },
    air: {
        infantry: 1.2,
        vehicle: 1.3,
        air: 1.0,
        building: 1.0
    }
};

// 카메라 설정
export const CAMERA = {
    MIN_ZOOM: 0.5,
    MAX_ZOOM: 2.0,
    DEFAULT_ZOOM: 1.0,
    ZOOM_SPEED: 0.1,
    PAN_SPEED: 500,
    EDGE_PAN_SIZE: 30,
    EDGE_PAN_SPEED: 400
};

// 미니맵 설정
export const MINIMAP = {
    WIDTH: 120,
    HEIGHT: 120,
    UPDATE_INTERVAL: 100 // 밀리초
};

// 선택 시스템 설정
export const SELECTION = {
    MIN_DRAG_DISTANCE: 10,
    MAX_SELECTION: 24,
    DOUBLE_CLICK_TIME: 300
};

// 터치 컨트롤 설정
export const TOUCH = {
    TAP_THRESHOLD: 10,
    TAP_DURATION: 200,
    LONG_PRESS_DURATION: 500,
    PINCH_THRESHOLD: 10,
    JOYSTICK_DEAD_ZONE: 0.1,
    JOYSTICK_SIZE: 120,
    JOYSTICK_THUMB_SIZE: 50
};

// UI 설정
export const UI = {
    BUTTON_SIZE: 44,
    PANEL_PADDING: 10,
    TOAST_DURATION: 3000,
    TOOLTIP_DELAY: 500
};

// 오디오 설정
export const AUDIO = {
    MAX_DISTANCE: 500,
    REFERENCE_DISTANCE: 100,
    DEFAULT_BGM_VOLUME: 0.5,
    DEFAULT_SFX_VOLUME: 0.7
};

// 이펙트 설정
export const EFFECTS = {
    // 파티클 수
    HIT_PARTICLES: 8,
    EXPLOSION_PARTICLES: 30,
    DEATH_PARTICLES: 20,
    BUILD_COMPLETE_PARTICLES: 40,
    SHIELD_HIT_PARTICLES: 15,
    HEAL_PARTICLES: 10,
    CRITICAL_PARTICLES: 15,

    // 파티클 수명 (밀리초)
    PARTICLE_LIFETIME: 1000,

    // 플로팅 텍스트
    FLOATING_TEXT_DURATION: 1000,
    FLOATING_TEXT_SPEED: 30
};

// AI 설정
export const AI = {
    // 난이도별 반응 속도 (초)
    REACTION_TIME: {
        easy: 3,
        normal: 1,
        hard: 0.5
    },
    // 난이도별 공격 병력 수
    ATTACK_FORCE: {
        easy: 5,
        normal: 8,
        hard: 12
    },
    // 업데이트 간격 (밀리초)
    UPDATE_INTERVAL: 500,
    // 최대 동시 공격 그룹
    MAX_ATTACK_GROUPS: 3
};

// 웨이브 모드 설정
export const WAVE = {
    TOTAL_WAVES: 10,
    WAVE_INTERVAL: 60, // 초
    BOSS_WAVES: [5, 10],
    // 웨이브당 기본 적 수
    BASE_ENEMIES: 5,
    // 웨이브당 증가량
    ENEMIES_PER_WAVE: 3,
    // 웨이브 클리어 보상
    WAVE_REWARD_CRYSTAL: 50,
    WAVE_REWARD_ENERGY: 25
};

// 경로 탐색 설정
export const PATHFINDING = {
    GRID_SIZE: 32,
    MAX_SEARCH_NODES: 1000,
    PATH_UPDATE_INTERVAL: 500
};

// 렌더링 설정
export const RENDER = {
    // 체력바
    HEALTH_BAR_WIDTH: 40,
    HEALTH_BAR_HEIGHT: 4,
    HEALTH_BAR_OFFSET: 10,

    // 건설 미리보기
    PREVIEW_ALPHA: 0.6,
    PREVIEW_VALID_COLOR: 'rgba(68, 255, 136, 0.3)',
    PREVIEW_INVALID_COLOR: 'rgba(255, 68, 68, 0.3)',

    // 선택 원
    SELECTION_CIRCLE_WIDTH: 2,
    SELECTION_CIRCLE_ALPHA: 0.8,

    // 범위 표시
    RANGE_INDICATOR_ALPHA: 0.15,

    // 지형 색상
    TERRAIN_COLORS: {
        ground: '#1a1a2e',
        grass: '#1f3d1f',
        water: '#1a2a4a',
        rock: '#2a2a3e'
    }
};

// 색상 정의
export const COLORS = {
    // 팀 색상
    PLAYER: '#4488ff',
    ENEMY: '#ff4444',
    NEUTRAL: '#888888',
    ALLY: '#44ff88',

    // 자원 색상
    CRYSTAL: '#66ccff',
    ENERGY: '#ffcc00',

    // 상태 색상
    HEALTH: '#44ff44',
    SHIELD: '#44ffff',
    DANGER: '#ff4444',
    WARNING: '#ffaa00',
    SUCCESS: '#44ff88',

    // UI 색상
    TEXT_PRIMARY: '#ffffff',
    TEXT_SECONDARY: '#aaaacc',
    BG_DARK: '#0a0a1a',
    BG_MEDIUM: '#1a1a2e',
    BG_LIGHT: '#2a2a4e'
};

// 게임 상태
export const GAME_STATES = {
    LOADING: 'loading',
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

// 게임 모드
export const GAME_MODES = {
    SKIRMISH: 'skirmish',
    WAVE: 'wave',
    CAMPAIGN: 'campaign',
    TUTORIAL: 'tutorial'
};

// 명령 타입
export const COMMANDS = {
    MOVE: 'move',
    ATTACK: 'attack',
    ATTACK_MOVE: 'attackMove',
    STOP: 'stop',
    HOLD: 'hold',
    PATROL: 'patrol',
    GATHER: 'gather',
    BUILD: 'build',
    REPAIR: 'repair',
    TRAIN: 'train'
};

// 엔티티 상태
export const ENTITY_STATES = {
    IDLE: 'idle',
    MOVING: 'moving',
    ATTACKING: 'attacking',
    GATHERING: 'gathering',
    BUILDING: 'building',
    PRODUCING: 'producing',
    DEAD: 'dead'
};

// 건설 상태
export const BUILD_STATES = {
    NONE: 'none',
    PLACING: 'placing',
    BUILDING: 'building',
    COMPLETE: 'complete'
};

// 이벤트 타입
export const EVENTS = {
    // 게임 이벤트
    GAME_START: 'gameStart',
    GAME_OVER: 'gameOver',
    GAME_PAUSE: 'gamePause',
    GAME_RESUME: 'gameResume',

    // 엔티티 이벤트
    ENTITY_CREATED: 'entityCreated',
    ENTITY_DESTROYED: 'entityDestroyed',
    ENTITY_SELECTED: 'entitySelected',
    ENTITY_DESELECTED: 'entityDeselected',

    // 생산 이벤트
    PRODUCTION_START: 'productionStart',
    PRODUCTION_COMPLETE: 'productionComplete',
    PRODUCTION_CANCELLED: 'productionCancelled',

    // 건설 이벤트
    BUILD_START: 'buildStart',
    BUILD_COMPLETE: 'buildComplete',
    BUILD_CANCELLED: 'buildCancelled',

    // 자원 이벤트
    RESOURCE_CHANGED: 'resourceChanged',
    RESOURCE_DEPLETED: 'resourceDepleted',

    // 전투 이벤트
    UNIT_ATTACKED: 'unitAttacked',
    UNIT_KILLED: 'unitKilled',
    BUILDING_DESTROYED: 'buildingDestroyed',

    // 웨이브 이벤트
    WAVE_START: 'waveStart',
    WAVE_COMPLETE: 'waveComplete',

    // AI 이벤트
    UNDER_ATTACK: 'underAttack',

    // UI 이벤트
    TOAST_SHOW: 'toastShow',
    MENU_OPEN: 'menuOpen',
    MENU_CLOSE: 'menuClose'
};

// 레이어 순서 (z-index)
export const LAYERS = {
    TERRAIN: 0,
    RESOURCES: 1,
    BUILDINGS: 2,
    UNITS: 3,
    PROJECTILES: 4,
    EFFECTS: 5,
    UI: 10
};
