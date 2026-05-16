import logging
import os
import time

logger = logging.getLogger(__name__)


class STTModel:
    """
    Whisper 기반 한국어 음성 인식 모델
    서버 시작 시 1번만 로드하고 재사용
    """

    def __init__(self):
        self.model = None
        self.model_size = os.getenv("WHISPER_MODEL_SIZE", "medium")

    def load(self):
        """모델 로드 (서버 시작 시 1회 호출)"""
        try:
            import whisper
            logger.info(f"[STT] Whisper '{self.model_size}' 모델 로딩 중...")
            start = time.time()
            self.model = whisper.load_model(self.model_size)
            elapsed = round((time.time() - start) * 1000)
            logger.info(f"[STT] 모델 로드 완료 ({elapsed}ms)")
        except Exception as e:
            logger.error(f"[STT] 모델 로드 실패: {e}")
            raise

    def is_loaded(self) -> bool:
        return self.model is not None

    def transcribe(self, audio_path: str) -> str:
        """
        오디오 파일을 한국어 텍스트로 변환

        Args:
            audio_path: 오디오 파일 경로 (.wav / .webm / .mp3)

        Returns:
            변환된 한국어 텍스트
        """
        if not self.is_loaded():
            raise RuntimeError("STT 모델이 로드되지 않았습니다.")

        logger.info(f"[STT] 변환 시작: {audio_path}")
        start = time.time()

        # language="ko" 로 한국어 강제 지정
        result = self.model.transcribe(audio_path, language="ko")
        text = result["text"].strip()

        elapsed = round((time.time() - start) * 1000)
        logger.info(f"[STT] 변환 완료 ({elapsed}ms): '{text[:50]}...'")

        return text


# 싱글톤 인스턴스 (main.py에서 import해서 사용)
stt_model = STTModel()
