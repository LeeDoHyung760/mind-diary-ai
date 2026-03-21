const chatGroups = [
  {
    label: "오늘",
    chats: ["친구와의 대화 이후", "그냥 이유 없이 무거운 하루"],
  },
  {
    label: "어제",
    chats: ["시험 스트레스"],
  },
  {
    label: "2026-03-02",
    chats: [],
  },
];

function ChatHistoryPanel({
  selectedChat,
  onSelectChat,
  embedded = false,
  animationClass = "",
  theme,
}) {
  return (
    <div
      className={`${
        embedded ? "flex min-h-0 flex-1 flex-col" : "panel flex h-full flex-col p-5 md:p-6"
      } ${animationClass}`.trim()}
    >
      <div className={embedded ? "" : "border-b border-slate-100 pb-5"}>
        <p className="px-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          채팅
        </p>
      </div>

      <div className="soft-scrollbar mt-4 flex-1 overflow-y-auto pr-1">
        <div className="space-y-5">
          {chatGroups.map((group) => (
            <section key={group.label}>
              <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {group.label}
              </h3>
              {group.chats.length > 0 && (
                <div className="space-y-2">
                  {group.chats.map((chat) => {
                    const isSelected = chat === selectedChat;

                    return (
                      <button
                        key={chat}
                        type="button"
                        onClick={() => onSelectChat(chat)}
                        className={`w-full rounded-2xl px-3 py-3 text-left text-sm transition ${
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
                        <div className="truncate font-medium">{chat}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChatHistoryPanel;
