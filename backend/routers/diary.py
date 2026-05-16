import asyncio
import logging
import os
import tempfile
import time
from functools import partial


from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

from models import stt_model, emotion_model, chat_model
from schemas import DiaryAnalyzeResponse, EmotionResult

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/diary", tags=["diary"])

# 허용 오디오 형식
ALLOWED_CONTENT_TYPES = {
    "audio/wav",
    "audio/wave",
    "audio/x-wav",
    "audio/webm",
    "audio/mpeg",
    "audio/mp3",
    "application/octet-stream",  # 일부 브라우저가 이 타입으로 보냄
}


@router.post("/analyze", response_model=DiaryAnalyzeResponse)
async def analyze_diary(audio: UploadFile = File(...)):
    """
    음성 일기 전체 분석 엔드포인트

    1. 음성 → 텍스트 (Whisper STT)
    2. 텍스트 → 감정 분류 (KoBERT)
    3. 텍스트 + 감정 → 공감 응답 생성 (KoGPT)
    """
    total_start = time.time()

    # ── 1. 파일 형식 검증 ──────────────────────────────────────────
    if audio.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"지원하지 않는 파일 형식입니다: {audio.content_type}. "
                   f"wav / webm / mp3 만 허용됩니다.",
        )

    # ── 2. 임시 파일에 오디오 저장 ────────────────────────────────
    suffix = _get_suffix(audio.filename or "audio.wav")
    tmp_path = None

    try:
        # 임시 파일 생성 (추론 후 자동 삭제)
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp_path = tmp.name
            contents = await audio.read()
            tmp.write(contents)

        logger.info(f"[API] 오디오 저장 완료: {tmp_path} ({len(contents)} bytes)")

        # ── 3. STT: 음성 → 텍스트 ────────────────────────────────
        loop = asyncio.get_event_loop()

        logger.info("[API] STT 변환 시작")
        transcript = await loop.run_in_executor(
            None, partial(stt_model.transcribe, tmp_path)
        )

        if not transcript:
            raise HTTPException(
                status_code=400,
                detail="음성에서 텍스트를 인식하지 못했습니다. 다시 녹음해주세요."
            )

        # ── 4. 감정 분류: 텍스트 → 감정 ─────────────────────────
        logger.info("[API] 감정 분류 시작")
        emotion_result = await loop.run_in_executor(
            None, partial(emotion_model.classify, transcript)
        )

        # ── 5. 응답 생성: 텍스트 + 감정 → 공감 응답 ─────────────
        logger.info("[API] 공감 응답 생성 시작")
        ai_response = await loop.run_in_executor(
            None,
            partial(chat_model.generate, transcript, emotion_result["label"]),
        )

        # ── 6. 전체 처리 시간 계산 ───────────────────────────────
        processing_time_ms = round((time.time() - total_start) * 1000)
        logger.info(f"[API] 전체 완료: {processing_time_ms}ms")

        return DiaryAnalyzeResponse(
            transcript=transcript,
            emotion=EmotionResult(
                label=emotion_result["label"],
                score=emotion_result["score"],
            ),
            ai_response=ai_response,
            processing_time_ms=processing_time_ms,
        )

    except HTTPException:
        raise  # 이미 처리된 HTTP 에러는 그대로 재발생

    except Exception as e:
        logger.error(f"[API] 분석 중 오류 발생: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"모델 추론 중 오류가 발생했습니다: {str(e)}"
        )

    finally:
        # 임시 파일 반드시 삭제
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
            logger.info(f"[API] 임시 파일 삭제: {tmp_path}")


def _get_suffix(filename: str) -> str:
    """파일명에서 확장자 추출"""
    ext = os.path.splitext(filename)[-1].lower()
    return ext if ext in {".wav", ".webm", ".mp3"} else ".wav"

class ChatRequest(BaseModel):
    text: str

class ChatResponse(BaseModel):
    ai_response: str
    emotion: EmotionResult

@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="텍스트를 입력해주세요.")
    loop = asyncio.get_event_loop()
    try:
        emotion_result = await loop.run_in_executor(
            None, partial(emotion_model.classify, req.text)
        )
        ai_response = await loop.run_in_executor(
            None, partial(chat_model.generate, req.text, emotion_result["label"])
        )
        return ChatResponse(
            ai_response=ai_response,
            emotion=EmotionResult(label=emotion_result["label"], score=emotion_result["score"]),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))