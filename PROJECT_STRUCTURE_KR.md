# Mind App 프로젝트 최종 구조 문서

이 문서는 현재 코드 기준으로 프로젝트 구조, 실행 방법, 데이터 흐름, 삭제/정리 결과를 정리한 메인 문서입니다.

## 1. 프로젝트 목적

이 프로젝트의 현재 목표는 사용자가 GPT처럼 텍스트를 입력하면 React 프론트엔드에서 Flask 백엔드로 전달하고, Flask가 MongoDB에 채팅 내용을 저장하는 구조를 만드는 것입니다.

현재는 AI 모델 연결을 목표로 하지 않습니다. AI 모델 관련 실험 코드는 제거했고, 문자 채팅은 고정 안내 응답과 함께 MongoDB에 저장되도록 정리했습니다.

저장되는 AI 안내 문구:

```text
지금은 AI 모델이 연결되어 있지 않지만, 입력한 내용은 저장되었습니다.
```

## 2. 삭제한 파일 목록

아래 파일은 정리 과정에서 삭제했습니다.

```text
AI_PIPELINE.md
backend/README.md
backend/app/services/ai_pipeline.py
backend/app/services/audio_cache.py
backend/app/services/kobert_service.py
backend/app/services/kogpt_service.py
backend/app/services/kospeech_service.py
```

삭제 이유:

- `AI_PIPELINE.md`: 실험/가이드성 AI 문서였고 메인 문서와 중복되었습니다.
- `backend/README.md`: 오래된 기본 안내 문서였고 현재 구조/API를 충분히 반영하지 않았습니다.
- AI 서비스 파일들: 현재 목표인 "문자 입력 -> 백엔드 -> MongoDB 저장"에는 필수가 아니었습니다.
- 음성/STT 관련 코드는 현재 프론트 UI에서 실제 호출되지 않았고, 목표 기능 범위 밖이었습니다.

## 3. AI 관련 코드 제거/유지 결과

제거한 것:

```text
AI 파이프라인
KoBERT 감정 분석 서비스
KoGPT 응답 생성 서비스
Whisper/STT 서비스
음성 임시 캐시
음성 채팅 API
프론트 sendVoiceMessage 함수
AI 관련 Python 패키지 의존성
```

유지한 것:

```text
POST /api/users/<user_id>/chats/messages
GET /api/users/<user_id>/chats
DELETE /api/users/<user_id>/chats/<chat_id>
MongoDB chat_sessions 저장 흐름
고정 fallback 응답 저장
```

현재 문자 채팅 저장 기능은 AI 모델 없이 동작하도록 정리되었습니다.

## 4. 현재 실제 파일 구조

```text
mind_app/
  .env
  .gitignore
  .codexignore
  .claudeignore
  index.html
  package.json
  package-lock.json
  postcss.config.js
  tailwind.config.js
  vite.config.js
  PROJECT_STRUCTURE_KR.md

  src/
    App.jsx
    index.css
    main.jsx

    assets/
      avatars/
        avatar-blue.png
        avatar-gold.png
        avatar-green.png

    components/
      SlimeAvatar.jsx
      login/
        LoginActions.jsx
        LoginCard.jsx
        LoginField.jsx

    layouts/
      AppShell.jsx

    lib/
      api.js
      authStorage.js
      chatStorage.js
      socialAuth.js
      theme.js
      useCurrentUser.js

    pages/
      CounselingPage.jsx
      GamePage.jsx
      LoginPage.jsx
      OnboardingPage.jsx
      SettingsPage.jsx
      SocialCallbackPage.jsx

    sections/
      ChatHistoryPanel.jsx
      ChatPanel.jsx
      CompanionPanel.jsx
      EmotionAnalysisPanel.jsx
      SupportPanel.jsx

    services/
      chatService.js
      profileService.js

    storage/
      authStorage.js
      chatStorage.js

    utils/
      chatFormat.js

  backend/
    .env
    requirements.txt
    run.py

    app/
      __init__.py
      config.py
      db.py
      utils.py

      repositories/
        chat_repository.py
        user_repository.py

      routes/
        auth.py
        chats.py
        health.py
        users.py

      services/
        auth_service.py
        chat_service.py
        errors.py
        user_service.py
```

## 5. 현재 구현 기능

현재 코드 기준으로 구현된 기능:

