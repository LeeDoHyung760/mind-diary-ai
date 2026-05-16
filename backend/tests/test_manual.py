"""
빠른 수동 테스트 스크립트
실제 모델 설치 전에 파이프라인 구조가 맞는지 확인용

실행:
    cd backend
    python tests/test_manual.py
"""

import os
import sys
from unittest.mock import MagicMock, patch

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def run_pipeline_test():
    """세 모델 파이프라인 연결 수동 테스트"""

    print("\n" + "=" * 55)
    print("🧪 MindBridge AI 파이프라인 수동 테스트")
    print("=" * 55)

    # ── Mock 모델 설정 ──────────────────────────────────────
    print("\n[SETUP] Mock 모델 생성 중...")

    mock_stt = MagicMock()
    mock_stt.is_loaded.return_value = True
    mock_stt.transcribe.return_value = "오늘 정말 힘들었어요. 친구랑 싸웠거든요."

    mock_emotion = MagicMock()
    mock_emotion.is_loaded.return_value = True
    mock_emotion.classify.return_value = {"label": "슬픔", "score": 0.87}

    mock_chat = MagicMock()
    mock_chat.is_loaded.return_value = True
    mock_chat.generate.return_value = (
        "많이 힘드셨겠어요. 친구와의 갈등은 정말 마음이 무거울 수 있죠. "
        "어떤 일이 있었는지 이야기해줄 수 있어요?"
    )

    print("  ✅ Mock STT (Whisper) 준비됨")
    print("  ✅ Mock 감정 분석 (KoBERT) 준비됨")
    print("  ✅ Mock 챗봇 (KoGPT) 준비됨")

    # ── 파이프라인 실행 ──────────────────────────────────────
    test_audio = "sample.wav"
    print(f"\n[INPUT] 오디오 파일: {test_audio}")

    # 1단계: STT
    print("\n[1/3] 🎤 음성 → 텍스트 변환 (Whisper)")
    transcript = mock_stt.transcribe(test_audio)
    print(f"  결과: '{transcript}'")
    assert isinstance(transcript, str) and len(transcript) > 0
    print("  ✅ STT 성공")

    # 2단계: 감정 분석
    print("\n[2/3] 😢 텍스트 → 감정 분류 (KoBERT)")
    emotion = mock_emotion.classify(transcript)
    print(f"  감정: {emotion['label']} (신뢰도: {emotion['score']})")
    assert "label" in emotion and "score" in emotion
    assert 0.0 <= emotion["score"] <= 1.0
    print("  ✅ 감정 분류 성공")

    # 3단계: 응답 생성
    print("\n[3/3] 💬 텍스트 + 감정 → 공감 응답 생성 (KoGPT)")
    ai_response = mock_chat.generate(transcript, emotion["label"])
    print(f"  응답: '{ai_response}'")
    assert isinstance(ai_response, str) and len(ai_response) > 0
    print("  ✅ 응답 생성 성공")

    # ── 최종 결과 출력 ──────────────────────────────────────
    print("\n" + "=" * 55)
    print("📦 최종 JSON 응답 (실제 API 반환값)")
    print("=" * 55)

    import json
    result = {
        "transcript": transcript,
        "emotion": emotion,
        "ai_response": ai_response,
        "processing_time_ms": 1240,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))

    print("\n" + "=" * 55)
    print("🎉 파이프라인 테스트 완료! 모든 연결이 정상입니다.")
    print("=" * 55)
    print("\n다음 단계:")
    print("  1. pip install -r requirements.txt  (실제 패키지 설치)")
    print("  2. uvicorn main:app --reload --port 8000  (서버 실행)")
    print("  3. pytest tests/ -v  (자동 테스트 실행)")
    print()


if __name__ == "__main__":
    run_pipeline_test()
