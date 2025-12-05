/**
 * Star Siege - 소셜 공유 시스템
 * 게임 결과, 업적, 스크린샷 공유 기능
 */

/**
 * 소셜 플랫폼 정보
 */
const SOCIAL_PLATFORMS = {
    twitter: {
        name: 'Twitter/X',
        icon: '𝕏',
        color: '#000000',
        shareUrl: 'https://twitter.com/intent/tweet?text={text}&url={url}'
    },
    facebook: {
        name: 'Facebook',
        icon: '📘',
        color: '#1877f2',
        shareUrl: 'https://www.facebook.com/sharer/sharer.php?u={url}&quote={text}'
    },
    reddit: {
        name: 'Reddit',
        icon: '🔴',
        color: '#ff4500',
        shareUrl: 'https://www.reddit.com/submit?url={url}&title={text}'
    },
    clipboard: {
        name: '클립보드',
        icon: '📋',
        color: '#666666'
    },
    native: {
        name: '공유',
        icon: '📤',
        color: '#4caf50'
    }
};

/**
 * 공유 템플릿
 */
const SHARE_TEMPLATES = {
    gameResult: {
        victory: {
            ko: '🎮 Star Siege에서 승리! 🏆\n웨이브 {wave} 클리어!\n점수: {score}\n처치: {kills}\n#StarSiege #모바일게임',
            en: '🎮 Victory in Star Siege! 🏆\nWave {wave} cleared!\nScore: {score}\nKills: {kills}\n#StarSiege #MobileGame',
            ja: '🎮 Star Siegeで勝利! 🏆\nウェーブ {wave} クリア!\nスコア: {score}\n撃破: {kills}\n#StarSiege #モバイルゲーム',
            zh: '🎮 Star Siege胜利! 🏆\n第{wave}波通关!\n分数: {score}\n击杀: {kills}\n#StarSiege #手机游戏'
        },
        defeat: {
            ko: '🎮 Star Siege 도전!\n웨이브 {wave}까지 생존\n점수: {score}\n다시 도전해보세요!\n#StarSiege #모바일게임',
            en: '🎮 Star Siege Challenge!\nSurvived to Wave {wave}\nScore: {score}\nTry again!\n#StarSiege #MobileGame',
            ja: '🎮 Star Siegeチャレンジ!\nウェーブ {wave}まで生存\nスコア: {score}\n再挑戦!\n#StarSiege #モバイルゲーム',
            zh: '🎮 Star Siege挑战!\n生存到第{wave}波\n分数: {score}\n再试一次!\n#StarSiege #手机游戏'
        }
    },
    achievement: {
        ko: '🏆 Star Siege 업적 달성!\n"{name}"\n{description}\n#StarSiege #업적',
        en: '🏆 Star Siege Achievement Unlocked!\n"{name}"\n{description}\n#StarSiege #Achievement',
        ja: '🏆 Star Siege実績達成!\n「{name}」\n{description}\n#StarSiege #実績',
        zh: '🏆 Star Siege成就达成!\n"{name}"\n{description}\n#StarSiege #成就'
    },
    highScore: {
        ko: '🌟 Star Siege 새 기록!\n최고 웨이브: {wave}\n최고 점수: {score}\n당신도 도전하세요!\n#StarSiege #하이스코어',
        en: '🌟 Star Siege New Record!\nHighest Wave: {wave}\nHigh Score: {score}\nChallenge accepted?\n#StarSiege #HighScore',
        ja: '🌟 Star Siege新記録!\n最高ウェーブ: {wave}\nハイスコア: {score}\nチャレンジしよう!\n#StarSiege #ハイスコア',
        zh: '🌟 Star Siege新纪录!\n最高波次: {wave}\n最高分: {score}\n来挑战吧!\n#StarSiege #最高分'
    },
    stats: {
        ko: '🎮 Star Siege 전적\n🏆 최고 웨이브: {wave}\n⚔️ 총 킬: {kills}\n🎯 승률: {winRate}%\n⏱️ 플레이 시간: {playTime}\n#StarSiege',
        en: '🎮 Star Siege Stats\n🏆 Highest Wave: {wave}\n⚔️ Total Kills: {kills}\n🎯 Win Rate: {winRate}%\n⏱️ Play Time: {playTime}\n#StarSiege',
        ja: '🎮 Star Siege戦績\n🏆 最高ウェーブ: {wave}\n⚔️ 総撃破: {kills}\n🎯 勝率: {winRate}%\n⏱️ プレイ時間: {playTime}\n#StarSiege',
        zh: '🎮 Star Siege战绩\n🏆 最高波次: {wave}\n⚔️ 总击杀: {kills}\n🎯 胜率: {winRate}%\n⏱️ 游戏时间: {playTime}\n#StarSiege'
    },
    invite: {
        ko: '🚀 Star Siege에서 만나요!\n최고의 모바일 RTS 게임을 경험하세요!\n#StarSiege #모바일RTS',
        en: '🚀 Join me in Star Siege!\nExperience the ultimate mobile RTS game!\n#StarSiege #MobileRTS',
        ja: '🚀 Star Siegeで会いましょう!\n究極のモバイルRTSを体験!\n#StarSiege #モバイルRTS',
        zh: '🚀 来Star Siege吧!\n体验终极手机RTS游戏!\n#StarSiege #手机RTS'
    }
};

