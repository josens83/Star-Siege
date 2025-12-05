/**
 * Star Siege - 다국어 지원 시스템 (i18n)
 * 한국어, 영어, 일본어, 중국어 지원
 */

/**
 * 지원 언어 목록
 */
export const SUPPORTED_LANGUAGES = {
    ko: { name: '한국어', flag: '🇰🇷', rtl: false },
    en: { name: 'English', flag: '🇺🇸', rtl: false },
    ja: { name: '日本語', flag: '🇯🇵', rtl: false },
    zh: { name: '中文', flag: '🇨🇳', rtl: false }
};

/**
 * 한국어 번역
 */
const TRANSLATIONS_KO = {
    // 공통
    common: {
        confirm: '확인',
        cancel: '취소',
        yes: '예',
        no: '아니오',
        ok: '확인',
        back: '뒤로',
        close: '닫기',
        save: '저장',
        load: '불러오기',
        delete: '삭제',
        reset: '초기화',
        settings: '설정',
        play: '플레이',
        pause: '일시정지',
        resume: '계속하기',
        quit: '종료',
        retry: '다시 시도',
        next: '다음',
        prev: '이전',
        loading: '로딩 중...',
        error: '오류',
        success: '성공',
        warning: '경고'
    },

    // 메인 메뉴
    menu: {
        title: 'Star Siege',
        subtitle: '우주 전략 시뮬레이션',
        campaign: '캠페인',
        waveMode: '웨이브 모드',
        skirmish: '교전',
        shop: '상점',
        achievements: '업적',
        statistics: '통계',
        settings: '설정',
        credits: '크레딧',
        exit: '종료'
    },

    // 팩션
    factions: {
        terra: {
            name: '테라 연합',
            description: '지구 연방의 후예, 균형 잡힌 군사력',
            motto: '연합을 위하여, 인류를 위하여'
        },
        kryon: {
            name: '크라이온',
            description: '고대 외계 종족, 쉴드와 사이오닉 기술',
            motto: '영원한 빛이 우리를 인도한다'
        },
        mechanicus: {
            name: '메카니쿠스',
            description: 'AI 기계 집합체, 강력하지만 느린 유닛',
            motto: '로직이 곧 진리'
        }
    },

    // 게임 내
    game: {
        wave: '웨이브',
        waveIncoming: '웨이브 {0} 접근 중!',
        waveSurvived: '웨이브 {0} 생존!',
        bossWave: '보스 웨이브!',
        resources: '자원',
        crystal: '크리스탈',
        energy: '에너지',
        supply: '보급',
        time: '시간',
        score: '점수',
        kills: '처치',
        victory: '승리!',
        defeat: '패배',
        paused: '일시정지',
        selectUnits: '유닛 선택',
        moveUnits: '유닛 이동',
        attackTarget: '목표 공격',
        buildMenu: '건설 메뉴',
        unitProduction: '유닛 생산'
    },

    // 유닛
    units: {
        worker: '일꾼',
        marine: '해병',
        medic: '의무병',
        tank: '전차',
        scout: '정찰병',
        zealot: '광전사',
        stalker: '추적자',
        ranger: '사수',
        sentinel: '센티넬',
        flak: '플랙',
        crusher: '크러셔',
        harvester: '수확기',
        probe: '탐사정'
    },

    // 건물
    buildings: {
        commandCenter: '사령부',
        barracks: '병영',
        factory: '공장',
        turret: '터렛',
        collector: '수집기',
        generator: '발전기',
        nexus: '넥서스',
        gateway: '관문',
        core: '중앙 코어'
    },

    // 상점
    shop: {
        title: '상점',
        gems: '젬',
        coins: '코인',
        boosters: '부스터',
        skins: '스킨',
        upgrades: '업그레이드',
        packages: '패키지',
        buy: '구매',
        owned: '보유중',
        popular: '인기',
        bestValue: '최고 가치',
        limited: '한정',
        sale: '할인',
        free: '무료'
    },

    // 업적
    achievements: {
        title: '업적',
        completed: '완료',
        inProgress: '진행중',
        locked: '잠김',
        claim: '수령',
        claimAll: '모두 수령',
        progress: '진행도',
        reward: '보상',
        categories: {
            combat: '전투',
            economy: '경제',
            building: '건설',
            campaign: '캠페인',
            wave: '웨이브',
            misc: '기타'
        }
    },

    // 통계
    statistics: {
        title: '통계',
        overview: '개요',
        combat: '전투',
        economy: '경제',
        history: '기록',
        leaderboard: '리더보드',
        totalGames: '총 게임 수',
        wins: '승리',
        losses: '패배',
        winRate: '승률',
        highestWave: '최고 웨이브',
        totalPlayTime: '총 플레이 시간',
        totalKills: '총 처치',
        share: '공유'
    },

    // 설정
    settings: {
        title: '설정',
        audio: '오디오',
        graphics: '그래픽',
        gameplay: '게임플레이',
        controls: '컨트롤',
        accessibility: '접근성',
        account: '계정',
        language: '언어',
        masterVolume: '마스터 볼륨',
        musicVolume: '배경 음악',
        sfxVolume: '효과음',
        quality: '그래픽 품질',
        low: '낮음',
        medium: '중간',
        high: '높음',
        difficulty: '난이도',
        easy: '쉬움',
        normal: '보통',
        hard: '어려움'
    },

    // 캠페인
    campaign: {
        title: '캠페인',
        chapter: '챕터',
        mission: '미션',
        locked: '잠김',
        completed: '완료',
        stars: '별',
        briefing: '브리핑',
        objectives: '목표',
        rewards: '보상',
        start: '시작'
    },

    // 알림 메시지
    messages: {
        welcome: 'Star Siege에 오신 것을 환영합니다!',
        dailyReward: '일일 보상을 받으세요!',
        achievementUnlocked: '업적 달성: {0}',
        newHighScore: '새로운 최고 기록!',
        purchaseComplete: '구매 완료!',
        notEnoughCoins: '코인이 부족합니다',
        notEnoughGems: '젬이 부족합니다',
        settingsSaved: '설정이 저장되었습니다',
        connectionError: '연결 오류. 다시 시도해주세요',
        saveComplete: '저장 완료',
        loadComplete: '불러오기 완료'
    }
};

