import logging
import os
import time

logger = logging.getLogger(__name__)

# 감정 라벨 한국어 매핑 (모델별로 다를 수 있으므로 조정 필요)
EMOTION_LABEL_MAP = {
    "공포": "공포",
    "놀람": "놀람",
    "분노": "분노",
    "슬픔": "슬픔",
    "중립": "중립",
    "행복": "기쁨",
    "혐오": "혐오",
    # hun3359/klue-bert-base-sentiment 라벨
    "0": "부정",
    "1": "중립",
    "2": "긍정",
    "LABEL_0": "부정",
    "LABEL_1": "중립",
    "LABEL_2": "긍정",
}


class EmotionModel:
    """
    KoBERT 기반 한국어 감정 분류 모델
    Hugging Face transformers pipeline 사용
    """

    def __init__(self):
        self.pipeline = None
        self.model_name = os.getenv(
            "EMOTION_MODEL_NAME", "hun3359/klue-bert-base-sentiment"
        )

    def load(self):
        """모델 로드 (서버 시작 시 1회 호출)"""
        try:
            from transformers import pipeline
            logger.info(f"[감정] '{self.model_name}' 모델 로딩 중...")
            start = time.time()
            self.pipeline = pipeline(
                "text-classification",
                model=self.model_name,
                tokenizer=self.model_name,
                device=-1,  # CPU 사용 (-1), GPU는 0
            )
            elapsed = round((time.time() - start) * 1000)
            logger.info(f"[감정] 모델 로드 완료 ({elapsed}ms)")
        except Exception as e:
            logger.error(f"[감정] 모델 로드 실패: {e}")
            raise

    def is_loaded(self) -> bool:
        return self.pipeline is not None

    def classify(self, text: str) -> dict:
        """
        텍스트에서 감정 분류

        Args:
            text: 한국어 텍스트

        Returns:
            {"label": "슬픔", "score": 0.87}
        """
        if not self.is_loaded():
            raise RuntimeError("감정 분석 모델이 로드되지 않았습니다.")

        logger.info(f"[감정] 분류 시작: '{text[:30]}...'")
        start = time.time()

        result = self.pipeline(text, truncation=True, max_length=512)[0]
        raw_label = result["label"]
        score = round(result["score"], 4)

        # 라벨 한국어로 변환
        label = EMOTION_LABEL_MAP.get(raw_label, raw_label)

        elapsed = round((time.time() - start) * 1000)
        logger.info(f"[감정] 분류 완료 ({elapsed}ms): {label} ({score})")

        return {"label": label, "score": score}


# 싱글톤 인스턴스
emotion_model = EmotionModel()