- React 라우팅
- 로그인 페이지
- 카카오/네이버/구글 로그인 URL 생성
- Flask OAuth 로그인 시작/콜백 처리
- 로그인 사용자 MongoDB `users` 저장 또는 갱신
- 로그인 후 프론트 콜백 페이지에서 사용자 정보 조회
- 사용자 정보를 브라우저 localStorage에 저장
- 온보딩 프로필 저장
- 설정 페이지 프로필 저장
- 로그인 사용자 채팅 MongoDB 저장
- 로그인 사용자 채팅 목록 조회
- 로그인 사용자 채팅 삭제
- 게스트 사용자 채팅 localStorage 저장
- 문자 입력 시 고정 안내 응답과 함께 채팅 저장

## 6. 아직 미완성인 기능

현재 코드 기준 미완성 또는 실제 데이터와 연결되지 않은 기능:

- 실제 AI 모델 응답 생성
- 감정 분석 모델 연결
- 음성 녹음 UI
- 음성 메시지 API
- 분석 화면의 실제 MongoDB 데이터 연동
- 날짜별 감정 통계 API
- 자동 테스트 코드
- 깨진 한글 UI 문구 정리

## 7. 전체 기술 구조

```text
React frontend
  -> fetch API
  -> Flask backend
  -> Service layer
  -> Repository layer
  -> MongoDB
```

로그인 사용자는 MongoDB에 저장됩니다.

게스트 사용자는 브라우저 localStorage에 저장됩니다.

## 8. React 프론트엔드 구조

진입점:

```text
src/main.jsx
```

라우팅:

```text
src/App.jsx
```

라우트:

```text
/                         -> /login
/login                    -> LoginPage
/onboarding               -> OnboardingPage
/auth/:provider/callback  -> SocialCallbackPage
/counseling               -> CounselingPage
/analysis                 -> GamePage
/settings                 -> SettingsPage
/game                     -> /analysis
```

채팅 화면 상태 중심:

```text
src/layouts/AppShell.jsx
```

채팅 입력 UI:

```text
src/sections/ChatPanel.jsx
```

백엔드 API 호출:

```text
src/lib/api.js
```

로그인 사용자/게스트 사용자 채팅 저장 분기:

```text
src/services/chatService.js
```

## 9. Flask 백엔드 구조

백엔드 실행 진입점:

```text
backend/run.py
```

Flask 앱 생성:

```text
backend/app/__init__.py
```

등록되는 Blueprint:

```text
health_bp -> /api
auth_bp   -> /api/auth
users_bp  -> /api/users
chats_bp  -> /api/users
```

주요 API 파일:

```text
backend/app/routes/auth.py
backend/app/routes/users.py
backend/app/routes/chats.py
backend/app/routes/health.py
```

MongoDB 접근 파일:

```text
backend/app/repositories/user_repository.py
backend/app/repositories/chat_repository.py
```

## 10. MongoDB 구조

MongoDB 연결:

```text
backend/app/db.py
```

환경변수:

```text
MONGO_URI
MONGO_DATABASE_NAME
```

사용 컬렉션:

```text
users
chat_sessions
```

`users`에는 소셜 로그인 사용자와 프로필 설정이 저장됩니다.

`chat_sessions`에는 로그인 사용자의 채팅 세션이 저장됩니다.

## 11. React -> Flask -> MongoDB 데이터 흐름

사용자가 상담 화면에서 문자를 입력하면 다음 순서로 이동합니다.

```text
src/sections/ChatPanel.jsx
  -> handleSubmit()
  -> onSendMessage(text)

src/layouts/AppShell.jsx
  -> handleSendMessage(text)
  -> sendChatMessage(currentUser, selectedChatId, text)

src/services/chatService.js
  -> 로그인 사용자면 appendUserChatMessage(user.id, { chatId, text })
  -> 게스트 사용자면 appendGuestChatMessage(text, chatId)

src/lib/api.js
  -> POST /api/users/{userId}/chats/messages

backend/app/routes/chats.py
  -> append_chat_message_route(user_id)

backend/app/services/chat_service.py
  -> append_chat_message(user_id, payload)
  -> user_message 생성
  -> fallback ai_message 생성
  -> insert_chat 또는 update_chat_messages

backend/app/repositories/chat_repository.py
  -> db.chat_sessions.insert_one(...)
  또는
  -> db.chat_sessions.find_one_and_update(...)
```

새 채팅 저장 형태:

