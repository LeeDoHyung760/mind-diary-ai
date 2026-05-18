import logging
import os
import re
import time

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "당신은 따뜻하고 공감 능력이 뛰어난 한국어 심리상담사입니다.\n"
    "규칙:\n"
    "1. 사용자의 감정에 깊이 공감하며 따뜻하게 위로하세요.\n"
    "2. 2~3문장으로 간결하게 답변하세요.\n"
    "3. 존댓말을 사용하세요.\n"
    "4. 구체적인 감정을 반영하여 응답하세요."
)


def _clean_response(text: str) -> str:
    text = re.sub(r"\s{2,}", " ", text).strip()
    sentences = re.split(r"(?<=[.!?])\s*", text)
    sentences = [s for s in sentences if len(s) > 3]
    if len(sentences) > 3:
        sentences = sentences[:3]
    return " ".join(sentences)


class ChatModel:
    """EXAONE-3.5-2.4B-Instruct 기반 한국어 공감 응답 생성 모델"""

    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.model_name = os.getenv(
            "CHAT_MODEL_NAME", "LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct"
        )

    def load(self):
        try:
            logger.info(f"[챗봇] '{self.model_name}' 모델 로딩 중...")
            start = time.time()

            _rev = "e949c91dec92095908d34e6b560af77dd0c993f8"
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name, trust_remote_code=True, revision=_rev,
            )
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.float16,
                device_map="cuda:0",
                trust_remote_code=True,
                revision=_rev,
            )

            elapsed = round((time.time() - start) * 1000)
            logger.info(f"[챗봇] 모델 로드 완료 ({elapsed}ms)")
        except Exception as e:
            logger.error(f"[챗봇] 모델 로드 실패: {e}")
            raise

    def is_loaded(self) -> bool:
        return self.model is not None and self.tokenizer is not None

    def generate(self, transcript: str, emotion: str) -> str:
        if not self.is_loaded():
            raise RuntimeError("챗봇 모델이 로드되지 않았습니다.")

        logger.info(f"[챗봇] 응답 생성 시작 (감정: {emotion})")
        start = time.time()

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"[감정: {emotion}] {transcript}"},
        ]
        prompt = self.tokenizer.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)

        with torch.no_grad():
            output_ids = self.model.generate(
                **inputs,
                max_new_tokens=128,
                do_sample=False,
                eos_token_id=self.tokenizer.eos_token_id,
            )

        new_tokens = output_ids[0][inputs["input_ids"].shape[1] :]
        raw = self.tokenizer.decode(new_tokens, skip_special_tokens=True)
        response = _clean_response(raw)

        elapsed = round((time.time() - start) * 1000)
        logger.info(f"[챗봇] 응답 생성 완료 ({elapsed}ms)")

        return response


chat_model = ChatModel()