/**
 * 소셜 공유 시스템 클래스
 */
export class SocialSystem {
    constructor(game) {
        this.game = game;
        this.gameUrl = 'https://starsiege.game'; // 실제 게임 URL로 변경
        this.appStoreUrl = '';
        this.playStoreUrl = '';
    }

    /**
     * 초기화
     */
    init() {
        // Web Share API 지원 확인
        this.nativeShareSupported = typeof navigator.share === 'function';
        console.log(`네이티브 공유 지원: ${this.nativeShareSupported}`);
    }

    /**
     * 현재 언어 가져오기
     */
    getLanguage() {
        return this.game?.settings?.get('language') || 'ko';
    }

    /**
     * 게임 결과 공유
     */
    async shareGameResult(result) {
        const { victory, wave, score, kills } = result;
        const lang = this.getLanguage();
        const template = victory ?
            SHARE_TEMPLATES.gameResult.victory[lang] :
            SHARE_TEMPLATES.gameResult.defeat[lang];

        const text = this.formatTemplate(template, {
            wave: wave,
            score: score.toLocaleString(),
            kills: kills.toLocaleString()
        });

        return this.share({
            text,
            title: 'Star Siege 결과'
        });
    }

    /**
     * 업적 공유
     */
    async shareAchievement(achievement) {
        const lang = this.getLanguage();
        const template = SHARE_TEMPLATES.achievement[lang];

        const text = this.formatTemplate(template, {
            name: achievement.name,
            description: achievement.description
        });

        return this.share({
            text,
            title: 'Star Siege 업적'
        });
    }

    /**
     * 최고 기록 공유
     */
    async shareHighScore(stats) {
        const lang = this.getLanguage();
        const template = SHARE_TEMPLATES.highScore[lang];

        const text = this.formatTemplate(template, {
            wave: stats.highestWave,
            score: stats.highScore.toLocaleString()
        });

        return this.share({
            text,
            title: 'Star Siege 최고 기록'
        });
    }

    /**
     * 통계 공유
     */
    async shareStats() {
        const stats = this.game?.statistics;
        if (!stats) return false;

        const lang = this.getLanguage();
        const template = SHARE_TEMPLATES.stats[lang];
        const lifetime = stats.lifetime;

        const text = this.formatTemplate(template, {
            wave: lifetime.highestWave,
            kills: lifetime.totalKills.toLocaleString(),
            winRate: Math.round(stats.getWinRate() * 100),
            playTime: this.formatPlayTime(lifetime.totalPlayTime)
        });

        return this.share({
            text,
            title: 'Star Siege 통계'
        });
    }

    /**
     * 초대 공유
     */
    async shareInvite() {
        const lang = this.getLanguage();
        const template = SHARE_TEMPLATES.invite[lang];

        return this.share({
            text: template,
            title: 'Star Siege',
            url: this.gameUrl
        });
    }

    /**
     * 스크린샷 공유
     */
    async shareScreenshot() {
        try {
            const canvas = document.getElementById('game-canvas');
            if (!canvas) {
                throw new Error('게임 캔버스를 찾을 수 없습니다');
            }

            // 캔버스를 이미지로 변환
            const dataUrl = canvas.toDataURL('image/png');
            const blob = await this.dataUrlToBlob(dataUrl);
            const file = new File([blob], 'starsiege-screenshot.png', { type: 'image/png' });

            // Web Share API로 파일 공유 시도
            if (this.nativeShareSupported && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Star Siege Screenshot',
                    text: '🎮 Star Siege #StarSiege'
                });
                return true;
            }