```javascript
{
  userId: ObjectId("..."),
  title: "사용자 입력 앞 24자",
  messages: [
    {
      id: "...",
      sender: "user",
      text: "사용자가 입력한 내용",
      createdAt: ISODate("...")
    },
    {
      id: "...",
      sender: "ai",
      text: "지금은 AI 모델이 연결되어 있지 않지만, 입력한 내용은 저장되었습니다.",
      emotion: {},
      createdAt: ISODate("...")
    }
  ],
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

## 12. localStorage와 MongoDB 차이

### localStorage

브라우저 내부 저장소입니다.

현재 사용하는 키:

```text
mindbridge-current-user
mindbridge-guest-user
mindbridge-guest-chats
```

사용 위치:

```text
src/storage/authStorage.js
src/storage/chatStorage.js
```

게스트 사용자 정보와 게스트 채팅은 localStorage에 저장됩니다.

### MongoDB

백엔드 서버가 연결하는 실제 데이터베이스입니다.

사용 위치:

```text
backend/app/repositories/user_repository.py
backend/app/repositories/chat_repository.py
```

로그인 사용자 정보와 로그인 사용자 채팅은 MongoDB에 저장됩니다.

## 13. 로그인 흐름

프론트 로그인 URL 생성:

```text
src/lib/socialAuth.js
```

백엔드 로그인 API:

```text
GET /api/auth/kakao/login
GET /api/auth/kakao/callback

GET /api/auth/naver/login
GET /api/auth/naver/callback

GET /api/auth/google/login
GET /api/auth/google/callback
```

OAuth 처리:

```text
backend/app/services/auth_service.py
```

사용자 DB 저장:

```text
backend/app/repositories/user_repository.py
  -> upsert_social_user(...)
