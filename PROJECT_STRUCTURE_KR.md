# 프로젝트 구조

이 문서는 현재 코드 기준의 구조와 실행 흐름만 간단히 정리합니다.

## 전체 구조

```text
mind_app/
  index.html
  package.json
  vite.config.js
  tailwind.config.js
  README.md
  PROJECT_STRUCTURE_KR.md

  src/
    main.jsx
    App.jsx
    index.css

    assets/
      avatars/

    components/
      SlimeAvatar.jsx
      login/
      music/

    layouts/
      AppShell.jsx

    lib/
      api.js
      authStorage.js
      socialAuth.js
      theme.js
      useAppPreferences.js
      useCurrentUser.js

    pages/
      LoginPage.jsx
      OnboardingPage.jsx
      SocialCallbackPage.jsx
      CounselingPage.jsx
      GamePage.jsx
      SettingsPage.jsx

    sections/
      ChatPanel.jsx
      ChatHistoryPanel.jsx
      EmotionAnalysisPanel.jsx
      CompanionPanel.jsx
      SupportPanel.jsx

    services/
      chatService.js
      profileService.js

    storage/
      authStorage.js
      chatStorage.js
      preferencesStorage.js

    utils/
      chatFormat.js
      musicHelpers.js

  backend/
    run.py
    requirements.txt
    .env

    app/
      __init__.py
      config.py
      db.py
      utils.py

      routes/
        auth.py
        chats.py
        guest.py
        health.py
        users.py

      services/
        auth_service.py
        chat_service.py
        user_service.py
        errors.py

      repositories/
        chat_repository.py
        user_repository.py

    models/
      chat.py
      emotion_kcelectra.py
      stt.py
```

## 프론트엔드 흐름

```text
src/main.jsx
  -> src/App.jsx
  -> src/layouts/AppShell.jsx
  -> src/pages/*
  -> src/sections/*
```

주요 라우트:

```text
/login                    로그인
/onboarding               온보딩
/auth/:provider/callback  소셜 로그인 콜백
/counseling               상담
/analysis                 분석
/settings                 설정
```

채팅 흐름:

```text
ChatPanel.jsx
  -> AppShell.jsx
  -> services/chatService.js
  -> lib/api.js 또는 storage/chatStorage.js
```

로그인 사용자는 백엔드 API를 통해 MongoDB에 저장합니다.

게스트 사용자는 브라우저 localStorage에 저장합니다.

## 백엔드 흐름

```text
backend/run.py
  -> app/create_app()
  -> config.py
  -> db.py
  -> routes/*
  -> services/*
  -> repositories/*
```

등록되는 주요 Blueprint:

```text
/api/health
/api/auth
/api/guest
/api/users
/api/users/<user_id>/chats
```

## 데이터 저장

MongoDB 컬렉션:

```text
users
chat_sessions
```

localStorage 키:

```text
mindbridge-current-user
mindbridge-guest-user
mindbridge-guest-chats
```

게스트 체험을 종료하거나 새 게스트 체험을 시작할 때 `mindbridge-guest-chats`를 삭제합니다.

## AI 모델

AI 모델 코드는 `backend/models/`에 있습니다.

```text
emotion_kcelectra.py  감정 분류
chat.py               EXAONE 응답 생성
stt.py                음성 인식 모델
```

로컬에서 AI 모델을 끄려면 `backend/.env`에 설정합니다.

```env
ENABLE_AI_MODELS=false
```

AI 모델을 켜려면:

```env
ENABLE_AI_MODELS=true
```

현재 EXAONE 설정은 CUDA GPU 환경을 전제로 합니다. Intel 내장 그래픽 환경에서는 AI 모델을 끄고 백엔드를 실행하는 방식이 현실적입니다.

## 실행

프론트엔드:

```bash
npm install
npm run dev
```

백엔드:

```bash
cd backend
.\.venv\Scripts\Activate.ps1
python run.py
```

백엔드 상태 확인:

```text
http://localhost:5000/api/health
```

## 주의 파일

```text
src/layouts/AppShell.jsx
  보호 페이지 레이아웃, 뒤로가기 확인, 채팅 상태

src/services/chatService.js
  로그인/게스트 채팅 분기

src/storage/authStorage.js
  사용자 localStorage

src/storage/chatStorage.js
  게스트 채팅 localStorage

backend/app/config.py
  환경변수 설정

backend/app/__init__.py
  Flask 앱 생성, AI 모델 로딩 여부

backend/app/services/chat_service.py
  로그인 사용자 채팅 저장

backend/app/routes/guest.py
  게스트 채팅 응답

backend/models/chat.py
  EXAONE 프롬프트와 max_new_tokens 설정
```

## 보안 메모

현재 프로토타입에서는 로그인 사용자 정보를 localStorage에 저장합니다. localStorage는 브라우저에 남기 때문에 공용 PC에서는 로그아웃이 필요합니다.

실서비스에서는 httpOnly cookie 또는 서버 세션 방식이 더 안전합니다.

`.env`, `backend/.env`, OAuth secret, MongoDB 비밀번호는 Git에 올리지 않습니다.
