import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../lib/useCurrentUser";
import { getThemeTokens } from "../lib/theme";
import { loadChatsForUser, removeChat, sendChatMessage } from "../services/chatService";
import { resetToLoginState } from "../services/profileService";
import { recommendedSongs } from "../sections/CompanionPanel";
import ChatHistoryPanel from "../sections/ChatHistoryPanel";

const menuItems = [
  { to: "/counseling", label: "상담", icon: "C" },
  { to: "/analysis", label: "분석", icon: "A" },
];

const analysisSummaries = [
  {
    label: "오늘",
    value: "64%",
    note: "현재는 예시 데이터입니다. 실제 감정 분석 데이터로 교체할 수 있습니다.",
  },
  {
    label: "어제",
    value: "58%",
    note: "이 영역은 아직 UI 샘플 상태이며, 이후 서비스 데이터와 연결하면 됩니다.",
  },
];

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useCurrentUser();
  const theme = getThemeTokens(currentUser);
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [chatStatus, setChatStatus] = useState("idle");
  const [chatError, setChatError] = useState("");
  const [selectedAnalysisSong, setSelectedAnalysisSong] = useState(recommendedSongs[0].title);
  const isCounselingPage = location.pathname === "/counseling";
  const isGuest = currentUser?.source === "guest";
  const isLoggedIn = Boolean(currentUser?.id) && !isGuest;
  const selectedChat = chatSessions.find((chat) => chat.id === selectedChatId) || null;

  useEffect(() => {
    let isActive = true;

    async function loadChats() {
      setChatStatus("loading");
      setChatError("");

      try {
        const chats = await loadChatsForUser(currentUser);

        if (!isActive) {
          return;
        }

        setChatSessions(chats);
        setSelectedChatId((currentId) => {
          if (chats.some((chat) => chat.id === currentId)) {
            return currentId;
          }

          return chats[0]?.id ?? null;
        });
        setChatStatus("ready");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setChatSessions([]);
        setSelectedChatId(null);
        setChatStatus("error");
        setChatError(error.message);
      }
    }

    loadChats();

    return () => {
      isActive = false;
    };
  }, [currentUser]);

  const handleAuthAction = () => {
    resetToLoginState();
    navigate("/login");
  };

  const handleChatStored = (chat) => {
    setChatSessions((previousChats) => {
      const remainingChats = previousChats.filter((item) => item.id !== chat.id);
      return [chat, ...remainingChats];
    });
    setSelectedChatId(chat.id);
    setChatStatus("ready");
  };

  const handleSendMessage = async (text) => {
    const chat = await sendChatMessage(currentUser, selectedChatId, text);
    handleChatStored(chat);
  };

  const handleCreateChat = () => {
    setSelectedChatId(null);
    setChatStatus("ready");
    setChatError("");
  };

  const handleDeleteChat = async (chatId) => {
    let remainingChats;
    const nextGuestChats = await removeChat(currentUser, chatId);

    if (nextGuestChats === null) {
      setChatSessions((previousChats) => {
        remainingChats = previousChats.filter((chat) => chat.id !== chatId);
        return remainingChats;
      });
    } else {
      remainingChats = nextGuestChats;
      setChatSessions(remainingChats);
    }

    setSelectedChatId((currentId) => {
      if (currentId !== chatId) {
        return currentId;
      }

      return remainingChats?.[0]?.id ?? null;
    });
  };

  const authLabel = isGuest ? "게스트 종료" : isLoggedIn ? "로그아웃" : "로그인";
  const accountBadge = isGuest ? "게스트" : isLoggedIn ? "계정" : "체험";

  return (
    <div
      className="min-h-screen p-4 md:p-6"
      style={{
        "--theme-strong": theme.strong,
        "--theme-soft": theme.soft,
        "--theme-surface": theme.surface,
        "--theme-border": theme.border,
        "--theme-glow": theme.glow,
        "--theme-tint-text": theme.tintText,
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1600px] gap-4 md:gap-6">
        <div className="panel fixed inset-x-4 top-4 z-20 flex items-center justify-between px-4 py-3 md:hidden">
          <div>
            <div className="text-sm font-bold text-[color:var(--theme-strong)]">MindBridge</div>
            <div className="text-xs text-slate-500">AI Emotion Care</div>
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-2">
              {[...menuItems, { to: "/settings", label: "설정" }].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive ? "text-white" : "text-[color:var(--theme-strong)] hover:opacity-90"
                    }`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? "var(--theme-strong)" : "var(--theme-soft)",
                  })}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <button
              type="button"
              onClick={handleAuthAction}
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              {authLabel}
            </button>
          </div>
        </div>

        <aside className="panel hidden h-[calc(100vh-3rem)] w-[250px] shrink-0 flex-col overflow-hidden px-4 py-5 md:flex">
          <div className="flex items-center gap-3 px-1">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold text-white"
              style={{ backgroundColor: theme.strong, boxShadow: `0 12px 22px ${theme.glow}` }}
            >
              M
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-[color:var(--theme-strong)]">MindBridge</div>
              <div className="text-xs text-slate-500">AI Emotion Care</div>
            </div>
          </div>

          <nav className="mt-5 flex shrink-0 flex-col gap-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "text-white"
                      : "bg-slate-50 text-slate-700 hover:text-[color:var(--theme-strong)]"
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? "var(--theme-strong)" : undefined,
                })}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="relative mt-5 flex min-h-0 flex-1 flex-col border-t border-slate-100 pt-5">
            {isCounselingPage ? (
              <ChatHistoryPanel
                chats={chatSessions}
                selectedChatId={selectedChatId}
                onSelectChat={setSelectedChatId}
                onCreateChat={handleCreateChat}
                onDeleteChat={handleDeleteChat}
                embedded
                theme={theme}
              />
            ) : (
              <div className="flex min-h-0 flex-1 flex-col gap-3">
                {analysisSummaries.map((summary) => (
                  <div
                    key={summary.label}
                    className="rounded-3xl px-4 py-4 text-sm"
                    style={{ backgroundColor: theme.soft, color: theme.tintText }}
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.2em]">
                      {summary.label}
                    </div>
                    <div className="mt-2 text-lg font-bold">{summary.value}</div>
                    <p className="mt-2 text-xs leading-5">{summary.note}</p>
                  </div>
                ))}

                <div className="rounded-3xl bg-slate-50 px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--theme-strong)]">
                    Music
                  </div>
                  <div className="mt-2 text-sm font-bold text-ink">추천 음악</div>
                  <div className="mt-3 space-y-2">
                    {recommendedSongs.map((song) => {
                      const isSelected = song.title === selectedAnalysisSong;

                      return (
                        <div
                          key={song.title}
                          className={`flex items-center justify-between rounded-2xl px-3 py-2 text-xs transition ${
                            isSelected ? "" : "bg-white text-slate-700"
                          }`}
                          style={
                            isSelected
                              ? { backgroundColor: theme.soft, color: theme.strong }
                              : undefined
                          }
                        >
                          <span className="truncate pr-2">{song.title}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedAnalysisSong(song.title)}
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                              isSelected ? "text-white" : "bg-ink text-white hover:bg-slate-700"
                            }`}
                            style={isSelected ? { backgroundColor: theme.strong } : undefined}
                          >
                            재생
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 shrink-0 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleAuthAction}
              className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:text-[color:var(--theme-strong)]"
            >
              <span>{authLabel}</span>
              <span className="text-xs">{accountBadge}</span>
            </button>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `mt-2 flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "text-white"
                    : "bg-slate-50 text-slate-700 hover:text-[color:var(--theme-strong)]"
                }`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? "var(--theme-strong)" : undefined,
              })}
            >
              <span>설정</span>
              <span className="text-xs">{currentUser?.assistantName || "마음이"}</span>
            </NavLink>
          </div>
        </aside>

        <main className="relative min-w-0 flex-1 overflow-hidden pt-20 md:h-[calc(100vh-3rem)] md:pt-0">
          <Outlet
            context={{
              selectedChat,
              currentUser,
              theme,
              chatStatus,
              chatError,
              onSendMessage: handleSendMessage,
            }}
          />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