```

로그인 후 프론트 콜백 처리:

```text
src/pages/SocialCallbackPage.jsx
```

전체 흐름:

```text
1. 사용자가 로그인 버튼 클릭
2. React가 /api/auth/{provider}/login 으로 이동
3. Flask가 provider 로그인 페이지로 redirect
4. provider가 Flask callback으로 code 전달
5. Flask가 code로 access_token 요청
6. Flask가 provider 프로필 조회
7. Flask가 users 컬렉션에 upsert
8. Flask가 /auth/{provider}/callback 으로 redirect
9. React가 userId로 GET /api/users/{userId} 호출
10. React가 localStorage에 current user 저장
11. onboarding 상태에 따라 /onboarding 또는 /counseling 이동
```

## 14. API 목록

### Health

```text
GET /api/health
```

### Auth

```text
GET /api/auth/kakao/login
GET /api/auth/kakao/callback
GET /api/auth/naver/login
GET /api/auth/naver/callback
GET /api/auth/google/login
GET /api/auth/google/callback
```

### Users

```text
POST /api/users/onboarding
GET /api/users/<user_id>
PATCH /api/users/<user_id>/profile
```

### Chats

```text
GET /api/users/<user_id>/chats
POST /api/users/<user_id>/chats/messages
DELETE /api/users/<user_id>/chats/<chat_id>
```

음성 API는 제거했습니다.

## 15. .env / ignore 상태

### 확인한 파일

```text
.gitignore
.codexignore
.claudeignore
.env
backend/.env
```

env 예시 파일은 현재 확인되지 않았습니다.

### Git 추적 상태

확인 결과:

```text
.env          -> Git 추적 대상 아님
backend/.env  -> Git 추적 대상 아님
.gitignore    -> Git 추적 대상
.codexignore  -> 현재 Git 미추적
.claudeignore -> 현재 Git 미추적
```

### 루트 `.env` 변수 이름

실제 값은 문서에 기록하지 않습니다. 확인한 변수 이름만 정리합니다.

```text
VITE_API_BASE_URL
VITE_KAKAO_CLIENT_ID
VITE_KAKAO_REDIRECT_URI
VITE_NAVER_CLIENT_ID
VITE_NAVER_REDIRECT_URI
VITE_NAVER_STATE
VITE_GOOGLE_CLIENT_ID
VITE_GOOGLE_REDIRECT_URI
```

주의:

프론트의 `VITE_*` 값은 빌드된 브라우저 코드에 노출될 수 있습니다. 따라서 `CLIENT_SECRET`, DB 비밀번호, 서버 비밀키 같은 값은 절대 루트 프론트 `.env`에 넣으면 안 됩니다.

### `backend/.env` 변수 이름

실제 값은 문서에 기록하지 않습니다. 확인한 변수 이름만 정리합니다.

```text
FLASK_ENV
FLASK_DEBUG
PORT
MONGO_URI
MONGO_DATABASE_NAME
APP_SECRET_KEY
ALLOWED_ORIGINS
FRONTEND_URL
KAKAO_CLIENT_ID
KAKAO_CLIENT_SECRET
KAKAO_REDIRECT_URI
NAVER_CLIENT_ID
NAVER_CLIENT_SECRET
NAVER_REDIRECT_URI
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
```

### ignore 정리 결과

`.gitignore`, `.codexignore`, `.claudeignore`에 환경변수 파일과 민감 파일 패턴을 추가했습니다.

주요 제외 대상:

```text
.env
.env.*
**/.env
**/.env.*
backend/.env
backend/.env.*
*.pem
*.key
*secret*
*credential*
*token*
*apikey*
*api_key*
*client_secret*
node_modules/
dist/
backend/.venv/
__pycache__/
```

예시 파일은 허용하도록 예외를 두었습니다.

```text
!.env.example
!.env.sample
!backend/.env.example
!backend/.env.sample
```

### 민감정보 노출 가능성

현재 `.env`와 `backend/.env`는 Git 추적 대상이 아니고 ignore에도 포함되어 있습니다.

다만 이미 Codex/Claude 같은 도구가 파일 읽기 권한을 가진 작업공간에서 실행되면, 사용자가 요청한 작업 범위에 따라 로컬 파일 접근이 가능할 수 있습니다. 그래서 시크릿 값은 문서나 채팅에 출력하지 않는 방식으로 관리해야 합니다.

비밀번호나 client secret을 바꿀 예정이라면 다음을 권장합니다.

```text
1. 카카오/네이버/구글 개발자 콘솔에서 기존 secret 재발급 또는 폐기
2. backend/.env에 새 secret 입력
3. 루트 .env에는 secret을 넣지 않기
4. MongoDB Atlas 비밀번호도 노출 가능성이 걱정되면 재발급
5. Git에 과거 커밋으로 secret이 올라간 적이 있는지 git log 기준 별도 점검
```

## 16. React 실행 방법

프로젝트 루트에서 실행합니다.

```bash
npm install
npm run dev
```

기본 주소:

```text
http://localhost:5173
```

## 17. Flask 실행 방법

백엔드는 `backend` 폴더에서 실행합니다.

```bash
cd backend
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
py run.py
```

이미 가상환경과 패키지가 준비되어 있다면:

```bash
cd backend
python run.py
```

기본 주소:

```text
http://localhost:5000
```

상태 확인:

```text
http://localhost:5000/api/health
```

## 18. MongoDB 실행 방법

로컬 MongoDB를 사용한다면 MongoDB 서버를 별도로 실행해야 합니다.

```bash
mongod
```

또는 DB 경로를 지정합니다.

```bash
mongod --dbpath C:\data\db
```

`backend/.env` 예시:

```env
MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE_NAME=mind_app
```

Atlas를 사용한다면:

```env
MONGO_URI=mongodb+srv://USER:PASSWORD@CLUSTER_HOST/mind_app
MONGO_DATABASE_NAME=mind_app
```

## 19. IntelliJ에서 실행하는 방법

IntelliJ에서 실행해도 괜찮습니다.

추천 방식:

```text
1. 프로젝트 루트 mind_app 열기
2. Python interpreter를 backend/.venv로 설정
3. Run Configuration 생성
4. Script path: backend/run.py
5. Working directory: backend
6. backend/.env 파일 준비
7. 실행
```

주의:

`backend/app/config.py`는 `backend/.env`를 읽도록 되어 있습니다. Working directory가 달라도 코드상 env 경로는 `backend/.env` 기준입니다.

## 20. VS Code에서 실행하는 방법

VS Code로 열어서 실행해도 괜찮습니다.

추천 방식:

```text
1. VS Code에서 프로젝트 루트 mind_app 열기
2. Python 확장 설치
3. 인터프리터를 backend/.venv로 선택
4. 터미널 1에서 backend 실행
5. 터미널 2에서 frontend 실행
```

백엔드:

```bash
cd backend
.venv\Scripts\Activate.ps1
python run.py
```

프론트:

```bash
npm run dev
```

## 21. IntelliJ와 VS Code 중 어떤 방식이 편한가

현재 프로젝트는 React와 Flask가 분리되어 있으므로 VS Code가 더 단순할 수 있습니다.

이유:

- 루트에서 프론트 터미널 실행이 쉽습니다.
- `backend` 폴더에서 백엔드 터미널을 따로 실행하기 쉽습니다.
- React, Python, env 파일을 동시에 보기 편합니다.

IntelliJ도 사용 가능합니다. 이미 IntelliJ에서 Python 가상환경으로 백엔드를 켜고 있었다면 그 방식도 유지해도 됩니다.

정리하면:

```text
프론트/백을 터미널로 빠르게 같이 실행: VS Code 추천
Python Run Configuration 중심으로 관리: IntelliJ도 가능
```

## 22. Python 가상환경은 꼭 필요한가

필수는 아니지만 강력히 권장합니다.

이유:

- Flask, PyMongo 같은 백엔드 패키지를 프로젝트별로 분리할 수 있습니다.
- 전역 Python 환경 오염을 줄일 수 있습니다.
- IntelliJ와 VS Code 모두 가상환경을 선택해서 실행할 수 있습니다.

권장 위치:

```text
backend/.venv
```

`.gitignore`, `.codexignore`, `.claudeignore`에서 `backend/.venv/`는 제외했습니다.

## 23. 개발 시 추천 실행 순서

```text
1. MongoDB 실행 또는 Atlas 연결 확인
2. backend/.env 확인
3. backend 폴더에서 가상환경 활성화
4. Flask 실행
5. 프로젝트 루트에서 npm run dev 실행
6. http://localhost:5173 접속
7. 로그인 또는 게스트 흐름 테스트
8. 상담 화면에서 문자 입력
9. MongoDB chat_sessions 저장 확인
```

## 24. MongoDB 저장 확인 방법

MongoDB Shell 또는 Compass에서 확인합니다.

```javascript
use mind_app
db.users.find()
db.chat_sessions.find()
```

최신 채팅순:

```javascript
db.chat_sessions.find().sort({ updatedAt: -1 })
```

특정 사용자 채팅:

```javascript
db.chat_sessions.find({ userId: ObjectId("USER_OBJECT_ID") })
```

## 25. 처음 보는 사람을 위한 코드 읽는 순서

전체 흐름:

```text
1. src/main.jsx
2. src/App.jsx
3. src/layouts/AppShell.jsx
4. src/sections/ChatPanel.jsx
5. src/services/chatService.js
6. src/lib/api.js
7. backend/run.py
8. backend/app/__init__.py
9. backend/app/routes/chats.py
10. backend/app/services/chat_service.py
11. backend/app/repositories/chat_repository.py
12. backend/app/db.py
```

로그인 흐름:

```text
1. src/lib/socialAuth.js
2. backend/app/routes/auth.py
3. backend/app/services/auth_service.py
4. backend/app/repositories/user_repository.py
5. src/pages/SocialCallbackPage.jsx
6. src/storage/authStorage.js
```

## 26. 건드릴 때 조심해야 할 핵심 파일

```text
src/lib/api.js
  프론트 API 경로 정의