/**
 * 영어 번역
 */
const TRANSLATIONS_EN = {
    common: {
        confirm: 'Confirm',
        cancel: 'Cancel',
        yes: 'Yes',
        no: 'No',
        ok: 'OK',
        back: 'Back',
        close: 'Close',
        save: 'Save',
        load: 'Load',
        delete: 'Delete',
        reset: 'Reset',
        settings: 'Settings',
        play: 'Play',
        pause: 'Pause',
        resume: 'Resume',
        quit: 'Quit',
        retry: 'Retry',
        next: 'Next',
        prev: 'Previous',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning'
    },

    menu: {
        title: 'Star Siege',
        subtitle: 'Space Strategy Simulation',
        campaign: 'Campaign',
        waveMode: 'Wave Mode',
        skirmish: 'Skirmish',
        shop: 'Shop',
        achievements: 'Achievements',
        statistics: 'Statistics',
        settings: 'Settings',
        credits: 'Credits',
        exit: 'Exit'
    },

    factions: {
        terra: {
            name: 'Terra Union',
            description: 'Descendants of Earth Federation, balanced military power',
            motto: 'For the Union, For Humanity'
        },
        kryon: {
            name: 'Kryon',
            description: 'Ancient alien race, masters of shield and psionic technology',
            motto: 'The Eternal Light guides us'
        },
        mechanicus: {
            name: 'Mechanicus',
            description: 'AI machine collective, powerful but slow heavy units',
            motto: 'Logic is Truth'
        }
    },

    game: {
        wave: 'Wave',
        waveIncoming: 'Wave {0} incoming!',
        waveSurvived: 'Wave {0} survived!',
        bossWave: 'Boss Wave!',
        resources: 'Resources',
        crystal: 'Crystal',
        energy: 'Energy',
        supply: 'Supply',
        time: 'Time',
        score: 'Score',
        kills: 'Kills',
        victory: 'Victory!',
        defeat: 'Defeat',
        paused: 'Paused',
        selectUnits: 'Select Units',
        moveUnits: 'Move Units',
        attackTarget: 'Attack Target',
        buildMenu: 'Build Menu',
        unitProduction: 'Unit Production'
    },

    units: {
        worker: 'Worker',
        marine: 'Marine',
        medic: 'Medic',
        tank: 'Tank',
        scout: 'Scout',
        zealot: 'Zealot',
        stalker: 'Stalker',
        ranger: 'Ranger',
        sentinel: 'Sentinel',
        flak: 'Flak',
        crusher: 'Crusher',
        harvester: 'Harvester',
        probe: 'Probe'
    },

    buildings: {
        commandCenter: 'Command Center',
        barracks: 'Barracks',
        factory: 'Factory',
        turret: 'Turret',
        collector: 'Collector',
        generator: 'Generator',
        nexus: 'Nexus',
        gateway: 'Gateway',
        core: 'Core'
    },

    shop: {
        title: 'Shop',
        gems: 'Gems',
        coins: 'Coins',
        boosters: 'Boosters',
        skins: 'Skins',
        upgrades: 'Upgrades',
        packages: 'Packages',
        buy: 'Buy',
        owned: 'Owned',
        popular: 'Popular',
        bestValue: 'Best Value',
        limited: 'Limited',
        sale: 'Sale',
        free: 'Free'
    },

    achievements: {
        title: 'Achievements',
        completed: 'Completed',
        inProgress: 'In Progress',
        locked: 'Locked',
        claim: 'Claim',
        claimAll: 'Claim All',
        progress: 'Progress',
        reward: 'Reward',
        categories: {
            combat: 'Combat',
            economy: 'Economy',
            building: 'Building',
            campaign: 'Campaign',
            wave: 'Wave',
            misc: 'Misc'
        }
    },

    statistics: {
        title: 'Statistics',
        overview: 'Overview',
        combat: 'Combat',
        economy: 'Economy',
        history: 'History',
        leaderboard: 'Leaderboard',
        totalGames: 'Total Games',
        wins: 'Wins',
        losses: 'Losses',
        winRate: 'Win Rate',
        highestWave: 'Highest Wave',
        totalPlayTime: 'Total Play Time',
        totalKills: 'Total Kills',
        share: 'Share'
    },

    settings: {
        title: 'Settings',
        audio: 'Audio',
        graphics: 'Graphics',
        gameplay: 'Gameplay',
        controls: 'Controls',
        accessibility: 'Accessibility',
        account: 'Account',
        language: 'Language',
        masterVolume: 'Master Volume',
        musicVolume: 'Music',
        sfxVolume: 'Sound Effects',
        quality: 'Graphics Quality',
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        difficulty: 'Difficulty',
        easy: 'Easy',
        normal: 'Normal',
        hard: 'Hard'
    },

    campaign: {
        title: 'Campaign',
        chapter: 'Chapter',
        mission: 'Mission',
        locked: 'Locked',
        completed: 'Completed',
        stars: 'Stars',
        briefing: 'Briefing',
        objectives: 'Objectives',
        rewards: 'Rewards',
        start: 'Start'
    },

    messages: {
        welcome: 'Welcome to Star Siege!',
        dailyReward: 'Claim your daily reward!',
        achievementUnlocked: 'Achievement unlocked: {0}',
        newHighScore: 'New high score!',
        purchaseComplete: 'Purchase complete!',
        notEnoughCoins: 'Not enough coins',
        notEnoughGems: 'Not enough gems',
        settingsSaved: 'Settings saved',
        connectionError: 'Connection error. Please try again',
        saveComplete: 'Save complete',
        loadComplete: 'Load complete'
    }
};

