"""KcELECTRA 기반 감정 분류 모델 (파인튜닝 후 사용)"""
import logging
import os
import time

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

logger = logging.getLogger(__name__)

KCELECTRA_MODEL_DIR = os.getenv(
    "EMOTION_MODEL_DIR",
    "KimHo3/kcelectra-emotion-6class",
)

INTENT_LABEL_MAP = {
    0: "분노",
    1: "슬픔",
    2: "불안",
    3: "상처",
    4: "당황",
    5: "기쁨",
}


class EmotionModel:
    """KcELECTRA 파인튜닝 감정 분류 모델 (6클래스)"""

    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    def load(self):
        try:
            logger.info(f"[감정] KcELECTRA 감정 분류 모델 로딩 중... ({KCELECTRA_MODEL_DIR})")
            start = time.time()

            self.tokenizer = AutoTokenizer.from_pretrained(KCELECTRA_MODEL_DIR)
            self.model = AutoModelForSequenceClassification.from_pretrained(KCELECTRA_MODEL_DIR)
            self.model.to(self.device)
            self.model.eval()

            elapsed = round((time.time() - start) * 1000)
            logger.info(f"[감정] 모델 로드 완료 ({elapsed}ms, device={self.device})")
        except Exception as e:
            logger.error(f"[감정] 모델 로드 실패: {e}")
            raise

    def is_loaded(self) -> bool:
        return self.model is not None and self.tokenizer is not None

    def classify(self, text: str) -> dict:
        if not self.is_loaded():
            raise RuntimeError("감정 분석 모델이 로드되지 않았습니다.")

        logger.info(f"[감정] 분류 시작: '{text[:30]}...'")
        start = time.time()

        inputs = self.tokenizer(
            text,
            max_length=128,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        ).to(self.device)

        with torch.no_grad():
            outputs = self.model(**inputs)

        probs = torch.softmax(outputs.logits[0], dim=-1)
        intent_idx = int(torch.argmax(probs))
        score = round(float(probs[intent_idx]), 4)
        label = INTENT_LABEL_MAP.get(intent_idx, str(intent_idx))

        elapsed = round((time.time() - start) * 1000)
        logger.info(f"[감정] 분류 완료 ({elapsed}ms): {label} ({score})")

        return {"label": label, "score": score}


emotion_model = EmotionModel()
