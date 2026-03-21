import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ChatHistoryPanel from "../sections/ChatHistoryPanel";
import { recommendedSongs } from "../sections/CompanionPanel";
import { clearCurrentUser, clearGuestUser } from "../lib/authStorage";
import { getThemeTokens } from "../lib/theme";
import { useCurrentUser } from "../lib/useCurrentUser";

const menuItems = [
  { to: "/counseling", label: "상담", icon: "C" },
  { to: "/analysis", label: "감정분석", icon: "A" },
];

const DEFAULT_CHAT = "그냥 이유 없이 마음이 무거운 날";
const analysisSummaries = [
  {
    label: "오늘",
    value: "64%",
    note: "불안과 피로가 함께 보이는 패턴이 가장 많이 나타났습니다.",
  },
  {
    label: "어제",
    value: "58%",
    note: "긴장은 조금 줄었지만 가라앉은 기분이 계속 반복되었습니다.",
  },
];

function AppShell() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const theme = getThemeTokens(currentUser);
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);
  const [selectedChat, setSelectedChat] = useState(DEFAULT_CHAT);
  const [sidebarTransition, setSidebarTransition] = useState(null);
  const [selectedAnalysisSong, setSelectedAnalysisSong] = useState(recommendedSongs[0].title);
  const isCounselingPage = location.pathname === "/counseling";
  const isGuest = currentUser?.source === "guest";
  const isLoggedIn = Boolean(currentUser?.id) && !isGuest;

  useEffect(() => {
    const previousPath = previousPathRef.current;

    if (previousPath === "/counseling" && location.pathname === "/analysis") {
      setSidebarTransition("out-up");

      const timeout = window.setTimeout(() => {
        setSidebarTransition(null);
      }, 520);

      previousPathRef.current = location.pathname;
      return () => window.clearTimeout(timeout);
    }

    if (previousPath === "/analysis" && location.pathname === "/counseling") {
      setSidebarTransition("in-down");

      const timeout = window.setTimeout(() => {
        setSidebarTransition(null);
      }, 520);

      previousPathRef.current = location.pathname;
      return () => window.clearTimeout(timeout);
    }

    previousPathRef.current = location.pathname;
    return undefined;
  }, [location.pathname]);

  const handleAuthAction = () => {
    if (isGuest) {
      clearGuestUser();
    } else if (isLoggedIn) {
      clearCurrentUser();
    }

    navigate("/login");
  };

  const authLabel = isGuest ? "게스트 종료" : isLoggedIn ? "로그아웃" : "로그인";
  const accountBadge = isGuest ? "게스트 체험" : isLoggedIn ? "계정 연결됨" : "체험";

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
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
                embedded
                animationClass={sidebarTransition === "in-down" ? "sidebar-history-enter" : ""}
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

                {sidebarTransition === "out-up" && (
                  <div className="pointer-events-none absolute inset-0 bg-white/72">
                    <ChatHistoryPanel
                      selectedChat={selectedChat}
                      onSelectChat={setSelectedChat}
                      embedded
                      animationClass="sidebar-history-exit"
                      theme={theme}
                    />
                  </div>
                )}
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
          <Outlet context={{ selectedChat, setSelectedChat, currentUser, theme }} />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