/**
 * 일본어 번역
 */
const TRANSLATIONS_JA = {
    common: {
        confirm: '確認',
        cancel: 'キャンセル',
        yes: 'はい',
        no: 'いいえ',
        ok: 'OK',
        back: '戻る',
        close: '閉じる',
        save: '保存',
        load: '読み込む',
        delete: '削除',
        reset: 'リセット',
        settings: '設定',
        play: 'プレイ',
        pause: '一時停止',
        resume: '再開',
        quit: '終了',
        retry: 'リトライ',
        next: '次へ',
        prev: '前へ',
        loading: '読み込み中...',
        error: 'エラー',
        success: '成功',
        warning: '警告'
    },

    menu: {
        title: 'Star Siege',
        subtitle: '宇宙戦略シミュレーション',
        campaign: 'キャンペーン',
        waveMode: 'ウェーブモード',
        skirmish: 'スカーミッシュ',
        shop: 'ショップ',
        achievements: '実績',
        statistics: '統計',
        settings: '設定',
        credits: 'クレジット',
        exit: '終了'
    },

    factions: {
        terra: {
            name: 'テラ連合',
            description: '地球連邦の後継者、バランスの取れた軍事力',
            motto: '連合のために、人類のために'
        },
        kryon: {
            name: 'クライオン',
            description: '古代の異星人種族、シールドとサイオニック技術の達人',
            motto: '永遠の光が私たちを導く'
        },
        mechanicus: {
            name: 'メカニクス',
            description: 'AI機械集合体、強力だが遅い重装甲ユニット',
            motto: '論理こそが真理'
        }
    },

    game: {
        wave: 'ウェーブ',
        waveIncoming: 'ウェーブ {0} 接近中!',
        waveSurvived: 'ウェーブ {0} 生存!',
        bossWave: 'ボスウェーブ!',
        resources: '資源',
        crystal: 'クリスタル',
        energy: 'エネルギー',
        supply: '補給',
        time: '時間',
        score: 'スコア',
        kills: '撃破',
        victory: '勝利!',
        defeat: '敗北',
        paused: '一時停止中',
        selectUnits: 'ユニット選択',
        moveUnits: 'ユニット移動',
        attackTarget: 'ターゲット攻撃',
        buildMenu: '建設メニュー',
        unitProduction: 'ユニット生産'
    },

    units: {
        worker: 'ワーカー',
        marine: 'マリーン',
        medic: 'メディック',
        tank: 'タンク',
        scout: 'スカウト',
        zealot: 'ジーロット',
        stalker: 'ストーカー',
        ranger: 'レンジャー',
        sentinel: 'センチネル',
        flak: 'フラック',
        crusher: 'クラッシャー',
        harvester: 'ハーベスター',
        probe: 'プローブ'
    },

    buildings: {
        commandCenter: '司令部',
        barracks: '兵舎',
        factory: '工場',
        turret: 'タレット',
        collector: 'コレクター',
        generator: 'ジェネレーター',
        nexus: 'ネクサス',
        gateway: 'ゲートウェイ',
        core: 'コア'
    },

    shop: {
        title: 'ショップ',
        gems: 'ジェム',
        coins: 'コイン',
        boosters: 'ブースター',
        skins: 'スキン',
        upgrades: 'アップグレード',
        packages: 'パッケージ',
        buy: '購入',
        owned: '所持',
        popular: '人気',
        bestValue: 'お得',
        limited: '限定',
        sale: 'セール',
        free: '無料'
    },

    achievements: {
        title: '実績',
        completed: '完了',
        inProgress: '進行中',
        locked: 'ロック',
        claim: '受け取る',
        claimAll: '全て受け取る',
        progress: '進行度',
        reward: '報酬',
        categories: {
            combat: '戦闘',
            economy: '経済',
            building: '建設',
            campaign: 'キャンペーン',
            wave: 'ウェーブ',
            misc: 'その他'
        }
    },

    statistics: {
        title: '統計',
        overview: '概要',
        combat: '戦闘',
        economy: '経済',
        history: '履歴',
        leaderboard: 'リーダーボード',
        totalGames: '総ゲーム数',
        wins: '勝利',
        losses: '敗北',
        winRate: '勝率',
        highestWave: '最高ウェーブ',
        totalPlayTime: '総プレイ時間',
        totalKills: '総撃破数',
        share: '共有'
    },

    settings: {
        title: '設定',
        audio: 'オーディオ',
        graphics: 'グラフィック',
        gameplay: 'ゲームプレイ',
        controls: 'コントロール',
        accessibility: 'アクセシビリティ',
        account: 'アカウント',
        language: '言語',
        masterVolume: 'マスター音量',
        musicVolume: 'BGM',
        sfxVolume: '効果音',
        quality: '画質',
        low: '低',
        medium: '中',
        high: '高',
        difficulty: '難易度',
        easy: '簡単',
        normal: '普通',
        hard: '難しい'
    },

    campaign: {
        title: 'キャンペーン',
        chapter: 'チャプター',
        mission: 'ミッション',
        locked: 'ロック',
        completed: '完了',
        stars: 'スター',
        briefing: 'ブリーフィング',
        objectives: '目標',
        rewards: '報酬',
        start: '開始'
    },

    messages: {
        welcome: 'Star Siegeへようこそ!',
        dailyReward: 'デイリー報酬を受け取りましょう!',
        achievementUnlocked: '実績達成: {0}',
        newHighScore: '新記録!',
        purchaseComplete: '購入完了!',
        notEnoughCoins: 'コインが足りません',
        notEnoughGems: 'ジェムが足りません',
        settingsSaved: '設定を保存しました',
        connectionError: '接続エラー。もう一度お試しください',
        saveComplete: '保存完了',
        loadComplete: '読み込み完了'
    }
};

