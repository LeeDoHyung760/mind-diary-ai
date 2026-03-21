import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import SlimeAvatar from "../components/SlimeAvatar";
import { updateUserProfile } from "../lib/api";
import { saveCurrentUser, saveGuestUser } from "../lib/authStorage";
import { avatarOptions } from "../lib/theme";

function SettingsPage() {
  const navigate = useNavigate();
  const { currentUser } = useOutletContext();
  const isGuest = currentUser?.source === "guest";
  const defaultAvatar =
    avatarOptions.find((option) => option.id === currentUser?.avatarStyle) || avatarOptions[0];

  const [assistantName, setAssistantName] = useState(currentUser?.assistantName || "마음이");
  const [selectedAvatar, setSelectedAvatar] = useState(defaultAvatar);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSave = async (event) => {
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
      if (currentUser?.id && !isGuest) {
        const response = await updateUserProfile(currentUser.id, payload);
        saveCurrentUser(response.user);
      } else {
        saveGuestUser({
          ...currentUser,
          ...payload,
        });
      }

      setMessage(isGuest ? "게스트 설정이 현재 기기에 저장되었습니다." : "설정이 저장되었습니다.");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel h-full overflow-auto p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--theme-strong)]">
          설정
        </p>
        <h1 className="mt-3 text-3xl font-bold text-ink">설정</h1>
        <p className="mt-2 text-sm text-slate-500">
          {isGuest
            ? "게스트 설정은 현재 기기에만 저장되며 게스트 세션 종료 시 함께 지워집니다."
            : "로그인 사용자의 설정은 백엔드에 동기화되어 앱 전체에 반영됩니다."}
        </p>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleSave} className="rounded-[28px] bg-slate-50 p-6">
            <label htmlFor="settings-assistant-name" className="text-sm font-semibold text-slate-700">
              친구 이름
            </label>
            <input
              id="settings-assistant-name"
              value={assistantName}
              onChange={(event) => setAssistantName(event.target.value)}
              placeholder="예: 마음이"
              maxLength={16}
              className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[color:var(--theme-strong)]"
            />

            <div className="mt-8">
              <div className="text-sm font-semibold text-slate-700">아바타</div>
              <div className="mt-4 grid gap-3">
                {avatarOptions.map((option) => {
                  const isSelected = selectedAvatar.id === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedAvatar(option)}
                      className={`flex items-center justify-between rounded-[24px] border px-4 py-4 text-left transition ${
                        isSelected
                          ? "border-[color:var(--theme-strong)] bg-white"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span className="flex items-center gap-4">
                        <span
                          className="flex h-14 w-14 items-center justify-center rounded-2xl"
                          style={{ backgroundColor: option.surface }}
                        >
                          <img src={option.image} alt={option.label} className="h-12 w-10 object-contain" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-slate-700">
                            {option.label}
                          </span>
                          <span className="mt-1 block text-xs text-slate-500">{option.accent}</span>
                        </span>
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isSelected ? "text-white" : "bg-slate-100 text-slate-500"
                        }`}
                        style={isSelected ? { backgroundColor: "var(--theme-strong)" } : undefined}
                      >
                        {isSelected ? "선택됨" : "선택"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {message && (
              <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}

            {errorMessage && (
              <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {errorMessage}
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !assistantName.trim()}
                className="rounded-2xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
                style={{ backgroundColor: "var(--theme-strong)" }}
              >
                {isSubmitting ? "저장 중..." : "저장"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/counseling")}
                className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                상담으로 돌아가기
              </button>
            </div>
          </form>

          <div className="rounded-[28px] bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-700">미리보기</div>
            <div className="mt-5 flex flex-col gap-5">
              <div
                className="flex h-64 items-center justify-center rounded-[28px]"
                style={{ backgroundColor: selectedAvatar.surface }}
              >
                <SlimeAvatar avatar={selectedAvatar} size="large" />
              </div>

              <div className="rounded-[24px] bg-slate-50 px-5 py-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Assistant
                </div>
                <div className="mt-2 text-2xl font-bold text-ink">{assistantName || "마음이"}</div>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {isGuest
                    ? "이 게스트 프로필은 현재 브라우저 로컬 저장소에만 남습니다."
                    : "이 로그인 프로필은 백엔드와 동기화됩니다."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SettingsPage;
