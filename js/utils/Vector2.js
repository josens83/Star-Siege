/**
 * Vector2 - 2D 벡터 클래스
 * 게임 내 위치, 방향, 속도 계산에 사용
 */
export class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * 벡터 복사본 생성
     */
    clone() {
        return new Vector2(this.x, this.y);
    }

    /**
     * 값 설정
     */
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * 다른 벡터의 값 복사
     */
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    /**
     * 벡터 덧셈
     */
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    /**
     * 벡터 덧셈 (새 벡터 반환)
     */
    static add(a, b) {
        return new Vector2(a.x + b.x, a.y + b.y);
    }

    /**
     * 벡터 뺄셈
     */
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    /**
     * 벡터 뺄셈 (새 벡터 반환)
     */
    static sub(a, b) {
        return new Vector2(a.x - b.x, a.y - b.y);
    }

    /**
     * 스칼라 곱
     */
    mul(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    /**
     * 스칼라 곱 (새 벡터 반환)
     */
    static mul(v, scalar) {
        return new Vector2(v.x * scalar, v.y * scalar);
    }

    /**
     * 스칼라 나눗셈
     */
    div(scalar) {
        if (scalar !== 0) {
            this.x /= scalar;
            this.y /= scalar;
        }
        return this;
    }

    /**
     * 벡터 크기 (길이)
     */
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * 벡터 크기 제곱 (성능 최적화용)
     */
    magnitudeSquared() {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * 정규화 (단위 벡터로 변환)
     */
    normalize() {
        const mag = this.magnitude();
        if (mag > 0) {
            this.x /= mag;
            this.y /= mag;
        }
        return this;
    }

    /**
     * 정규화된 벡터 반환 (원본 유지)
     */
    normalized() {
        const mag = this.magnitude();
        if (mag > 0) {
            return new Vector2(this.x / mag, this.y / mag);
        }
        return new Vector2();
    }

    /**
     * 두 점 사이의 거리
     */
    distanceTo(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 두 점 사이의 거리 제곱 (성능 최적화용)
     */
    distanceToSquared(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return dx * dx + dy * dy;
    }

    /**
     * 내적 (Dot product)
     */
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    /**
     * 외적의 Z 성분 (Cross product - 2D에서는 스칼라)
     */
    cross(v) {
        return this.x * v.y - this.y * v.x;
    }

    /**
     * 각도 계산 (라디안)
     */
    angle() {
        return Math.atan2(this.y, this.x);
    }

    /**
     * 다른 벡터와의 각도 차이 (라디안)
     */
    angleTo(v) {
        return Math.atan2(v.y - this.y, v.x - this.x);
    }

    /**
     * 벡터 회전 (라디안)
     */
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = this.x * cos - this.y * sin;
        const y = this.x * sin + this.y * cos;
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * 선형 보간 (Linear interpolation)
     */
    lerp(v, t) {
        this.x += (v.x - this.x) * t;
        this.y += (v.y - this.y) * t;
        return this;
    }

    /**
     * 선형 보간 (새 벡터 반환)
     */
    static lerp(a, b, t) {
        return new Vector2(
            a.x + (b.x - a.x) * t,
            a.y + (b.y - a.y) * t
        );
    }

    /**
     * 벡터 크기 제한
     */
    clampMagnitude(max) {
        const mag = this.magnitude();
        if (mag > max) {
            this.normalize().mul(max);
        }
        return this;
    }

    /**
     * 값 범위 제한
     */
    clamp(min, max) {
        this.x = Math.max(min.x, Math.min(max.x, this.x));
        this.y = Math.max(min.y, Math.min(max.y, this.y));
        return this;
    }

    /**
     * 반사 벡터 계산
     */
    reflect(normal) {
        const dot = this.dot(normal) * 2;
        return new Vector2(
            this.x - normal.x * dot,
            this.y - normal.y * dot
        );
    }

    /**
     * 동등 비교
     */
    equals(v) {
        return this.x === v.x && this.y === v.y;
    }

    /**
     * 근사 동등 비교
     */
    equalsApprox(v, epsilon = 0.0001) {
        return Math.abs(this.x - v.x) < epsilon && Math.abs(this.y - v.y) < epsilon;
    }

    /**
     * 제로 벡터 여부
     */
    isZero() {
        return this.x === 0 && this.y === 0;
    }

    /**
     * 문자열 변환
     */
    toString() {
        return `Vector2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }

    /**
     * 배열로 변환
     */
    toArray() {
        return [this.x, this.y];
    }

    /**
     * 객체로 변환
     */
    toObject() {
        return { x: this.x, y: this.y };
    }

    // 정적 팩토리 메서드

    /**
     * 제로 벡터
     */
    static zero() {
        return new Vector2(0, 0);
    }

    /**
     * 단위 벡터 (1, 1)
     */
    static one() {
        return new Vector2(1, 1);
    }

    /**
     * 위 방향 벡터
     */
    static up() {
        return new Vector2(0, -1);
    }

    /**
     * 아래 방향 벡터
     */
    static down() {
        return new Vector2(0, 1);
    }

    /**
     * 왼쪽 방향 벡터
     */
    static left() {
        return new Vector2(-1, 0);
    }

    /**
     * 오른쪽 방향 벡터
     */
    static right() {
        return new Vector2(1, 0);
    }

    /**
     * 각도로부터 방향 벡터 생성 (라디안)
     */
    static fromAngle(angle) {
        return new Vector2(Math.cos(angle), Math.sin(angle));
    }

    /**
     * 랜덤 방향 벡터 생성
     */
    static random() {
        const angle = Math.random() * Math.PI * 2;
        return new Vector2(Math.cos(angle), Math.sin(angle));
    }

    /**
     * 범위 내 랜덤 위치 생성
     */
    static randomInRange(minX, maxX, minY, maxY) {
        return new Vector2(
            minX + Math.random() * (maxX - minX),
            minY + Math.random() * (maxY - minY)
        );
    }

    /**
     * 원 내부 랜덤 위치 생성
     */
    static randomInCircle(center, radius) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * radius;
        return new Vector2(
            center.x + Math.cos(angle) * r,
            center.y + Math.sin(angle) * r
        );
    }
}
