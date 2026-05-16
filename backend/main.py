import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import stt_model, emotion_model, chat_model
from routers import diary_router
from schemas import HealthResponse

# ── 환경변수 로드 (.env 파일) ─────────────────────────────────────────
load_dotenv()

# ── 로깅 설정 ─────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ── 서버 시작/종료 시 모델 로드/해제 ─────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    서버 시작 시 모든 AI 모델을 한 번만 로드.
    매 요청마다 로드하면 수십 초가 걸리므로 반드시 여기서 처리.
    """
    logger.info("=" * 50)
    logger.info("🚀 MindBridge AI 서버 시작 중...")
    logger.info("=" * 50)

    # 모델 순서대로 로드
    stt_model.load()
    emotion_model.load()
    chat_model.load()

    logger.info("✅ 모든 모델 로드 완료! 서버 준비됨.")
    logger.info("=" * 50)

    yield  # 서버 실행 중

    # 서버 종료 시 (필요하면 모델 메모리 해제)
    logger.info("🛑 서버 종료 중...")


# ── FastAPI 앱 생성 ────────────────────────────────────────────────────
app = FastAPI(
    title="MindBridge AI API",
    description="한국어 음성 일기 감정 분석 및 공감 응답 생성 서버",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS 설정 (React Vite 개발 서버 허용) ────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 라우터 등록 ───────────────────────────────────────────────────────
app.include_router(diary_router)


# ── 헬스체크 엔드포인트 ───────────────────────────────────────────────
@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """서버 및 모델 상태 확인"""
    return HealthResponse(
        status="ok",
        models_loaded={
            "stt": stt_model.is_loaded(),
            "emotion": emotion_model.is_loaded(),
            "chat": chat_model.is_loaded(),
        },
    )
