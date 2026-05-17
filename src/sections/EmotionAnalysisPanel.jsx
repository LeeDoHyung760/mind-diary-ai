import { useEffect, useMemo, useState } from "react";
import { getStoredGuestChats } from "../storage/chatStorage";

const EMOTION_COLORS = {
  기쁨: "bg-emerald-500",
  불안: "bg-amber-400",
  분노: "bg-rose-400",
  화남: "bg-rose-400",
  슬픔: "bg-sky-400",
  상처: "bg-purple-400",
  당황: "bg-orange-400",
};

const EMOTION_INSIGHTS = {
  기쁨: [
    "안정감과 만족감 표현이 반복되며 하루 분위기를 만들었습니다.",
    "좋았던 감각을 짧게 기록해 두면 다음 회복에도 도움이 됩니다.",
    "무엇이 마음을 편하게 했는지 다시 떠올리는 것이 좋습니다.",
  ],
  불안: [
    "하루 전반에서 긴장과 자기 점검이 자주 반복됐습니다.",
    "불확실성을 줄일 작은 체크리스트가 안정감을 만드는 데 도움이 됩니다.",
    "지금 가장 신경 쓰이는 한 가지를 구체화하는 것이 우선입니다.",
  ],
  분노: [
    "답답함과 짜증 표현이 반복되며 대화 전반을 끌고 갔습니다.",
    "즉각 반응을 줄이고 거리 두기 문장을 먼저 꺼내는 편이 도움이 됩니다.",
    "무엇이 가장 거슬렸는지 짧게 분리해 적어보면 감정이 가라앉습니다.",
  ],
  화남: [
    "답답함과 짜증 표현이 반복되며 대화 전반을 끌고 갔습니다.",
    "즉각 반응을 줄이고 거리 두기 문장을 먼저 꺼내는 편이 도움이 됩니다.",
    "무엇이 가장 거슬렸는지 짧게 분리해 적어보면 감정이 가라앉습니다.",
  ],
  슬픔: [
    "에너지 저하와 무기력 표현이 길게 이어졌습니다.",
    "일정 밀도를 낮추고, 몸을 쓰는 짧은 활동을 함께 두는 편이 좋습니다.",
    "하루 중 가장 무거웠던 순간을 한 문장으로 남겨보면 정리가 빨라집니다.",
  ],
  상처: [
    "서운함이나 실망감 표현이 대화 속에 반복됐습니다.",
    "자신이 원했던 것과 실제 상황 사이의 차이를 인식하는 것이 도움이 됩니다.",
    "상대에게 직접 말하기 전에 감정을 정리해 보는 것이 좋습니다.",
  ],
  당황: [
    "예상치 못한 상황에 대한 혼란과 어리둥절함이 나타났습니다.",
    "상황을 객관적으로 정리해 보면 대처 방향이 보입니다.",
    "당장 해결할 수 없는 일은 잠시 거리 두기가 도움이 됩니다.",
  ],
};

