import React from "react";

function openSong(song) {
  if (!song?.youtubeUrl) return;
  window.open(song.youtubeUrl, "_blank", "noopener,noreferrer");
}

export default function MiniPlayer({ theme, song, emotion = "calm" }) {
  const hasSong = Boolean(song);

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
      className="rounded-[2rem] border p-5"
      style={{
        background: colors.panelBg,
        borderColor: colors.panelBorder,
        boxShadow: colors.panelShadow,
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-[0.28em]"
            style={{ color: colors.label }}
          >
            MUSIC
          </p>
          <h3
            className="mt-3 text-[1.6rem] font-extrabold leading-none"
            style={{ color: colors.title }}
          >
            추천 음악
          </h3>
        </div>

        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{
            background: colors.soft,
            color: colors.strong,
          }}
        >
          ♪
        </div>
      </div>

      {hasSong ? (
        <div
          className="flex items-center justify-between gap-3 rounded-[1.6rem] px-5 py-4"
          style={{ background: colors.soft }}
        >
          <div className="min-w-0">
            <p
              className="truncate text-[17px] font-medium"
              style={{ color: colors.strong }}
              title={`${song.artist} - ${song.title}`}
            >
              {song.artist} - {song.title}
            </p>
            <p
              className="mt-1 truncate text-xs"
              style={{ color: colors.body }}
            >
              {emotion}
            </p>
          </div>

          <button
            type="button"
            onClick={() => openSong(song)}
            className="shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition hover:opacity-90"
            style={{
              background: colors.strong,
              color: "#ffffff",
            }}
          >
            Play
          </button>
        </div>
      ) : (
        <div
          className="rounded-[1.6rem] px-5 py-4"
          style={{ background: colors.softAlt }}
        >
          <p
            className="text-sm font-semibold"
            style={{ color: colors.title }}
          >
            아직 추천 음악이 없어요
          </p>
          <p
            className="mt-2 text-xs"
            style={{ color: colors.body }}
          >
            감정 분석 후 추천 음악이 표시됩니다.
          </p>
        </div>
      )}
    </div>
  );
}