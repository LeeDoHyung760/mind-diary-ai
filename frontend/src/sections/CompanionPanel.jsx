import { useState } from "react";
import { getThemeTokens } from "../lib/theme";

export const recommendedSongs = [
  { title: "아이유 - 마음" },
  { title: "(여자)아이들 - Tomboy" },
  { title: "Coldplay - Fix You" },
];

function CompanionPanel({ currentUser, theme = getThemeTokens(currentUser) }) {
  const [selectedSong, setSelectedSong] = useState(recommendedSongs[0].title);
  const assistantName = currentUser?.assistantName || "마음이";

  return (
    <aside className="grid h-full min-h-0 gap-4 xl:grid-rows-[2fr_1fr]">
      <section className="panel relative overflow-hidden p-5">
        <div
          className="absolute left-8 top-8 h-24 w-24 rounded-full blur-2xl"
          style={{ backgroundColor: theme.glow }}
        />
        <div className="absolute bottom-10 right-8 h-24 w-24 rounded-full bg-amber-200/50 blur-2xl" />

        <div className="relative flex h-full flex-col">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--theme-strong)]">
              Avatar
            </p>
            <div className="mt-2 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-ink">{assistantName}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  업로드한 아바타 이미지가 그대로 표시됩니다.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div
              className="flex h-[320px] w-full items-center justify-center rounded-[32px]"
              style={{ backgroundColor: theme.surface }}
            >
              <SlimeAvatar avatar={theme.avatar} size="large" />
            </div>
          </div>
        </div>
      </section>

      <section className="panel flex min-h-0 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--theme-strong)]">
          Music
        </p>
        <h3 className="mt-2 text-lg font-bold text-ink">추천 음악</h3>
        <p className="mt-1 text-sm text-slate-500">
          지금은 플레이 UI만 두고, 실제 재생 연결은 다음 단계에서 붙입니다.
        </p>

        <div className="mt-4 space-y-2">
          {recommendedSongs.map((song) => {
            const isActive = song.title === selectedSong;

            return (
              <div
                key={song.title}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
                  isActive ? "" : "bg-slate-50 text-slate-700"
                }`}
                style={isActive ? { backgroundColor: theme.soft, color: theme.strong } : undefined}
              >
                <span className="truncate pr-3">{song.title}</span>
                <button
                  type="button"
                  onClick={() => setSelectedSong(song.title)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    isActive ? "text-white" : "bg-ink text-white hover:bg-slate-700"
                  }`}
                  style={isActive ? { backgroundColor: theme.strong } : undefined}
                >
                  Play
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </aside>
  );
}

export default CompanionPanel;
