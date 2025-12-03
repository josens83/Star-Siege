/**
 * Minimap - 미니맵 시스템
 */

import { GAME, MINIMAP, COLORS } from '../utils/Constants.js';
import { Unit } from '../entities/Unit.js';
import { Building } from '../entities/Building.js';

export class Minimap {
    constructor(game) {
        this.game = game;

        // 캔버스 설정
        this.canvas = document.getElementById('minimap-canvas');
        this.ctx = this.canvas?.getContext('2d');

        if (this.canvas) {
            this.canvas.width = MINIMAP.WIDTH;
            this.canvas.height = MINIMAP.HEIGHT;

            // 클릭 이벤트
            this.canvas.addEventListener('click', (e) => this.onClick(e));
            this.canvas.addEventListener('touchstart', (e) => this.onTouch(e));
        }

        // 스케일 계산
        this.scaleX = MINIMAP.WIDTH / GAME.MAP_WIDTH;
        this.scaleY = MINIMAP.HEIGHT / GAME.MAP_HEIGHT;

        // 업데이트 타이머
        this.updateTimer = 0;
        this.updateInterval = MINIMAP.UPDATE_INTERVAL;
    }

    /**
     * 렌더링
     */
    render() {
        if (!this.ctx) return;

        const ctx = this.ctx;

        // 배경
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, MINIMAP.WIDTH, MINIMAP.HEIGHT);

        // 자원 노드
        for (const node of this.game.resourceNodes) {
            if (!node.isAlive) continue;

            const x = node.position.x * this.scaleX;
            const y = node.position.y * this.scaleY;

            ctx.fillStyle = COLORS.CRYSTAL;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // 건물
        for (const building of this.game.buildings) {
            if (!building.isAlive) continue;

            const x = building.position.x * this.scaleX;
            const y = building.position.y * this.scaleY;
            const size = Math.max(4, building.size * this.scaleX);

            ctx.fillStyle = building.team === this.game.playerTeam ? COLORS.PLAYER : COLORS.ENEMY;
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
        }

        // 유닛
        for (const unit of this.game.units) {
            if (!unit.isAlive) continue;

            const x = unit.position.x * this.scaleX;
            const y = unit.position.y * this.scaleY;

            ctx.fillStyle = unit.team === this.game.playerTeam ? COLORS.PLAYER : COLORS.ENEMY;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // 카메라 뷰 영역
        this.renderCameraView(ctx);
    }

    /**
     * 카메라 뷰 영역 렌더링
     */
    renderCameraView(ctx) {
        const camera = this.game.camera;
        if (!camera) return;

        const viewBounds = camera.getViewBounds();

        const x = viewBounds.x * this.scaleX;
        const y = viewBounds.y * this.scaleY;
        const width = viewBounds.width * this.scaleX;
        const height = viewBounds.height * this.scaleY;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
    }

    /**
     * 클릭 이벤트
     */
    onClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.scaleX;
        const y = (e.clientY - rect.top) / this.scaleY;

        this.game.camera.centerOn(x, y);
    }

    /**
     * 터치 이벤트
     */
    onTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / this.scaleX;
        const y = (touch.clientY - rect.top) / this.scaleY;

        this.game.camera.centerOn(x, y);
    }

    /**
     * 월드 좌표를 미니맵 좌표로 변환
     */
    worldToMinimap(worldX, worldY) {
        return {
            x: worldX * this.scaleX,
            y: worldY * this.scaleY
        };
    }

    /**
     * 미니맵 좌표를 월드 좌표로 변환
     */
    minimapToWorld(mapX, mapY) {
        return {
            x: mapX / this.scaleX,
            y: mapY / this.scaleY
        };
    }
}
