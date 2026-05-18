# MindBridge

React + Flask + MongoDB 기반의 감정 상담 프로토타입입니다.

사용자는 소셜 로그인 또는 게스트 체험으로 상담 화면에 진입하고, 텍스트 상담 내용을 저장할 수 있습니다. 로그인 사용자의 프로필과 채팅은 MongoDB에 저장되고, 게스트 사용자의 정보와 채팅은 브라우저 localStorage에 저장됩니다.

## 주요 기능

- 카카오, 네이버, 구글 OAuth 로그인
- 게스트 체험
- 온보딩 프로필 설정
- 상담 채팅 저장 및 조회
- 분석 페이지 감정 요약 UI
- 아바타 및 추천 음악 UI
- 보호 페이지 뒤로가기/로그아웃 확인

## 기술 스택

```text
Frontend: React, Vite, Tailwind CSS
Backend: Flask, PyMongo
Database: MongoDB
AI: KcELECTRA, EXAONE 연동 코드 포함
```

## 실행 방법

프론트엔드:

```bash
npm install
npm run dev
```

기본 주소:

```text
http://localhost:5173
```

백엔드:

```bash
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
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

## 환경 변수

백엔드는 `backend/.env`를 사용합니다.

필수 항목:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE_NAME=mind_app
APP_SECRET_KEY=replace-this-with-a-real-secret
ALLOWED_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

소셜 로그인 사용 시:

```env
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
KAKAO_REDIRECT_URI=http://localhost:5000/api/auth/kakao/callback

NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
NAVER_REDIRECT_URI=http://localhost:5000/api/auth/naver/callback

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

로컬에서 AI 모델을 끄고 백엔드만 실행하려면:

```env
ENABLE_AI_MODELS=false
```

AI 모델을 켜려면:

```env
ENABLE_AI_MODELS=true
```

단, EXAONE은 현재 CUDA GPU 환경을 전제로 합니다.

## MongoDB

사용 컬렉션:

```text
users
chat_sessions
```

로컬 MongoDB 예시:

```env
MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE_NAME=mind_app
```

MongoDB Shell 확인:

```javascript
use mind_app
db.users.find()
db.chat_sessions.find().sort({ updatedAt: -1 })
```

## 주요 경로

```text
src/App.jsx                         라우팅
src/layouts/AppShell.jsx            보호 페이지 레이아웃, 채팅 상태
src/sections/ChatPanel.jsx          상담 채팅 UI
src/sections/EmotionAnalysisPanel.jsx 분석 페이지
src/services/chatService.js         로그인/게스트 채팅 분기
src/storage/authStorage.js          사용자 localStorage
src/storage/chatStorage.js          게스트 채팅 localStorage
src/lib/api.js                      백엔드 API 호출

backend/run.py                      Flask 실행 진입점
backend/app/__init__.py             Flask 앱 생성
backend/app/config.py               환경변수 설정
backend/app/db.py                   MongoDB 연결
backend/app/routes/                 API 라우트
backend/app/services/               서비스 로직
backend/app/repositories/           MongoDB 접근
backend/models/                     AI 모델 로딩/생성
```

## API 요약

```text
GET    /api/health

GET    /api/auth/kakao/login
GET    /api/auth/kakao/callback
GET    /api/auth/naver/login
GET    /api/auth/naver/callback
GET    /api/auth/google/login
GET    /api/auth/google/callback

POST   /api/users/onboarding
GET    /api/users/<user_id>
PATCH  /api/users/<user_id>/profile

GET    /api/users/<user_id>/chats
POST   /api/users/<user_id>/chats/messages
DELETE /api/users/<user_id>/chats/<chat_id>

POST   /api/guest/chat
```

## 보안 메모

현재 프로토타입은 로그인 사용자 정보를 localStorage에 저장합니다. localStorage는 브라우저에 남기 때문에 공용 PC에서는 로그아웃이 필요합니다.

실서비스에서는 httpOnly cookie 또는 서버 세션 방식이 더 안전합니다.

`.env`, `backend/.env`, API secret, DB 비밀번호는 Git에 올리지 않습니다.

## 분석 페이지 메모

분석 페이지의 `오늘의 마음 편지` 카드 폰트는 `src/sections/EmotionAnalysisPanel.jsx`의 `letterFont`에서 조정합니다.

현재 편지 본문 폰트 크기는 `27px` 기준입니다.