/**
 * 중국어 번역
 */
const TRANSLATIONS_ZH = {
    common: {
        confirm: '确认',
        cancel: '取消',
        yes: '是',
        no: '否',
        ok: '确定',
        back: '返回',
        close: '关闭',
        save: '保存',
        load: '加载',
        delete: '删除',
        reset: '重置',
        settings: '设置',
        play: '开始',
        pause: '暂停',
        resume: '继续',
        quit: '退出',
        retry: '重试',
        next: '下一步',
        prev: '上一步',
        loading: '加载中...',
        error: '错误',
        success: '成功',
        warning: '警告'
    },

    menu: {
        title: 'Star Siege',
        subtitle: '太空战略模拟',
        campaign: '战役',
        waveMode: '波次模式',
        skirmish: '遭遇战',
        shop: '商店',
        achievements: '成就',
        statistics: '统计',
        settings: '设置',
        credits: '制作人员',
        exit: '退出'
    },

    factions: {
        terra: {
            name: '泰拉联盟',
            description: '地球联邦的后裔，拥有均衡的军事力量',
            motto: '为了联盟，为了人类'
        },
        kryon: {
            name: '克里昂',
            description: '古老的外星种族，精通护盾和灵能技术',
            motto: '永恒之光指引我们'
        },
        mechanicus: {
            name: '机械神教',
            description: 'AI机器集合体，拥有强大但缓慢的重装单位',
            motto: '逻辑即真理'
        }
    },

    game: {
        wave: '波次',
        waveIncoming: '第 {0} 波来袭!',
        waveSurvived: '第 {0} 波生存!',
        bossWave: 'Boss波次!',
        resources: '资源',
        crystal: '水晶',
        energy: '能量',
        supply: '补给',
        time: '时间',
        score: '分数',
        kills: '击杀',
        victory: '胜利!',
        defeat: '失败',
        paused: '已暂停',
        selectUnits: '选择单位',
        moveUnits: '移动单位',
        attackTarget: '攻击目标',
        buildMenu: '建造菜单',
        unitProduction: '单位生产'
    },

    units: {
        worker: '工人',
        marine: '陆战队员',
        medic: '医疗兵',
        tank: '坦克',
        scout: '侦察兵',
        zealot: '狂热者',
        stalker: '追踪者',
        ranger: '游侠',
        sentinel: '哨兵',
        flak: '高射炮',
        crusher: '粉碎者',
        harvester: '采集者',
        probe: '探测器'
    },

    buildings: {
        commandCenter: '指挥中心',
        barracks: '兵营',
        factory: '工厂',
        turret: '炮塔',
        collector: '收集器',
        generator: '发电机',
        nexus: '枢纽',
        gateway: '传送门',
        core: '核心'
    },

    shop: {
        title: '商店',
        gems: '宝石',
        coins: '金币',
        boosters: '加速器',
        skins: '皮肤',
        upgrades: '升级',
        packages: '礼包',
        buy: '购买',
        owned: '已拥有',
        popular: '热门',
        bestValue: '超值',
        limited: '限定',
        sale: '特惠',
        free: '免费'
    },

    achievements: {
        title: '成就',
        completed: '已完成',
        inProgress: '进行中',
        locked: '未解锁',
        claim: '领取',
        claimAll: '全部领取',
        progress: '进度',
        reward: '奖励',
        categories: {
            combat: '战斗',
            economy: '经济',
            building: '建造',
            campaign: '战役',
            wave: '波次',
            misc: '其他'
        }
    },

    statistics: {
        title: '统计',
        overview: '概览',
        combat: '战斗',
        economy: '经济',
        history: '历史',
        leaderboard: '排行榜',
        totalGames: '总场次',
        wins: '胜利',
        losses: '失败',
        winRate: '胜率',
        highestWave: '最高波次',
        totalPlayTime: '总游戏时间',
        totalKills: '总击杀',
        share: '分享'
    },

    settings: {
        title: '设置',
        audio: '音频',
        graphics: '画面',
        gameplay: '游戏设置',
        controls: '控制',
        accessibility: '辅助功能',
        account: '账户',
        language: '语言',
        masterVolume: '主音量',
        musicVolume: '背景音乐',
        sfxVolume: '音效',
        quality: '画质',
        low: '低',
        medium: '中',
        high: '高',
        difficulty: '难度',
        easy: '简单',
        normal: '普通',
        hard: '困难'
    },

    campaign: {
        title: '战役',
        chapter: '章节',
        mission: '任务',
        locked: '未解锁',
        completed: '已完成',
        stars: '星',
        briefing: '简报',
        objectives: '目标',
        rewards: '奖励',
        start: '开始'
    },

    messages: {
        welcome: '欢迎来到Star Siege!',
        dailyReward: '领取每日奖励!',
        achievementUnlocked: '成就达成: {0}',
        newHighScore: '新纪录!',
        purchaseComplete: '购买完成!',
        notEnoughCoins: '金币不足',
        notEnoughGems: '宝石不足',
        settingsSaved: '设置已保存',
        connectionError: '连接错误，请重试',
        saveComplete: '保存完成',
        loadComplete: '加载完成'
    }
};