const LETTERS_BY_EMOTION = {
  기쁨: [
    "안녕, 오늘의 너에게 :)",
    "오늘은 기쁜 마음이 반짝 올라온 하루였구나.",
    "이 좋은 감각을 그냥 흘려보내지 말고, 무엇이 너를 편하게 했는지 짧게 남겨보자.",
    "작은 기쁨을 잘 기억해두면 다음 날의 너에게도 귀여운 선물이 될 거야.",
  ],
  불안: [
    "안녕, 오늘의 너에게 :)",
    "오늘은 불안한 마음이 조금 크게 올라온 하루였구나.",
    "그럴 땐 해야 할 일을 한 번에 다 보려고 하지 말고, 아주 작은 것 하나만 골라서 천천히 시작해보자.",
    "따뜻한 물 한 잔 마시고, 어깨 힘을 살짝 빼줘. 너는 지금도 충분히 잘 버티고 있어.",
  ],
  분노: [
    "안녕, 오늘의 너에게 :)",
    "오늘은 답답하고 거슬리는 마음이 꽤 크게 지나갔구나.",
    "바로 해결하려고 애쓰기보다, 먼저 숨을 길게 내쉬고 마음의 온도를 살짝 낮춰보자.",
    "말하기 전에 물 한 모금, 문장 하나 쉬어가기. 그 작은 멈춤이 너를 지켜줄 거야.",
  ],
  화남: [
    "안녕, 오늘의 너에게 :)",
    "오늘은 답답하고 거슬리는 마음이 꽤 크게 지나갔구나.",
    "바로 해결하려고 애쓰기보다, 먼저 숨을 길게 내쉬고 마음의 온도를 살짝 낮춰보자.",
    "말하기 전에 물 한 모금, 문장 하나 쉬어가기. 그 작은 멈춤이 너를 지켜줄 거야.",
  ],
  슬픔: [
    "안녕, 오늘의 너에게 :)",
    "오늘은 마음이 조금 축축하고 무거웠던 날이었구나.",
    "억지로 괜찮은 척하지 않아도 돼. 조용히 숨을 고르고, 네 마음이 쉬어갈 자리를 조금만 만들어주자.",
    "작은 위로 하나를 꼭 챙겨줘. 따뜻한 담요, 좋아하는 노래, 짧은 산책이면 충분해.",
  ],
  상처: [
    "안녕, 오늘의 너에게 :)",
    "오늘은 마음 한쪽이 조금 콕 하고 아팠던 하루였구나.",
    "서운했던 마음을 바로 밀어내지 말고, 내가 무엇을 바랐는지 조용히 적어보자.",
    "네 마음이 예민해서가 아니라, 소중한 것을 지키고 싶었던 걸 수도 있어.",
  ],
  당황: [
    "안녕, 오늘의 너에게 :)",
    "오늘은 예상하지 못한 일 때문에 마음이 조금 흔들렸구나.",
    "지금 바로 답을 찾으려고 하지 않아도 돼. 일어난 일과 내가 할 수 있는 일을 나눠서 봐보자.",
    "잠깐 멈추고 숨을 고르면, 다음 한 걸음이 조금 더 또렷해질 거야.",
  ],
};

const letterFont =
  "'Gaegu', 'NanumSquareRound', 'NanumSquareRoundOTF', 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";

function formatDateLabel(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return `${year}년 ${month}월 ${day}일`;
}

