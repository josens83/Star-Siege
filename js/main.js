/**
 * Star Siege - 메인 엔트리 포인트
 * 모바일 RTS 게임
 */

import { Game } from './game/Game.js';

// 전역 게임 인스턴스
let game = null;

/**
 * 게임 초기화 및 시작
 */
async function initGame() {
    console.log('🎮 Star Siege 시작...');

    // 게임 인스턴스 생성
    game = new Game();

    // 전역에서 접근 가능하도록 (디버깅용)
    window.game = game;

    // 초기화
    try {
        await game.init();
        console.log('✅ 게임 초기화 완료');
    } catch (error) {
        console.error('❌ 게임 초기화 실패:', error);
        showError('게임을 시작할 수 없습니다.');
    }
}

/**
 * 에러 표시
 */
function showError(message) {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingText = document.getElementById('loading-text');

    if (loadingText) {
        loadingText.textContent = message;
        loadingText.style.color = '#ff4444';
    }
}

/**
 * Service Worker 등록
 */
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            console.log('Service Worker 등록됨:', registration.scope);
        } catch (error) {
            console.log('Service Worker 등록 실패:', error);
        }
    }
}

/**
 * PWA 설치 프롬프트 처리
 */
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // 설치 버튼 표시 (필요한 경우)
    console.log('PWA 설치 가능');
});

/**
 * 전체 화면 모드
 */
function requestFullscreen() {
    const elem = document.documentElement;

    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

/**
 * 화면 잠금 방지 (Wake Lock API)
 */
async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            await navigator.wakeLock.request('screen');
            console.log('화면 잠금 방지 활성화');
        } catch (error) {
            console.log('Wake Lock 실패:', error);
        }
    }
}

/**
 * 화면 방향 잠금
 */
function lockOrientation() {
    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {
            // 방향 잠금 실패 (무시)
        });
    }
}

/**
 * 모바일 브라우저 주소창 숨기기
 */
function hideAddressBar() {
    window.scrollTo(0, 1);
}

/**
 * 터치 이벤트 기본 동작 방지
 */
function preventDefaultTouchBehavior() {
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('#game-canvas')) {
            e.preventDefault();
        }
    }, { passive: false });

    // 더블탭 줌 방지
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
}

/**
 * 키보드 단축키 안내
 */
function logControls() {
    console.log(`
    ╔════════════════════════════════════════╗
    ║         Star Siege 조작법               ║
    ╠════════════════════════════════════════╣
    ║  마우스/터치:                           ║
    ║  - 좌클릭/탭: 선택                      ║
    ║  - 우클릭/길게 탭: 명령                 ║
    ║  - 드래그: 범위 선택                    ║
    ║  - 휠/핀치: 줌                          ║
    ║                                        ║
    ║  키보드:                               ║
    ║  - WASD/방향키: 카메라 이동            ║
    ║  - A: 공격 명령 모드                    ║
    ║  - S: 정지                             ║
    ║  - H: 위치 고수                        ║
    ║  - ESC: 일시정지/취소                  ║
    ║  - F2: 디버그 모드                     ║
    ║  - 1-0: 컨트롤 그룹                    ║
    ║  - Ctrl+1-0: 그룹 지정                 ║
    ╚════════════════════════════════════════╝
    `);
}

/**
 * DOM 로드 완료 시 실행
 */
document.addEventListener('DOMContentLoaded', () => {
    // 기본 동작 방지
    preventDefaultTouchBehavior();

    // 주소창 숨기기 (모바일)
    hideAddressBar();

    // Service Worker 등록
    registerServiceWorker();

    // 조작법 로그
    logControls();

    // 게임 초기화
    initGame();
});

/**
 * 페이지 가시성 변경 처리
 */
document.addEventListener('visibilitychange', () => {
    if (game) {
        if (document.hidden) {
            // 탭이 백그라운드로
            if (game.state === 'playing') {
                game.pause();
            }
        }
    }
});

/**
 * 화면 크기 변경 처리
 */
window.addEventListener('resize', () => {
    if (game) {
        game.resizeCanvas();
    }
});

/**
 * 화면 방향 변경 처리
 */
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        if (game) {
            game.resizeCanvas();
        }
        hideAddressBar();
    }, 100);
});

/**
 * 포커스 처리
 */
window.addEventListener('focus', () => {
    requestWakeLock();
});

// 에러 처리
window.addEventListener('error', (e) => {
    console.error('전역 에러:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('처리되지 않은 Promise 거부:', e.reason);
});
