import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppPreferences } from "../lib/useAppPreferences";
import { useCurrentUser } from "../lib/useCurrentUser";
import { getThemeTokens } from "../lib/theme";
import { loadChatsForUser, removeChat, sendChatMessage } from "../services/chatService";
import { resetToLoginState } from "../services/profileService";
import ChatHistoryPanel from "../sections/ChatHistoryPanel";
import SlimeAvatar from "../components/SlimeAvatar";
import MusicCard from "../components/music/MusicCard";
import { getRecommendedSongs } from "../utils/musicHelpers";

const menuItems = [
  { to: "/counseling", label: "상담", icon: "C" },
  { to: "/analysis", label: "분석", icon: "A" },
];

const analysisSummaries = [
  {
    label: "오늘",
    value: "64%",
    note: "현재 값은 예시 데이터입니다. 실제 감정 분석 데이터로 교체할 수 있습니다.",
  },
  {
    label: "어제",
    value: "58%",
    note: "이 영역은 임시 UI 상태이며, 이후 서비스 데이터와 연결할 수 있습니다.",
  },
];

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useCurrentUser();
  const locationRef = useRef(location);
  const userRef = useRef(currentUser);
  const isLeavingRef = useRef(false);
  const { volume, isMuted } = useAppPreferences();
  const theme = getThemeTokens(currentUser);
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [chatStatus, setChatStatus] = useState("idle");
  const [chatError, setChatError] = useState("");
  const [recommendedMusic, setRecommendedMusic] = useState([]);
  const isCounselingPage = location.pathname.includes("counseling");
  const isGuest = currentUser?.source === "guest";
  const isLoggedIn = Boolean(currentUser?.id) && !isGuest;
  const selectedChat = chatSessions.find((chat) => chat.id === selectedChatId) || null;
  const analysisEmotion = "calm";
  const assistantName = currentUser?.assistantName || "마음이";

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    userRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    const currentPath = `${location.pathname}${location.search}${location.hash}`;

    if (window.history.state?.mindbridgeGuardPath !== currentPath) {
      window.history.pushState(
        { mindbridgeGuard: true, mindbridgeGuardPath: currentPath },
        "",
        currentPath
      );
    }
  }, [location.hash, location.pathname, location.search]);

  useEffect(() => {
    const handleProtectedBack = () => {
      if (isLeavingRef.current) {
        return;
      }

      const latestUser = userRef.current;
      const latestLocation = locationRef.current;
      const latestPath = `${latestLocation.pathname}${latestLocation.search}${latestLocation.hash}`;
      const isLatestGuest = latestUser?.source === "guest";
      const message = isLatestGuest
        ? "뒤로 가면 게스트 체험이 종료됩니다. 계속하시겠습니까?"
        : "뒤로 가면 로그아웃됩니다. 계속하시겠습니까?";

      if (window.confirm(message)) {
        isLeavingRef.current = true;
        resetToLoginState();
        navigate("/login", { replace: true });
        return;
      }

      window.history.pushState(
        { mindbridgeGuard: true, mindbridgeGuardPath: latestPath },
        "",
        latestPath
      );
    };

    window.addEventListener("popstate", handleProtectedBack);

    return () => {
      window.removeEventListener("popstate", handleProtectedBack);
    };
  }, [navigate]);

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
        setSelectedChatId(null);
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

  useEffect(() => {
    const normalizedVolume = isMuted ? 0 : Math.max(0, Math.min(100, Number(volume))) / 100;

    const applyVolume = (mediaElement) => {
      if (mediaElement instanceof HTMLMediaElement) {
        mediaElement.volume = normalizedVolume;
      }
    };

    const handlePlay = (event) => {
      applyVolume(event.target);
    };

    document.querySelectorAll("audio, video").forEach(applyVolume);
    document.addEventListener("play", handlePlay, true);

    return () => {
      document.removeEventListener("play", handlePlay, true);
    };
  }, [isMuted, volume]);

  const handleAuthAction = () => {
    const message = isGuest ? "게스트 체험을 종료하시겠습니까?" : "로그아웃 하시겠습니까?";

    if (!window.confirm(message)) {
      return;
    }

    isLeavingRef.current = true;
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
  const result = await sendChatMessage(currentUser, selectedChatId, text);

  handleChatStored(result.chat);

  if (result.musicRecommendations?.length > 0) {
    setRecommendedMusic(result.musicRecommendations);
  }
};

  const handleCreateChat = () => {
    setSelectedChatId(null);
    setChatStatus("ready");
    setChatError("");
    setRecommendedMusic([]);
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
      className="h-screen overflow-hidden p-3 sm:p-4 md:p-6"
      style={{
        "--theme-strong": theme.strong,
        "--theme-soft": theme.soft,
        "--theme-surface": theme.surface,
        "--theme-border": theme.border,
        "--theme-glow": theme.glow,
        "--theme-tint-text": theme.tintText,
      }}
    >
      <div className="mx-auto flex h-full min-h-0 max-w-[1600px] flex-col gap-4 overflow-hidden lg:flex-row">
        <div className="panel fixed inset-x-3 top-3 z-20 flex items-center justify-between px-4 py-3 sm:inset-x-4 sm:top-4 md:hidden">
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

        <aside className="panel hidden lg:flex lg:h-full lg:min-h-0 lg:w-[280px] lg:shrink-0 lg:flex-col lg:overflow-hidden lg:px-4 lg:py-5">
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
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden pr-1">
                {analysisSummaries.map((summary) => (
                  <div
                    key={summary.label}
                    className="rounded-3xl px-4 py-4 text-sm"
                    style={{ backgroundColor: theme.soft, color: theme.tintText }}
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.2em]">{summary.label}</div>
                    <div className="mt-2 text-lg font-bold">{summary.value}</div>
                    <p className="mt-2 text-xs leading-5">{summary.note}</p>
                  </div>
                ))}

              </div>
            )}

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
                <span className="text-xs">{assistantName}</span>
              </NavLink>
            </div>
          </div>
        </aside>

        <div
          className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[minmax(0,1fr)_320px]"
        >
          <main className="min-h-0 min-w-0 overflow-hidden">
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

          <aside className="hidden h-full min-h-0 min-w-0 grid-rows-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-3 overflow-hidden lg:grid">
            <div
              className="flex min-h-0 flex-col rounded-[1.5rem] border p-4"
              style={{
                background: "#ffffff",
                borderColor: "#edf2f7",
                boxShadow: "0 12px 32px rgba(15, 23, 42, 0.05)",
              }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: theme?.strong || "#4fa36c" }}
              >
                AVATAR
              </p>

              <h3 className="mt-2 text-2xl font-extrabold leading-none" style={{ color: "#1f2a3d" }}>
                {assistantName}
              </h3>

              <p className="mt-2 text-sm leading-6" style={{ color: "#6b7b95" }}>
                업로드한 아바타 이미지가 그대로 표시됩니다.
              </p>

              <div
                className="mt-3 flex min-h-0 flex-1 items-center justify-center rounded-[1.5rem] p-3"
                style={{ background: theme?.avatar?.surface || theme?.soft || "#f2faf4" }}
              >
                <SlimeAvatar avatar={theme.avatar} size="fit" />
              </div>
            </div>

            <MusicCard
              theme={theme}
              emotion={analysisEmotion}
              songs={recommendedMusic}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

export default AppShell;
