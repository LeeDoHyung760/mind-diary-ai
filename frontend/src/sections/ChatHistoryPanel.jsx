import { groupChatsByDate, resolveChatTitle } from "../utils/chatFormat";

function ChatHistoryPanel({
  chats,
  selectedChatId,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  embedded = false,
  theme,
}) {
  const chatGroups = groupChatsByDate(chats);

  return (
    <div className={embedded ? "flex min-h-0 flex-1 flex-col" : "panel flex h-full flex-col p-5 md:p-6"}>
      <div className={embedded ? "" : "border-b border-slate-100 pb-5"}>
        <div className="flex items-center justify-between gap-2 px-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">채팅</p>
          <button
            type="button"
            onClick={onCreateChat}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
          >
            새 채팅
          </button>
        </div>
      </div>

      <div className="soft-scrollbar mt-4 flex-1 overflow-y-auto pr-1">
        <div className="space-y-5">
          {chatGroups.length === 0 && (
            <div className="rounded-2xl bg-slate-50 px-3 py-4 text-sm text-slate-500">
              아직 저장된 대화가 없습니다.
            </div>
          )}

          {chatGroups.map((group) => (
            <section key={group.label}>
              <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {group.label}
              </h3>
              <div className="space-y-2">
                {group.chats.map((chat) => {
                  const isSelected = chat.id === selectedChatId;

                  return (
                    <div
                      key={chat.id}
                      className={`flex items-center gap-2 rounded-2xl px-3 py-3 text-left text-sm transition ${
                        isSelected
                          ? ""
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                      style={
                        isSelected
                          ? { backgroundColor: theme?.soft, color: theme?.strong }
                          : undefined
                      }
                    >
                      <button
                        type="button"
                        onClick={() => onSelectChat(chat.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="truncate font-medium">{resolveChatTitle(chat)}</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteChat(chat.id)}
                        className="shrink-0 rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        삭제
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChatHistoryPanel;