            // 폴백: 다운로드
            this.downloadImage(dataUrl, 'starsiege-screenshot.png');
            return true;

        } catch (error) {
            console.error('스크린샷 공유 실패:', error);
            return false;
        }
    }

    /**
     * 공유 실행
     */
    async share(options) {
        const { text, title, url } = options;

        // 네이티브 공유 시도
        if (this.nativeShareSupported) {
            try {
                await navigator.share({
                    title: title || 'Star Siege',
                    text: text,
                    url: url || this.gameUrl
                });
                return true;
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('네이티브 공유 실패:', error);
                }
            }
        }

        // 폴백: 공유 다이얼로그 표시
        return this.showShareDialog(options);
    }

    /**
     * 공유 다이얼로그 표시
     */
    showShareDialog(options) {
        return new Promise((resolve) => {
            const { text, url } = options;

            // 다이얼로그 생성
            const dialog = document.createElement('div');
            dialog.className = 'share-dialog';
            dialog.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 3000;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

            const content = document.createElement('div');
            content.style.cssText = `
                background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
                border: 1px solid #333;
                border-radius: 16px;
                padding: 24px;
                width: 90%;
                max-width: 400px;
                text-align: center;
            `;

            content.innerHTML = `
                <h3 style="color: #fff; margin: 0 0 20px 0; font-size: 18px;">📤 공유하기</h3>
                <div style="display: flex; justify-content: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;">
                    ${this.renderShareButtons(text, url)}
                </div>
                <button class="close-share-btn" style="
                    background: #333;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 24px;
                    color: #fff;
                    font-size: 14px;
                    cursor: pointer;
                    width: 100%;
                ">닫기</button>
            `;

            dialog.appendChild(content);
            document.body.appendChild(dialog);

            // 이벤트 리스너
            dialog.addEventListener('click', (e) => {
                const target = e.target;

                if (target.classList.contains('share-dialog') || target.classList.contains('close-share-btn')) {
                    dialog.remove();
                    resolve(false);
                }

                if (target.classList.contains('share-btn')) {
                    const platform = target.dataset.platform;
                    this.shareToPlatform(platform, text, url);
                    dialog.remove();
                    resolve(true);
                }
            });
        });
    }

    /**
     * 공유 버튼 렌더링
     */
    renderShareButtons(text, url) {
        const platforms = ['twitter', 'facebook', 'reddit', 'clipboard'];

        return platforms.map(platformId => {
            const platform = SOCIAL_PLATFORMS[platformId];
            return `
                <button class="share-btn" data-platform="${platformId}" style="
                    background: ${platform.color};
                    border: none;
                    border-radius: 12px;
                    width: 60px;
                    height: 60px;
                    color: #fff;
                    font-size: 24px;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                ">
                    <span style="font-size: 24px;">${platform.icon}</span>
                    <span style="font-size: 10px;">${platform.name}</span>
                </button>
            `;
        }).join('');
    }

    /**
     * 플랫폼별 공유
     */
    async shareToPlatform(platformId, text, url) {
        const platform = SOCIAL_PLATFORMS[platformId];
        if (!platform) return false;

        const shareUrl = url || this.gameUrl;

        switch (platformId) {
            case 'clipboard':
                return this.copyToClipboard(text);

            case 'twitter':
            case 'facebook':
            case 'reddit':
                const finalUrl = platform.shareUrl
                    .replace('{text}', encodeURIComponent(text))
                    .replace('{url}', encodeURIComponent(shareUrl));
                window.open(finalUrl, '_blank', 'width=600,height=400');
                return true;

            default:
                return false;
        }
    }

    /**
     * 클립보드에 복사
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('클립보드에 복사되었습니다!');
            return true;
        } catch (error) {
            // 폴백: 구형 방식
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();

            try {
                document.execCommand('copy');
                this.showToast('클립보드에 복사되었습니다!');
                return true;
            } catch (e) {
                console.error('클립보드 복사 실패:', e);
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
    }

    /**
     * 토스트 메시지 표시
     */
    showToast(message, duration = 2000) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 4000;
            animation: fadeIn 0.3s ease;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * 템플릿 포맷팅
     */
    formatTemplate(template, params) {
        let result = template;
        for (const [key, value] of Object.entries(params)) {
            result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        }
        return result;
    }

    /**
     * 플레이 시간 포맷팅
     */
    formatPlayTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const lang = this.getLanguage();

        switch (lang) {
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
     * Data URL을 Blob으로 변환
     */
    async dataUrlToBlob(dataUrl) {
        const response = await fetch(dataUrl);
        return response.blob();
    }

    /**
     * 이미지 다운로드
     */
    downloadImage(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.click();
    }

    /**
     * 리더보드 공유용 이미지 생성
     */
    async generateShareImage(stats) {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        // 배경
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#0f0f1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 400);

        // 테두리
        ctx.strokeStyle = '#4caf50';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, 580, 380);

        // 타이틀
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⭐ STAR SIEGE ⭐', 300, 60);

        // 통계
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'left';

        const lifetime = stats.lifetime;
        const lines = [
            `🏆 최고 웨이브: ${lifetime.highestWave}`,
            `⚔️ 총 처치: ${lifetime.totalKills.toLocaleString()}`,
            `🎮 총 게임: ${lifetime.gamesPlayed}`,
            `📈 승률: ${Math.round(stats.getWinRate() * 100)}%`,
            `⏱️ 플레이 시간: ${this.formatPlayTime(lifetime.totalPlayTime)}`
        ];

        lines.forEach((line, index) => {
            ctx.fillText(line, 80, 130 + index * 50);
        });

        // 해시태그
        ctx.fillStyle = '#888';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('#StarSiege #모바일RTS', 300, 370);

        return canvas.toDataURL('image/png');
    }
}
