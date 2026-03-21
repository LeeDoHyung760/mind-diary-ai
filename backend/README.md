# Flask Backend

React 프론트와 분리된 Flask 백엔드입니다.

## 파일 역할

- `backend/.env`
  - 실제 실행에 쓰는 환경변수 파일
- `backend/.env.example`
  - 예시 템플릿
- `backend/app/config.py`
  - `backend/.env`를 읽어서 Flask 설정을 만듭니다
- `backend/app/routes/users.py`
  - 온보딩 저장 API가 들어 있습니다

## 어디에 뭘 넣어야 하나

`backend/.env`를 열고 아래 값들을 직접 채워 넣으면 됩니다.

- `MONGO_URI`
  - MongoDB Atlas나 로컬 MongoDB 연결 문자열
  - 예: `mongodb+srv://아이디:비밀번호@클러스터주소/DB이름`
- `MONGO_DATABASE_NAME`
  - 사용할 DB 이름
  - 예: `mind_app`
- `APP_SECRET_KEY`
  - Flask 시크릿 키
- `ALLOWED_ORIGINS`
  - 프론트 주소
  - 기본값은 `http://localhost:5173`
- `FRONTEND_URL`
  - 카카오 로그인 완료 후 다시 보낼 프론트 주소
  - 기본값은 `http://localhost:5173`

SNS 로그인을 서버에서 처리할 때만 아래도 채웁니다.

- `KAKAO_CLIENT_ID`
- `KAKAO_CLIENT_SECRET`
- `KAKAO_REDIRECT_URI`
- `NAVER_CLIENT_ID`
- `NAVER_CLIENT_SECRET`
- `NAVER_REDIRECT_URI`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`

## 실행 순서

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

기본 주소는 `http://localhost:5000`입니다.

## 현재 API

- `GET /api/health`
- `GET /api/auth/kakao/login`
- `GET /api/auth/kakao/callback`
- `POST /api/users/onboarding`
- `GET /api/users/<user_id>`
- `PATCH /api/users/<user_id>/profile`
