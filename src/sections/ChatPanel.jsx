import { useState } from "react";
import SlimeAvatar from "../components/SlimeAvatar";
import { getThemeTokens } from "../lib/theme";
import { formatChatTime } from "../utils/chatFormat";

function ChatPanel({
  selectedChat,
  currentUser,
  theme = getThemeTokens(currentUser),
  chatStatus,
  chatError,
  onSendMessage,
}) {
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const messages = selectedChat?.messages ?? [];
  const assistantName = currentUser?.assistantName || "마음이";

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = draft.trim();

    if (!text || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await onSendMessage(text);
      setDraft("");
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-slate-100 px-5 py-5 md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--theme-strong)]">
          MindBridge Chat
        </p>
        <div className="mt-2 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ink">{selectedChat?.title || "새 대화"}</h2>
            <p className="mt-2 text-sm text-slate-500">
              메시지는 채팅 서비스 계층을 통해 저장됩니다. AI 응답은 아직 임시 문구입니다.
            </p>
          </div>
          <div className="hidden rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 md:block">
            메시지 {messages.length}개
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[#fcfbf8]">
        <div className="soft-scrollbar h-full space-y-6 px-5 py-6 md:px-8">
          {chatStatus === "loading" && (
            <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-500 shadow-sm">
              대화 기록을 불러오는 중입니다.
            </div>
          )}

          {chatStatus === "error" && (
            <div className="rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-600">
              {chatError}
            </div>
          )}

          {chatStatus === "ready" && messages.length === 0 && (
            <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-500 shadow-sm">
              첫 메시지를 보내면 새 대화가 시작됩니다.
            </div>
          )}

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
                    {formatChatTime(message.createdAt)}
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

      <form onSubmit={handleSubmit} className="shrink-0 border-t border-slate-100 bg-white px-5 py-5 md:px-8">
        <div className="flex flex-col gap-3">
          <textarea
            rows="3"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="지금의 감정이나 상황을 적어보세요."
            className="min-h-[120px] flex-1 resize-none rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm outline-none transition focus:bg-white focus:ring-4"
            style={{ ["--tw-ring-color"]: theme.ring }}
          />
          {submitError && (
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {submitError}
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !draft.trim() || chatStatus === "loading"}
              className="rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: theme.strong }}
            >
              {isSubmitting ? "전송 중..." : "메시지 보내기"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

export default ChatPanel;
