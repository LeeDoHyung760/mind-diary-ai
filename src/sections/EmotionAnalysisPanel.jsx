import { useEffect, useMemo, useState } from "react";
import { getStoredGuestChats } from "../storage/chatStorage";

const MONTHS = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: `${index + 1}월`,
}));
const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

const EMOTION_COLORS = {
  기쁨: "bg-emerald-500",
  불안: "bg-amber-400",
  분노: "bg-rose-400",
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

function formatDateLabel(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return `${year}년 ${month}월 ${day}일`;
}

function parseDateParts(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

function getCalendarDays(year, month) {
  const count = new Date(year, month, 0).getDate();
  return Array.from({ length: count }, (_, index) => index + 1);
}

function truncateText(text, maxLength = 20) {
  return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
}

function EmotionAnalysisPanel() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [pickerStep, setPickerStep] = useState("year");
  const [pickerAnimation, setPickerAnimation] = useState("calendar-step-enter");

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

  const availableYears = useMemo(
    () => [...new Set(availableDates.map((d) => d.year))].sort((a, b) => a - b),
    [availableDates]
  );

  useEffect(() => {
    if (!selectedDate && availableDates.length > 0) {
      const sorted = [...availableDates].sort((a, b) => b.key.localeCompare(a.key));
      const latest = sorted[0];
      setSelectedDate(latest.key);
      setSelectedYear(latest.year);
      setSelectedMonth(latest.month);
    }
  }, [availableDates, selectedDate]);

  const currentAnalysis = dailyAnalysis[selectedDate];

  const availableMonths = useMemo(
    () =>
      new Set(
        availableDates.filter((item) => item.year === selectedYear).map((item) => item.month)
      ),
    [availableDates, selectedYear]
  );

  const availableDays = useMemo(
    () =>
      new Set(
        availableDates
          .filter((item) => item.year === selectedYear && item.month === selectedMonth)
          .map((item) => item.day)
      ),
    [availableDates, selectedMonth, selectedYear]
  );

  const days = getCalendarDays(selectedYear, selectedMonth);

  const moveStep = (nextStep) => {
    setPickerAnimation("calendar-step-enter");
    setPickerStep(nextStep);
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPickerAnimation("");
    }, 320);
    return () => window.clearTimeout(timeout);
  }, [pickerStep]);

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

      <div className="mt-4 grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.08fr_0.92fr]">
        {/* 1. 감정 분석 결과 */}
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

        {/* 2. 다른 날의 감정 보기 */}
        <div className="rounded-[24px] border border-dashed border-brand-200 bg-brand-50/60 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-brand-700">다른 날의 감정 보기</div>
              <p className="mt-1 text-xs text-slate-500">
                연도, 월, 일을 순서대로 눌러 기록을 확인합니다.
              </p>
            </div>
            <div className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-500">
              {pickerStep === "year" ? "연도" : pickerStep === "month" ? "월" : "일"}
            </div>
          </div>

          <div className="mt-3 rounded-[20px] bg-white/92 p-3 shadow-sm">
            <div className="mb-3 grid grid-cols-3 gap-2">
              {(availableYears.length > 0 ? availableYears : [new Date().getFullYear()]).map(
                (year) => {
                  const isActive = selectedYear === year;
                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => {
                        setSelectedYear(year);
                        moveStep("month");
                      }}
                      className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "bg-brand-700 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                      }`}
                    >
                      {year}
                    </button>
                  );
                }
              )}
            </div>

            <div className={`calendar-step-panel ${pickerAnimation}`}>
              {pickerStep === "year" && (
                <div className="rounded-2xl bg-slate-50 px-4 py-5 text-center text-sm font-medium text-slate-500">
                  먼저 연도를 선택해 주세요.
                </div>
              )}

              {pickerStep === "month" && (
                <div className="grid grid-cols-3 gap-2">
                  {MONTHS.map((month) => {
                    const hasData = availableMonths.has(month.value);
                    const isActive = selectedMonth === month.value;

                    return (
                      <button
                        key={month.value}
                        type="button"
                        disabled={!hasData}
                        onClick={() => {
                          setSelectedMonth(month.value);
                          moveStep("day");
                        }}
                        className={`rounded-2xl px-3 py-4 text-sm font-semibold transition ${
                          isActive
                            ? "bg-brand-700 text-white"
                            : hasData
                              ? "bg-slate-50 text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                              : "cursor-not-allowed bg-slate-50/70 text-slate-300"
                        }`}
                      >
                        {month.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {pickerStep === "day" && (
                <>
                  <div className="mb-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => moveStep("month")}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500"
                    >
                      월 다시 선택
                    </button>
                    <div className="text-[11px] font-medium text-slate-400">
                      {selectedYear}.{String(selectedMonth).padStart(2, "0")}
                    </div>
                  </div>
                  <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400">
                    {WEEK_DAYS.map((day) => (
                      <div key={day}>{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day) => {
                      const dateKey = `${selectedYear}-${String(selectedMonth).padStart(
                        2,
                        "0"
                      )}-${String(day).padStart(2, "0")}`;
                      const hasData = availableDays.has(day);
                      const isSelected = selectedDate === dateKey;

                      return (
                        <button
                          key={dateKey}
                          type="button"
                          disabled={!hasData}
                          onClick={() => setSelectedDate(dateKey)}
                          className={`h-8 rounded-lg text-[11px] font-semibold transition ${
                            isSelected
                              ? "bg-brand-700 text-white"
                              : hasData
                                ? "bg-slate-50 text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                                : "cursor-not-allowed bg-slate-50/70 text-slate-300"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 3. 핵심 해석 */}
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

        {/* 4. 자주 쓰는 표현 */}
        <div className="rounded-[24px] border border-dashed border-brand-200 bg-brand-50/60 p-5">
          <div className="text-sm font-semibold text-brand-700">자주 쓰는 표현</div>
          <p className="mt-1 text-xs text-slate-500">
            사용자 대화에서 직접 나온 표현만 기준으로 묶었습니다.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {currentAnalysis.frequentWords.map((group) => (
              <div key={group.label} className="rounded-2xl bg-white/85 px-4 py-4 shadow-sm">
                <div className="text-sm font-semibold text-ink">{group.label}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.words.map((word) => (
                    <span
                      key={word}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default EmotionAnalysisPanel;
