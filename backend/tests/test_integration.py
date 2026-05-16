"""
통합 테스트 — FastAPI 서버 전체를 Mock 모델로 테스트

실행 방법:
    cd backend
    pytest tests/test_integration.py -v

실제 모델을 쓰고 싶으면 USE_REAL_MODELS=true pytest ... 로 실행
"""

import io
import os
import sys
from unittest.mock import patch, MagicMock

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

USE_REAL_MODELS = os.getenv("USE_REAL_MODELS", "false").lower() == "true"


def make_mock_models():
    """테스트용 Mock 모델 3개 생성"""
    mock_stt = MagicMock()
    mock_stt.is_loaded.return_value = True
    mock_stt.transcribe.return_value = "오늘 정말 힘들었어요. 친구랑 싸웠거든요."

    mock_emotion = MagicMock()
    mock_emotion.is_loaded.return_value = True
    mock_emotion.classify.return_value = {"label": "슬픔", "score": 0.87}

    mock_chat = MagicMock()
    mock_chat.is_loaded.return_value = True
    mock_chat.generate.return_value = "많이 힘드셨겠어요. 친구와의 갈등은 마음이 무거울 수 있죠."

    return mock_stt, mock_emotion, mock_chat


# ── 테스트 클라이언트 준비 ────────────────────────────────────────────

@pytest.fixture(scope="module")
def client():
    """Mock 모델이 주입된 FastAPI TestClient"""
    if USE_REAL_MODELS:
        # 실제 모델 사용 (시간 오래 걸림)
        from main import app
        with TestClient(app) as c:
            yield c
    else:
        # Mock 모델 주입
        mock_stt, mock_emotion, mock_chat = make_mock_models()
        with patch("models.stt.stt_model", mock_stt), \
             patch("models.emotion.emotion_model", mock_emotion), \
             patch("models.chat.chat_model", mock_chat), \
             patch("routers.diary.stt_model", mock_stt), \
             patch("routers.diary.emotion_model", mock_emotion), \
             patch("routers.diary.chat_model", mock_chat):

            # lifespan의 model.load() 도 Mock 처리
            with patch("main.stt_model", mock_stt), \
                 patch("main.emotion_model", mock_emotion), \
                 patch("main.chat_model", mock_chat):
                from main import app
                with TestClient(app) as c:
                    yield c


# ═══════════════════════════════════════════════════════
# 1. 헬스체크 테스트
# ═══════════════════════════════════════════════════════

class TestHealthCheck:

    def test_health_returns_200(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200

    def test_health_response_structure(self, client):
        data = client.get("/api/health").json()
        assert "status" in data
        assert "models_loaded" in data
        assert "stt" in data["models_loaded"]
        assert "emotion" in data["models_loaded"]
        assert "chat" in data["models_loaded"]

    def test_health_status_ok(self, client):
        data = client.get("/api/health").json()
        assert data["status"] == "ok"


# ═══════════════════════════════════════════════════════
# 2. 일기 분석 API 테스트
# ═══════════════════════════════════════════════════════

class TestDiaryAnalyze:

    def _make_audio_file(self, filename="test.wav", content_type="audio/wav"):
        """테스트용 더미 오디오 파일 생성"""
        return ("audio", (filename, io.BytesIO(b"dummy audio data"), content_type))

    def test_analyze_returns_200(self, client):
        """정상 요청 시 200 반환"""
        response = client.post(
            "/api/diary/analyze",
            files=[self._make_audio_file()],
        )
        assert response.status_code == 200

    def test_analyze_response_has_required_fields(self, client):
        """응답 JSON에 필수 필드가 모두 있는지 확인"""
        data = client.post(
            "/api/diary/analyze",
            files=[self._make_audio_file()],
        ).json()

        assert "transcript" in data
        assert "emotion" in data
        assert "ai_response" in data
        assert "processing_time_ms" in data

    def test_analyze_emotion_has_label_and_score(self, client):
        """감정 결과에 label과 score가 있는지 확인"""
        data = client.post(
            "/api/diary/analyze",
            files=[self._make_audio_file()],
        ).json()

        assert "label" in data["emotion"]
        assert "score" in data["emotion"]
        assert isinstance(data["emotion"]["score"], float)

    def test_analyze_transcript_is_string(self, client):
        """transcript가 문자열인지 확인"""
        data = client.post(
            "/api/diary/analyze",
            files=[self._make_audio_file()],
        ).json()
        assert isinstance(data["transcript"], str)
        assert len(data["transcript"]) > 0

    def test_analyze_processing_time_positive(self, client):
        """처리 시간이 양수인지 확인"""
        data = client.post(
            "/api/diary/analyze",
            files=[self._make_audio_file()],
        ).json()
        assert data["processing_time_ms"] >= 0

    def test_analyze_webm_accepted(self, client):
        """webm 형식도 허용되는지 확인"""
        response = client.post(
            "/api/diary/analyze",
            files=[self._make_audio_file("test.webm", "audio/webm")],
        )
        assert response.status_code == 200

    def test_analyze_mp3_accepted(self, client):
        """mp3 형식도 허용되는지 확인"""
        response = client.post(
            "/api/diary/analyze",
            files=[self._make_audio_file("test.mp3", "audio/mpeg")],
        )
        assert response.status_code == 200

    def test_analyze_invalid_file_type_returns_400(self, client):
        """이미지 파일 등 잘못된 형식은 400 반환"""
        response = client.post(
            "/api/diary/analyze",
            files=[self._make_audio_file("test.jpg", "image/jpeg")],
        )
        assert response.status_code == 400

    def test_analyze_no_file_returns_422(self, client):
        """파일 없이 요청 시 422 Unprocessable Entity 반환"""
        response = client.post("/api/diary/analyze")
        assert response.status_code == 422

    def test_analyze_mock_values_correct(self, client):
        """Mock 모델 반환값이 응답에 그대로 나오는지 확인"""
        data = client.post(
            "/api/diary/analyze",
            files=[self._make_audio_file()],
        ).json()

        # Mock에서 설정한 값과 일치해야 함
        assert data["transcript"] == "오늘 정말 힘들었어요. 친구랑 싸웠거든요."
        assert data["emotion"]["label"] == "슬픔"
        assert data["emotion"]["score"] == 0.87
        assert "힘드셨겠어요" in data["ai_response"]