/**
 * 모든 번역
 */
const TRANSLATIONS = {
    ko: TRANSLATIONS_KO,
    en: TRANSLATIONS_EN,
    ja: TRANSLATIONS_JA,
    zh: TRANSLATIONS_ZH
};

/**
 * i18n 시스템 클래스
 */
export class I18nSystem {
    constructor(game) {
        this.game = game;
        this.currentLanguage = 'ko';
        this.fallbackLanguage = 'en';
        this.translations = TRANSLATIONS;
        this.listeners = [];

        this.detectLanguage();
    }

    /**
     * 초기화
     */
    init() {
        // 저장된 언어 설정 로드
        const saved = localStorage.getItem('starsiege_language');
        if (saved && SUPPORTED_LANGUAGES[saved]) {
            this.currentLanguage = saved;
        }

        // HTML lang 속성 설정
        document.documentElement.lang = this.currentLanguage;

        console.log(`언어 초기화: ${this.currentLanguage}`);
    }

    /**
     * 브라우저 언어 감지
     */
    detectLanguage() {
        const browserLang = navigator.language?.split('-')[0] || 'en';

        if (SUPPORTED_LANGUAGES[browserLang]) {
            this.currentLanguage = browserLang;
        } else {
            this.currentLanguage = this.fallbackLanguage;
        }
    }

