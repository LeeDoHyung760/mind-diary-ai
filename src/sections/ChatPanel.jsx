import SlimeAvatar from "../components/SlimeAvatar";
import { getThemeTokens } from "../lib/theme";

const chatMessages = {
  "친구와의 대화 이후": [
    { id: 1, sender: "ai", text: "친구와 이야기한 뒤에도 마음이 계속 남아 있는 것 같아요. 어떤 장면이 가장 걸렸나요?", time: "오전 8:20" },
    { id: 2, sender: "user", text: "별일 아닌 것 같은데도 계속 신경이 쓰여요.", time: "오전 8:21" },
    { id: 3, sender: "ai", text: "겉으로는 괜찮아 보여도 안쪽에서는 아직 정리가 덜 된 상태일 수 있어요.", time: "오전 8:22" },
    { id: 4, sender: "user", text: "맞아요. 다시 떠올리면 마음이 조금 내려앉아요.", time: "오전 8:23" },
  ],
  "그냥 이유 없이 무거운 하루": [
    { id: 1, sender: "ai", text: "오늘은 어떤 하루였는지 천천히 말해줘도 괜찮아요.", time: "오전 9:41" },
    { id: 2, sender: "user", text: "딱히 이유는 없는데 하루 종일 몸도 마음도 무거웠어요.", time: "오전 9:42" },
    { id: 3, sender: "ai", text: "이유를 찾기 어려운 피로가 쌓인 날처럼 들려요. 특별히 힘들었던 순간이 있었나요?", time: "오전 9:43" },
    { id: 4, sender: "user", text: "사소한 일에도 자꾸 지치고 아무것도 하기 싫었어요.", time: "오전 9:44" },
  ],
  "시험 스트레스": [
    { id: 1, sender: "ai", text: "시험이 가까워질수록 긴장이 커질 수 있어요. 지금 제일 부담되는 건 뭐예요?", time: "오후 7:10" },
    { id: 2, sender: "user", text: "준비한 것보다 부족한 것만 계속 보여서 불안해요.", time: "오후 7:11" },
    { id: 3, sender: "ai", text: "그 불안이 준비를 더 꼼꼼히 보게 만들기도 하지만, 너무 커지면 숨이 막힐 수 있어요.", time: "오후 7:12" },
  ],
};

function ChatPanel({ selectedChat, currentUser, theme = getThemeTokens(currentUser) }) {
  const messages = chatMessages[selectedChat] ?? [];
  const assistantName = currentUser?.assistantName || "마음이";

  return (
    <section className="panel flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-slate-100 px-5 py-5 md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--theme-strong)]">
          MindBridge Chat
        </p>
        <div className="mt-2 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ink">{selectedChat}</h2>
            <p className="mt-2 text-sm text-slate-500">
              선택한 슬라임 테마 색상이 채팅 말풍선과 액션 버튼에 바로 반영됩니다.
            </p>
          </div>
          <div className="hidden rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 md:block">
            오늘 대화 {messages.length}개
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[#fcfbf8]">
        <div className="soft-scrollbar h-full space-y-6 px-5 py-6 md:px-8">
          {messages.map((message) => {
            const isAi = message.sender === "ai";

            return (
              <div
                key={message.id}
                className={`flex items-end gap-3 ${isAi ? "justify-start" : "justify-end"}`}
              >
                {isAi && (
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: theme.surface }}
                    title={assistantName}
                  >
                    <SlimeAvatar avatar={theme.avatar} size="small" />
                  </div>
                )}
                <div
                  className={`max-w-[90%] rounded-[28px] px-5 py-4 text-sm leading-7 shadow-sm md:max-w-[75%] ${
                    isAi
                      ? "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                      : "rounded-br-md text-white"
                  }`}
                  style={!isAi ? { backgroundColor: theme.strong } : undefined}
                >
                  <p>{message.text}</p>
                  <div
                    className={`mt-2 text-right text-xs ${isAi ? "text-slate-400" : ""}`}
                    style={!isAi ? { color: theme.contrast } : undefined}
                  >
                    {message.time}
                  </div>
                </div>
                {!isAi && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
                    나
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <form className="shrink-0 border-t border-slate-100 bg-white px-5 py-5 md:px-8">
        <div className="flex flex-col gap-3">
          <textarea
            rows="3"
            placeholder="지금의 감정이나 상황을 적어보세요."
            className="min-h-[120px] flex-1 resize-none rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm outline-none transition focus:bg-white focus:ring-4"
            style={{ ["--tw-ring-color"]: theme.ring }}
          />
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: theme.strong }}
            >
              메시지 보내기
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

export default ChatPanel;
