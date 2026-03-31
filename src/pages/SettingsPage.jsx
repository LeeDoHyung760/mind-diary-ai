import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import SlimeAvatar from "../components/SlimeAvatar";
import { useAppPreferences } from "../lib/useAppPreferences";
import { avatarOptions } from "../lib/theme";
import { isGuestUser, saveProfileChanges } from "../services/profileService";
import { saveAppPreferences } from "../storage/preferencesStorage";

const providerLabels = {
  google: "Google",
  kakao: "Kakao",
  naver: "Naver",
};

function getConnectedAccounts(user) {
  if (isGuestUser(user)) {
    return ["게스트"];
  }

  if (user?.socialProvider) {
    return [providerLabels[user.socialProvider] || user.socialProvider];
  }

  return ["일반 계정"];
}

function SettingCard({ title, children, className = "" }) {
  return (
    <section
      className={`rounded-[22px] border p-5 md:p-6 ${className}`}
      style={{
        borderColor: "color-mix(in srgb, var(--theme-strong) 18%, rgba(15, 23, 42, 0.1))",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.92), color-mix(in srgb, var(--theme-soft) 46%, white))",
      }}
    >
      <div>
        <div
          className="text-[17px] font-bold"
          style={{ color: "color-mix(in srgb, var(--theme-strong) 42%, rgb(25, 38, 38))" }}
        >
          {title}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function AccountRow({ label, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-4 first:border-t-0">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="min-w-0 text-sm text-slate-500">{children}</div>
    </div>
  );
}

