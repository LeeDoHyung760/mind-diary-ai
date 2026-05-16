"""
유닛 테스트 — 실제 AI 모델 없이 Mock으로 빠르게 검증

실행 방법:
    cd backend
    pip install pytest pytest-asyncio httpx
    pytest tests/test_unit.py -v
"""

import io
import os
import sys
from unittest.mock import MagicMock, patch

import pytest

# backend 경로를 sys.path에 추가
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# ═══════════════════════════════════════════════════════
# 1. STT 모듈 테스트
# ═══════════════════════════════════════════════════════

class TestSTTModel:
    """Whisper STT 모델 단위 테스트"""

    def test_is_loaded_false_before_load(self):
        """로드 전에는 is_loaded가 False여야 함"""
        from models.stt import STTModel
        model = STTModel()
        assert model.is_loaded() is False

    def test_transcribe_raises_if_not_loaded(self):
        """모델 미로드 상태에서 transcribe 호출 시 RuntimeError 발생"""
        from models.stt import STTModel
        model = STTModel()
        with pytest.raises(RuntimeError, match="로드되지 않았습니다"):
            model.transcribe("dummy.wav")

    def test_transcribe_success(self, tmp_path):
        """whisper mock으로 STT 정상 동작 확인"""
        from models.stt import STTModel

        # whisper 모듈 전체를 Mock
        mock_whisper = MagicMock()
        mock_whisper.load_model.return_value = MagicMock(
            transcribe=MagicMock(return_value={"text": "  오늘 정말 힘들었어요.  "})
        )

        with patch.dict("sys.modules", {"whisper": mock_whisper}):
            model = STTModel()
            model.load()
            result = model.transcribe(str(tmp_path / "test.wav"))

        # 앞뒤 공백이 strip 되어야 함
        assert result == "오늘 정말 힘들었어요."


# ═══════════════════════════════════════════════════════
# 2. 감정 분석 모듈 테스트
# ═══════════════════════════════════════════════════════

class TestEmotionModel:
    """KoBERT 감정 분류 단위 테스트"""

    def test_is_loaded_false_before_load(self):
        from models.emotion import EmotionModel
        model = EmotionModel()
        assert model.is_loaded() is False

    def test_classify_raises_if_not_loaded(self):
        from models.emotion import EmotionModel
        model = EmotionModel()
        with pytest.raises(RuntimeError):
            model.classify("테스트 텍스트")

    def test_classify_label_mapping(self):
        """LABEL_0 같은 원시 라벨이 한국어로 변환되는지 확인"""
        from models.emotion import EmotionModel, EMOTION_LABEL_MAP

        mock_pipeline_instance = MagicMock(
            return_value=[{"label": "LABEL_0", "score": 0.91}]
        )
        mock_transformers = MagicMock()
        mock_transformers.pipeline.return_value = mock_pipeline_instance

        with patch.dict("sys.modules", {"transformers": mock_transformers}):
            model = EmotionModel()
            model.load()
            result = model.classify("오늘 너무 슬퍼요")

        assert result["label"] == EMOTION_LABEL_MAP.get("LABEL_0", "LABEL_0")
        assert 0.0 <= result["score"] <= 1.0

    def test_classify_returns_score_rounded(self):
        """score가 소수점 4자리로 반올림되는지 확인"""
        from models.emotion import EmotionModel

        mock_pipeline_instance = MagicMock(
            return_value=[{"label": "슬픔", "score": 0.876543}]
        )
        mock_transformers = MagicMock()
        mock_transformers.pipeline.return_value = mock_pipeline_instance

        with patch.dict("sys.modules", {"transformers": mock_transformers}):
            model = EmotionModel()
            model.load()
            result = model.classify("슬픈 텍스트")

        assert result["score"] == round(0.876543, 4)


# ═══════════════════════════════════════════════════════
# 3. 챗봇 모듈 테스트
# ═══════════════════════════════════════════════════════

class TestChatModel:
    """KoGPT 응답 생성 단위 테스트"""

    def test_is_loaded_false_before_load(self):
        from models.chat import ChatModel
        model = ChatModel()
        assert model.is_loaded() is False

    def test_generate_raises_if_not_loaded(self):
        from models.chat import ChatModel
        model = ChatModel()
        with pytest.raises(RuntimeError):
            model.generate("텍스트", "슬픔")

    def test_generate_extracts_after_counselor_tag(self):
        """'상담사:' 이후 텍스트만 추출하는지 확인"""
        from models.chat import ChatModel

        mock_tensor = MagicMock()
        mock_tensor.__getitem__ = MagicMock(return_value=mock_tensor)

        mock_tokenizer = MagicMock()
        mock_tokenizer.encode.return_value = mock_tensor
        mock_tokenizer.decode.return_value = (
            "감정: 슬픔\n사용자: 힘들어요\n상담사: 많이 힘드셨겠어요."
        )
        mock_tokenizer.pad_token_id = 0
        mock_tokenizer.eos_token_id = 1

        mock_model = MagicMock()
        mock_model.generate.return_value = mock_tensor

        # torch, transformers 모두 sys.modules로 Mock
        mock_torch = MagicMock()
        mock_torch.no_grad.return_value.__enter__ = MagicMock(return_value=None)
        mock_torch.no_grad.return_value.__exit__ = MagicMock(return_value=False)

        mock_transformers = MagicMock()
        mock_transformers.AutoTokenizer.from_pretrained.return_value = mock_tokenizer
        mock_transformers.AutoModelForCausalLM.from_pretrained.return_value = mock_model

        with patch.dict("sys.modules", {
            "torch": mock_torch,
            "transformers": mock_transformers,
        }):
            model = ChatModel()
            model.load()
            response = model.generate("힘들어요", "슬픔")

        assert "많이 힘드셨겠어요." in response
        assert "감정:" not in response
        assert "사용자:" not in response


# ═══════════════════════════════════════════════════════
# 4. 스키마 테스트
# ═══════════════════════════════════════════════════════

class TestSchemas:
    """Pydantic 스키마 유효성 테스트"""

    def test_emotion_result_valid(self):
        from schemas import EmotionResult
        result = EmotionResult(label="슬픔", score=0.87)
        assert result.label == "슬픔"
        assert result.score == 0.87

    def test_diary_analyze_response_valid(self):
        from schemas import DiaryAnalyzeResponse, EmotionResult
        response = DiaryAnalyzeResponse(
            transcript="오늘 힘들었어요",
            emotion=EmotionResult(label="슬픔", score=0.87),
            ai_response="많이 힘드셨겠어요.",
            processing_time_ms=1200,
        )
        assert response.transcript == "오늘 힘들었어요"
        assert response.emotion.label == "슬픔"
        assert response.processing_time_ms == 1200
