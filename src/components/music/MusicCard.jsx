import React from "react";

function openSong(song) {
  if (!song?.youtubeUrl) return;
  window.open(song.youtubeUrl, "_blank", "noopener,noreferrer");
}

export default function MusicCard({
  theme,
  emotion = "calm",
  songs = [],
  title = "MUSIC",
}) {
  const hasSongs = songs.length > 0;

  const colors = {
    panelBg: theme?.surface || "#ffffff",
    panelBorder: theme?.border || "#edf2f7",
    panelShadow: `0 12px 32px ${theme?.glow || "rgba(15, 23, 42, 0.05)"}`,
    label: theme?.strong || "#4fa36c",
    title: "#1f2a3d",
    body: "#6b7b95",
    soft: theme?.avatar?.surface || theme?.soft || "#eef7ef",
    softAlt: theme?.soft || "#f5f8fc",
    strong: theme?.strong || "#4fa36c",
    strongDark: theme?.tintText || "#1f2a3d",
  };

  return (
    <div
      className="rounded-[2rem] border p-6"
      style={{
        background: colors.panelBg,
        borderColor: colors.panelBorder,
        boxShadow: colors.panelShadow,
      }}
    >
      <div className="mb-6">
        <p
          className="text-xs font-semibold uppercase tracking-[0.28em]"
          style={{ color: colors.label }}
        >
          {title}
        </p>

        <h3
          className="mt-3 text-[2rem] font-extrabold leading-none"
          style={{ color: colors.title }}
        >
          추천 음악
        </h3>

        <p
          className="mt-4 text-[15px] leading-7"
          style={{ color: colors.body }}
        >
          지금은 플레이 UI만 두고, 실제 재생 연결은 다음 단계에서 붙입니다.
        </p>
      </div>

      {hasSongs ? (
        <div className="space-y-4">
          {songs.map((song, index) => {
            const isFirst = index === 0;

            return (
              <div
                key={`${song.title}-${song.artist}-${index}`}
                className="flex items-center justify-between gap-4 rounded-[1.6rem] px-6 py-5"
                style={{
                  background: isFirst ? colors.soft : colors.softAlt,
                }}
              >
                <div className="min-w-0">
                  <p
                    className="truncate text-[18px] font-medium"
                    style={{
                      color: isFirst ? colors.strong : "#405069",
                    }}
                    title={`${song.artist} - ${song.title}`}
                  >
                    {song.artist} - {song.title}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openSong(song)}
                  className="shrink-0 rounded-full px-6 py-3 text-[15px] font-bold transition hover:opacity-90"
                  style={{
                    background: isFirst ? colors.strong : colors.strongDark,
                    color: "#ffffff",
                  }}
                >
                  Play
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="rounded-[1.6rem] px-6 py-5"
          style={{ background: colors.softAlt }}
        >
          <p
            className="text-base font-semibold"
            style={{ color: colors.title }}
          >
            아직 추천 음악이 없어요
          </p>
          <p
            className="mt-2 text-sm"
            style={{ color: colors.body }}
          >
            감정 분석 후 추천 음악이 표시됩니다.
          </p>
        </div>
      )}
    </div>
  );
}