function SettingsPage() {
  const navigate = useNavigate();
  const { currentUser } = useOutletContext();
  const preferences = useAppPreferences();
  const isGuest = isGuestUser(currentUser);
  const defaultAvatar =
    avatarOptions.find((option) => option.id === currentUser?.avatarStyle) || avatarOptions[0];

  const [assistantName, setAssistantName] = useState(currentUser?.assistantName || "마음이");
  const [selectedAvatar, setSelectedAvatar] = useState(defaultAvatar);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showAccountChangePanel, setShowAccountChangePanel] = useState(false);

  const [volume, setVolume] = useState(preferences.volume);
  const [isMuted, setIsMuted] = useState(preferences.isMuted);

  useEffect(() => {
    setAssistantName(currentUser?.assistantName || "마음이");
    setSelectedAvatar(
      avatarOptions.find((option) => option.id === currentUser?.avatarStyle) || avatarOptions[0],
    );
  }, [currentUser]);

  useEffect(() => {
    setVolume(preferences.volume);
    setIsMuted(preferences.isMuted);
  }, [preferences.isMuted, preferences.volume]);

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setMessage("");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [message]);

  const connectedAccounts = useMemo(() => getConnectedAccounts(currentUser), [currentUser]);
  const effectiveVolume = isMuted ? 0 : volume;

  const persistSoundSettings = (nextVolume = volume, nextMuted = isMuted) => {
    saveAppPreferences({
      volume: nextVolume,
      isMuted: nextMuted,
    });
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setErrorMessage("");

    const payload = {
      assistantName: assistantName.trim(),
      avatarStyle: selectedAvatar.id,
      themeColor: selectedAvatar.accent,
    };

    try {
      await saveProfileChanges(currentUser, payload);
      setMessage(
        isGuest
          ? "프로필 설정이 이 브라우저에 저장되었습니다."
          : "프로필 설정이 계정에 저장되었습니다.",
      );
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel h-full min-h-0 overflow-hidden p-4 md:p-8">
      <div className="mx-auto flex h-full min-h-0 max-w-6xl flex-col">
        <div
          className="flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] border p-5 shadow-sm md:p-7"
          style={{
            borderColor: "color-mix(in srgb, var(--theme-strong) 20%, rgba(15, 23, 42, 0.08))",
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.95), color-mix(in srgb, var(--theme-soft) 38%, white))",
            boxShadow: "0 14px 38px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div className="flex flex-col gap-2 border-b border-slate-200/70 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.28em]"
                style={{ color: "color-mix(in srgb, var(--theme-strong) 36%, rgb(20, 30, 30))" }}
              >
                Setting
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-ink">설정</h1>
              <p className="mt-2 text-sm text-slate-500">
                기존 프로필 설정은 유지하고, 계정과 소리 설정을 분리해서 적용했습니다.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/counseling")}
              className="inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-semibold text-slate-600 transition hover:bg-white"
              style={{
                borderColor: "color-mix(in srgb, var(--theme-strong) 16%, rgba(15, 23, 42, 0.12))",
                background: "rgba(255,255,255,0.72)",
              }}
            >
              상담으로 돌아가기
            </button>
          </div>

          <div className="mt-6 flex-1 min-h-0 overflow-y-auto pr-1">
            <div className="grid min-h-full gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <SettingCard
                title="프로필 설정"
              >
                <label htmlFor="settings-assistant-name" className="text-sm font-semibold text-slate-700">
                  동반자 이름
                </label>
                <input
                  id="settings-assistant-name"
                  value={assistantName}
                  onChange={(event) => setAssistantName(event.target.value)}
                  placeholder="동반자의 이름을 입력해 주세요"
                  maxLength={16}
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition"
                  style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)" }}
                />

                <div className="mt-6">
                  <div className="text-sm font-semibold text-slate-700">아바타</div>
                  <div className="mt-4 grid gap-3">
                    {avatarOptions.map((option) => {
                      const isSelected = selectedAvatar.id === option.id;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setSelectedAvatar(option)}
                          className="flex items-center justify-between rounded-[18px] border px-4 py-4 text-left transition"
                          style={{
                            borderColor: isSelected
                              ? "var(--theme-strong)"
                              : "rgba(148, 163, 184, 0.25)",
                            background: isSelected
                              ? "rgba(255,255,255,0.96)"
                              : "rgba(255,255,255,0.82)",
                            boxShadow: isSelected
                              ? "0 0 0 3px color-mix(in srgb, var(--theme-strong) 16%, transparent)"
                              : "none",
                          }}
                        >
                          <span className="flex items-center gap-4">
                            <span
                              className="flex h-14 w-14 items-center justify-center rounded-2xl"
                              style={{ backgroundColor: option.surface }}
                            >
                              <img src={option.image} alt={option.label} className="h-12 w-10 object-contain" />
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-slate-700">{option.label}</span>
                              <span className="mt-1 block text-xs text-slate-500">{option.accent}</span>
                            </span>
                          </span>
                          <span
                            className="rounded-full px-3 py-1 text-xs font-semibold"
                            style={{
                              background: isSelected ? "var(--theme-strong)" : "rgba(241, 245, 249, 1)",
                              color: isSelected ? "#fff" : "#64748b",
                            }}
                          >
                            {isSelected ? "선택됨" : "선택"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {errorMessage && (
                  <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                    {errorMessage}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || !assistantName.trim()}
                    className="rounded-xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
                    style={{ backgroundColor: "var(--theme-strong)" }}
                  >
                    {isSubmitting ? "저장 중..." : "프로필 저장"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen((previous) => !previous)}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    {isPreviewOpen ? "미리보기 닫기" : "미리보기 열기"}
                  </button>
                  {message && <span className="text-sm font-medium text-emerald-700">{message}</span>}
                </div>
              </SettingCard>
            </form>

            <div className="space-y-5">
              {isPreviewOpen && (
                <SettingCard title="미리보기">
                  <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
                    <div
                      className="flex min-h-[220px] items-center justify-center rounded-[24px]"
                      style={{ backgroundColor: selectedAvatar.surface }}
                    >
                      <SlimeAvatar avatar={selectedAvatar} size="large" />
                    </div>

                    <div className="rounded-[22px] border border-white/70 bg-white/80 px-5 py-5">
                      <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                        Assistant
                      </div>
                      <div className="mt-2 text-2xl font-bold text-ink">{assistantName || "마음이"}</div>
                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        {isGuest
                          ? "게스트 설정은 현재 브라우저에 저장됩니다."
                          : "로그인한 사용자 설정은 백엔드를 통해 저장됩니다."}
                      </p>
                    </div>
                  </div>
                </SettingCard>
              )}

              <SettingCard
                title="계정 설정"
              >
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85">
                  <AccountRow label="사용자 ID">{currentUser?.id || "guest-user"}</AccountRow>
                  <AccountRow label="이메일">{currentUser?.email || "연결되지 않음"}</AccountRow>
                  <AccountRow label="연결 계정">
                    <div className="flex flex-wrap justify-end gap-2">
                      {connectedAccounts.map((account) => (
                        <span
                          key={account}
                          className="rounded-full px-3 py-1 text-xs font-semibold"
                          style={{
                            color: "color-mix(in srgb, var(--theme-strong) 48%, rgb(31, 46, 46))",
                            background: "color-mix(in srgb, var(--theme-soft) 80%, white)",
                            border: "1px solid color-mix(in srgb, var(--theme-strong) 18%, rgba(15, 23, 42, 0.1))",
                          }}
                        >
                          {account}
                        </span>
                      ))}
                    </div>
                  </AccountRow>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-700">연결계정 변경</div>
                    <button
                      type="button"
                      onClick={() => setShowAccountChangePanel((previous) => !previous)}
                      className="rounded-lg px-4 py-2 text-sm font-semibold transition"
                      style={{
                        color: "color-mix(in srgb, var(--theme-strong) 55%, rgb(20, 30, 30))",
                        background: "color-mix(in srgb, var(--theme-soft) 56%, white)",
                        border: "1px solid color-mix(in srgb, var(--theme-strong) 22%, rgba(15, 23, 42, 0.12))",
                      }}
                    >
                      {showAccountChangePanel ? "닫기" : "변경하기"}
                    </button>
                  </div>

                  {showAccountChangePanel && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-4" />
                  )}
                </div>
              </SettingCard>

              <SettingCard
                title="소리 설정"
              >
                <div className="rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <label htmlFor="settings-volume" className="text-sm font-semibold text-slate-700">
                      전체 볼륨
                    </label>
                    <span
                      className="text-sm font-bold"
                      style={{ color: "color-mix(in srgb, var(--theme-strong) 55%, rgb(30, 42, 42))" }}
                    >
                      {effectiveVolume}%
                    </span>
                  </div>

                  <input
                    id="settings-volume"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={volume}
                    onChange={(event) => setVolume(Number(event.target.value))}
                    onMouseUp={() => persistSoundSettings()}
                    onTouchEnd={() => persistSoundSettings()}
                    onKeyUp={() => persistSoundSettings()}
                    className="mt-4 w-full accent-[color:var(--theme-strong)]"
                  />

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const nextMuted = !isMuted;
                        setIsMuted(nextMuted);
                        persistSoundSettings(volume, nextMuted);
                      }}
                      className="rounded-lg px-4 py-2 text-sm font-semibold transition"
                      style={{
                        color: "color-mix(in srgb, var(--theme-strong) 55%, rgb(20, 30, 30))",
                        background: "color-mix(in srgb, var(--theme-soft) 56%, white)",
                        border: "1px solid color-mix(in srgb, var(--theme-strong) 22%, rgba(15, 23, 42, 0.12))",
                      }}
                    >
                      {isMuted ? "음소거 해제" : "음소거"}
                    </button>
                  </div>
                </div>
              </SettingCard>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SettingsPage;