src/services/chatService.js
  로그인 사용자와 게스트 사용자 저장 분기

src/storage/authStorage.js
  현재 사용자 localStorage 저장

src/layouts/AppShell.jsx
  채팅 목록, 선택된 채팅, 메시지 전송 상태 관리

backend/app/__init__.py
  Flask 앱 생성, CORS, DB 연결, 라우트 등록

backend/app/config.py
  env 설정 로드

backend/app/db.py
  MongoDB 연결

backend/app/routes/chats.py
  채팅 API

backend/app/services/chat_service.py
  채팅 저장 로직

backend/app/repositories/chat_repository.py
  MongoDB chat_sessions 직접 접근

backend/app/routes/auth.py
backend/app/services/auth_service.py
  소셜 로그인 흐름
```

## 27. localStorage 로그인 보안 주의

현재 프로토타입에서는 로그인 사용자 정보를 localStorage에 저장합니다.

localStorage는 브라우저에 남기 때문에 공용 PC에서는 로그아웃이 필요합니다. 사용자가 보호 페이지에서 브라우저 뒤로가기를 누르거나 로그아웃 버튼을 누를 때 확인창을 띄우고, 확인하면 저장된 사용자 정보를 삭제한 뒤 `/login`으로 이동하도록 처리합니다.

실서비스에서는 localStorage에 로그인 세션 정보를 오래 보관하는 방식보다 httpOnly cookie 또는 서버 세션 방식이 더 안전합니다.