    /**
     * 언어 변경
     */
    setLanguage(lang) {
        if (!SUPPORTED_LANGUAGES[lang]) {
            console.warn(`지원하지 않는 언어: ${lang}`);
            return false;
        }

        this.currentLanguage = lang;
        document.documentElement.lang = lang;
        localStorage.setItem('starsiege_language', lang);

        // 리스너 호출
        this.notifyListeners();

        // 설정 시스템 업데이트
        if (this.game?.settings) {
            this.game.settings.set('language', lang);
        }

        console.log(`언어 변경: ${lang}`);
        return true;
    }

    /**
     * 현재 언어 가져오기
     */
    getLanguage() {
        return this.currentLanguage;
    }

    /**
     * 지원 언어 목록 가져오기
     */
    getSupportedLanguages() {
        return SUPPORTED_LANGUAGES;
    }

    /**
     * 번역 가져오기
     */
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];

        // 현재 언어에서 찾기
        for (const k of keys) {
            if (value === undefined || value === null) break;
            value = value[k];
        }

        // 폴백 언어에서 찾기
        if (value === undefined || value === null) {
            value = this.translations[this.fallbackLanguage];
            for (const k of keys) {
                if (value === undefined || value === null) break;
                value = value[k];
            }
        }

        // 찾지 못한 경우 키 반환
        if (value === undefined || value === null) {
            console.warn(`번역 없음: ${key}`);
            return key;
        }

        // 파라미터 치환
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return this.interpolate(value, params);
        }

        return value;
    }

    /**
     * 파라미터 치환
     */
    interpolate(text, params) {
        let result = text;

        // {0}, {1}, ... 형식
        Object.keys(params).forEach((key, index) => {
            const regex = new RegExp(`\\{${key}\\}|\\{${index}\\}`, 'g');
            result = result.replace(regex, params[key]);
        });

        return result;
    }

    /**
     * 번역이 있는지 확인
     */
    hasTranslation(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];

        for (const k of keys) {
            if (value === undefined || value === null) return false;
            value = value[k];
        }

        return value !== undefined && value !== null;
    }

    /**
     * 언어 변경 리스너 등록
     */
    onChange(callback) {
        this.listeners.push(callback);

        // 제거 함수 반환
        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    /**
     * 리스너 호출
     */
    notifyListeners() {
        for (const callback of this.listeners) {
            callback(this.currentLanguage);
        }
    }

    /**
     * 숫자 포맷팅 (로케일 적용)
     */
    formatNumber(num) {
        return new Intl.NumberFormat(this.currentLanguage).format(num);
    }

    /**
     * 날짜 포맷팅 (로케일 적용)
     */
    formatDate(date, options = {}) {
        return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
    }

    /**
     * 시간 포맷팅 (mm:ss)
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    }

    /**
     * 플레이 시간 포맷팅
     */
    formatPlayTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);

        switch (this.currentLanguage) {
            case 'ko':
                return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
            case 'ja':
                return hours > 0 ? `${hours}時間${mins}分` : `${mins}分`;
            case 'zh':
                return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
            default:
                return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        }
    }

    /**
     * 데이터 직렬화
     */
    serialize() {
        return {
            language: this.currentLanguage
        };
    }

    /**
     * 데이터 역직렬화
     */
    deserialize(data) {
        if (data?.language) {
            this.setLanguage(data.language);
        }
    }
}

// 글로벌 접근용 함수
let i18nInstance = null;

export function initI18n(game) {
    i18nInstance = new I18nSystem(game);
    i18nInstance.init();
    return i18nInstance;
}

export function t(key, params = {}) {
    if (!i18nInstance) {
        console.warn('i18n 시스템이 초기화되지 않았습니다');
        return key;
    }
    return i18nInstance.t(key, params);
}

export function getI18n() {
    return i18nInstance;
}