function parseDateParts(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

function truncateText(text, maxLength = 20) {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

function EmotionAnalysisPanel() {
  const [selectedDate, setSelectedDate] = useState(null);

  const dailyAnalysis = useMemo(() => {
    const chats = getStoredGuestChats();
    const byDate = {};

    for (const chat of chats) {
      for (const msg of chat.messages || []) {
        if (msg.sender !== "user" || !msg.emotion) continue;
        const date = msg.createdAt.split("T")[0];
        if (!byDate[date]) byDate[date] = { messages: [], emotions: [] };
        byDate[date].messages.push(msg);
        byDate[date].emotions.push(msg.emotion);
      }
    }

    const result = {};
    for (const [date, data] of Object.entries(byDate)) {
      const emotionCounts = {};
      for (const emotion of data.emotions) {
        emotionCounts[emotion.label] = (emotionCounts[emotion.label] || 0) + 1;
      }

      const total = data.emotions.length;
      const scores = Object.entries(emotionCounts)
        .map(([label, count]) => ({
          label,
          value: Math.round((count / total) * 100),
          color: EMOTION_COLORS[label] || "bg-gray-400",
        }))
        .sort((a, b) => b.value - a.value);

      const dominant = scores[0]?.label || "없음";

      const messagesByEmotion = {};
      for (const msg of data.messages) {
        const label = msg.emotion.label;
        if (!messagesByEmotion[label]) messagesByEmotion[label] = [];
        messagesByEmotion[label].push(truncateText(msg.text));
      }

      const frequentWords = Object.entries(messagesByEmotion).map(([label, texts]) => ({
        label,
        words: texts.slice(0, 4),
      }));

      result[date] = {
        dateLabel: formatDateLabel(date),
        dominant,
        scores,
        insights: EMOTION_INSIGHTS[dominant] || ["감정 데이터를 분석 중입니다."],
        frequentWords,
      };
    }

    return result;
  }, []);

  const availableDates = useMemo(
    () =>
      Object.keys(dailyAnalysis).map((key) => ({
        key,
        ...parseDateParts(key),
      })),
    [dailyAnalysis]
  );

  useEffect(() => {
    if (!selectedDate && availableDates.length > 0) {
      const sorted = [...availableDates].sort((a, b) => b.key.localeCompare(a.key));
      const latest = sorted[0];
      setSelectedDate(latest.key);
    }
  }, [availableDates, selectedDate]);

  const currentAnalysis = dailyAnalysis[selectedDate];
  const letterLines = currentAnalysis
    ? LETTERS_BY_EMOTION[currentAnalysis.dominant] || LETTERS_BY_EMOTION.불안
    : LETTERS_BY_EMOTION.불안;

  if (availableDates.length === 0) {
    return (
      <section className="panel flex h-full min-h-0 flex-col items-center justify-center overflow-hidden p-5 md:p-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
            Emotion Insight
          </p>
          <h1 className="mt-2 text-2xl font-bold text-ink">감정 분석</h1>
          <p className="mt-4 text-sm text-slate-500">
            아직 분석할 대화 기록이 없습니다.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            상담 페이지에서 대화를 나누면 감정 분석 결과가 여기에 표시됩니다.
          </p>
        </div>
      </section>
    );
  }

  if (!currentAnalysis) {
    return null;
  }

  return (
    <section className="panel flex h-full min-h-0 flex-col overflow-hidden p-5 md:p-6">
      <div className="shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
              Emotion Insight
            </p>
            <h1 className="mt-2 text-2xl font-bold text-ink">감정 분석</h1>
            <p className="mt-1 text-sm text-slate-500">
              {currentAnalysis.dateLabel} 기준 감정 상태와 사용자 표현을 정리했습니다.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
            <div className="text-xs text-slate-400">선택한 날짜</div>
            <div className="text-sm font-semibold text-slate-700">{currentAnalysis.dateLabel}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.95fr)] lg:grid-rows-2">
        <div className="rounded-[24px] bg-slate-50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-700">감정 분석 결과</div>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {currentAnalysis.dominant} 감정이 가장 크게 드러난 하루입니다.
              </p>
            </div>
            <div className="min-w-[84px] rounded-2xl bg-white px-3 py-2 text-center shadow-sm">
              <div className="text-lg font-bold leading-tight text-ink">
                {currentAnalysis.dominant}
              </div>
              <div className="text-sm font-semibold text-brand-700">우세</div>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {currentAnalysis.scores.map((emotion) => (
              <div key={emotion.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">{emotion.label}</span>
                  <span className="font-semibold text-slate-500">{emotion.value}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div
                    className={`h-2.5 rounded-full ${emotion.color}`}
                    style={{ width: `${emotion.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-amber-100 bg-[#fff7df] p-6 shadow-[0_16px_36px_rgba(180,128,58,0.12)] lg:row-span-2">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[length:100%_34px]" />
          <div className="relative flex h-full min-h-0 flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
                  Letter
                </p>
                <h2
                  className="mt-2 text-xl font-bold text-amber-950"
                  style={{ fontFamily: letterFont }}
                >
                  오늘의 마음 편지
                </h2>
              </div>
              <div
                className="rounded-full bg-white/75 px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm"
                style={{ fontFamily: letterFont }}
              >
                {currentAnalysis.dominant} 우세
              </div>
            </div>

            <div
              className="mt-6 flex min-h-0 flex-1 flex-col justify-center rounded-[25px] bg-white/55 px-5 py-5 text-[27px] font-medium leading-8 text-amber-950 shadow-inner"
              style={{ fontFamily: letterFont }}
            >
              {letterLines.map((line) => (
                <p key={line} className="mb-4 last:mb-0">
                  {line}
                </p>
              ))}
            </div>

            <div
              className="relative mt-5 text-right text-sm font-semibold text-amber-800"
              style={{ fontFamily: letterFont }}
            >
              - 마음이가 보냄
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-dashed border-brand-200 bg-brand-50/60 p-5">
          <div className="text-sm font-semibold text-brand-700">핵심 해석</div>
          <div className="mt-3 grid gap-2">
            {currentAnalysis.insights.map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-white/85 px-4 py-3 text-sm leading-6 text-slate-600"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default EmotionAnalysisPanel;
