from pydantic import BaseModel


class EmotionResult(BaseModel):
    """감정 분석 결과 스키마"""
    label: str          # 감정 라벨 (예: 기쁨, 슬픔, 분노)
    score: float        # 신뢰도 점수 (0.0 ~ 1.0)


class DiaryAnalyzeResponse(BaseModel):
    """일기 분석 전체 응답 스키마"""
    transcript: str             # STT 변환 텍스트
    emotion: EmotionResult      # 감정 분석 결과
    ai_response: str            # KoGPT 공감 응답
    processing_time_ms: int     # 전체 처리 시간 (밀리초)


class HealthResponse(BaseModel):
    """서버 상태 확인 응답 스키마"""
    status: str
    models_loaded: dict         # 각 모델 로드 여부
