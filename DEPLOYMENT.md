# Star Siege - 배포 가이드

## 개요
Star Siege는 HTML5 Canvas 기반의 모바일 RTS 게임입니다. PWA와 Capacitor를 통해 웹, iOS, Android 플랫폼에 배포할 수 있습니다.

## 요구 사항

### 공통
- Node.js 18+
- npm 9+

### Android 빌드
- Android Studio
- JDK 17+
- Android SDK (API 34+)

### iOS 빌드
- macOS
- Xcode 15+
- CocoaPods

## 설치

```bash
# 의존성 설치
npm install

# Capacitor 초기화 (처음 한 번만)
npm run cap:init
```

## PWA 배포 (웹)

게임은 이미 PWA로 구성되어 있습니다.

1. 파일을 웹 서버에 업로드
2. HTTPS 활성화 필요
3. Service Worker가 자동으로 오프라인 지원

### 로컬 테스트
```bash
npm start
# http://localhost:3000 에서 확인
```

## Android 배포

### 1. Android 플랫폼 추가
```bash
npm run cap:add:android
```

### 2. 네이티브 프로젝트 동기화
```bash
npm run cap:sync
```

### 3. Android Studio에서 열기
```bash
npm run cap:open:android
```

### 4. 앱 아이콘 설정
`android/app/src/main/res/` 디렉토리에 각 해상도별 아이콘 추가:
- mipmap-mdpi: 48x48
- mipmap-hdpi: 72x72
- mipmap-xhdpi: 96x96
- mipmap-xxhdpi: 144x144
- mipmap-xxxhdpi: 192x192

### 5. 스플래시 스크린 설정
`android/app/src/main/res/drawable/` 에 splash.png 추가

### 6. 릴리스 빌드
Android Studio에서:
1. Build > Generate Signed Bundle / APK
2. Android App Bundle 선택
3. 키스토어 생성/선택
4. Release 빌드

### 7. Google Play Console 업로드
- 내부 테스트 > 프로덕션 순서로 진행
- 앱 정보, 스크린샷, 설명 작성

## iOS 배포

### 1. iOS 플랫폼 추가
```bash
npm run cap:add:ios
```

### 2. 네이티브 프로젝트 동기화
```bash
npm run cap:sync
```

### 3. Xcode에서 열기
```bash
npm run cap:open:ios
```

### 4. 앱 아이콘 설정
Xcode의 Assets.xcassets > AppIcon에 아이콘 추가:
- 다양한 크기의 아이콘 필요 (20x20 ~ 1024x1024)

### 5. Bundle Identifier 설정
- Xcode > Signing & Capabilities
- Team 선택
- Bundle Identifier 확인 (com.starsiege.rts)

### 6. 릴리스 빌드
1. Product > Archive
2. Distribute App
3. App Store Connect 선택

### 7. App Store Connect 업로드
- 앱 정보, 스크린샷, 설명 작성
- TestFlight 테스트 후 심사 제출

## 인앱 구매 설정

### Google Play
1. Google Play Console > 수익 창출 > 인앱 상품
2. 상품 ID 등록 (IAP_PRODUCTS와 일치해야 함)
3. 가격 설정

### App Store
1. App Store Connect > 앱 > 인앱 구매
2. 상품 ID 등록
3. 가격 계층 설정

## 환경 설정

### 프로덕션 빌드 체크리스트
- [ ] console.log 제거 또는 비활성화
- [ ] 디버그 모드 비활성화
- [ ] 에러 리포팅 설정 (Sentry 등)
- [ ] 분석 도구 설정 (Firebase Analytics 등)
- [ ] 개인정보 처리방침 URL 준비
- [ ] 서비스 이용약관 URL 준비

### capacitor.config.json 프로덕션 설정
```json
{
  "android": {
    "webContentsDebuggingEnabled": false,
    "loggingBehavior": "none"
  }
}
```

## 업데이트 배포

### 웹 (PWA)
- 파일 업로드만으로 즉시 업데이트
- Service Worker가 자동으로 새 버전 감지

### 네이티브 앱
```bash
# 코드 변경 후
npm run cap:sync

# 스토어에 새 버전 제출
```

## 문제 해결

### Android 빌드 오류
```bash
# Gradle 캐시 정리
cd android
./gradlew clean
```

### iOS 빌드 오류
```bash
# CocoaPods 재설치
cd ios/App
pod deintegrate
pod install
```

### 화면이 흰색으로 표시
- capacitor.config.json의 webDir 확인
- index.html 경로 확인

## 리소스

- [Capacitor 공식 문서](https://capacitorjs.com/docs)
- [Android 개발자 가이드](https://developer.android.com/guide)
- [Apple 개발자 문서](https://developer.apple.com/documentation/)
