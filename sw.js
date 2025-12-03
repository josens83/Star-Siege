/**
 * Star Siege - Service Worker
 * 오프라인 지원 및 캐싱
 */

const CACHE_NAME = 'star-siege-v1';
const CACHE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/style.css',
    './js/main.js',
    './js/game/Game.js',
    './js/game/GameLoop.js',
    './js/game/InputManager.js',
    './js/entities/Entity.js',
    './js/entities/Unit.js',
    './js/entities/Building.js',
    './js/entities/Projectile.js',
    './js/entities/ResourceNode.js',
    './js/systems/ResourceSystem.js',
    './js/systems/SelectionSystem.js',
    './js/systems/BuildSystem.js',
    './js/systems/ProductionSystem.js',
    './js/systems/Camera.js',
    './js/systems/BalanceManager.js',
    './js/systems/PerformanceManager.js',
    './js/systems/SaveSystem.js',
    './js/systems/TutorialSystem.js',
    './js/ai/AIController.js',
    './js/ai/WaveSystem.js',
    './js/ai/MissionSystem.js',
    './js/ui/UIManager.js',
    './js/ui/Minimap.js',
    './js/ui/TouchControls.js',
    './js/audio/AudioManager.js',
    './js/effects/EffectSystem.js',
    './js/data/BuildingConfigs.js',
    './js/data/UnitConfigs.js',
    './js/data/MissionData.js',
    './js/utils/Vector2.js',
    './js/utils/Constants.js'
];

/**
 * 설치 이벤트 - 캐시 생성
 */
self.addEventListener('install', (event) => {
    console.log('[Service Worker] 설치 중...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] 리소스 캐싱...');
                return cache.addAll(CACHE_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] 설치 완료');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] 캐싱 실패:', error);
            })
    );
});

/**
 * 활성화 이벤트 - 이전 캐시 정리
 */
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] 활성화 중...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[Service Worker] 이전 캐시 삭제:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] 활성화 완료');
                return self.clients.claim();
            })
    );
});

/**
 * Fetch 이벤트 - 캐시 우선, 네트워크 폴백
 */
self.addEventListener('fetch', (event) => {
    // 네비게이션 요청
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match('./index.html');
                })
        );
        return;
    }

    // 일반 리소스 요청 - 캐시 우선
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                // 캐시에 없으면 네트워크에서 가져옴
                return fetch(event.request)
                    .then((response) => {
                        // 유효한 응답인지 확인
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // 응답 복제 및 캐시 저장
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // 오프라인이고 캐시에도 없으면
                        console.log('[Service Worker] 오프라인 - 리소스 없음:', event.request.url);
                    });
            })
    );
});

/**
 * 메시지 이벤트 - 캐시 업데이트 트리거
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'UPDATE_CACHE') {
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(CACHE_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] 캐시 업데이트 완료');
            });
    }
});

/**
 * 백그라운드 동기화
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-game-data') {
        console.log('[Service Worker] 백그라운드 동기화');
    }
});
